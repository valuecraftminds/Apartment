const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HouseType{
    static async create(houseTypeData) {
    const { company_id, apartment_id, name,members, sqrfeet, rooms, bathrooms} = houseTypeData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    const [result] = await pool.execute(
        `INSERT INTO housetype 
        (id, company_id, apartment_id, name, members, sqrfeet, rooms, bathrooms) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, company_id, apartment_id, name, members, sqrfeet, rooms, bathrooms]
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
            'SELECT * FROM houseType WHERE company_id=? ORDER BY created_at ASC',
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
        const {members,sqrfeet,rooms,bathrooms } = houseTypeData;
        await pool.execute(
            'UPDATE housetype SET members=?, sqrfeet = ?,rooms=?,bathrooms=? WHERE id = ?',
            [ members,sqrfeet,rooms,bathrooms,id]
        );
        return { id, ...houseTypeData };
    }

    //Deactivate house type
    static async deactivate(id){
        await pool.execute(
            'Update housetype set is_active = 0 where id = ?',
            [id]
        );
        return true;
    }

    //Activate house type
    static async activate(id){
        await pool.execute(
            'Update housetype set is_active = 1 where id = ?',
            [id]
        );
        return true
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


