// models/HouseOwner.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class HouseOwner {
static async create(houseOwnerData) {
    const { company_id, apartment_id, name, nic, occupation, country, mobile, email, occupied_way, proof } = houseOwnerData;
    const id = uuidv4().replace(/-/g, '').substring(0, 10);

    // Get the House Owner role_id for this company
    let role_id = null;
    
    try {
        const [roleRows] = await pool.execute(
            'SELECT id FROM roles WHERE company_id = ? AND role_name = ? AND is_active = 1 LIMIT 1',
            [company_id, 'House Owner']
        );
        
        if (roleRows.length > 0) {
            role_id = roleRows[0].id;
        } else {
            // If no House Owner role exists, try to find any role with owner in the name
            const [alternativeRoles] = await pool.execute(
                'SELECT id FROM roles WHERE company_id = ? AND (role_name LIKE "%owner%" OR role_name LIKE "%Owner%") AND is_active = 1 LIMIT 1',
                [company_id]
            );
            
            if (alternativeRoles.length > 0) {
                role_id = alternativeRoles[0].id;
            } else {
                // If still no role, get the first active role for the company
                const [firstRole] = await pool.execute(
                    'SELECT id FROM roles WHERE company_id = ? AND is_active = 1 LIMIT 1',
                    [company_id]
                );
                
                if (firstRole.length > 0) {
                    role_id = firstRole[0].id;
                }
            }
        }
    } catch (error) {
        console.error('Error finding role for house owner:', error);
        // Continue without role_id if there's an error
    }

    await pool.execute(
        `INSERT INTO houseowner 
        (id, company_id, apartment_id, name, nic, occupation, country, mobile, email, occupied_way, proof, 
         is_active, is_verified, created_at, updated_at, role_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 0, NOW(), NOW(), ?)`,
        [id, company_id, apartment_id, name, nic, occupation, country, mobile, email, occupied_way, proof, role_id]
    );

    return { 
        id, 
        ...houseOwnerData,
        role_id: role_id 
    };
}

  // Find by ID
  static async findById(id) {
    const [rows] = await pool.execute(
        `SELECT ho.*, r.role_name 
         FROM houseowner ho
         LEFT JOIN roles r ON ho.role_id = r.id
         WHERE ho.id = ?`,
        [id]
    );
    return rows[0];
}

  // Find all owners
  static async findAll() {
    const [rows] = await pool.execute(
        `SELECT ho.*, r.role_name 
         FROM houseowner ho
         LEFT JOIN roles r ON ho.role_id = r.id
         ORDER BY ho.name ASC`
    );
    return rows;
}

    static async findByApartment(apartment_id) {
      const [rows] = await pool.execute(
          'SELECT * FROM houseowner WHERE apartment_id=?',
          [apartment_id]
      );
      return rows;
  }

 
  // FIXED: Get house owner by house ID (using houseowner_id from houses table)
  static async findByHouseId(house_id) {
    const query = `
      SELECT ho.* 
      FROM houseowner ho
      INNER JOIN houses h ON ho.id = h.houseowner_id
      WHERE h.id = ?
      LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [house_id]);
    return rows[0] || null;
  }

  // FIXED: Get house owner by house ID and apartment ID
  static async findByHouseAndApartment(house_id, apartment_id) {
    const query = `
      SELECT ho.*, r.role_name
      FROM houseowner ho
      INNER JOIN houses h ON ho.id = h.houseowner_id
      LEFT JOIN roles r ON ho.role_id = r.id
      WHERE h.id = ? AND h.apartment_id = ?
      LIMIT 1
    `;
    
    const [rows] = await pool.execute(query, [house_id, apartment_id]);
    return rows[0] || null;
}


  // Update owner
  // models/HouseOwner.js
static async updateHouseOwner(id, houseOwnerData) {
    const { name, occupation, country, mobile, email, occupied_way, proof, role_id } = houseOwnerData;

    let query = `UPDATE houseowner SET `;
    const params = [];
    const updates = [];
    
    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    
    if (occupation !== undefined) {
        updates.push('occupation = ?');
        params.push(occupation);
    }
    
    if (country !== undefined) {
        updates.push('country = ?');
        params.push(country);
    }
    
    if (mobile !== undefined) {
        updates.push('mobile = ?');
        params.push(mobile);
    }
    
    if (email !== undefined) {
        updates.push('email = ?');
        params.push(email);
    }
    
    if (occupied_way !== undefined) {
        updates.push('occupied_way = ?');
        params.push(occupied_way);
    }
    
    if (proof !== undefined) {
        updates.push('proof = ?');
        params.push(proof);
    }
    
    if (role_id !== undefined) {
        updates.push('role_id = ?');
        params.push(role_id);
    }
    
    updates.push('updated_at = NOW()');
    
    query += updates.join(', ') + ' WHERE id = ?';
    params.push(id);
    
    await pool.execute(query, params);
    return this.findById(id);
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
