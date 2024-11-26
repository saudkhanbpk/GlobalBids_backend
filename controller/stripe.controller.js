import Stripe from 'stripe';
import BidTransactionHistoryModel from '../model/transaction.model.js';
import { InternalServerError } from '../error/AppError.js';
import JobModel from '../model/job.model.js';
import BidModel from '../model/bids.model.js';
import { createRoom } from '../services/chat.room.service.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createPayment = async (req, res, next) => {
    const { leadPrice } = req.body;
    const amountInCents = Math.round(leadPrice * 100);

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'usd',
        });

        const data = {
            clientSecret: paymentIntent.client_secret,
            originalAmount: leadPrice,
        };
        return res.status(201).json(data);
    } catch (error) {
        return next(new InternalServerError());
    }
};

export const updateBidPayment = async (req, res, next) => {
    const {
        amount,
        jobId,
        bidId,
        cardDigit,
        contractor,
        transactionId,
        leadPrice,
        category,
        status,
    } = req.body;

    const userId = req.user._id;

    try {
        const newTransaction = new BidTransactionHistoryModel({
            user: userId,
            job: jobId,
            bid: bidId,
            category: category,
            amount: amount.toString(),
            transactionDate: new Date().toISOString(),
            status,
            cardDigit: cardDigit,
            transactionId: transactionId,
            leadPrice: leadPrice,
        });

        await newTransaction.save();

        const job = await JobModel.findByIdAndUpdate(
            jobId,
            {
                bidStatus: 'closed',
                progress: '0',
                status: 'in-progress',
                contractor: contractor,
            },
            { new: true }
        );

        await BidModel.findByIdAndUpdate(bidId, {
            bidTransaction: newTransaction._id,
        });

        if (status === 'succeeded') {
            await createRoom([job.user, userId], jobId);
        }

        return res.status(201).json({
            success: true,
            transaction: newTransaction,
            messages: 'Transaction ',
        });
    } catch (error) {
        return next(new InternalServerError());
    }
};

export const getTransactionHistory = async (req, res) => {
    try {
        const paymentIntents = await stripe.paymentIntents.list({
            limit: 10,
            created: { gte: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60 },
        });

        const transactions = paymentIntents.data.map((paymentIntent) => ({
            id: paymentIntent.id,
            amount: paymentIntent.amount_received / 100,
            currency: paymentIntent.currency,
            status: paymentIntent.status,
            createdAt: new Date(paymentIntent.created * 1000).toLocaleString(),
        }));

        return res.status(200).json({ transactions });
    } catch (err) {
        console.error(err);
        return res
            .status(500)
            .json({ message: 'Failed to fetch transaction history' });
    }
};

