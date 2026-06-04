import 'dotenv/config';

const API_BASE = 'http://localhost:3000/api/v1';

// Test user credentials
const testUser = {
    email: 'test.payment@rokkru.com',
    password: 'TestPassword123!',
    first_name: 'Test',
    last_name: 'User',
    user_type_id: 2 // Assuming 2 is for regular users/mentors
};

async function makeRequest(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
    }

    return data;
}

async function testFullPaymentFlow() {
    console.log('\n🧪 Starting Full Payment Flow Test...\n');
    console.log('='.repeat(60));

    try {
        // Step 1: Register user
        console.log('\n📝 STEP 1: Registering test user...');
        let authToken;

        try {
            const registerData = await makeRequest(`${API_BASE}/auth/register`, {
                method: 'POST',
                body: JSON.stringify(testUser),
            });
            console.log('✅ User registered successfully');
            console.log(`   User ID: ${registerData.user?.user_id || 'N/A'}`);
            console.log(`   Email: ${testUser.email}`);
        } catch (error) {
            if (error.message.includes('already exists') || error.message.includes('duplicate')) {
                console.log('ℹ️  User already exists, will try to login...');
            } else {
                console.error('❌ Registration failed:', error.message);
                // Try to continue with login anyway
            }
        }

        // Step 2: Login
        console.log('\n🔐 STEP 2: Logging in...');
        const loginData = await makeRequest(`${API_BASE}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: testUser.email,
                password: testUser.password,
            }),
        });

        authToken = loginData.accessToken || loginData.token || loginData.access_token;
        console.log('✅ Login successful');
        console.log(`   Token: ${authToken.substring(0, 20)}...`);
        console.log(`   User: ${loginData.user?.first_name} ${loginData.user?.last_name}`);

        // Step 3: Get available subscription plans
        console.log('\n📋 STEP 3: Fetching subscription plans...');
        const plans = await makeRequest(`${API_BASE}/stripe/plans`);

        if (!plans || plans.length === 0) {
            throw new Error('No subscription plans available');
        }

        console.log(`✅ Found ${plans.length} subscription plans:`);
        plans.forEach(plan => {
            console.log(`   - ${plan.name}: $${plan.price} (ID: ${plan.subscription_Plan_id})`);
        });

        // Step 4: Create checkout session (test with first plan)
        const selectedPlan = plans[0];
        console.log(`\n💳 STEP 4: Creating checkout session for "${selectedPlan.name}"...`);

        const checkoutData = await makeRequest(`${API_BASE}/stripe/create-checkout-session`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({
                subscription_plan_id: selectedPlan.subscription_Plan_id,
                success_url: 'http://localhost:5173/payment/success?session_id={CHECKOUT_SESSION_ID}',
                cancel_url: 'http://localhost:5173/payment/cancel',
            }),
        });

        console.log('✅ Checkout session created successfully!');
        console.log(`   Session ID: ${checkoutData.sessionId}`);
        console.log(`   Payment URL: ${checkoutData.url}`);

        // Step 5: Display results
        console.log('\n' + '='.repeat(60));
        console.log('🎉 TEST COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));

        console.log('\n📊 SUMMARY:');
        console.log(`   ✅ User: ${testUser.email}`);
        console.log(`   ✅ Plan: ${selectedPlan.name} ($${selectedPlan.price})`);
        console.log(`   ✅ Session: ${checkoutData.sessionId}`);

        console.log('\n🔗 STRIPE CHECKOUT URL:');
        console.log('   ' + checkoutData.url);

        console.log('\n📝 NEXT STEPS:');
        console.log('   1. Open the URL above in your browser');
        console.log('   2. Use Stripe test card: 4242 4242 4242 4242');
        console.log('   3. Expiry: 12/34, CVC: 123, ZIP: 12345');
        console.log('   4. Complete the payment');
        console.log('   5. You will be redirected to success page');

        console.log('\n💾 CREDENTIALS FOR FUTURE TESTS:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        console.log(`   Token: ${authToken.substring(0, 30)}...`);

        console.log('\n✨ Payment link is ready for testing!\n');

        return {
            success: true,
            user: testUser.email,
            plan: selectedPlan.name,
            sessionId: checkoutData.sessionId,
            paymentUrl: checkoutData.url,
            token: authToken,
        };

    } catch (error) {
        console.log('\n' + '='.repeat(60));
        console.log('❌ TEST FAILED');
        console.log('='.repeat(60));
        console.error('\n🔥 Error:', error.message);

        if (error.message.includes('Not authorized') || error.message.includes('401')) {
            console.log('\n💡 TIP: Check that JWT authentication is working correctly');
        } else if (error.message.includes('ECONNREFUSED')) {
            console.log('\n💡 TIP: Make sure the backend server is running (npm start)');
        } else if (error.message.includes('Stripe')) {
            console.log('\n💡 TIP: Check your Stripe API keys in .env file');
        }

        console.log('\n');
        return {
            success: false,
            error: error.message,
        };
    }
}

// Run the test
testFullPaymentFlow()
    .then(() => process.exit(0))
    .catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
