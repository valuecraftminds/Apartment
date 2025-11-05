// controllers/bulkImportController.js
const pool = require('../db');
const BulkImportModel = require('../models/BulkImport');
const xlsx = require('xlsx');

const bulkImportController = {
  async bulkImport(req, res) {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const company_id = req.user.company_id;

      // Read Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Excel file is empty'
        });
      }

      const results = {
        total: data.length,
        created: {
          apartments: 0,
          floors: 0,
          houseTypes: 0,
          houses: 0
        },
        updated: {
          houses: 0
        },
        errors: []
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const rowNumber = i + 2;

        try {
          // Validate required fields
          if (!row.apartment_name || !row.floor_number || !row.house_number || !row.house_type) {
            results.errors.push(`Row ${rowNumber}: Missing required fields (apartment_name, floor_number, house_number, house_type)`);
            continue;
          }

          const apartmentName = row.apartment_name.toString().trim();
          const floorNumber = row.floor_number.toString().trim();
          const houseNumber = row.house_number.toString().trim();
          const houseTypeName = row.house_type.toString().trim();
          const status = row.status && ['vacant', 'occupied', 'maintenance'].includes(row.status.toString().toLowerCase()) 
            ? row.status.toString().toLowerCase() 
            : 'vacant';

          // House type details (with defaults)
          const sqrfeet = parseFloat(row.sqrfeet) || 1000;
          const rooms = parseInt(row.rooms) || 3;
          const bathrooms = parseInt(row.bathrooms) || 2;

          // Apartment details (with defaults)
          const address = row.address?.toString().trim() || 'Not specified';
          const city = row.city?.toString().trim() || 'Not specified';

          // Step 1: Create or get apartment
          let apartment = await BulkImportModel.findApartmentByName(company_id, apartmentName);
          if (!apartment) {
            apartment = await BulkImportModel.createApartment({
              company_id,
              name: apartmentName,
              address,
              city
            });
            results.created.apartments++;
          }

          // Step 2: Create or get floor
          let floor = await BulkImportModel.findFloor(apartment.id, floorNumber);
          if (!floor) {
            floor = await BulkImportModel.createFloor({
              company_id,
              apartment_id: apartment.id,
              floor_id: floorNumber
            });
            results.created.floors++;
          }

          // Step 3: Create or get house type
          let houseType = await BulkImportModel.findHouseTypeByName(company_id, apartment.id, houseTypeName);
          if (!houseType) {
            houseType = await BulkImportModel.createHouseType({
              company_id,
              apartment_id: apartment.id,
              name: houseTypeName,
              sqrfeet,
              rooms,
              bathrooms
            });
            results.created.houseTypes++;
          }

          // Step 4: Create or update house
          const existingHouse = await BulkImportModel.findHouse(floor.id, houseNumber);
          if (existingHouse) {
            // Update existing house
            await connection.execute(
              'UPDATE houses SET housetype_id = ?, status = ? WHERE id = ?',
              [houseType.id, status, existingHouse.id]
            );
            results.updated.houses++;
          } else {
            // Create new house
            await BulkImportModel.createHouse({
              company_id,
              apartment_id: apartment.id,
              floor_id: floor.id,
              house_id: houseNumber,
              housetype_id: houseType.id,
              status
            });
            results.created.houses++;
          }

          // Update counts
          await BulkImportModel.updateHouseCount(floor.id);
          await BulkImportModel.updateApartmentStats(apartment.id);

        } catch (error) {
          console.error(`Error processing row ${rowNumber}:`, error);
          results.errors.push(`Row ${rowNumber}: ${error.message}`);
        }
      }

      await connection.commit();

      res.json({
        success: true,
        message: 'Bulk import completed successfully',
        data: results
      });

    } catch (error) {
      await connection.rollback();
      console.error('Bulk import error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during bulk import',
        error: error.message
      });
    } finally {
      connection.release();
    }
  },

  async downloadTemplate(req, res) {
    try {
      // Create sample data for template with all required fields
      const templateData = [
        {
          apartment_name: 'Sunrise Apartments',
          address: '123 Main Street',
          city: 'Colombo',
          floor_number: '1',
          house_number: '101',
          house_type: 'Standard',
          sqrfeet: 1200,
          rooms: 3,
          bathrooms: 2,
          status: 'vacant'
        },
        {
          apartment_name: 'Sunrise Apartments',
          address: '123 Main Street',
          city: 'Colombo',
          floor_number: '1',
          house_number: '102',
          house_type: 'Deluxe',
          sqrfeet: 1500,
          rooms: 4,
          bathrooms: 3,
          status: 'occupied'
        },
        {
          apartment_name: 'Ocean View',
          address: '456 Beach Road',
          city: 'Galle',
          floor_number: 'Ground',
          house_number: 'G01',
          house_type: 'Standard',
          sqrfeet: 1000,
          rooms: 3,
          bathrooms: 2,
          status: 'vacant'
        }
      ];

      const worksheet = xlsx.utils.json_to_sheet(templateData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Template');

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=apartment-import-template.xlsx');

      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(buffer);

    } catch (error) {
      console.error('Template download error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating template'
      });
    }
  }
};

module.exports = bulkImportController;