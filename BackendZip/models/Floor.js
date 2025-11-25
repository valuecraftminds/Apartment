const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class Floor {
    static async create(floorData) {
        const { company_id, apartment_id, floor_id, house_count  } = floorData;
        const id = uuidv4().replace(/-/g, '').substring(0, 10);

        const [result] = await pool.execute(
            'INSERT INTO floors (id, company_id, apartment_id, floor_id,  house_count) VALUES (?, ?, ?, ?, ?)',
            [id,company_id, apartment_id, floor_id, null]
        );
        return { id, ...floorData };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT * FROM floors WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findByCompanyId(company_id){
        const [rows] = await pool.execute(
            'SELECT * FROM floors WHERE company_id=? ORDER BY created_at DESC',
            [company_id]
        );
        return rows;
    }

    static async findByApartmentId(apartment_id){
        const [rows] = await pool.execute(
            // 'SELECT * FROM floors WHERE apartment_id=? ORDER BY CAST(SUBSTRING(floor_id, 2) AS UNSIGNED) ASC',
           `SELECT 
            f.*, 
            COUNT(DISTINCT h.id) AS house_count
        FROM floors f
        LEFT JOIN houses h ON f.id = h.floor_id
        WHERE f.apartment_id = ?
        GROUP BY f.id
        ORDER BY CAST(SUBSTRING(f.floor_id, 2) AS UNSIGNED) ASC`,
        [apartment_id]
        );
        return rows;
    }

    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT * FROM floors ORDER BY created_at DESC'
        );
        return rows; 
    }

    static async findByApartment(apartment_id) {
    const [rows] = await pool.execute(
      "SELECT * FROM floors WHERE apartment_id = ? ORDER BY created_at ASC",
      [apartment_id]
    );
    return rows;
  }

    //UPdate Floors
    static async update(id, floorData) {
    const { status, floor_id } = floorData;
    await pool.execute(
        'UPDATE floors SET status = ?, floor_id = ? WHERE id = ?',
        [status, floor_id, id]
    );
    return { id, ...floorData };
}

    // Deactivate floor (set status to 'inactive')
    static async deactivate(id) {
    await pool.execute(
        'UPDATE floors SET is_active = 0 WHERE id = ?',
        [id]
    );
    return true;
    
}
    //Activate floor
    static async activate(id) {
        await pool.execute(
            'UPDATE floors SET is_active = 1 WHERE id = ?',
            [id]
        );
        return true;
    }

    static async delete(id) {
        await pool.execute(
            'DELETE FROM floors WHERE id = ?',
            [id]
        );
        return true;
    }
}

module.exports = Floor;