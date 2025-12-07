//controllers/billPaymentController.js
const BillPayment = require('../models/BillPayment');

const billPaymentController = {
    async getAllPayments(req, res) {
        try {
            const company_id = req.user.company_id;
            const { 
                payment_status, 
                apartment_id, 
                billtype, 
                floor_id,
                house_id,
                month, 
                year 
            } = req.query;

            const filters = {};
            if (payment_status) filters.payment_status = payment_status;
            if (apartment_id) filters.apartment_id = apartment_id;
            if (billtype) filters.billtype = billtype; // Changed from bill_id
            if (floor_id) filters.floor_id = floor_id; // Added
            if (house_id) filters.house_id = house_id; // Added
            if (month) filters.month = month;
            if (year) filters.year = year;

            console.log('Filters received:', filters); // Debug log

            const payments = await BillPayment.findAllByCompany(company_id, filters);
            
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
            const payment = await BillPayment.findById(id);

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
            const summary = await BillPayment.getPaymentSummary(company_id);
            
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
            
            const summary = await BillPayment.getMonthlySummary(company_id, currentYear);
            
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

            const updatedPayment = await BillPayment.updatePaymentStatus(id, payment_status, paidAmount);
            
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
    },

    async getMeasurableBillPayments(req, res) {
        try {
            const company_id = req.user.company_id;
            const { 
                payment_status, 
                apartment_id, 
                month, 
                year 
            } = req.query;

            const filters = {};
            if (payment_status) filters.payment_status = payment_status;
            if (apartment_id) filters.apartment_id = apartment_id;
            if (month) filters.month = month;
            if (year) filters.year = year;

            const payments = await BillPayment.findMeasurableBillPayments(company_id, filters);
            
            res.json({
                success: true,
                data: payments
            });
        } catch (err) {
            console.error('Get measurable bill payments error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching measurable bill payments'
            });
        }
    }
}
module.exports=billPaymentController;