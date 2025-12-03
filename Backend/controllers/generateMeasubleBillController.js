const GenerateMeasurableBill = require('../models/GenerateMeasurableBill')

const generateMeasurableBillController = {
    // Create a single measurable bill
    async createMeasurableBill(req, res) {
        try {
            const {
                apartment_id,
                floor_id,
                house_id,
                bill_id,
                year,
                month,
                previous_reading,
                current_reading,
                used_units,
                totalAmount,
                due_date
            } = req.body;
            
            const company_id = req.user.company_id;

            // Validation
            if (!apartment_id || !house_id || !bill_id || !year || !month || totalAmount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Apartment, house, bill, year, month, and total amount are required'
                });
            }

            // Check for duplicate bill for same house, bill, month, year
            const isDuplicate = await GenerateMeasurableBill.checkDuplicate(
                company_id, bill_id, parseInt(year), month, house_id
            );
            
            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'Measurable bill already generated for this house, bill, and period'
                });
            }

            // Auto-calculate used_units if readings are provided
            let calculatedUsedUnits = used_units;
            if (previous_reading !== undefined && current_reading !== undefined) {
                calculatedUsedUnits = current_reading - previous_reading;
                if (calculatedUsedUnits < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current reading must be greater than or equal to previous reading'
                    });
                }
            }

            // Create measurable bill
            const newMeasurableBill = await GenerateMeasurableBill.create({
                company_id,
                apartment_id,
                floor_id: floor_id || null,
                house_id,
                bill_id,
                year: parseInt(year),
                month,
                previous_reading: previous_reading || 0,
                current_reading: current_reading || 0,
                used_units: calculatedUsedUnits || 0,
                totalAmount: parseFloat(totalAmount)
            });

            // Create bill payment record
            const billPaymentId = `billpay_measurable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await GenerateMeasurableBill.createBillPayment({
                id: billPaymentId,
                company_id,
                apartment_id,
                floor_id: floor_id || null,
                house_id,
                bill_id,
                generate_measurable_bills_id: newMeasurableBill.id,
                pendingAmount: parseFloat(totalAmount),
                due_date: due_date || null
            });

            res.status(201).json({
                success: true,
                message: 'Measurable bill generated successfully',
                data: newMeasurableBill
            });

        } catch (err) {
            console.error('Create measurable bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating measurable bill'
            });
        }
    },

    // Create multiple measurable bills (for bulk generation)
    async createMultipleMeasurableBills(req, res) {
        try {
            const { bills, due_date } = req.body; // bills is array of bill objects
            const company_id = req.user.company_id;

            if (!Array.isArray(bills) || bills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bills array is required'
                });
            }

            // Prepare bills data and check for duplicates
            const billsToCreate = [];
            const errors = [];
            const generatedBills = [];

            for (const billData of bills) {
                try {
                    const {
                        apartment_id,
                        floor_id,
                        house_id,
                        bill_id,
                        year,
                        month,
                        previous_reading,
                        current_reading,
                        used_units,
                        totalAmount
                    } = billData;

                    // Check for duplicate
                    const isDuplicate = await GenerateMeasurableBill.checkDuplicate(
                        company_id, bill_id, parseInt(year), month, house_id
                    );

                    if (!isDuplicate) {
                        // Auto-calculate used_units if readings are provided
                        let calculatedUsedUnits = used_units;
                        if (previous_reading !== undefined && current_reading !== undefined) {
                            calculatedUsedUnits = current_reading - previous_reading;
                            if (calculatedUsedUnits < 0) {
                                errors.push(`House ${house_id}: Current reading must be greater than previous reading`);
                                continue;
                            }
                        }

                        billsToCreate.push({
                            company_id,
                            apartment_id,
                            floor_id: floor_id || null,
                            house_id,
                            bill_id,
                            year: parseInt(year),
                            month,
                            previous_reading: previous_reading || 0,
                            current_reading: current_reading || 0,
                            used_units: calculatedUsedUnits || 0,
                            totalAmount: parseFloat(totalAmount)
                        });
                    } else {
                        errors.push(`House ${house_id}: Bill already exists for ${month} ${year}`);
                    }
                } catch (error) {
                    errors.push(`House ${billData.house_id}: ${error.message}`);
                }
            }

            if (billsToCreate.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No bills to create (all may be duplicates)',
                    errors
                });
            }

            // Create all bills
            const createdBills = await GenerateMeasurableBill.createMultiple(billsToCreate);

            // Create bill payment records
            for (const bill of createdBills) {
                const billPaymentId = `billpay_measurable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await GenerateMeasurableBill.createBillPayment({
                    id: billPaymentId,
                    company_id,
                    apartment_id: bill.apartment_id,
                    floor_id: bill.floor_id || null,
                    house_id: bill.house_id,
                    bill_id: bill.bill_id,
                    generate_measurable_bills_id: bill.id,
                    pendingAmount: bill.totalAmount,
                    due_date: due_date || null
                });

                generatedBills.push(bill);
            }

            res.status(201).json({
                success: true,
                message: `Successfully generated ${generatedBills.length} measurable bills`,
                data: generatedBills,
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (err) {
            console.error('Create multiple measurable bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating multiple measurable bills'
            });
        }
    },

    // Get all measurable bills for a company
    async getAllMeasurableBills(req, res) {
        try {
            const company_id = req.user.company_id;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company ID is required'
                });
            }

            const measurableBills = await GenerateMeasurableBill.findByCompanyId(company_id);
            
            res.json({
                success: true,
                data: measurableBills
            });

        } catch (err) {
            console.error('Get all measurable bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching measurable bills'
            });
        }
    },

    // Get measurable bills by bill ID
    async getMeasurableBillsByBillId(req, res) {
        try {
            const { bill_id } = req.params;
            const company_id = req.user.company_id;

            const measurableBills = await GenerateMeasurableBill.findByBillId(bill_id, company_id);
            
            res.json({
                success: true,
                data: measurableBills
            });

        } catch (err) {
            console.error('Get measurable bills by bill ID error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching measurable bills'
            });
        }
    },

    // Get measurable bill by ID
    async getMeasurableBillById(req, res) {
        try {
            const { id } = req.params;
            
            const measurableBill = await GenerateMeasurableBill.getBillWithDetails(id);

            if (!measurableBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Measurable bill not found'
                });
            }

            res.json({
                success: true,
                data: measurableBill
            });

        } catch (err) {
            console.error('Get measurable bill by ID error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching measurable bill'
            });
        }
    },

    // Get measurable bills by period (month, year)
    async getMeasurableBillsByPeriod(req, res) {
        try {
            const { year, month } = req.query;
            const company_id = req.user.company_id;

            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'Year and month are required'
                });
            }

            const measurableBills = await GenerateMeasurableBill.findByPeriod(
                company_id, parseInt(year), month
            );
            
            res.json({
                success: true,
                data: measurableBills
            });

        } catch (err) {
            console.error('Get measurable bills by period error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching measurable bills'
            });
        }
    },

    // Get previous reading for a house
    async getPreviousReading(req, res) {
        try {
            const { house_id, bill_id } = req.query;
            
            if (!house_id || !bill_id) {
                return res.status(400).json({
                    success: false,
                    message: 'House ID and Bill ID are required'
                });
            }

            const previousReading = await GenerateMeasurableBill.getPreviousReading(house_id, bill_id);
            
            res.json({
                success: true,
                data: previousReading || { current_reading: 0 }
            });

        } catch (err) {
            console.error('Get previous reading error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching previous reading'
            });
        }
    },

    // Get measurable bills by house ID
    async getMeasurableBillsByHouseId(req, res) {
        try {
            const { house_id } = req.params;
            const company_id = req.user.company_id;

            const measurableBills = await GenerateMeasurableBill.findByHouseId(house_id, company_id);
            
            res.json({
                success: true,
                data: measurableBills
            });

        } catch (err) {
            console.error('Get measurable bills by house ID error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching house bills'
            });
        }
    },

    // Update measurable bill
    async updateMeasurableBill(req, res) {
        try {
            const { id } = req.params;
            const {
                month,
                year,
                previous_reading,
                current_reading,
                used_units,
                totalAmount
            } = req.body;

            // Check if bill exists
            const existingBill = await GenerateMeasurableBill.findById(id);
            if (!existingBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Measurable bill not found'
                });
            }

            // Auto-calculate used_units if readings are provided
            let calculatedUsedUnits = used_units;
            if (previous_reading !== undefined && current_reading !== undefined) {
                calculatedUsedUnits = current_reading - previous_reading;
                if (calculatedUsedUnits < 0) {
                    return res.status(400).json({
                        success: false,
                        message: 'Current reading must be greater than or equal to previous reading'
                    });
                }
            }

            const updateData = {
                month: month || existingBill.month,
                year: year ? parseInt(year) : existingBill.year,
                previous_reading: previous_reading !== undefined ? previous_reading : existingBill.previous_reading,
                current_reading: current_reading !== undefined ? current_reading : existingBill.current_reading,
                used_units: calculatedUsedUnits !== undefined ? calculatedUsedUnits : existingBill.used_units,
                totalAmount: totalAmount !== undefined ? parseFloat(totalAmount) : existingBill.totalAmount
            };

            const updatedBill = await GenerateMeasurableBill.update(id, updateData);

            res.json({
                success: true,
                message: 'Measurable bill updated successfully',
                data: updatedBill
            });

        } catch (err) {
            console.error('Update measurable bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating measurable bill'
            });
        }
    },

    // Delete measurable bill
    async deleteMeasurableBill(req, res) {
        try {
            const { id } = req.params;

            // Check if bill exists
            const existingBill = await GenerateMeasurableBill.findById(id);
            if (!existingBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Measurable bill not found'
                });
            }

            await GenerateMeasurableBills.delete(id);
            
            res.json({
                success: true,
                message: 'Measurable bill deleted successfully'
            });

        } catch (err) {
            console.error('Delete measurable bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting measurable bill'
            });
        }
    },

    // Get statistics for measurable bills
    async getMeasurableBillsStatistics(req, res) {
        try {
            const company_id = req.user.company_id;
            const { year } = req.query;

            const statistics = await GenerateMeasurableBill.getStatistics(company_id, year ? parseInt(year) : null);
            
            res.json({
                success: true,
                data: statistics
            });

        } catch (err) {
            console.error('Get statistics error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching statistics'
            });
        }
    },

    // Get monthly summary
    async getMonthlySummary(req, res) {
        try {
            const company_id = req.user.company_id;
            const { year } = req.query;

            if (!year) {
                return res.status(400).json({
                    success: false,
                    message: 'Year is required'
                });
            }

            const monthlySummary = await GenerateMeasurableBill.getMonthlySummary(company_id, parseInt(year));
            
            res.json({
                success: true,
                data: monthlySummary
            });

        } catch (err) {
            console.error('Get monthly summary error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching monthly summary'
            });
        }
    },

    // Generate bills from calculation (from your frontend)
    async generateFromCalculation(req, res) {
        try {
            const {
                house_id,
                apartment_id,
                floor_id,
                bill_id,
                year,
                month,
                used_units,
                total_amount,
                calculation_details,
                due_date
            } = req.body;
            
            const company_id = req.user.company_id;

            // Validation
            if (!house_id || !apartment_id || !bill_id || !year || !month || 
                used_units === undefined || total_amount === undefined) {
                return res.status(400).json({
                    success: false,
                    message: 'Required fields missing'
                });
            }

            // Get previous reading
            const previousReadingData = await GenerateMeasurableBill.getPreviousReading(house_id, bill_id);
            const previous_reading = previousReadingData ? previousReadingData.current_reading : 0;
            const current_reading = previous_reading + parseFloat(used_units);

            // Check for duplicate
            const isDuplicate = await GenerateMeasurableBill.checkDuplicate(
                company_id, bill_id, parseInt(year), month, house_id
            );
            
            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill already generated for this period'
                });
            }

            // Create measurable bill
            const measurableBill = await GenerateMeasurableBill.create({
                company_id,
                apartment_id,
                floor_id: floor_id || null,
                house_id,
                bill_id,
                year: parseInt(year),
                month,
                previous_reading,
                current_reading,
                used_units: parseFloat(used_units),
                totalAmount: parseFloat(total_amount)
            });

            // Create bill payment record
            const billPaymentId = `billpay_calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await GenerateMeasurableBill.createBillPayment({
                id: billPaymentId,
                company_id,
                apartment_id,
                floor_id: floor_id || null,
                house_id,
                bill_id,
                generate_measurable_bills_id: measurableBill.id,
                pendingAmount: parseFloat(total_amount),
                due_date: due_date || null
            });

            res.status(201).json({
                success: true,
                message: 'Measurable bill generated from calculation successfully',
                data: {
                    ...measurableBill,
                    calculation_details: calculation_details || []
                }
            });

        } catch (err) {
            console.error('Generate from calculation error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bill from calculation'
            });
        }
    }
};

module.exports = generateMeasurableBillController;