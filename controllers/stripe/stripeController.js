import stripe from '../../config/stripe.js';
import SubscriptionPlan from '../../models/subscriptionPlanModel.js';
import StripePayment from '../../models/stripePaymentModel.js';
import User from '../../models/userModel.js';
import { toStripeAmount } from '../../utils/stripe/stripeAmounts.js';

function requireStripe(res) {
  if (!stripe) {
    res.status(503).json({ message: 'Stripe is not configured. Set STRIPE_SECRET_KEY in .env' });
    return false;
  }
  return true;
}

function isValidRedirectUrl(url) {
  if (!url) return true;

  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
}
export const getStripeConfig = (req, res) => {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!publishableKey) {
    return res.status(503).json({ message: 'STRIPE_PUBLISHABLE_KEY is not configured' });
  }
  return res.json({
    publishableKey,
    currency: (process.env.STRIPE_CURRENCY || 'usd').toLowerCase(),
  });
};

export const createCheckoutSession = async (req, res) => {
  try {
    if (!requireStripe(res)) return;

    const {
      subscription_plan_id: subscriptionPlanId,
      user_id: userId,
      email,
      success_url: successUrl,
      cancel_url: cancelUrl,
    } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ message: 'user_id is required' });
    }
    if (!email) {
      return res.status(400).json({ message: 'email is required' });
    }

    const parsedPlanId = Number(subscriptionPlanId);
    if (!Number.isInteger(parsedPlanId) || parsedPlanId <= 0) {
      return res.status(400).json({ message: 'subscription_plan_id must be a positive integer' });
    }

    if (!isValidRedirectUrl(successUrl) || !isValidRedirectUrl(cancelUrl)) {
      return res.status(400).json({ message: 'success_url and cancel_url must be valid http(s) URLs' });
    }

    const plan = await SubscriptionPlan.findByPk(parsedPlanId);
    if (!plan) {
      return res.status(404).json({ message: 'Subscription plan not found' });
    }

    const currency = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    const amount = Number(plan.price);
    const unitAmount = toStripeAmount(amount, currency);
    if (!unitAmount) {
      return res.status(400).json({ message: 'Subscription plan price must be greater than 0' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: plan.name,
              description: plan.description || undefined,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: successUrl || `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${frontendUrl}/payment/cancel`,
      customer_email: email,
      metadata: {
        user_id: String(userId),
        subscription_plan_id: String(parsedPlanId),
        user_type_id: String(user.user_type_id),
      },
    });

    // Create payment record in database - payment_id is auto-generated
    const payment = await StripePayment.create({
      user_id: userId,
      stripe_checkout_session_id: session.id,
      amount,
      currency,
      status: 'pending',
    });

    console.log('✅ Payment record created:');
    console.log('   payment_id:', payment.stripe_payment_id);
    console.log('   user_id:', payment.user_id);
    console.log('   session_id:', payment.stripe_checkout_session_id);
    console.log('   amount:', payment.amount);
    console.log('   status:', payment.status);

    return res.status(201).json({
      sessionId: session.id,
      url: session.url,
      payment_id: payment.stripe_payment_id, // Return the auto-generated payment_id
    });
  } catch (error) {
    console.error('❌ Create checkout error:', error);
    return res.status(500).json({ message: error.message });
  }
};

export const listSubscriptionPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.findAll({
      attributes: [
        'subscription_Plan_id',
        'name',
        'price',
        'duration_day',
        'description',
      ],
    });
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getCheckoutSession = async (req, res) => {
  try {
    if (!requireStripe(res)) return;

    const { sessionId } = req.params;
    // Allow user_id from query params for no-auth access
    const userId = req.query.user_id ? Number(req.query.user_id) : null;

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const payment = await StripePayment.findOne({
      where: { stripe_checkout_session_id: sessionId },
    });

    if (!payment) {
      return res.status(404).json({ message: 'Checkout session not found' });
    }

    // If user_id is provided, verify it matches
    if (userId && payment.user_id !== userId) {
      return res.status(403).json({ message: 'Unauthorized access to this session' });
    }

    return res.json({
      sessionId: session.id,
      paymentId: payment.stripe_payment_id,
      status: session.payment_status,
      amountTotal: session.amount_total,
      currency: session.currency,
      subscriptionStatus: payment.status,
      subscriptionId: payment.subscription_id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
