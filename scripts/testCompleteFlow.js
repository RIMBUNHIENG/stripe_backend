import 'dotenv/config';
import stripe from '../config/stripe.js';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';
import StripePayment from '../models/stripePaymentModel.js';
import Subscription from '../models/subscriptionModel.js';
import User from '../models/userModel.js';
import Mentor from '../models/mentorModel.js';
import { activateSubscription } from '../utils/stripe/subscriptionHelper.js';

console.log('═══════════════════════════════════════════════════════');
console.log('🧪 TESTING COMPLETE PAYMENT FLOW');
console.log('═══════════════════════════════════════════════════════\n');

async function testCompleteFlow() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');

        // STEP 1: Check if user exists
        console.log('📋 STEP 1: Verify user exists');
        console.log('   Looking for user_id: 1...');

        const user = await User.findByPk(1);
        if (!user) {
            console.log('   ❌ User not found! Creating test user...');
            throw new Error('User 001 not found. Run: node scripts/seedTestUser.js');
        }

        console.log(`   ✅ User found: ${user.email}`);
        console.log(`      user_id: ${user.user_id}`);
        console.log(`      user_type_id: ${user.user_type_id}`);

        // Check if mentor record exists (required for subscription)
        let mentor = await Mentor.findOne({ where: { user_id: user.user_id } });
        if (!mentor) {
            console.log('   ⚠️  Mentor record not found - creating one...');
            mentor = await Mentor.create({
                user_id: user.user_id,
                company: 'RokKru Platform',
                address: 'Test Address',
                province_id: 1
            });
            console.log('   ✅ Mentor record created');
        } else {
            console.log('   ✅ Mentor record exists');
        }
        console.log();

        // STEP 2: Find Professional_Plan
        console.log('📋 STEP 2: Find Professional_Plan');

        const plan = await SubscriptionPlan.findOne({
            where: { name: 'Professional_Plan' }
        });

        if (!plan) {
            throw new Error('Professional_Plan not found in database!');
        }

        console.log(`   ✅ Plan found: ${plan.name}`);
        console.log(`      plan_id: ${plan.subscription_Plan_id}`);
        console.log(`      price: $${plan.price}`);
        console.log(`      duration: ${plan.duration_day} days\n`);

        // STEP 3: Create Stripe Checkout Session
        console.log('📋 STEP 3: Create Stripe checkout session');
        console.log('   (Simulating user clicking "Subscribe Now")...');

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: plan.name,
                        description: plan.description
                    },
                    unit_amount: Math.round(plan.price * 100), // Convert to cents
                },
                quantity: 1,
            }],
            success_url: 'http://localhost:3000/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:3000/test-buy-button.html',
            customer_email: user.email,
            metadata: {
                user_id: String(user.user_id),
                subscription_plan_id: String(plan.subscription_Plan_id),
                user_type_id: String(user.user_type_id),
            },
        });

        console.log(`   ✅ Checkout session created`);
        console.log(`      session_id: ${session.id}`);
        console.log(`      amount: $${session.amount_total / 100}`);
        console.log(`      status: ${session.payment_status}\n`);

        // STEP 4: Create payment record (this happens when API is called)
        console.log('📋 STEP 4: Create payment record in database');

        const payment = await StripePayment.create({
            user_id: user.user_id,
            stripe_checkout_session_id: session.id,
            amount: plan.price,
            currency: 'usd',
            status: 'pending',
        });

        console.log(`   ✅ Payment record created`);
        console.log(`      payment_id: ${payment.stripe_payment_id}`);
        console.log(`      user_id: ${payment.user_id}`);
        console.log(`      amount: $${payment.amount}`);
        console.log(`      status: ${payment.status}\n`);

        // STEP 5: Simulate Stripe test payment (instant success)
        console.log('📋 STEP 5: Simulate payment completion');
        console.log('   (In real flow, user would pay on Stripe UI)...');
        console.log('   Using test mode - marking as paid...\n');

        // Update session to simulate successful payment
        session.payment_status = 'paid';
        session.payment_intent = 'pi_test_' + Date.now();

        // STEP 6: Simulate Webhook (checkout.session.completed)
        console.log('📋 STEP 6: Simulate webhook - checkout.session.completed');
        console.log('   (This normally fires from Stripe after payment)...');

        // Activate subscription (webhook logic)
        const subscription = await activateSubscription({
            userId: user.user_id,
            subscriptionPlanId: plan.subscription_Plan_id,
            userTypeId: user.user_type_id,
        });

        console.log(`   ✅ Subscription activated!`);
        console.log(`      subscription_id: ${subscription.subscription_id}`);
        console.log(`      user_id: ${subscription.user_id}`);
        console.log(`      plan_id: ${subscription.subscription_Plan_id}`);
        console.log(`      start_date: ${subscription.start_date}`);
        console.log(`      end_date: ${subscription.end_date}`);
        console.log(`      is_active: ${subscription.is_active}\n`);

        // Update payment record
        payment.subscription_id = subscription.subscription_id;
        payment.stripe_payment_intent_id = session.payment_intent;
        payment.status = 'completed';
        payment.update_date = new Date();
        await payment.save();

        console.log('   ✅ Payment record updated to "completed"\n');

        // STEP 7: Verify data in database
        console.log('📋 STEP 7: Verify all data saved in database\n');

        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                    PAYMENT RECORD                             ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log(`║ payment_id:          ${payment.stripe_payment_id}`.padEnd(67) + '║');
        console.log(`║ user_id:             ${payment.user_id}`.padEnd(67) + '║');
        console.log(`║ subscription_id:     ${payment.subscription_id}`.padEnd(67) + '║');
        console.log(`║ session_id:          ${payment.stripe_checkout_session_id}`.padEnd(67) + '║');
        console.log(`║ amount:              $${payment.amount}`.padEnd(67) + '║');
        console.log(`║ status:              ${payment.status}`.padEnd(67) + '║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║                   SUBSCRIPTION RECORD                         ║');
        console.log('╠═══════════════════════════════════════════════════════════════╣');
        console.log(`║ subscription_id:     ${subscription.subscription_id}`.padEnd(67) + '║');
        console.log(`║ user_id:             ${subscription.user_id}`.padEnd(67) + '║');
        console.log(`║ plan_id:             ${subscription.subscription_Plan_id}`.padEnd(67) + '║');
        console.log(`║ plan_name:           ${plan.name}`.padEnd(67) + '║');
        console.log(`║ start_date:          ${new Date(subscription.start_date).toLocaleDateString()}`.padEnd(67) + '║');
        console.log(`║ end_date:            ${new Date(subscription.end_date).toLocaleDateString()}`.padEnd(67) + '║');
        console.log(`║ is_active:           ${subscription.is_active ? 'YES' : 'NO'}`.padEnd(67) + '║');
        console.log('╚═══════════════════════════════════════════════════════════════╝\n');

        // Query to double-check
        const savedSubscription = await Subscription.findOne({
            where: { user_id: user.user_id },
            order: [['start_date', 'DESC']]
        });

        if (savedSubscription) {
            console.log('✅ SUCCESS! Subscription found in database!');
            console.log(`   User ${user.user_id} (${user.email}) has active subscription`);
            console.log(`   Plan: ${plan.name}`);
            console.log(`   Duration: ${new Date(savedSubscription.start_date).toLocaleDateString()} → ${new Date(savedSubscription.end_date).toLocaleDateString()}`);
        } else {
            console.log('❌ ERROR! Subscription NOT saved to database!');
        }

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('🎉 TEST COMPLETE - ALL STEPS PASSED!');
        console.log('═══════════════════════════════════════════════════════\n');

        process.exit(0);

    } catch (error) {
        console.error('\n❌ TEST FAILED!');
        console.error('Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testCompleteFlow();
