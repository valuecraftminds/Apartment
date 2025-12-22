// models/BulkImportModel.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

class BulkImportModel {
  static async createApartment(apartmentData) {
    const { company_id, name, address, city } = apartmentData;
    const id = uuidv4();
    const apartment_id = `APT${Date.now()}`;
    
    const [result] = await pool.execute(
      `INSERT INTO apartments (id, apartment_id, company_id, name, address, city) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, apartment_id, company_id, name, address, city || null]
    );
    
    return { id, apartment_id, ...apartmentData };
  }

  static async findApartmentByName(company_id, name) {
    const [rows] = await pool.execute(
      'SELECT id, apartment_id FROM apartments WHERE company_id = ? AND name = ? AND is_active = 1',
      [company_id, name]
    );
    return rows[0];
  }

  static async createFloor(floorData) {
    const { company_id, apartment_id, floor_id } = floorData;
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO floors (id, company_id, apartment_id, floor_id) 
       VALUES (?, ?, ?, ?)`,
      [id, company_id, apartment_id, floor_id]
    );
    
    return { id, ...floorData };
  }

  static async findFloor(apartment_id, floor_id) {
    const [rows] = await pool.execute(
      'SELECT id FROM floors WHERE apartment_id = ? AND floor_id = ? AND is_active = 1',
      [apartment_id, floor_id]
    );
    return rows[0];
  }

  static async createHouseType(houseTypeData) {
    const { company_id, apartment_id, name, sqrfeet, rooms, bathrooms } = houseTypeData;
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO housetype (id, company_id, apartment_id, name, sqrfeet, rooms, bathrooms) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, company_id, apartment_id, name, sqrfeet, rooms, bathrooms]
    );
    
    return { id, ...houseTypeData };
  }

  static async findHouseTypeByName(company_id, apartment_id, name) {
    const [rows] = await pool.execute(
      'SELECT id FROM housetype WHERE company_id = ? AND apartment_id = ? AND name = ? AND is_active = 1',
      [company_id, apartment_id, name]
    );
    return rows[0];
  }

  static async createHouse(houseData) {
    const { company_id, apartment_id, floor_id, house_id, housetype_id, status } = houseData;
    const id = uuidv4();
    
    const [result] = await pool.execute(
      `INSERT INTO houses (id, company_id, apartment_id, floor_id, house_id, housetype_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, company_id, apartment_id, floor_id, house_id, housetype_id, status]
    );
    
    return { id, ...houseData };
  }

  static async findHouse(floor_id, house_id) {
    const [rows] = await pool.execute(
      'SELECT id FROM houses WHERE floor_id = ? AND house_id = ? AND is_active = 1',
      [floor_id, house_id]
    );
    return rows[0];
  }

  static async updateHouseCount(floor_id) {
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as house_count FROM houses WHERE floor_id = ? AND is_active = 1',
      [floor_id]
    );
    
    await pool.execute(
      'UPDATE floors SET house_count = ? WHERE id = ?',
      [countResult[0].house_count, floor_id]
    );
  }

  static async updateApartmentStats(apartment_id) {
    // Update floors count
    const [floorsResult] = await pool.execute(
      'SELECT COUNT(*) as floor_count FROM floors WHERE apartment_id = ? AND is_active = 1',
      [apartment_id]
    );
    
    // Update houses count
    const [housesResult] = await pool.execute(
      'SELECT COUNT(*) as house_count FROM houses WHERE apartment_id = ? AND is_active = 1',
      [apartment_id]
    );
    
    await pool.execute(
      'UPDATE apartments SET floors = ?, houses = ? WHERE id = ?',
      [floorsResult[0].floor_count, housesResult[0].house_count, apartment_id]
    );
  }

  static async createMultipleHouses(housesData) {
    const houses = [];
    for (const houseData of housesData) {
      const { company_id, apartment_id, floor_id, house_id, housetype_id, status } = houseData;
      const id = uuidv4();
      
      const [result] = await pool.execute(
        `INSERT INTO houses (id, company_id, apartment_id, floor_id, house_id, housetype_id, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, company_id, apartment_id, floor_id, house_id, housetype_id, status]
      );
      
      houses.push({ id, ...houseData });
    }
    return houses;
  }

  static async getNextHouseNumber(floor_id, prefix = '') {
    const [rows] = await pool.execute(
      'SELECT house_id FROM houses WHERE floor_id = ? AND house_id LIKE ? ORDER BY house_id DESC LIMIT 1',
      [floor_id, `${prefix}%`]
    );
    
    if (rows.length === 0) {
      return `${prefix}01`;
    }
    
    const lastHouseId = rows[0].house_id;
    const lastNumber = parseInt(lastHouseId.replace(prefix, '')) || 0;
    const nextNumber = lastNumber + 1;
    return `${prefix}${nextNumber.toString().padStart(2, '0')}`;
  }
}

module.exports = BulkImportModel;