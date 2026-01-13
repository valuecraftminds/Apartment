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

    // async generateMultipleBills(req, res) {
    //     try {
    //         const { bill_id, year, month, totalAmount, apartment_id, selected_floors, selected_houses } = req.body;
    //         const company_id = req.user.company_id;

    //         if (!bill_id || !month || year === undefined || !totalAmount || !apartment_id) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'Bill ID, year, month, total amount, and apartment are required'
    //             });
    //         }

    //         // Get assigned houses based on selection
    //         let assignedHouses = [];
    //         if (selected_houses && selected_houses.length > 0) {
    //             // Generate for specific houses
    //             assignedHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
    //             assignedHouses = assignedHouses.filter(house => selected_houses.includes(house.house_id));
    //         } else if (selected_floors && selected_floors.length > 0) {
    //             // Generate for all houses in selected floors
    //             for (const floor_id of selected_floors) {
    //                 const floorHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id, floor_id);
    //                 assignedHouses = assignedHouses.concat(floorHouses);
    //             }
    //         } else {
    //             // Generate for all houses in apartment (original behavior)
    //             assignedHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
    //         }

    //         if (assignedHouses.length === 0) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'No houses found for the selected criteria'
    //             });
    //         }

    //         // Calculate unit price
    //         const unitPrice = parseFloat(totalAmount) / assignedHouses.length;

    //         // Prepare bills data
    //         const billsData = assignedHouses.map(house => ({
    //             year: parseInt(year),
    //             month,
    //             company_id,
    //             bill_id,
    //             totalAmount: unitPrice, // Individual house amount
    //             assignedHouses: 1, // Each bill is for one house
    //             unitPrice: unitPrice,
    //             apartment_id,
    //             floor_id: house.floor_id,
    //             house_id: house.house_id
    //         }));

    //         // Check for duplicates and filter
    //         const billsToCreate = [];
    //         for (const billData of billsData) {
    //             const isDuplicate = await GenerateBills.checkDuplicate(
    //                 company_id, bill_id, billData.year, month, apartment_id, billData.house_id
    //             );
    //             if (!isDuplicate) {
    //                 billsToCreate.push(billData);
    //             }
    //         }

    //         if (billsToCreate.length === 0) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: 'All bills for the selected houses have already been generated'
    //             });
    //         }

    //         // Create bills
    //         const generatedBills = await GenerateBills.createMultiple(billsToCreate);

    //           // Create bill payment records for each generated bill
    //         for (const bill of generatedBills) {
    //             const houseowner_id = await GenerateBills.getHouseOwnerId(bill.house_id);
    //             const billPaymentId = `billpay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    //             await GenerateBills.createBillPayment({
    //                 id: billPaymentId,
    //                 company_id,
    //                 apartment_id: bill.apartment_id,
    //                 floor_id: bill.floor_id || null,
    //                 house_id: bill.house_id || null,
    //                 houseowner_id: houseowner_id,
    //                 bill_id: bill.bill_id,
    //                 generate_bills_id: bill.id,
    //                 pendingAmount: bill.unitPrice, 
    //                 due_date: req.body.due_date || null
    //             });
    //         }

    //         res.status(201).json({
    //             success: true,
    //             message: `Successfully generated ${generatedBills.length} bills`,
    //             data: generatedBills
    //         });

    //     } catch (err) {
    //         console.error('Generate multiple bills error:', err);
    //         res.status(500).json({
    //             success: false,
    //             message: 'Server error while generating bills'
    //         });
    //     }
    // },
    // In controllers/generateBillController.js - Update generateMultipleBills method:

    async generateMultipleBills(req, res) {
        try {
            const { bill_id, year, month, totalAmount, apartment_id, selected_floors, selected_houses, calculation_method, due_date } = req.body;
            const company_id = req.user.company_id;

            if (!bill_id || !month || year === undefined || !totalAmount || !apartment_id) {
                return res.status(400).json({
                    success: false,
                    message: 'Bill ID, year, month, total amount, and apartment are required'
                });
            }

            // Validate calculation method
            const validMethods = ['house_count', 'square_footage'];
            const calcMethod = calculation_method || 'house_count';
            
            if (!validMethods.includes(calcMethod)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid calculation method'
                });
            }

            let billsToCreate = [];
            let summary = null;

            if (calcMethod === 'square_footage') {
                // Calculate by square footage
                const result = await GenerateBills.calculateBySquareFootage({
                    bill_id,
                    apartment_id,
                    floor_ids: selected_floors || [],
                    house_ids: selected_houses || [],
                    totalAmount: parseFloat(totalAmount)
                });
                
                // Prepare bills data for creation
                billsToCreate = result.bills.map(house => ({
                    year: parseInt(year),
                    month,
                    company_id,
                    bill_id,
                    totalAmount: house.unitPrice,
                    assignedHouses: 1,
                    unitPrice: house.unitPrice,
                    apartment_id,
                    floor_id: house.floor_id,
                    house_id: house.house_id,
                    square_footage: house.square_footage,
                    pricePerSqrFt: house.pricePerSqrFt
                }));
                
                summary = result.summary;
            } else {
                // Original house count method (current logic)
                // Get assigned houses based on selection
                let assignedHouses = [];
                if (selected_houses && selected_houses.length > 0) {
                    assignedHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id);
                    assignedHouses = assignedHouses.filter(house => selected_houses.includes(house.house_id));
                } else if (selected_floors && selected_floors.length > 0) {
                    for (const floor_id of selected_floors) {
                        const floorHouses = await GenerateBills.getAssignedHouses(bill_id, apartment_id, floor_id);
                        assignedHouses = assignedHouses.concat(floorHouses);
                    }
                } else {
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
                billsToCreate = assignedHouses.map(house => ({
                    year: parseInt(year),
                    month,
                    company_id,
                    bill_id,
                    totalAmount: unitPrice,
                    assignedHouses: 1,
                    unitPrice: unitPrice,
                    apartment_id,
                    floor_id: house.floor_id,
                    house_id: house.house_id
                }));
            }

            // Check for duplicates and filter
            const uniqueBillsToCreate = [];
            for (const billData of billsToCreate) {
                const isDuplicate = await GenerateBills.checkDuplicate(
                    company_id, bill_id, billData.year, month, apartment_id, billData.house_id
                );
                if (!isDuplicate) {
                    uniqueBillsToCreate.push(billData);
                }
            }

            if (uniqueBillsToCreate.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'All bills for the selected houses have already been generated'
                });
            }

            // Create bills
            const generatedBills = await GenerateBills.createMultiple(uniqueBillsToCreate);

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
                    due_date: due_date || null
                });
            }

            res.status(201).json({
                success: true,
                message: `Successfully generated ${generatedBills.length} bills using ${calcMethod === 'square_footage' ? 'square footage' : 'house count'} method`,
                data: generatedBills,
                summary: calcMethod === 'square_footage' ? summary : null
            });

        } catch (err) {
            console.error('Generate multiple bills error:', err);
            res.status(500).json({
                success: false,
                message: 'Server error while generating bills: ' + err.message
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
    },

    // In controllers/generateBillController.js - Add a debug endpoint:
    // In controllers/generateBillController.js - Fix the debugSquareFootage method:

async debugSquareFootage(req, res) {
    try {
        const { bill_id, apartment_id } = req.query;
        const company_id = req.user.company_id;
        
        console.log('Debug square footage request:', { bill_id, apartment_id, company_id });
        
        // IMPORTANT: Import pool here
        const pool = require('../db');
        
        // First, check if bill is assigned to any houses
        const [assignments] = await pool.execute(
            'SELECT ba.*, h.house_id as house_number FROM bill_assignments ba JOIN houses h ON ba.house_id = h.id WHERE ba.bill_id = ? AND ba.apartment_id = ?',
            [bill_id, apartment_id]
        );
        
        console.log('Bill assignments:', assignments);
        
        // Check houses
        const [houses] = await pool.execute(
            `SELECT h.*, ht.sqrfeet, ht.name as house_type_name 
             FROM houses h 
             LEFT JOIN housetype ht ON h.housetype_id = ht.id 
             WHERE h.apartment_id = ? AND h.is_active = 1`,
            [apartment_id]
        );
        
        console.log('Houses in apartment:', houses.length);
        
        // Check house types
        const [houseTypes] = await pool.execute(
            'SELECT * FROM housetype WHERE apartment_id = ?',
            [apartment_id]
        );
        
        res.json({
            success: true,
            data: {
                bill_assignments_count: assignments.length,
                houses_count: houses.length,
                houses_with_sqrfeet: houses.filter(h => h.sqrfeet).length,
                houses_with_housetype: houses.filter(h => h.housetype_id).length,
                house_types_count: houseTypes.length,
                sample_data: {
                    assignments: assignments.slice(0, 5),
                    houses: houses.slice(0, 5).map(h => ({
                        id: h.id,
                        house_id: h.house_id,
                        housetype_id: h.housetype_id,
                        house_type_name: h.house_type_name,
                        sqrfeet: h.sqrfeet
                    })),
                    house_types: houseTypes.slice(0, 5)
                }
            }
        });
        
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Debug error: ' + error.message
        });
    }
},

// Add this to your controller (generateBillController.js):

async testHouseData(req, res) {
    try {
        const { apartment_id, bill_id } = req.query;
        const company_id = req.user.company_id;
        
        console.log('🧪 TEST HOUSE DATA ===============================');
        
        const pool = require('../db');
        
        // 1. Get all houses in apartment
        const [houses] = await pool.execute(
            `SELECT 
                h.id, 
                h.house_id as house_number,
                h.housetype_id,
                h.is_active,
                h.status,
                ht.name as house_type_name,
                ht.sqrfeet
            FROM houses h
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            WHERE h.apartment_id = ?`,
            [apartment_id]
        );
        
        // 2. Get bill assignments
        const [assignments] = await pool.execute(
            `SELECT ba.*, h.house_id as house_number 
             FROM bill_assignments ba
             JOIN houses h ON ba.house_id = h.id
             WHERE ba.bill_id = ? AND ba.apartment_id = ?`,
            [bill_id, apartment_id]
        );
        
        // 3. Get house types
        const [houseTypes] = await pool.execute(
            'SELECT * FROM housetype WHERE apartment_id = ?',
            [apartment_id]
        );
        
        // 4. Check which houses would be selected
        const [selectedHouses] = await pool.execute(
            `SELECT 
                h.id as house_id,
                h.house_id as house_number,
                ht.sqrfeet,
                ba.id as assignment_id,
                CASE 
                    WHEN h.housetype_id IS NULL THEN 'NO HOUSETYPE'
                    WHEN ht.sqrfeet IS NULL THEN 'NO SQRFEET'
                    WHEN ht.sqrfeet <= 0 THEN 'ZERO SQRFEET'
                    WHEN ba.id IS NULL THEN 'NO ASSIGNMENT'
                    ELSE 'OK'
                END as status
            FROM houses h
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            LEFT JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ?
            WHERE h.apartment_id = ? AND h.is_active = 1`,
            [bill_id, apartment_id]
        );
        
        res.json({
            success: true,
            data: {
                summary: {
                    total_houses: houses.length,
                    houses_with_housetype: houses.filter(h => h.housetype_id).length,
                    houses_with_sqrfeet: houses.filter(h => h.sqrfeet).length,
                    active_houses: houses.filter(h => h.is_active === 1).length,
                    bill_assignments: assignments.length,
                    house_types: houseTypes.length
                },
                houses: houses.slice(0, 10),
                assignments: assignments.slice(0, 10),
                house_types: houseTypes.slice(0, 10),
                selection_check: selectedHouses.map(h => ({
                    house_id: h.house_id,
                    house_number: h.house_number,
                    sqrfeet: h.sqrfeet,
                    assignment_id: h.assignment_id,
                    status: h.status
                }))
            }
        });
        
    } catch (error) {
        console.error('Test error:', error);
        res.status(500).json({
            success: false,
            message: 'Test error: ' + error.message
        });
    }
},

async diagnoseSquareFootage(req, res) {
    try {
        const { bill_id, apartment_id } = req.query;
        
        console.log('🔍 DIAGNOSE Square Footage Request:', { bill_id, apartment_id });
        
        const pool = require('../db');
        
        // Run multiple diagnostic queries
        const diagnostics = {};
        
        // 1. Check if bill exists
        const [bill] = await pool.execute('SELECT bill_name FROM bills WHERE id = ?', [bill_id]);
        diagnostics.bill_exists = bill.length > 0;
        diagnostics.bill_name = bill.length > 0 ? bill[0].bill_name : 'Not found';
        
        // 2. Check if apartment exists
        const [apartment] = await pool.execute('SELECT name FROM apartments WHERE id = ?', [apartment_id]);
        diagnostics.apartment_exists = apartment.length > 0;
        diagnostics.apartment_name = apartment.length > 0 ? apartment[0].name : 'Not found';
        
        // 3. Check houses count
        const [housesCount] = await pool.execute(`
            SELECT COUNT(*) as count FROM houses WHERE apartment_id = ? AND is_active = 1
        `, [apartment_id]);
        diagnostics.total_active_houses = housesCount[0].count;
        
        // 4. Check houses with house types
        const [housesWithType] = await pool.execute(`
            SELECT COUNT(*) as count FROM houses h 
            WHERE h.apartment_id = ? AND h.is_active = 1 AND h.housetype_id IS NOT NULL
        `, [apartment_id]);
        diagnostics.houses_with_housetype = housesWithType[0].count;
        
        // 5. Check houses with square footage
        const [housesWithSqrFeet] = await pool.execute(`
            SELECT COUNT(*) as count FROM houses h 
            JOIN housetype ht ON h.housetype_id = ht.id 
            WHERE h.apartment_id = ? AND h.is_active = 1 AND ht.sqrfeet IS NOT NULL AND ht.sqrfeet > 0
        `, [apartment_id]);
        diagnostics.houses_with_sqrfeet = housesWithSqrFeet[0].count;
        
        // 6. Check bill assignments
        const [billAssignments] = await pool.execute(`
            SELECT COUNT(*) as count FROM bill_assignments 
            WHERE bill_id = ? AND apartment_id = ?
        `, [bill_id, apartment_id]);
        diagnostics.bill_assignments = billAssignments[0].count;
        
        // 7. Check if bill assignments match with houses
        const [matchingHouses] = await pool.execute(`
            SELECT COUNT(*) as count FROM bill_assignments ba
            JOIN houses h ON ba.house_id = h.id
            WHERE ba.bill_id = ? AND ba.apartment_id = ? AND h.apartment_id = ?
        `, [bill_id, apartment_id, apartment_id]);
        diagnostics.matching_houses = matchingHouses[0].count;
        
        // 8. Get sample data
        const [sampleData] = await pool.execute(`
            SELECT 
                h.id as house_id,
                h.house_id as house_number,
                h.housetype_id,
                ht.name as house_type_name,
                ht.sqrfeet,
                ba.id as assignment_id,
                ba.bill_id as assigned_bill_id,
                ba.apartment_id as assigned_apartment_id
            FROM houses h
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            LEFT JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ?
            WHERE h.apartment_id = ? AND h.is_active = 1
            LIMIT 10
        `, [bill_id, apartment_id]);
        
        diagnostics.sample_data = sampleData;
        
        res.json({
            success: true,
            data: diagnostics
        });
        
    } catch (error) {
        console.error('Diagnose error:', error);
        res.status(500).json({
            success: false,
            message: 'Diagnose error: ' + error.message
        });
    }
}
}

module.exports = generateBillController;