// models/GenerateBills.js
const pool = require('../db');

class GenerateBills{
    static async create(generateBillData){
        const {company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id} = generateBillData;
       
        const [result] = await pool.execute(
            'INSERT INTO generate_bills (company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id]
        );
        
        return { 
            id: result.insertId, 
            company_id, 
            bill_id, 
            year, 
            month,
            totalAmount,
            assignedHouses,
            unitPrice,
            apartment_id,
            floor_id,
            house_id
        };        
    }

    // NEW: Create multiple bills at once
    static async createMultiple(billsData) {
        const placeholders = billsData.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
        const values = [];
        
        billsData.forEach(bill => {
            values.push(
                bill.company_id,
                bill.bill_id,
                bill.year,
                bill.month,
                bill.totalAmount,
                bill.assignedHouses,
                bill.unitPrice,
                bill.apartment_id,
                bill.floor_id,
                bill.house_id
            );
        });

        const [result] = await pool.execute(
            `INSERT INTO generate_bills (company_id, bill_id, year, month, totalAmount, assignedHouses, unitPrice, apartment_id, floor_id, house_id) VALUES ${placeholders}`,
            values
        );

        return billsData.map((bill, index) => ({
            id: result.insertId + index,
            ...bill
        }));
    }

    //store bill payments
    static async createBillPayment(billPaymentData) {
        const {
            id, company_id, apartment_id, floor_id, house_id, houseowner_id, bill_id, 
            generate_bills_id, pendingAmount, due_date
        } = billPaymentData;
        
        const [result] = await pool.execute(
            `INSERT INTO bill_payments 
            (id, company_id, apartment_id, floor_id, house_id, houseowner_id,  bill_id, generate_bills_id, pendingAmount, due_date, payment_status, paidAmount, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 0.00, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [id, company_id, apartment_id, floor_id, house_id, houseowner_id, bill_id, generate_bills_id, pendingAmount, due_date]
        );
        
        return result.insertId;
    }

    static async getHouseOwnerId(house_id) {
        if (!house_id) return null;
        
        try {
            const [rows] = await pool.execute(
                'SELECT houseowner_id FROM houses WHERE id = ?',
                [house_id]
            );
            return rows[0]?.houseowner_id || null;
        } catch (error) {
            console.error('Error getting house owner:', error);
            return null;
        }
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM generate_bills WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT gb.*, b.bill_name, b.billtype FROM generate_bills gb LEFT JOIN bills b ON gb.bill_id = b.id WHERE gb.company_id = ? ORDER BY gb.created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByBillId(bill_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM generate_bills WHERE bill_id = ? ORDER BY created_at DESC',
            [bill_id]
        );
        return rows;
    }

    // Update duplicate check to include apartment_id and house_id
    static async checkDuplicate(company_id, bill_id, year, month, apartment_id, house_id = null) {
        let query = 'SELECT * FROM generate_bills WHERE company_id = ? AND bill_id = ? AND year = ? AND month = ? AND apartment_id = ?';
        const params = [company_id, bill_id, year, month, apartment_id];
        
        if (house_id) {
            query += ' AND house_id = ?';
            params.push(house_id);
        }
        
        const [rows] = await pool.execute(query, params);
        return rows.length > 0;
    }

    // NEW: Get assigned houses by apartment, floor, or individual houses
    static async getAssignedHouses(bill_id, apartment_id, floor_id = null) {
        let query = `
            SELECT ba.*, h.house_id as house_number, f.floor_id as floor_number, a.name as apartment_name
            FROM bill_assignments ba
            JOIN houses h ON ba.house_id = h.id
            JOIN floors f ON h.floor_id = f.id
            JOIN apartments a ON f.apartment_id = a.id
            WHERE ba.bill_id = ? AND ba.apartment_id = ?
        `;
        const params = [bill_id, apartment_id];
        
        if (floor_id) {
            query += ' AND h.floor_id = ?';
            params.push(floor_id);
        }
        
        query += ' ORDER BY f.floor_id, h.house_id';
        
        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // NEW: Get floors for apartment with house counts
    static async getFloorsWithHouseCounts(apartment_id, bill_id) {
        const [rows] = await pool.execute(
            `SELECT f.*, COUNT(ba.house_id) as assigned_houses_count
             FROM floors f
             LEFT JOIN houses h ON f.id = h.floor_id
             LEFT JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ?
             WHERE f.apartment_id = ?
             GROUP BY f.id
             ORDER BY f.floor_id`,
            [bill_id, apartment_id]
        );
        return rows;
    }

    static async update(id, generateBillData) {
        const { year, month, totalAmount, unitPrice } = generateBillData;
        await pool.execute(
            'UPDATE generate_bills SET year=?, month=?, totalAmount=?, unitPrice=? WHERE id = ?',
            [year, month, totalAmount, unitPrice, id]
        );
        return { id, ...generateBillData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM generate_bills WHERE id = ?',
            [id]
        );
        return true;
    }

    // Keep the count method for apartment-level generation
    static async getAssignedHousesCountByApartment(bill_id, apartment_id) {
        const [rows] = await pool.execute(
            'SELECT COUNT(*) as count FROM bill_assignments WHERE bill_id = ? AND apartment_id = ?',
            [bill_id, apartment_id]
        );
        return rows[0].count;
    }

    // In models/GenerateBills.js - Add this method if needed
    static async getHouseOwnersByApartment(apartment_id) {
        try {
            const [rows] = await pool.execute(
                `SELECT h.id as house_id, h.houseowner_id 
                FROM houses h
                WHERE h.apartment_id = ? AND h.houseowner_id IS NOT NULL`,
                [apartment_id]
            );
            return rows;
        } catch (error) {
            console.error('Error getting house owners by apartment:', error);
            return [];
        }
    }

    static async getHouseOwnersByFloor(floor_id) {
        try {
            const [rows] = await pool.execute(
                `SELECT h.id as house_id, h.houseowner_id 
                FROM houses h
                WHERE h.floor_id = ? AND h.houseowner_id IS NOT NULL`,
                [floor_id]
            );
            return rows;
        } catch (error) {
            console.error('Error getting house owners by floor:', error);
            return [];
        }
    }

    // NEW: Get square footage for houses
    static async getHousesWithSquareFootage(apartment_id, bill_id, floor_ids = [], house_ids = []) {
    try {
        console.log('🔍 DEBUG getHousesWithSquareFootage START ========================');
        console.log('Input parameters:', { apartment_id, bill_id, floor_ids, house_ids });
        
        // Build the query with better error handling
        let query = `
            SELECT 
                h.id as house_id,
                h.houseowner_id, 
                h.floor_id, 
                h.housetype_id,
                h.house_id as house_number,
                f.floor_id as floor_number,
                ht.sqrfeet as square_footage,
                ht.name as house_type_name,
                ba.id as bill_assignment_id,
                ba.bill_id as assigned_bill_id
            FROM houses h
            INNER JOIN housetype ht ON h.housetype_id = ht.id
            INNER JOIN floors f ON h.floor_id = f.id
            INNER JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ? AND ba.apartment_id = ?
            WHERE h.apartment_id = ? 
            AND h.is_active = 1
            AND (h.status = 'occupied' OR h.status = 'vacant')
            AND ht.sqrfeet IS NOT NULL 
            AND ht.sqrfeet > 0
        `;
        
        const params = [bill_id, apartment_id, apartment_id];
        
        // Handle house_ids array properly for MySQL
        if (house_ids.length > 0) {
            // Create placeholders for each house_id
            const placeholders = house_ids.map(() => '?').join(',');
            query += ` AND h.id IN (${placeholders})`;
            params.push(...house_ids);
        }
        
        // Handle floor_ids array properly for MySQL
        if (floor_ids.length > 0) {
            const placeholders = floor_ids.map(() => '?').join(',');
            query += ` AND h.floor_id IN (${placeholders})`;
            params.push(...floor_ids);
        }
        
        query += ' ORDER BY f.floor_id, h.house_id';
        
        console.log('Final query:', query);
        console.log('Query params:', params);
        
        const [rows] = await pool.execute(query, params);
        console.log(`✅ Found ${rows.length} houses with square footage data`);
        
        if (rows.length > 0) {
            console.log('\n🔍 STEP 4: Sample results (first 5):');
            rows.slice(0, Math.min(5, rows.length)).forEach((row, index) => {
                console.log(`Result ${index + 1}:`, {
                    house_id: row.house_id,
                    house_number: row.house_number,
                    floor_number: row.floor_number,
                    housetype_id: row.housetype_id,
                    house_type_name: row.house_type_name,
                    square_footage: row.square_footage,
                    bill_assignment_id: row.bill_assignment_id,
                    assigned_bill_id: row.assigned_bill_id
                });
            });
            
            // Calculate total square footage
            const totalSqrFeet = rows.reduce((sum, row) => sum + parseFloat(row.square_footage || 0), 0);
            console.log(`\n📊 Total square footage of ${rows.length} houses: ${totalSqrFeet.toFixed(2)} sq ft`);
        } else {
            console.log('\n❌ No results found.');
            
            // Run additional diagnostics with exact parameters
            const [diagnostics] = await pool.execute(`
                SELECT 
                    h.id as house_id,
                    h.house_id as house_number,
                    h.housetype_id,
                    ht.sqrfeet,
                    ba.id as assignment_id,
                    ba.bill_id,
                    ba.apartment_id
                FROM houses h
                LEFT JOIN housetype ht ON h.housetype_id = ht.id
                LEFT JOIN bill_assignments ba ON h.id = ba.house_id AND ba.bill_id = ? AND ba.apartment_id = ?
                WHERE h.apartment_id = ? 
                AND h.is_active = 1
                AND h.id IN (?, ?, ?, ?)  -- Your specific house_ids
            `, [bill_id, apartment_id, apartment_id, ...house_ids]);
            
            console.log('Detailed diagnostics for specific houses:');
            console.log(diagnostics);
            
            // Also check which houses have bill assignments
            const [assignedHouses] = await pool.execute(`
                SELECT house_id FROM bill_assignments 
                WHERE bill_id = ? AND apartment_id = ?
            `, [bill_id, apartment_id]);
            
            console.log('Houses with bill assignments:', assignedHouses);
        }
        
        console.log('🔍 DEBUG getHousesWithSquareFootage END ========================\n');
        
        return rows;
    } catch (error) {
        console.error('❌ Error getting houses with square footage:', error);
        console.error('Error details:', error.message);
        return [];
    }
}

    // NEW: Calculate bills by square footage
    static async calculateBySquareFootage(billData) {
    const { bill_id, apartment_id, floor_ids, house_ids, totalAmount } = billData;
    
    console.log('Starting square footage calculation:', billData);

    const roundUpToNearestTen = (number) => {
        return Math.ceil(number / 10) * 10;
    };
    
    // Get houses with their square footage
    const houses = await this.getHousesWithSquareFootage(apartment_id, bill_id, floor_ids, house_ids);
    
    console.log('Houses found:', houses.length);
    
    if (houses.length === 0) {
        // Get more detailed error information
        const pool = require('../db');
        const [diagnostics] = await pool.execute(`
            SELECT 
                'Houses in apartment' as category, COUNT(*) as count FROM houses WHERE apartment_id = ? AND is_active = 1
            UNION ALL
            SELECT 'Houses with house types' as category, COUNT(*) as count FROM houses h JOIN housetype ht ON h.housetype_id = ht.id WHERE h.apartment_id = ? AND h.is_active = 1
            UNION ALL
            SELECT 'Houses with square footage > 0' as category, COUNT(*) as count FROM houses h JOIN housetype ht ON h.housetype_id = ht.id WHERE h.apartment_id = ? AND h.is_active = 1 AND ht.sqrfeet IS NOT NULL AND ht.sqrfeet > 0
            UNION ALL
            SELECT 'Bill assignments for this bill' as category, COUNT(*) as count FROM bill_assignments WHERE bill_id = ? AND apartment_id = ?
        `, [apartment_id, apartment_id, apartment_id, bill_id, apartment_id]);
        
        console.log('Diagnostics data:', diagnostics);
        
        throw new Error(`No houses found with square footage data. Diagnostics:\n` +
            diagnostics.map(d => `  ${d.category}: ${d.count}`).join('\n'));
    }
    
    // Filter out houses without square footage (but keep them for the count)
    const validHouses = houses.filter(house => house.square_footage && house.square_footage > 0);
    
    if (validHouses.length === 0) {
        throw new Error(`No houses have valid square footage data. Please check house type configurations.`);
    }
    
    // Calculate total square footage only from valid houses
    const totalSqrFeet = validHouses.reduce((sum, house) => sum + parseFloat(house.square_footage), 0);
    
    console.log('Total square footage:', totalSqrFeet);
    console.log('Valid houses count:', validHouses.length);
    
    if (totalSqrFeet <= 0) {
        throw new Error(`Total square footage must be greater than 0. Found: ${totalSqrFeet}`);
    }
    
    // Calculate price per sqr ft
    const pricePerSqrFt = parseFloat(totalAmount) / totalSqrFeet;
    
    console.log('Price per sqr ft:', pricePerSqrFt);
    console.log('Total amount:', totalAmount);
    
    // Calculate amount for each valid house
    const bills = validHouses.map(house => {
        const sqrFeet = parseFloat(house.square_footage);
        let unitPrice = sqrFeet * pricePerSqrFt;
        
        unitPrice = roundUpToNearestTen(unitPrice);
        
        return {
            house_id: house.house_id,
            houseowner_id: house.houseowner_id,
            floor_id: house.floor_id,
            square_footage: sqrFeet,
            unitPrice: unitPrice,
            totalAmount: unitPrice,
            pricePerSqrFt: pricePerSqrFt,
            house_number: house.house_number,
            floor_number: house.floor_number,
            house_type_name: house.house_type_name
        };
    });
    
    // Log calculation summary
    console.log('Calculation summary:', {
        totalHouses: houses.length,
        validHouses: validHouses.length,
        totalSqrFeet: totalSqrFeet,
        pricePerSqrFt: pricePerSqrFt,
        totalAmount: parseFloat(totalAmount),
        sampleBill: bills[0]
    });
    
    return {
        bills,
        summary: {
            totalSqrFeet,
            pricePerSqrFt,
            totalHouses: houses.length,
            validHouses: validHouses.length,
            totalAmount: parseFloat(totalAmount),
            calculation_method: 'square_footage'
        }
    };
}
}
module.exports = GenerateBills;
