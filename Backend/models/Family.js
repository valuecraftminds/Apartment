//models/Family.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Family {
  // Create new member
  static async create(residentData) {
    const { houseowner_id, name, nic, email, phone } = residentData;
    const id = uuidv4().replace(/-/g, '').substring(0, 5);

    await pool.execute(
  `INSERT INTO family 
  (id, houseowner_id, name, nic, email, phone) 
  VALUES (?, ?, ?, ?, ?, ?)`,
  [id, houseowner_id, name, nic, email, phone]
);


    return { id, ...residentData };
  }

  // Find by ID
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT * FROM family WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  // Find all family
  static async findAll() {
    const [rows] = await pool.execute(
      'SELECT * FROM family ORDER BY name ASC'
    );
    return rows;
  }

  //find by house owner
  static async findByHouseOwnerId(houseowner_id) {  // Add parameter
  const [rows] = await pool.execute(
    'SELECT * FROM family WHERE houseowner_id = ? ORDER BY name ASC',
    [houseowner_id]  // Add parameter
  );
  return rows;
}
  
  // FIXED: Get family by house ID (using family_id from houses table)
  static async findByHouseId(house_id) {
    const query = `
      SELECT f.* 
      FROM family f
      INNER JOIN houses h ON f.id = h.family_id
      WHERE h.id = ?
    `;
    
    const [rows] = await pool.execute(query, [house_id]);
    return rows[0] || null;
  }

  // Update owner
  static async updateFamily(id, residentData) {
    const { name, email, phone } = residentData;

    await pool.execute(
      `UPDATE family 
        SET name=?, email=?, phone=?
          WHERE id = ?`,
      [name, email, phone, id]
    );

    return { id, ...residentData };
  }

  // Delete owner
  static async delete(id) {
    await pool.execute(
      'DELETE FROM family WHERE id = ?',
      [id]
    );
    return true;
  }
}

module.exports = Family;
