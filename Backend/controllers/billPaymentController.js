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
            const { payment_status, paidAmount, paid_at } = req.body;

            if (!payment_status) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment status is required'
                });
            }

            const validStatuses = ['Pending', 'Partial', 'Paid', 'Failed', 'Refunded'];
            if (!validStatuses.includes(payment_status)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment status'
                });
            }

            // Validate paid_at if provided
            if (paid_at && isNaN(Date.parse(paid_at))) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid payment date format'
                });
            }

            const updatedPayment = await BillPayment.updatePaymentStatus(
                id, 
                payment_status, 
                paidAmount, 
                paid_at
            );
            
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
    },

        async deletePayment(req, res) {
        try {
            const { id } = req.params;
            const company_id = req.user.company_id;

            // First check if payment exists and belongs to company
            const payment = await BillPayment.findById(id);
            
            if (!payment) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            // Verify payment belongs to user's company (optional security check)
            if (payment.company_id !== company_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Unauthorized to delete this payment'
                });
            }

            const deleted = await BillPayment.delete(id);
            
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    message: 'Payment not found'
                });
            }

            res.json({
                success: true,
                message: 'Payment deleted successfully'
            });

        } catch (err) {
            console.error('Delete payment error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting payment'
            });
        }
    },

    // Add this method to controllers/billPaymentController.js
    // In controllers/billPaymentController.js - update getMyBillPayments method
async getMyBillPayments(req, res) {
    try {
        console.log('🔍 [DEBUG] getMyBillPayments called');
        console.log('🔍 [DEBUG] req.houseowner:', req.houseowner);
        console.log('🔍 [DEBUG] req.user:', req.user);
        console.log('🔍 [DEBUG] Headers:', req.headers);
        
        // Get house owner ID from authenticated user
        const houseowner_id = req.houseowner?.id || req.houseowner?.houseowner_id;
        
        console.log('🔍 [DEBUG] houseowner_id extracted:', houseowner_id);
        
        if (!houseowner_id) {
            console.error('❌ [DEBUG] No houseowner_id found in request');
            return res.status(400).json({
                success: false,
                message: 'House owner ID not found. Please log in again.'
            });
        }

        const { 
            payment_status, 
            month, 
            year 
        } = req.query;

        const filters = {};
        if (payment_status) filters.payment_status = payment_status;
        if (month) filters.month = month;
        if (year) filters.year = year;

        console.log('🔍 [DEBUG] Filters:', filters);
        console.log('🔍 [DEBUG] Calling BillPayment.findAllByHouseOwner with:', { houseowner_id, filters });

        // Get bill payments for the house owner
        const payments = await BillPayment.findAllByHouseOwner(houseowner_id, filters);
        
        console.log('✅ [DEBUG] Payments found:', payments.length);
        if (payments.length > 0) {
            console.log('✅ [DEBUG] First payment:', {
                id: payments[0].id,
                bill_name: payments[0].bill_name,
                houseowner_id: payments[0].houseowner_id
            });
        }

        // Format the response
        const formattedPayments = payments.map(payment => ({
            id: payment.id,
            bill_name: payment.bill_name,
            billtype: payment.billtype,
            month: payment.month,
            year: payment.year,
            generated_total_amount: payment.generated_total_amount,
            totalAmount: payment.generated_total_amount, // For frontend compatibility
            paidAmount: payment.paidAmount,
            pendingAmount: payment.pendingAmount,
            payment_status: payment.payment_status,
            due_date: payment.due_date,
            paid_at: payment.paid_at,
            created_at: payment.created_at,
            updated_at: payment.updated_at,
            // House details
            apartment_id: payment.apartment_id,
            apartment_name: payment.apartment_name,
            floor_id: payment.floor_id,
            floor_number: payment.floor_number,
            house_id: payment.house_id,
            house_number: payment.house_number,
            house_type: payment.house_type,
            // Bill source
            bill_source_type: payment.bill_source_type,
            // Owner details
            houseowner_id: payment.houseowner_id,
            houseowner_name: payment.houseowner_name,
            houseowner_email: payment.houseowner_email,
            description: `${payment.bill_name} bill for ${payment.month} ${payment.year}`
        }));

        // Calculate summary
        const summary = {
            totalBills: payments.length,
            totalAmount: payments.reduce((sum, p) => sum + (parseFloat(p.generated_total_amount) || 0), 0),
            paidAmount: payments.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0),
            pendingAmount: payments.reduce((sum, p) => sum + (parseFloat(p.pendingAmount) || 0), 0)
        };

        res.json({
            success: true,
            data: formattedPayments,
            summary: summary,
            count: payments.length,
            debug: { // Add debug info temporarily
                houseowner_id_used: houseowner_id,
                query_params: req.query
            }
        });
    } catch (err) {
        console.error('❌ [ERROR] Get my bill payments error:', err);
        console.error('❌ [ERROR] Stack trace:', err.stack);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching bill payments',
            error: err.message // Add error message temporarily for debugging
        });
    }
}
}
module.exports=billPaymentController;