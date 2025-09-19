const pool=require('../db');
const { v4: uuidv4 } = require('uuid');

class Tenant{
    static async create(tenantData){
        const {regNo,name,address,employees}=tenantData;
        //const id=uuidv4(); 
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const [result] = await pool.execute(
            'INSERT INTO tenants (id,regNo,name,address,employees) values(?,?,?,?)',
            [id,regNo,name,address,employees]
        );
        return {id, ...tenantData};
    }

    static async findByRegNo(regNo){
        const [rows] = await pool.execute(
            'SELECT * FROM tenants WHERE regNo=?',
            [regNo]
        );
        return rows[0];
    }

    static async findById(id){
        const [rows] = await pool.execute(
            'SELECT * FROM tenants WHERE id=?',
            [id]
        );
        return rows[0];
    }

    static async findAll(){
        const [rows] = await pool.execute(
            'SELECT * FROM tenants ORDER BY createdAt DESC'
        );
        return rows;
    }

    static async update(id, tenantData){
        const {regNo,name,address,employees}=tenantData;
        await pool.execute(
            'UPDATE tenants SET regNo=?, name=?, address=?, employees=? is_active=? WHERE id=?',
            [regNo,name,address,employees,id]
        );
        return {id, ...tenantData}
    }

    static async delete(id){
        await pool.execute(
            'DELETE FROM tenants WHERE id=?',
            [id]
        );
        return true;
    }
}

module.exports = Tenant;