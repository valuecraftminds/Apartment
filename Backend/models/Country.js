const pool = require('../db');

class Country{
    static async findAll() {
        const [rows] = await pool.execute(
            'SELECT id, country_name, phone_code FROM countries WHERE is_active = 1 ORDER BY country_name'
        );
        return rows; 
    }
}

module.exports=Country;