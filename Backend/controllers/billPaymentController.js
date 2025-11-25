// controllers/billPaymentsController.js
const BillPayments = require('../models/BillPayments');

const billPaymentsController = {
    async getAllPayments(req, res) {
        try {
            const company_id = req.user.company_id;
            const { 
                payment_status, 
                apartment_id, 
                bill_id, 
                month, 
                year 
            } = req.query;

            const filters = {};
            if (payment_status) filters.payment_status = payment_status;
            if (apartment_id) filters.apartment_id = apartment_id;
            if (bill_id) filters.bill_id = bill_id;
            if (month) filters.month = month;
            if (year) filters.year = year;

            const payments = await BillPayments.findAllByCompany(company_id, filters);
            
            res.json({
                success: true,
                data: payments
            });
        } catch (err) {
            console.error('Get bill payments error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching bill payments'
            });
        }
    },

    async getPaymentById(req, res) {
        try {
            const { id } = req.params;
            const payment = await BillPayments.findById(id);

            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                data: payment
            });
        } catch (err) {
            console.error('Get payment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching payment'
            });
        }
    },

    async getPaymentSummary(req, res) {
        try {
            const company_id = req.user.company_id;
            const summary = await BillPayments.getPaymentSummary(company_id);
            
            res.json({
                success: true,
                data: summary
            });
        } catch (err) {
            console.error('Get payment summary error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching payment summary'
            });
        }
    },

    async getMonthlySummary(req, res) {
        try {
            const company_id = req.user.company_id;
            const { year } = req.query;
            const currentYear = year || new Date().getFullYear();
            
            const summary = await BillPayments.getMonthlySummary(company_id, currentYear);
            
            res.json({
                success: true,
                data: summary
            });
        } catch (err) {
            console.error('Get monthly summary error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching monthly summary'
            });
        }
    },

    async updatePaymentStatus(req, res) {
        try {
            const { id } = req.params;
            const { payment_status, paidAmount } = req.body;

            if (!payment_status) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment status is required'
                });
            }

            const validStatuses = ['Pending', 'Paid', 'Failed', 'Refunded'];
            if (!validStatuses.includes(payment_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment status'
                });
            }

            const updatedPayment = await BillPayments.updatePaymentStatus(id, payment_status, paidAmount);
            
            res.json({
                success: true,
                message: 'Payment status updated successfully',
                data: updatedPayment
            });
        } catch (err) {
            console.error('Update payment status error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating payment status'
            });
        }
    }
};

module.exports = billPaymentsController;