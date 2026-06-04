import 'dotenv/config';
import sequelize from '../config/config.js';
import SubscriptionPlan from '../models/subscriptionPlanModel.js';

async function seedPlans() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to database');

        // Check if plans already exist
        const existingPlans = await SubscriptionPlan.findAll();
        if (existingPlans.length > 0) {
            console.log('📋 Plans already exist:');
            existingPlans.forEach(plan => {
                console.log(`  - ${plan.name}: $${plan.price}`);
            });
            process.exit(0);
        }

        // Create sample plans
        const plans = await SubscriptionPlan.bulkCreate([
            {
                admin_id: 1, // You may need to adjust this
                name: 'Basic Plan',
                price: 9.99,
                duration_day: new Date('2025-12-31'),
                description: 'Perfect for getting started',
            },
            {
                admin_id: 1,
                name: 'Premium Plan',
                price: 29.99,
                duration_day: new Date('2025-12-31'),
                description: 'Most popular - full access',
            },
            {
                admin_id: 1,
                name: 'Enterprise Plan',
                price: 99.99,
                duration_day: new Date('2025-12-31'),
                description: 'For teams and organizations',
            }
        ]);

        console.log('✅ Created sample subscription plans:');
        plans.forEach(plan => {
            console.log(`  - ${plan.name}: $${plan.price} (ID: ${plan.subscription_Plan_id})`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

seedPlans();
