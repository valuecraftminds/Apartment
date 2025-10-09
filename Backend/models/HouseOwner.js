const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HouseOwner {
  // Create new owner
  static async create(houseOwnerData) {
    const { company_id,apartment_id,name, nic, marital_status, occupation, country, mobile, occupied_way, proof } = houseOwnerData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    await pool.execute(
      `INSERT INTO houseowner 
      (id, company_id,apartment_id,name, nic, marital_status, occupation, country, mobile, occupied_way, proof) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, company_id,apartment_id,name, nic, marital_status, occupation, country, mobile, occupied_way, proof]
    );

    return { id, ...houseOwnerData };
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM houseowner WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find all owners
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM houseowner ORDER BY name ASC'
    );
    return rows;
  }

  // static async findByCompanyId(company_id){
  //       const [rows] = await pool.execute(
  //           'SELECT * FROM houses WHERE company_id=? ORDER BY updated_at DESC',
  //           [company_id]
  //       );
  //       return rows;
  //   }

    static async findByApartment(apartment_id) {
    const [rows] = await pool.execute(
        'SELECT * FROM houseowner WHERE apartment_id=?  ORDER BY updated_at ASC',
        [apartment_id]
    );
    return rows;
}

  // Update owner
  static async updateHouseOwner(id, houseOwnerData) {
    const { name, marital_status, occupation, country, mobile, occupied_way, proof } = houseOwnerData;

    await pool.execute(
      `UPDATE houseowner 
        SET name=?, marital_status=?, occupation=?, country=?, mobile=?, occupied_way=?, proof=? 
          WHERE id = ?`,
      [name, marital_status, occupation, country, mobile, occupied_way, proof, id]
    );

    return { id, ...houseOwnerData };
  }

  // Delete owner
  static async delete(id) {
    await pool.execute(
      'DELETE FROM houseowner WHERE id = ?',
      [id]
    );
    return true;
  }
}

module.exports = HouseOwner;
