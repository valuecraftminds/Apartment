// //controller/generateBillController.js
const GenerateBills = require('../models/GenerateBills');

const generateBillController = {
    async generateBill(req, res){
        try{
           const { bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id, due_date } = req.body;
           const company_id = req.user.company_id;

            // Validation
            if (!bill_id || !month || year === undefined || !totalAmount || !apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID, year, month, total amount, and apartment are required'
                });
            }

            // Check for duplicate (now including apartment_id and house_id)
            const isDuplicate = await GenerateBills.checkDuplicate(company_id, bill_id, parseInt(year), month, apartment_id, house_id);
            if (isDuplicate) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill already generated for this period, apartment, and house'
                });
            }

            // const newGeneratedBill = await GenerateBills.create({
            //     year: parseInt(year),
            //     month,
            //     company_id,
            //     bill_id,
            //     totalAmount: parseFloat(totalAmount),
            //     assignedHouses: assignedHouses || 0,
            //     unitPrice: parseFloat(unitPrice),
            //     apartment_id,
            //     floor_id: floor_id || null,
            //     house_id: house_id || null
            // });

             const newGeneratedBill = await GenerateBills.create({
                year: parseInt(year),
                month,
                company_id,
                bill_id,
                totalAmount: parseFloat(totalAmount),
                assignedHouses: assignedHouses || 0,
                unitPrice: parseFloat(unitPrice),
                apartment_id,
                floor_id: floor_id || null,
                house_id: house_id || null
            });

             // Get houseowner_id if house_id exists
            let houseowner_id = null;
            if (house_id) {
                houseowner_id = await GenerateBills.getHouseOwnerId(house_id);
            }

             //Create bill payment record
            const billPaymentId = `billpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await GenerateBills.createBillPayment({
                id: billPaymentId,
                company_id,
                apartment_id,
                floor_id: floor_id || null,
                house_id: house_id || null,
                houseowner_id: houseowner_id, 
                bill_id,
                generate_bills_id: newGeneratedBill.id,
                pendingAmount: parseFloat(unitPrice), 
                due_date: due_date || null 
            });

            res.status(201).json({
                success: true,
                message: 'Bill generated successfully',
                data: newGeneratedBill
            });
        } catch(err) {
            console.error('Generate Bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bill'
            });
        }
    },

    async generateMultipleBills(req, res) {
        try {
            const { bill_id, year, month, totalAmount, apartment_id, selected_floors, selected_houses } = req.body;
            const company_id = req.user.company_id;

            if (!bill_id || !month || year === undefined || !totalAmount || !apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID, year, month, total amount, and apartment are required'
                });
            }

            // Get assigned houses based on selection
            let assignedHouses = [];
            if (selected_houses && selected_houses.length > 0) {
                // Generate for specific houses
                assignedHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
                assignedHouses = assignedHouses.filter(house => selected_houses.includes(house.house_id));
            } else if (selected_floors && selected_floors.length > 0) {
                // Generate for all houses in selected floors
                for (const floor_id of selected_floors) {
                    const floorHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id, floor_id);
                    assignedHouses = assignedHouses.concat(floorHouses);
                }
            } else {
                // Generate for all houses in apartment (original behavior)
                assignedHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
            }

            if (assignedHouses.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No houses found for the selected criteria'
                });
            }

            // Calculate unit price
            const unitPrice = parseFloat(totalAmount) / assignedHouses.length;

            // Prepare bills data
            const billsData = assignedHouses.map(house => ({
                year: parseInt(year),
                month,
                company_id,
                bill_id,
                totalAmount: unitPrice, // Individual house amount
                assignedHouses: 1, // Each bill is for one house
                unitPrice: unitPrice,
                apartment_id,
                floor_id: house.floor_id,
                house_id: house.house_id
            }));

            // Check for duplicates and filter
            const billsToCreate = [];
            for (const billData of billsData) {
                const isDuplicate = await GenerateBills.checkDuplicate(
                    company_id, bill_id, billData.year, month, apartment_id, billData.house_id
                );
                if (!isDuplicate) {
                    billsToCreate.push(billData);
                }
            }

            if (billsToCreate.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'All bills for the selected houses have already been generated'
                });
            }

            // Create bills
            const generatedBills = await GenerateBills.createMultiple(billsToCreate);

              // Create bill payment records for each generated bill
            for (const bill of generatedBills) {
                const houseowner_id = await GenerateBills.getHouseOwnerId(bill.house_id);
                const billPaymentId = `billpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                await GenerateBills.createBillPayment({
                    id: billPaymentId,
                    company_id,
                    apartment_id: bill.apartment_id,
                    floor_id: bill.floor_id || null,
                    house_id: bill.house_id || null,
                    houseowner_id: houseowner_id,
                    bill_id: bill.bill_id,
                    generate_bills_id: bill.id,
                    pendingAmount: bill.unitPrice, 
                    due_date: req.body.due_date || null
                });
            }

            res.status(201).json({
                success: true,
                message: `Successfully generated ${generatedBills.length} bills`,
                data: generatedBills
            });

        } catch (err) {
            console.error('Generate multiple bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bills'
            });
        }
    },


      async getAssignedHousesCount(req, res) {
        try {
            const { bill_id, apartment_id } = req.query;
            
            if (!bill_id || !apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID and Apartment ID are required'
                });
            }

            const count = await GenerateBills.getAssignedHousesCountByApartment(bill_id, apartment_id);
            
            res.json({
                success: true,
                data: { count }
            });

        } catch (err) {
            console.error('Get assigned houses count error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching assigned houses count'
            });
        }
    },

    // NEW: Get assigned houses with details
    async getAssignedHousesDetails(req, res) {
        try {
            const { bill_id, apartment_id } = req.query;
            
            if (!bill_id || !apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID and Apartment ID are required'
                });
            }

            const houses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
            const floors = await GenerateBills.getFloorsWithHouseCounts(apartment_id, bill_id);
            
            res.json({
                success: true,
                data: {
                    houses,
                    floors
                }
            });

        } catch (err) {
            console.error('Get assigned houses details error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching assigned houses details'
            });
        }
    },

    async generateBulkBills(req, res) {
        try {
            const { bills } = req.body; // Array of {bill_id, year, month}
            const company_id = req.user.company_id;

            if (!Array.isArray(bills) || bills.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Bills array is required'
                });
            }

            const generatedBills = [];
            const errors = [];

            for (const bill of bills) {
                try {
                    const { bill_id, year, month } = bill;
                    
                    // Check for duplicate
                    const isDuplicate = await GenerateBills.checkDuplicate(company_id, bill_id, parseInt(year), month);
                    if (!isDuplicate) {
                        const newBill = await GenerateBills.create({
                            year: parseInt(year),
                            month,
                            company_id,
                            bill_id
                        });
                        generatedBills.push(newBill);
                    } else {
                        errors.push(`Bill ${bill_id} already generated for ${month} ${year}`);
                    }
                } catch (error) {
                    errors.push(`Failed to generate bill ${bill.bill_id}: ${error.message}`);
                }
            }

            res.status(201).json({
                success: true,
                message: `Successfully generated ${generatedBills.length} bills`,
                data: generatedBills,
                errors: errors.length > 0 ? errors : undefined
            });

        } catch (err) {
            console.error('Generate bulk bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bills'
            });
        }
    },

    async getAllGeneratedBills(req, res) {
        try{
            const company_id = req.user.company_id;

            if (!company_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Company Id is required'
                });
            }

            const generatedBills = await GenerateBills.findByCompanyId(company_id);
            
            res.json({
                success: true,
                data: generatedBills
            });

        } catch(err) {
            console.error('Get generated bills error', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching generated bills'
            });
        }
    },

    async getByBillId(req, res) {
        try {
            const { bill_id } = req.params;
            const generatedBills = await GenerateBills.findByBillId(bill_id);
            
            res.json({
                success: true,
                data: generatedBills
            });

        } catch (err) {
            console.error("Error fetching generated bills:", err);
            res.status(500).json({ 
                success: false,
                message: "Server error" 
            });
        }
    },

    // Get generate bill by ID
    async getGenerateBillById(req, res) {
        try {
            const { id } = req.params;
            const generatedBill = await GenerateBills.findById(id);

            if (!generatedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated bill not found'
                });
            }

            res.json({
                success: true,
                data: generatedBill
            });
        } catch (err) {
            console.error('Get generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching generated bill'
            });
        }
    },

    async UpdateGenerateBills(req,res){
        try{
            const { id } = req.params;
            const { year, month, totalAmount, unitPrice } = req.body;

            const existingGeneratedBill = await GenerateBills.findById(id);
            if (!existingGeneratedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated Bill not found'
                });
            }

            const updateData = {
                year: year ? parseInt(year) : existingGeneratedBill.year,
                month: month || existingGeneratedBill.month,
                totalAmount: totalAmount ? parseFloat(totalAmount) : existingGeneratedBill.totalAmount,
                unitPrice: unitPrice ? parseFloat(unitPrice) : existingGeneratedBill.unitPrice,
            };

            const updatedGeneratedBill = await GenerateBills.update(id, updateData);

            res.json({
                success: true,
                message: 'Generated Bill updated successfully',
                data: updatedGeneratedBill
            });
        }catch(err){
            console.error('Update generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while updating generated bill'
            });
        }
    },

    async deleteGeneratedBill(req,res){
        try{
            const { id } = req.params;

            // Check if bill price exists
            const existingGeneratedBill = await GenerateBills.findById(id);
            if (!existingGeneratedBill) {
                return res.status(404).json({
                    success: false,
                    message: 'Generated bill not found'
                });
            }

            await GenerateBills.delete(id);
            res.json({
                success: true,
                message: 'Generated bill deleted successfully'
            });
        }catch(err){
            console.error('Delete generated bill error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while deleting generated bill'
            });
        }
    }
}

module.exports = generateBillController;