//Tenant.js
const pool=require('../db');
const { v4: uuidv4 } = require('uuid');

class Tenant{
    // static async create(tenantData){
    //     const {regNo,name,address}=tenantData;
    //     const id = uuidv4().replace(/-/g, '').substring(0, 3);

    //     const [result] = await pool.execute(
    //         'INSERT INTO tenants (id,regNo,name,address) values(?,?,?,?)',
    //         [id,regNo,name,address]
    //     );
    //     return {id, ...tenantData};
    // }

    // static async findByRegNo(regNo){
    //     const [rows] = await pool.execute(
    //         'SELECT * FROM tenants WHERE regNo=?',
    //         [regNo]
    //     );
    //     return rows[0];
    // }

  static async create(tenantData) {
    const { regNo, name, address } = tenantData;
    
    // Generate a proper UUID (not just 3 chars)
    const id = uuidv4().replace(/-/g, '').substring(0, 3);
    
    console.log('🔍 Creating tenant with ID:', id);
    
    try {
      const [result] = await pool.execute(
        'INSERT INTO tenants (id, regNo, name, address) VALUES (?, ?, ?, ?)',
        [id, regNo, name, address]
      );
      
      console.log('🔍 Database insert successful, affected rows:', result.affectedRows);
      
      return { id, regNo, name, address };
    } catch (err) {
      console.error('🔍 Database error in Tenant.create:', err);
      console.error('🔍 Error code:', err.code);
      console.error('🔍 Error sqlMessage:', err.sqlMessage);
      throw err;
    }
  }

  static async findByRegNo(regNo) {
    try {
      console.log('🔍 Searching for tenant with regNo:', regNo);
      const [rows] = await pool.execute(
        'SELECT * FROM tenants WHERE regNo = ? LIMIT 1',
        [regNo]
      );
      console.log('🔍 Found rows:', rows.length);
      return rows[0];
    } catch (err) {
      console.error('🔍 Error in findByRegNo:', err);
      throw err;
    }
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
        const {regNo,name,address}=tenantData;
        await pool.execute(
            'UPDATE tenants SET regNo=?, name=?, address=?, is_active=? WHERE id=?',
            [regNo,name,address,id]
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