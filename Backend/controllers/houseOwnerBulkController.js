// controllers/houseOwnerBulkController.js
const pool = require('../db');
const { v4: uuidv4 } = require('uuid');
const { sendHouseOwnerVerificationEmail } = require('../helpers/email');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
const HouseOwner = require('../models/HouseOwner');

const houseOwnerBulkController = {
    // Generate Excel template for selected houses
    async generateExcelTemplate(req, res) {
        let connection;
        try {
            const { house_ids, apartment_ids, floor_ids } = req.body;
            const company_id = req.user.company_id;
            
            if (!house_ids || !Array.isArray(house_ids) || house_ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Please select at least one house'
                });
            }

            connection = await pool.getConnection();
            
            // Get admin's country
            const [adminRows] = await connection.execute(
                'SELECT country FROM users WHERE id = ? AND company_id = ?',
                [req.user.id, company_id]
            );
            
            const adminCountry = adminRows[0]?.country || 'Sri Lanka';
            
            // Get house details with apartment and floor info
            const placeholders = house_ids.map(() => '?').join(',');
            const [houses] = await connection.execute(
                `SELECT 
                    h.id, 
                    h.house_id as house_number,
                    h.status,
                    h.floor_id,
                    h.apartment_id,
                    a.name as apartment_name,
                    a.address as apartment_address,
                    f.floor_id as floor_number
                FROM houses h
                LEFT JOIN floors f ON h.floor_id = f.id
                LEFT JOIN apartments a ON h.apartment_id = a.id
                WHERE h.id IN (${placeholders}) AND h.company_id = ?
                ORDER BY a.name, f.floor_id, h.house_id`,
                [...house_ids, company_id]
            );
            
            if (houses.length === 0) {
                await connection.release();
                return res.status(404).json({
                    success: false,
                    message: 'No houses found for the selected IDs'
                });
            }
            
            // Prepare Excel data: show only human-readable columns to users (no DB PKs visible).
            // Add a visible, non-PK identifier `House Ref` (short public id) per row.
            const excelData = houses.map(house => {
                const publicId = uuidv4().split('-')[0];
                return {
                    'House Ref': publicId,
                    'Apartment Name': house.apartment_name || '',
                    'Floor Number': house.floor_number || '',
                    'House Number': house.house_number || house.house_id || '',
                    'Owner Name': '',
                    'NIC': '',
                    'Occupation': '',
                    'Country': adminCountry,
                    'Mobile': '',
                    'Email': '',
                    'Occupied Type': 'own',
                    'Move-in Date': new Date().toISOString().split('T')[0],
                    'Notes': ''
                };
            });
            
            // Create workbook using exceljs so we can protect specific columns
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('House Owners Template');

            worksheet.columns = [
                { header: 'House Ref', key: 'houseRef', width: 20 },
                { header: 'Apartment Name', key: 'apartmentName', width: 20 },
                { header: 'Floor Number', key: 'floorNumber', width: 12 },
                { header: 'House Number', key: 'houseNumber', width: 15 },
                { header: 'Owner Name', key: 'ownerName', width: 20 },
                { header: 'NIC', key: 'nic', width: 15 },
                { header: 'Occupation', key: 'occupation', width: 15 },
                { header: 'Country', key: 'country', width: 15 },
                { header: 'Mobile', key: 'mobile', width: 15 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Occupied Type', key: 'occupiedType', width: 15 },
                { header: 'Move-in Date', key: 'moveInDate', width: 15 },
                { header: 'Notes', key: 'notes', width: 20 }
            ];

            // Add header styling
            const headerRow = worksheet.getRow(1);
            headerRow.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6D28D9' } };
                cell.alignment = { horizontal: 'center' };
            });

            // Add data rows
            excelData.forEach(item => {
                worksheet.addRow([
                    item['House Ref'],
                    item['Apartment Name'],
                    item['Floor Number'],
                    item['House Number'],
                    item['Owner Name'],
                    item['NIC'],
                    item['Occupation'],
                    item['Country'],
                    item['Mobile'],
                    item['Email'],
                    item['Occupied Type'],
                    item['Move-in Date'],
                    item['Notes']
                ]);
            });

            const rowCount = excelData.length + 1; // including header

            // Create a hidden validation sheet with allowed values for Occupied Type
            const valData = [[ 'own' ], [ 'For rent' ]];
            const wsVal = workbook.addWorksheet('VALIDATION');
            wsVal.addRow(['own']);
            wsVal.addRow(['For rent']);
            wsVal.state = 'hidden';

            // Create a hidden mapping sheet that ties each visible `House Ref` to the internal House PK.
            const mappingHeader = ['PublicId', 'HousePK'];
            const wsMap = workbook.addWorksheet('MAPPING');
            wsMap.addRow(mappingHeader);
            const mappingRows = houses.map((house, idx) => [excelData[idx]['House Ref'], house.id]);
            mappingRows.forEach(r => wsMap.addRow(r));
            wsMap.state = 'hidden';

            // Add data validation (list) for Occupied Type on each data cell in that column
            // Use the hidden VALIDATION sheet as the source so options are maintainable
            const occupiedColIndex = 11; // 1-based index in our worksheet.columns
            for (let r = 2; r <= rowCount; r++) {
                const cell = worksheet.getRow(r).getCell(occupiedColIndex);
                cell.dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: ['=VALIDATION!$A$1:$A$2']
                };
            }

            // Protect the sheet and lock House Ref, Apartment Name, Floor Number, House Number columns.
            // By default cells are locked; we'll unlock editable columns (Owner Name..Notes)
            for (let r = 2; r <= rowCount; r++) {
                const rowObj = worksheet.getRow(r);
                // unlock editable columns (cols 5..13)
                for (let c = 5; c <= 13; c++) {
                    const cell = rowObj.getCell(c);
                    cell.protection = { locked: false };
                }
            }

            // Protect worksheet (empty password to allow Excel to enforce protection)
            await worksheet.protect('', { selectLockedCells: true, selectUnlockedCells: true });

            // Generate buffer (exceljs)
            const excelBuffer = await workbook.xlsx.writeBuffer();
            
            // Set headers for download
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="House_Owners_Template_${new Date().toISOString().split('T')[0]}.xlsx"`);
            
            res.send(excelBuffer);
            
        } catch (error) {
            console.error('Excel generation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to generate Excel template',
                error: error.message
            });
        } finally {
            if (connection) connection.release();
        }
    },

    // Bulk import house owners from Excel
    async bulkImportHouseOwners(req, res) {
        let connection;
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No file uploaded'
                });
            }

            const company_id = req.user.company_id;
            
            // Parse Excel file
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });

            // Try to read hidden mapping sheet first (preferred). This sheet maps either PublicId -> HousePK
            // or (legacy) Row -> HousePK. We'll build both structures for compatibility.
            let mappingByPublicId = null;
            let mappingByRow = null;
            const mapSheetName = workbook.SheetNames.find(n => n.toLowerCase() === 'mapping');
            if (mapSheetName) {
                const wsMap = workbook.Sheets[mapSheetName];
                const mapRows = XLSX.utils.sheet_to_json(wsMap, { header: 1, defval: '' });
                // mapRows[0] is header. If the mapping is [PublicId, HousePK], build mappingByPublicId.
                mappingByPublicId = {};
                mappingByRow = mapRows.slice(1).map(r => (r && r[1]) ? r[1] : null);
                for (let m = 1; m < mapRows.length; m++) {
                    const key = mapRows[m][0];
                    const val = mapRows[m][1];
                    if (key) mappingByPublicId[String(key)] = val;
                }
            }

            const worksheet = workbook.Sheets[workbook.SheetNames.find(n => n.toLowerCase().includes('house owners') || n.toLowerCase().includes('house')) || workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);
            
            if (!jsonData || jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'No data found in Excel file'
                });
            }
            
            connection = await pool.getConnection();
            await connection.beginTransaction();
            
            const results = {
                total: jsonData.length,
                success: 0,
                failed: 0,
                errors: [],
                importedOwners: []
            };

            // Process each row
            for (let i = 0; i < jsonData.length; i++) {
                const row = jsonData[i];
                const rowNumber = i + 2; // +2 because Excel rows start at 1 and header is row 1

                try {
                    // Extract and validate data
                    // Prefer explicit DB PK column `House PK` if present, otherwise fall back to House ID/house_id
                    const houseId = row['House PK'] || row['House ID'] || row['house_id'];
                    const apartmentId = row['Apartment ID'] || row['apartment_id'];
                    const ownerName = (row['Owner Name'] || row['owner_name'] || row['name'] || '').toString().trim();
                    const email = (row['Email'] || row['email'] || '').toString().trim();
                    const nic = (row['NIC'] || row['nic'] || '').toString().trim();
                    const mobile = (row['Mobile'] || row['mobile'] || row['Phone'] || '').toString().trim();
                    const country = (row['Country'] || row['country'] || req.user.country || 'Sri Lanka').toString().trim();
                    const occupation = (row['Occupation'] || row['occupation'] || '').toString().trim();
                    let occupiedWay = (row['Occupied Type'] || row['occupied_type'] || 'own').toString().trim();

                    // Visible public identifier (House Ref) may be used instead of DB PK
                    const publicId = (row['House Ref'] || row['PublicId'] || row['house_ref'] || '').toString().trim();
                    

                    // Normalize occupied way
                    if (occupiedWay.toLowerCase().includes('rent')) {
                        occupiedWay = 'For rent';
                    } else {
                        occupiedWay = 'own';
                    }

                    // Validate required fields (apartmentId not required because we include hidden PK or PublicId mapping)
                    if ((!houseId && !publicId) || !ownerName) {
                        throw new Error('House identifier (House ID or House Ref) and Owner Name are required');
                    }

                    if (email && !email.includes('@')) {
                        throw new Error('Invalid email format');
                    }

                    // Check if house exists. Prefer mapping PK (if provided by hidden sheet PublicId->PK), then PK lookup, then house number.
                    let houseRows = [];

                    // Try to use PublicId (visible `House Ref`) mapping first, then legacy row-based mapping.
                    if (mappingByPublicId && publicId && mappingByPublicId[publicId]) {
                        const mappedPk = mappingByPublicId[publicId];
                        if (mappedPk) {
                            [houseRows] = await connection.execute(
                                'SELECT id, status, houseowner_id, apartment_id FROM houses WHERE id = ? AND company_id = ? FOR UPDATE',
                                [mappedPk, company_id]
                            );
                        }
                    }

                    // Legacy: if no public-id mapping used, try by mapping row index
                    if ((!houseRows || houseRows.length === 0) && mappingByRow && mappingByRow[i]) {
                        const mappedPk = mappingByRow[i];
                        if (mappedPk) {
                            [houseRows] = await connection.execute(
                                'SELECT id, status, houseowner_id, apartment_id FROM houses WHERE id = ? AND company_id = ? FOR UPDATE',
                                [mappedPk, company_id]
                            );
                        }
                    }

                    // If mapping not used or not found, try by provided PK value
                    if (!houseRows || houseRows.length === 0) {
                        try {
                            [houseRows] = await connection.execute(
                                'SELECT id, status, houseowner_id, apartment_id FROM houses WHERE id = ? AND company_id = ? FOR UPDATE',
                                [houseId, company_id]
                            );
                        } catch (e) {
                            houseRows = [];
                        }
                    }

                    // If still not found, fallback to matching by house number (`house_id`). If apartmentName/floorNumber provided, narrow by them.
                    if (!houseRows || houseRows.length === 0) {
                        // Build a flexible query: match by house number, optionally narrow by apartment name and floor number
                        if (row['House Number']) {
                            // try narrow by apartment name + floor number if available
                            if (row['Apartment Name'] && row['Floor Number']) {
                                const [byText] = await connection.execute(
                                    `SELECT h.id, h.status, h.houseowner_id, h.apartment_id FROM houses h
                                        JOIN apartments a ON h.apartment_id = a.id
                                        JOIN floors f ON h.floor_id = f.id
                                        WHERE h.house_id = ? AND a.name = ? AND f.floor_id = ? AND h.company_id = ? FOR UPDATE`,
                                    [row['House Number'], row['Apartment Name'], row['Floor Number'], company_id]
                                );
                                if (byText && byText.length > 0) houseRows = byText;
                            }

                            // fallback: match by house number only
                            if (!houseRows || houseRows.length === 0) {
                                const [byNumber] = await connection.execute(
                                    'SELECT id, status, houseowner_id, apartment_id FROM houses WHERE house_id = ? AND company_id = ? FOR UPDATE',
                                    [row['House Number'], company_id]
                                );
                                if (byNumber && byNumber.length > 0) houseRows = byNumber;
                            }
                        }
                    }

                    if (!houseRows || houseRows.length === 0) {
                        throw new Error('House not found in the specified apartment');
                    }

                    // Resolve the actual DB primary id for this house (in case we searched by house number)
                    const resolvedHouseId = houseRows[0].id;

                    // Try to reuse existing owner by email. Prefer narrowing by apartment if provided,
                    // otherwise search by company scope. Avoid passing undefined to SQL by using explicit queries.
                    let ownerId = null;
                    if (email) {
                        let existingOwner = [];
                        if (apartmentId) {
                            [existingOwner] = await connection.execute(
                                'SELECT id FROM houseowner WHERE email = ? AND apartment_id = ? LIMIT 1',
                                [email, apartmentId]
                            );
                        } else {
                            [existingOwner] = await connection.execute(
                                'SELECT id FROM houseowner WHERE email = ? AND company_id = ? LIMIT 1',
                                [email, company_id]
                            );
                        }
                        if (existingOwner && existingOwner.length > 0) {
                            ownerId = existingOwner[0].id;
                        }
                    }

                    // If no existing owner, create via model (this will resolve role automatically)
                    if (!ownerId) {
                        const created = await HouseOwner.create({
                            company_id,
                            apartment_id: apartmentId || null,
                            name: ownerName || 'Unknown',
                            nic: nic || null,
                            occupation: occupation || null,
                            country: country || null,
                            mobile: mobile || null,
                            email: email || null,
                            occupied_way: occupiedWay || 'own',
                            proof: null
                        });

                        ownerId = created.id;
                    }

                    // Parse optional Move-in Date
                    const moveInDate = (row['Move-in Date'] || row['Move in Date'] || row['move_in_date'] || row['movein_date'] || row['Movein Date'] || '').toString().trim();
                    const occupiedAtVal = moveInDate ? new Date(moveInDate) : new Date();
                    await connection.execute(
                        'UPDATE houses SET houseowner_id = ?, status = ?, occupied_at = ? WHERE id = ?',
                        [ownerId, 'occupied', occupiedAtVal, resolvedHouseId]
                    );

                    // Generate verification token for newly created owners only
                    const crypto = require('crypto');
                    const verificationToken = crypto.randomBytes(32).toString('hex');
                    const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
                    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

                    await connection.execute(
                        'UPDATE houseowner SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?',
                        [tokenHash, tokenExpires, ownerId]
                    );

                    results.success++;
                    results.importedOwners.push({
                        row: rowNumber,
                        ownerId,
                        name: ownerName,
                        email,
                        houseId: resolvedHouseId,
                        verificationToken
                    });

                } catch (error) {
                    results.failed++;
                    // Prefer to show any provided house identifier (PK or house number)
                    const providedHouseId = row['House ID'] || row['house_id'] || row['House Number'] || row['house_number'] || 'N/A';
                    const providedApartment = row['Apartment ID'] || row['apartment_id'] || 'N/A';
                    results.errors.push({
                        row: rowNumber,
                        houseId: providedHouseId,
                        apartmentId: providedApartment,
                        error: error.message
                    });
                }
            }

            // Commit transaction
            await connection.commit();

            // Send verification emails for successful imports (in background)
            if (results.importedOwners.length > 0) {
                // Don't await - let it run in background
                Promise.allSettled(
                    results.importedOwners.map(async (owner) => {
                        try {
                            await sendHouseOwnerVerificationEmail(owner.email, owner.verificationToken, owner.ownerId);
                            console.log(`Verification email sent to ${owner.email}`);
                        } catch (emailError) {
                            console.error(`Failed to send verification email to ${owner.email}:`, emailError.message);
                        }
                    })
                ).then(() => {
                    console.log(`All verification emails processed for ${results.importedOwners.length} owners`);
                });
            }

            res.json({
                success: true,
                message: `Bulk import completed: ${results.success} successful, ${results.failed} failed`,
                data: results
            });
            
        } catch (error) {
            console.error('Bulk import error:', error);
            
            if (connection) {
                await connection.rollback();
            }
            
            res.status(500).json({
                success: false,
                message: 'Failed to process bulk import',
                error: error.message
            });
        } finally {
            if (connection) connection.release();
        }
    },

    // Get houses for selection (for frontend)
    async getHousesForSelection(req, res) {
        try {
            const company_id = req.user.company_id;
            const { apartment_id, floor_id, status = 'vacant' } = req.query;
            
            let query = `
                SELECT 
                    h.id,
                    h.house_id as house_number,
                    h.status,
                    h.floor_id,
                    f.floor_id,
                    h.apartment_id,
                    a.name as apartment_name
                FROM houses h
                LEFT JOIN floors f ON h.floor_id = f.id
                LEFT JOIN apartments a ON h.apartment_id = a.id
                WHERE h.company_id = ?
            `;
            
            const params = [company_id];
            
            if (apartment_id) {
                query += ' AND h.apartment_id = ?';
                params.push(apartment_id);
            }
            
            if (floor_id) {
                query += ' AND h.floor_id = ?';
                params.push(floor_id);
            }
            
            if (status) {
                query += ' AND h.status = ?';
                params.push(status);
            }
            
            query += ' ORDER BY a.name, f.floor_id, h.house_id';
            
            const [houses] = await pool.execute(query, params);
            
            res.json({
                success: true,
                data: houses
            });
            
        } catch (error) {
            console.error('Get houses error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch houses',
                error: error.message
            });
        }
    },

    // Send verification email for specific owner
    async sendVerificationEmail(req, res) {
        try {
            const { owner_id, email } = req.body;
            
            if (!owner_id || !email) {
                return res.status(400).json({
                    success: false,
                    message: 'Owner ID and email are required'
                });
            }
            
            // Generate new verification token
            const crypto = require('crypto');
            const verificationToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(verificationToken).digest('hex');
            const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            await pool.execute(
                'UPDATE houseowner SET verification_token_hash = ?, verification_token_expires = ? WHERE id = ?',
                [tokenHash, tokenExpires, owner_id]
            );
            
            // Send email
            await sendHouseOwnerVerificationEmail(email, verificationToken, owner_id);
            
            res.json({
                success: true,
                message: 'Verification email sent successfully'
            });
            
        } catch (error) {
            console.error('Send verification email error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email',
                error: error.message
            });
        }
    }
};

module.exports = houseOwnerBulkController;