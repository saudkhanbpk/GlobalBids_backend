import Stripe from 'stripe';
import BidTransactionHistoryModel from '../model/transaction.model.js';
import { InternalServerError } from '../error/AppError.js';
import JobModel from "../model/job.model.js"
import BidModel from '../model/bids.model.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res, next) => {
    const { amount, jobId, bidId, cardDigit, contractor, category, leadprice } = req.body;

    const amountInCents = Math.round(amount * 100);

    let leadPrice = 0;
    let priceCategory = '';

    if (amount >= 0 && amount <= 999) {
        leadPrice = 30;
        priceCategory = 'small';
    } else if (amount >= 1000 && amount <= 9999) {
        leadPrice = 50;
        priceCategory = 'medium';
    } else if (amount >= 10000) {
        leadPrice = 100;
        priceCategory = 'large';
    }

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
        });

        const newTransaction = new BidTransactionHistoryModel({
            job: jobId,
            bid: bidId,
            category: priceCategory,
            amount: amount.toString(),
            transactionDate: new Date().toISOString(),
            status: 'paid',
            cardDigit: cardDigit,
            transactionId: paymentIntent.id,
            leadPrice: leadPrice,
        });

        await newTransaction.save();

        await JobModel.findByIdAndUpdate(
            jobId,
            {
                bidStatus: "closed",
                progress: "0",
                status: "in-progress",
                contractor: contractor,
            },
            { new: true }
        );

        await BidModel.findByIdAndUpdate(bidId, { bidTransaction: newTransaction })

        const data = {
            clientSecret: paymentIntent.client_secret,
            totalAmountCharged: amount,
            originalAmount: amount,
            leadPrice: leadPrice,
            category: priceCategory
        };
        return res.status(201).json(data);

    } catch (error) {
        console.error('Error processing payment:', error);
        return next(new InternalServerError());
    }
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



