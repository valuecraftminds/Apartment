const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HouseType{
    static async create(houseTypeData) {
    const { company_id, apartment_id, members, sqrfeet, rooms, bathrooms} = houseTypeData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    const [result] = await pool.execute(
        `INSERT INTO houses 
        (id, company_id, apartment_id, members, sqrfeet, rooms, bathrooms) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, company_id, apartment_id, members, sqrfeet, rooms, bathrooms]
    );

    return { id, ...houseTypeData };
}
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM houseType WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM houseType WHERE company_id=? ORDER BY ORDER BY created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartment(apartment_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM houseType WHERE apartment_id=? ORDER BY created_at ASC',
        [apartment_id]
    );
    return rows;
}

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM houseType ORDER BY created_at DESC'
        );
        return rows; 
    }

    static async update(id, houseTypeData) {
        const {members,sqrfeet,rooms,bathrooms,status,occupied_way } = houseData;
        await pool.execute(
            'UPDATE houses SET members=?, sqrfeet = ?,rooms=?,bathrooms=? WHERE id = ?',
            [ members,sqrfeet,rooms,bathrooms,status,occupied_way,id]
        );
        return { id, ...houseTypeData };
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM houseType WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = HouseType;


