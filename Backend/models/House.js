//models/House.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class House{
    static async create(houseData) {
    const { company_id, apartment_id, floor_id,  house_id, housetype_id } = houseData;

    const [countResult] = await pool.execute(
        'SELECT COUNT(*) as count FROM houses WHERE company_id = ? AND apartment_id = ? and floor_id = ?',
        [company_id, apartment_id,floor_id]
    );
    // const nextNumber = (countResult[0].count + 1).toString().padStart(3, '0');
    const uuid = uuidv4();
    const nextNumber = (countResult[0].count + 1).toString().padStart(4, '0');
    const id = `${floor_id}-${nextNumber}`;

    const [result] = await pool.execute(
        `INSERT INTO houses 
        (id, company_id, apartment_id, floor_id, house_id, housetype_id) 
        VALUES (?, ?, ?, ?, ?, ?)`,
        [id, company_id, apartment_id, floor_id, house_id, housetype_id]
    );

    return { id, ...houseData };
}
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE company_id=? ORDER BY updated_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartmentAndFloor(apartment_id, floor_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM houses WHERE apartment_id=? AND floor_id=? ORDER BY created_at ASC',
        [apartment_id, floor_id]
    );
    return rows;
}

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM houses ORDER BY updated_at DESC'
        );
        return rows; 
    }

    // In your House model, add this method
    static async findByIdWithDetails(id) {
        const query = `
            SELECT h.*, ht.name as house_type_name, ht.sqrfeet, ht.rooms, ht.bathrooms
            FROM houses h
            LEFT JOIN housetype ht ON h.housetype_id = ht.id
            WHERE h.id = ?
        `;
        
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    }

    static async update(id, houseData) {
        const { house_id,houseowner_id,housetype_id,family_id,status } = houseData;
        await pool.execute(
            'UPDATE houses SET house_id=?,houseowner_id=?,housetype_id=?,family_id=?,status=? WHERE id = ?',
            [ house_id,houseowner_id,housetype_id,family_id,status,id]
        );
        return { id, ...houseData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM houses WHERE id = ?',
            [id]
        );
        return true;
    }

    // Deactivate house (set status to 'inactive')
    static async deactivate(id) {
    await pool.execute(
        'UPDATE houses SET is_active = 0 WHERE id = ?',
        [id]
    );
    return true;
    
}
    //Activate house
    static async activate(id) {
        await pool.execute(
            'UPDATE houses SET is_active = 1 WHERE id = ?',
            [id]
        );
        return true;
    }

    //delete house
    static async delete(id) {
        await pool.execute(
            'DELETE FROM houses WHERE id = ?',
            [id]
        );
        return true;
    }

   static async findByHouseOwnerId(houseowner_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE houseowner_id = ? ORDER BY created_at DESC',
            [houseowner_id]
        );
        return rows; 
    }

    static async findPrimaryHouseByOwnerId(houseowner_id) {
        const [rows] = await pool.execute(
            'SELECT * FROM houses WHERE houseowner_id = ? ORDER BY created_at ASC LIMIT 1',
            [houseowner_id]
        );
        return rows[0] || null;
    }
}

module.exports = House;


