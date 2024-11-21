// import Stripe from 'stripe';

// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// export const createPayment = async (req, res) => {
//     const { amount } = req.body;
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency: 'usd',
//         });
//         res.send({
//             clientSecret: paymentIntent.client_secret,
//         });
//     } catch (err) {
//         res.status(500).send({ error: err.message });
//     }
// };


import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res) => {
    const { amount } = req.body;

    const amountInCents = Math.round(amount * 100);

    const processingFee = Math.round(amountInCents * 0.05);

    const paymentIntent = await stripe.paymentIntents.create({
        amount: processingFee,
        currency: 'usd',
    });

    res.send({
        clientSecret: paymentIntent.client_secret,
        processingFee: processingFee / 100,
        totalAmountCharegd: processingFee / 100,
        originalAmount: amount,
    });
};

export const getTransactionHistory = async (req, res) => {
    try {
        const paymentIntents = await stripe.paymentIntents.list({
            limit: 10,
            created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
        });

        const transactions = paymentIntents.data.map(paymentIntent => ({
            id: paymentIntent.id,
            amount: paymentIntent.amount_received / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            createdAt: new Date(paymentIntent.created * 1000).toLocaleString(),
        }));

        return res.status(200).json({ transactions });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Failed to fetch transaction history' });
    }
};



