// routes/billPayments.js
const express = require('express');
const router = express.Router();
const billPaymentController = require('../controllers/billPaymentController');
const { authenticateToken } = require('../middleware/auth');
const { authenticateHouseOwner } = require('../middleware/houseOwnerAuth');

// Add this route with authenticateHouseOwner middleware
router.get('/house-owner/me', authenticateHouseOwner, billPaymentController.getMyBillPayments);
// Add this route to routes/billPayments.js (temporary for debugging)
router.get('/test/my-bills-debug', authenticateHouseOwner, async (req, res) => {
    try {
        const houseowner_id = req.houseowner?.id;
        
        if (!houseowner_id) {
            return res.status(400).json({
                success: false,
                message: 'No houseowner ID found'
            });
        }

        // Check if houseowner exists
        const [houseowner] = await pool.execute(
            'SELECT id, name, email FROM houseowner WHERE id = ?',
            [houseowner_id]
        );

        if (houseowner.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Houseowner not found in database'
            });
        }

        // Check bill payments count
        const [billPayments] = await pool.execute(
            'SELECT COUNT(*) as count FROM bill_payments WHERE houseowner_id = ?',
            [houseowner_id]
        );

        // Get sample bill payments
        const [samplePayments] = await pool.execute(
            `SELECT bp.id, bp.houseowner_id, b.bill_name, bp.payment_status 
             FROM bill_payments bp
             LEFT JOIN bills b ON bp.bill_id = b.id
             WHERE bp.houseowner_id = ?
             LIMIT 5`,
            [houseowner_id]
        );

        // Get all houseowner IDs in bill_payments to see structure
        const [allHouseownerIds] = await pool.execute(
            'SELECT DISTINCT houseowner_id FROM bill_payments WHERE houseowner_id IS NOT NULL LIMIT 10'
        );

        res.json({
            success: true,
            data: {
                houseowner: houseowner[0],
                bill_payments_count: billPayments[0].count,
                sample_payments: samplePayments,
                all_houseowner_ids_in_table: allHouseownerIds,
                current_houseowner_id: houseowner_id
            }
        });

    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// Add this to routes/billPayments.js (temporary)
router.get('/debug/my-bills-db-check', authenticateHouseOwner, async (req, res) => {
    try {
        const houseowner_id = req.houseowner.id;
        
        // Direct database queries to check what's there
        const queries = [
            // Check total bill payments for this houseowner
            `SELECT COUNT(*) as count FROM bill_payments WHERE houseowner_id = ?`,
            
            // Check bill payments with details
            `SELECT 
                bp.id, 
                bp.houseowner_id,
                bp.payment_status,
                bp.pendingAmount,
                bp.paidAmount,
                b.bill_name,
                COALESCE(gb.year, gmb.year) as year,
                COALESCE(gb.month, gmb.month) as month
             FROM bill_payments bp
             LEFT JOIN bills b ON bp.bill_id = b.id
             LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
             LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
             WHERE bp.houseowner_id = ?
             LIMIT 10`,
            
            // Check if houseowner exists in houseowner table
            `SELECT id, name, email FROM houseowner WHERE id = ?`,
            
            // Check if there are ANY bill payments at all
            `SELECT COUNT(*) as total_payments FROM bill_payments`,
            
            // Check bill payments for 2026 specifically
            `SELECT 
                bp.id,
                bp.houseowner_id,
                COALESCE(gb.year, gmb.year) as year
             FROM bill_payments bp
             LEFT JOIN generate_bills gb ON bp.generate_bills_id = gb.id
             LEFT JOIN generateMeasurable_bills gmb ON bp.generateMeasurable_bills_id = gmb.id
             WHERE (gb.year = 2026 OR gmb.year = 2026)`
        ];
        
        const results = {};
        
        // Execute each query
        results['total_for_houseowner'] = (await pool.execute(queries[0], [houseowner_id]))[0];
        results['sample_payments'] = (await pool.execute(queries[1], [houseowner_id]))[0];
        results['houseowner_info'] = (await pool.execute(queries[2], [houseowner_id]))[0];
        results['all_payments_count'] = (await pool.execute(queries[3]))[0];
        results['payments_2026'] = (await pool.execute(queries[4]))[0];
        
        res.json({
            success: true,
            houseowner_id: houseowner_id,
            data: results
        });
        
    } catch (error) {
        console.error('Debug DB check error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
});

// router.use(authenticateToken);

//Routes
router.get('/', authenticateToken, billPaymentController.getAllPayments);
router.get('/summary', authenticateToken, billPaymentController.getPaymentSummary);
router.get('/monthly-summary', authenticateToken, billPaymentController.getMonthlySummary);
router.get('/:id', authenticateToken, billPaymentController.getPaymentById);
router.patch('/:id/status', authenticateToken, billPaymentController.updatePaymentStatus);
router.get('/measurable', authenticateToken, billPaymentController.getMeasurableBillPayments);
router.delete('/:id', authenticateToken, billPaymentController.deletePayment);

module.exports = router;