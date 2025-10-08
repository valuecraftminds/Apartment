const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HouseOwner {
  // Create new owner
  static async create(houseOwnerData) {
    const { name, NIC, marital_status, occupation, country, mobile, occupied_way, proof } = houseOwnerData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    await pool.execute(
      `INSERT INTO houseowner 
      (id, name, NIC, marital_status, occupation, country, mobile, occupied_way, proof) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, NIC, marital_status, occupation, country, mobile, occupied_way, proof]
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

  // Update owner
  static async update(id, houseOwnerData) {
    const { name, NIC, marital_status, occupation, country, mobile, occupied_way, proof } = houseOwnerData;

    await pool.execute(
      `UPDATE houseowner 
       SET name=?, NIC=?, marital_status=?, occupation=?, country=?, mobile=?, occupied_way=?, proof=? 
       WHERE id = ?`,
      [name, NIC, marital_status, occupation, country, mobile, occupied_way, proof, id]
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
