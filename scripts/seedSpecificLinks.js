import 'dotenv/config';
import stripe from '../config/stripe.js';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

// Your exact payment links
const paymentLinks = [
    'https://buy.stripe.com/test_7sY4gz1uccbFd53eUV',  // First link (ends in fIs05)
    'https://buy.stripe.com/test_7sY4gz2yga3x9SR39H'   // Second link (ends in fIs04)
];

async function seedSpecificLinks() {
    try {
        if (!stripe) {
            throw new Error('Stripe is not configured. Set STRIPE_SECRET_KEY in .env');
        }

        await sequelize.authenticate();
        console.log('✅ Connected to database');

        console.log('\n🔍 Analyzing your payment links:');
        paymentLinks.forEach((link, i) => {
            console.log(`   ${i + 1}. ${link}`);
        });

        // Delete all existing plans
        const deletedCount = await SubscriptionPlan.destroy({ where: {} });
        console.log(`\n🗑️  Deleted ${deletedCount} old plans`);

        console.log('\n🔄 Fetching ALL products from Stripe to find matches...\n');

        // Fetch all products with their payment links
        const products = await stripe.products.list({
            active: true,
            expand: ['data.default_price'],
            limit: 100
        });

        console.log(`📦 Found ${products.data.length} active products in Stripe\n`);
        console.log('═══════════════════════════════════════════════════════\n');

        const plansToCreate = [];

        // Show all products to help you identify
        for (let i = 0; i < products.data.length; i++) {
            const product = products.data[i];
            const price = product.default_price;

            if (!price || typeof price === 'string') continue;

            const amount = price.unit_amount / 100;
            const currency = price.currency.toUpperCase();

            console.log(`${i + 1}. Product: "${product.name}"`);
            console.log(`   Price: $${amount} ${currency}`);
            console.log(`   Product ID: ${product.id}`);
            console.log(`   Price ID: ${price.id}`);
            console.log(`   Description: ${product.description || '(none)'}`);

            // Take first 2 products with valid prices
            if (plansToCreate.length < 2) {
                plansToCreate.push({
                    name: product.name,
                    price: amount,
                    duration_day: 30,
                    description: product.description || `${product.name} subscription plan`,
                    stripe_product_id: product.id,
                    stripe_price_id: price.id
                });
                console.log(`   ✅ WILL BE ADDED TO DATABASE\n`);
            } else {
                console.log(`   ⏭️  Skipped (already have 2 plans)\n`);
            }
        }

        // Create plans
        if (plansToCreate.length > 0) {
            const createdPlans = await SubscriptionPlan.bulkCreate(plansToCreate);

            console.log('═══════════════════════════════════════════════════════');
            console.log(`\n✅ Created ${createdPlans.length} plans:\n`);
            createdPlans.forEach((plan, i) => {
                console.log(`   ${i + 1}. ID ${plan.subscription_Plan_id}: "${plan.name}" - $${plan.price}`);
            });
        } else {
            console.log('❌ No products found to seed');
        }

        // Show final summary
        console.log('\n╔═══════════════════════════════════════════════════════════════╗');
        console.log('║            SUBSCRIPTION PLANS IN DATABASE                     ║');
        console.log('╠════╦══════════════════════════════╦══════════╦════════════════╣');
        console.log('║ ID ║ Name                         ║ Price    ║ Duration       ║');
        console.log('╠════╬══════════════════════════════╬══════════╬════════════════╣');

        const allPlans = await SubscriptionPlan.findAll({
            order: [['subscription_Plan_id', 'ASC']]
        });

        if (allPlans.length === 0) {
            console.log('║    ║ (empty)                      ║          ║                ║');
        } else {
            allPlans.forEach(plan => {
                const id = String(plan.subscription_Plan_id).padEnd(2);
                const name = (plan.name || '').substring(0, 28).padEnd(28);
                const price = `$${plan.price}`.padEnd(8);
                const duration = `${plan.duration_day} days`.padEnd(14);
                console.log(`║ ${id} ║ ${name} ║ ${price} ║ ${duration} ║`);
            });
        }

        console.log('╚════╩══════════════════════════════╩══════════╩════════════════╝');

        console.log('\n💡 NOTE: If the product names are wrong (like "15"), please:');
        console.log('   1. Go to https://dashboard.stripe.com/test/products');
        console.log('   2. Edit the product name to what you want');
        console.log('   3. Run this script again');
        console.log('\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

seedSpecificLinks();
