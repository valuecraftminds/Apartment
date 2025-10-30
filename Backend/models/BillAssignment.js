const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class BillAssignment {
    // Create multiple bill assignments
    static async createMultiple(assignmentsData) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const assignments = [];
            for (const assignment of assignmentsData) {
                const { bill_id, apartment_id, floor_id, house_id } = assignment;
                const id = uuidv4().replace(/-/g, '').substring(0, 10);

                await connection.execute(
                    `INSERT INTO bill_assignments 
                    (id, bill_id, apartment_id, floor_id, house_id) 
                    VALUES (?, ?, ?, ?, ?)`,
                    [id, bill_id, apartment_id, floor_id, house_id]
                );

                assignments.push({ id, bill_id, apartment_id, floor_id, house_id });
            }

            await connection.commit();
            return assignments;

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Find assignments by bill ID
    static async findByBillId(bill_id) {
        const [rows] = await pool.execute(
            `SELECT ba.*, 
                    a.name as apartment_name,
                    f.floor_id as floor_number,
                    h.house_id as house_number,
                    b.bill_name
             FROM bill_assignments ba
             LEFT JOIN apartments a ON ba.apartment_id = a.id
             LEFT JOIN floors f ON ba.floor_id = f.id
             LEFT JOIN houses h ON ba.house_id = h.id
             LEFT JOIN bills b ON ba.bill_id = b.id
             WHERE ba.bill_id = ? 
             ORDER BY ba.assigned_at DESC`,
            [bill_id]
        );
        return rows;
    }

    // Find assignments by house ID
    static async findByHouseId(house_id) {
        const [rows] = await pool.execute(
            `SELECT ba.*, b.bill_name, b.description
             FROM bill_assignments ba
             JOIN bills b ON ba.bill_id = b.id
             WHERE ba.house_id = ? AND ba.is_active = 1`,
            [house_id]
        );
        return rows;
    }

    // Check if bill is already assigned to a house
    static async checkExistingAssignment(bill_id, house_id) {
        const [rows] = await pool.execute(
            'SELECT id FROM bill_assignments WHERE bill_id = ? AND house_id = ? AND is_active = 1',
            [bill_id, house_id]
        );
        return rows.length > 0;
    }

    // Get assignments with filters
    static async findWithFilters(filters = {}) {
        let query = `
            SELECT ba.*, 
                   a.name as apartment_name,
                   f.floor_id as floor_number,
                   h.house_id as house_number,
                   b.bill_name,
                   b.description
            FROM bill_assignments ba
            LEFT JOIN apartments a ON ba.apartment_id = a.id
            LEFT JOIN floors f ON ba.floor_id = f.id
            LEFT JOIN houses h ON ba.house_id = h.id
            LEFT JOIN bills b ON ba.bill_id = b.id
            WHERE 1=1
        `;
        const params = [];

        if (filters.bill_id) {
            query += ' AND ba.bill_id = ?';
            params.push(filters.bill_id);
        }

        if (filters.apartment_id) {
            query += ' AND ba.apartment_id = ?';
            params.push(filters.apartment_id);
        }

        if (filters.floor_id) {
            query += ' AND ba.floor_id = ?';
            params.push(filters.floor_id);
        }

        if (filters.house_id) {
            query += ' AND ba.house_id = ?';
            params.push(filters.house_id);
        }

        if (filters.is_active !== undefined) {
            query += ' AND ba.is_active = ?';
            params.push(filters.is_active);
        }

        query += ' ORDER BY ba.assigned_at DESC';

        const [rows] = await pool.execute(query, params);
        return rows;
    }

    // Deactivate assignment (soft delete)
    static async deactivate(id) {
        await pool.execute(
            'UPDATE bill_assignments SET is_active = 0 WHERE id = ?',
            [id]
        );
        return true;
    }

    // Reactivate assignment
    static async reactivate(id) {
        await pool.execute(
            'UPDATE bill_assignments SET is_active = 1 WHERE id = ?',
            [id]
        );
        return true;
    }

    // Delete assignment permanently
    static async delete(id) {
        await pool.execute(
            'DELETE FROM bill_assignments WHERE id = ?',
            [id]
        );
        return true;
    }

    // Delete assignments by bill and houses
    static async deleteByBillAndHouses(bill_id, house_ids) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const placeholders = house_ids.map(() => '?').join(',');
            const query = `DELETE FROM bill_assignments WHERE bill_id = ? AND house_id IN (${placeholders})`;
            
            await connection.execute(query, [bill_id, ...house_ids]);
            await connection.commit();

            return true;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = BillAssignment;