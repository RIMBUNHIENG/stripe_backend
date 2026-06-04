import 'dotenv/config';
import { User, UserType, SubscriptionPlan, StripePayment, sequelize } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../utils/auth/accessRefreshToken.js';
import stripe from '../config/stripe.js';

async function testStripePayment() {
    console.log('\n🧪 Testing Stripe Payment Flow\n');
    console.log('='.repeat(70));

    try {
        //Step 1: Create or get test user
        console.log('\n📝 STEP 1: Setting up test user...');

        const userType = await UserType.findOne({ where: { user_type_name: 'Mentor' } });
        if (!userType) {
            throw new Error('Mentor user type not found');
        }

        const testEmail = 'payment.test@rokkru.com';
        let user = await User.findOne({ where: { email: testEmail } });

        if (!user) {
            const hashedPassword = await bcrypt.hash('TestPass123!', 10);
            user = await User.create({
                email: testEmail,
                password: hashedPassword,
                user_type_id: userType.user_type_id,
            });
            console.log(`✅ Created test user: ${testEmail} (ID: ${user.user_id})`);
        } else {
            console.log(`✅ Using existing user: ${testEmail} (ID: ${user.user_id})`);
        }

        // Step 2: Generate JWT token
        console.log('\n🔐 STEP 2: Generating access token...');
        const accessToken = generateAccessToken(user.user_id);
        console.log(`✅ Token generated: ${accessToken.substring(0, 30)}...`);

        // Step 3: Get subscription plans
        console.log('\n📋 STEP 3: Fetching subscription plans...');
        const plans = await SubscriptionPlan.findAll();

        if (plans.length === 0) {
            throw new Error('No subscription plans found');
        }

        console.log(`✅ Found ${plans.length} plan(s):`);
        plans.forEach(plan => {
            console.log(`   - ${plan.name}: $${plan.price} (ID: ${plan.subscription_Plan_id})`);
        });

        // Step 4: Create Stripe checkout session
        const selectedPlan = plans[0];
        console.log(`\n💳 STEP 4: Creating Stripe checkout session for "${selectedPlan.name}"...`);

        const currency = 'usd';
        const amount = Number(selectedPlan.price);
        const unitAmount = Math.round(amount * 100); // Convert to cents

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: selectedPlan.name,
                            description: selectedPlan.description || 'Subscription plan',
                        },
                        unit_amount: unitAmount,
                    },
                    quantity: 1,
                },
            ],
            success_url: 'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/payment/cancel',
            customer_email: user.email,
            metadata: {
                user_id: String(user.user_id),
                subscription_plan_id: String(selectedPlan.subscription_Plan_id),
                user_type_id: String(user.user_type_id),
            },
        });

        console.log(`✅ Checkout session created!`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   Amount: $${(session.amount_total / 100).toFixed(2)}`);

        // Step 5: Save to database
        console.log('\n💾 STEP 5: Saving payment record to database...');

        await StripePayment.create({
            user_id: user.user_id,
            stripe_checkout_session_id: session.id,
            amount,
            currency,
            status: 'pending',
        });
        console.log('✅ Payment record saved');

        // Display results
        console.log('\n' + '='.repeat(70));
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(70));

        console.log('\n📊 SUMMARY:');
        console.log(`   User ID: ${user.user_id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Plan: ${selectedPlan.name} ($${selectedPlan.price})`);
        console.log(`   Session ID: ${session.id}`);
        console.log(`   JWT Token: ${accessToken.substring(0, 40)}...`);

        console.log('\n🔗 STRIPE PAYMENT URL:');
        console.log(`\n   ${session.url}\n`);

        console.log('📝 TEST WITH STRIPE TEST CARD:');
        console.log('   Card Number: 4242 4242 4242 4242');
        console.log('   Expiry Date: 12/34');
        console.log('   CVC: 123');
        console.log('   ZIP: 12345');

        console.log('\n✅ Open the URL above to complete payment!');
        console.log('✅ Webhook will automatically activate subscription after payment\n');

        return {
            success: true,
            user_id: user.user_id,
            email: user.email,
            session_id: session.id,
            payment_url: session.url,
            token: accessToken,
        };

    } catch (error) {
        console.log('\n' + '='.repeat(70));
        console.log('❌ TEST FAILED');
        console.log('='.repeat(70));
        console.error(`\n🔥 Error: ${error.message}\n`);

        if (error.message.includes('Stripe')) {
            console.log('💡 TIP: Check STRIPE_SECRET_KEY in .env file\n');
        }

        return {
            success: false,
            error: error.message,
        };
    } finally {
        await sequelize.close();
    }
}

// Run test
testStripePayment()
    .then(result => {
        if (result.success) {
            console.log('✨ Test completed successfully!\n');
            process.exit(0);
        } else {
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
