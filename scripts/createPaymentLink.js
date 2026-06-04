import 'dotenv/config';
import stripe from '../config/stripe.js';

// Simple script to create a test payment link
async function createPaymentLink() {
    try {
        console.log('\n💳 Creating Stripe Payment Link...\n');

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Basic Plan',
                        description: 'Test subscription',
                    },
                    unit_amount: 999, // $9.99
                },
                quantity: 1,
            }],
            success_url: 'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: 'http://localhost:5173/payment/cancel',
            customer_email: 'test@rokkru.com',
        });

        console.log('✅ Payment link created!\n');
        console.log('🔗 URL:', session.url);
        console.log('\n📝 Test Card: 4242 4242 4242 4242');
        console.log('   Expiry: 12/34, CVC: 123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createPaymentLink();
