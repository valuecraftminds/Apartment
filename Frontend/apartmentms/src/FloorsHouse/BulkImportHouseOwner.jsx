// pages/BulkImportHouseOwner.js
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { UserCheck, Download, Upload, ChevronDown, ChevronRight, Check, Home, Building, Layers } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../api/axios';
import { toast, ToastContainer } from 'react-toastify';

export default function BulkImportHouseOwner() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [apartments, setApartments] = useState([]);
    const [floors, setFloors] = useState({});
    const [houses, setHouses] = useState({});
    const [selectedApartments, setSelectedApartments] = useState({});
    const [selectedFloors, setSelectedFloors] = useState({});
    const [selectedHouses, setSelectedHouses] = useState({});
    const [expandedApartments, setExpandedApartments] = useState({});
    const [expandedFloors, setExpandedFloors] = useState({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [importedData, setImportedData] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);

    // Load all apartments on component mount
    useEffect(() => {
        loadApartments();
    }, []);

    const loadApartments = async () => {
        try {
            setLoading(true);
            const result = await api.get('/apartments');
            if (result.data.success) {
                setApartments(result.data.data || []);
            }
        } catch (err) {
            console.error('Error loading apartments:', err);
            toast.error('Failed to load apartments');
        } finally {
            setLoading(false);
        }
    };

    const loadFloorsForApartment = async (apartmentId) => {
        if (!apartmentId) return;
        
        try {
            const result = await api.get(`/floors?apartment_id=${apartmentId}`);
            if (result.data.success) {
                const floorsData = result.data.data || [];
                setFloors(prev => ({
                    ...prev,
                    [apartmentId]: floorsData
                }));
                
                // Load houses for each floor
                floorsData.forEach(floor => {
                    loadHousesForFloor(apartmentId, floor.id);
                });
            }
        } catch (err) {
            console.error('Error loading floors:', err);
            toast.error('Failed to load floors');
        }
    };

    const loadHousesForFloor = async (apartmentId, floorId) => {
        if (!apartmentId || !floorId) return;
        
        try {
            const result = await api.get(`/houses?apartment_id=${apartmentId}&floor_id=${floorId}&status=vacant`);
            if (result.data.success) {
                // Ensure we only store houses that are vacant (server should already filter,
                // but guard here in case API returns extra items)
                const housesData = (result.data.data || []).filter(h => (h.status || '').toString().toLowerCase() === 'vacant');
                setHouses(prev => ({
                    ...prev,
                    [floorId]: housesData
                }));
            }
        } catch (err) {
            console.error('Error loading houses:', err);
            toast.error('Failed to load houses');
        }
    };

    const toggleApartment = (apartmentId) => {
        setExpandedApartments(prev => ({
            ...prev,
            [apartmentId]: !prev[apartmentId]
        }));
        
        if (!expandedApartments[apartmentId]) {
            loadFloorsForApartment(apartmentId);
        }
    };

    const toggleFloor = (apartmentId, floorId) => {
        const key = `${apartmentId}_${floorId}`;
        setExpandedFloors(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectApartment = (apartmentId, checked) => {
        setSelectedApartments(prev => ({
            ...prev,
            [apartmentId]: checked
        }));
        
        // Select/deselect all floors and houses in this apartment
        const apartmentFloors = floors[apartmentId] || [];
        apartmentFloors.forEach(floor => {
            setSelectedFloors(prev => ({
                ...prev,
                [floor.id]: checked
            }));
            
            // Select/deselect all houses in this floor
            const floorHouses = houses[floor.id] || [];
            floorHouses.forEach(house => {
                setSelectedHouses(prev => ({
                    ...prev,
                    [house.id]: checked
                }));
            });
        });
    };

    const handleSelectFloor = (apartmentId, floorId, checked) => {
        setSelectedFloors(prev => ({
            ...prev,
            [floorId]: checked
        }));
        
        // Select/deselect all houses in this floor
        const floorHouses = houses[floorId] || [];
        floorHouses.forEach(house => {
            setSelectedHouses(prev => ({
                ...prev,
                [house.id]: checked
            }));
        });
        
        // Update apartment selection status
        const apartmentFloors = floors[apartmentId] || [];
        const allFloorsSelected = apartmentFloors.every(floor => 
            floor.id === floorId ? checked : selectedFloors[floor.id]
        );
        
        setSelectedApartments(prev => ({
            ...prev,
            [apartmentId]: allFloorsSelected
        }));
    };

    const handleSelectHouse = (apartmentId, floorId, houseId, checked) => {
        setSelectedHouses(prev => ({
            ...prev,
            [houseId]: checked
        }));
        
        // Update floor selection status
        const floorHouses = houses[floorId] || [];
        const allHousesSelected = floorHouses.every(house => 
            house.id === houseId ? checked : selectedHouses[house.id]
        );
        
        setSelectedFloors(prev => ({
            ...prev,
            [floorId]: allHousesSelected
        }));
        
        // Update apartment selection status
        const apartmentFloors = floors[apartmentId] || [];
        const allFloorsSelected = apartmentFloors.every(floor => {
            if (floor.id === floorId) return allHousesSelected;
            return selectedFloors[floor.id];
        });
        
        setSelectedApartments(prev => ({
            ...prev,
            [apartmentId]: allFloorsSelected
        }));
    };

    const selectAllApartments = (checked) => {
        const newSelected = {};
        apartments.forEach(apartment => {
            newSelected[apartment.id] = checked;
        });
        setSelectedApartments(newSelected);
        
        // Select/deselect all floors and houses
        if (checked) {
            const newSelectedFloors = {};
            const newSelectedHouses = {};
            
            apartments.forEach(apartment => {
                const apartmentFloors = floors[apartment.id] || [];
                apartmentFloors.forEach(floor => {
                    newSelectedFloors[floor.id] = checked;
                    
                    const floorHouses = houses[floor.id] || [];
                    floorHouses.forEach(house => {
                        newSelectedHouses[house.id] = checked;
                    });
                });
            });
            
            setSelectedFloors(newSelectedFloors);
            setSelectedHouses(newSelectedHouses);
        } else {
            setSelectedFloors({});
            setSelectedHouses({});
        }
    };

    const downloadExcelTemplate = async () => {
        try {
            // Get selected house IDs
            const selectedHouseIds = Object.keys(selectedHouses).filter(id => selectedHouses[id]);
            
            if (selectedHouseIds.length === 0) {
                toast.error('Please select at least one house');
                return;
            }
            
            setLoading(true);

            // Request server-generated template with selected house IDs
            const response = await api.post('/house-owners/bulk/generate-template', {
                house_ids: selectedHouseIds
            }, {
                responseType: 'arraybuffer'
            });

            // Create blob and trigger download
            const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `House_Owners_Template_${new Date().toISOString().split('T')[0]}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Excel template downloaded successfully');
            
        } catch (err) {
            console.error('Error downloading template:', err);
            toast.error('Failed to download template');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
            toast.error('Please upload an Excel file');
            return;
        }
        
        try {
            setUploading(true);
            
            // Read the file
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data, { type: 'array' });
            // Pick the worksheet that contains the house template (avoid the hidden VALIDATION sheet)
            let sheetName = workbook.SheetNames.find(name => name === 'House Owners Template' || /house owners/i.test(name));
            if (!sheetName) {
                // Fallback: find a sheet that has 'House ID' in its header row
                for (const name of workbook.SheetNames) {
                    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1, range: 0, defval: '' });
                    const header = rows && rows[0] ? rows[0].map(h => ('' + h).toString().trim().toLowerCase()) : [];
                    if (header.includes('house id') || header.includes('house_id') || header.includes('house number')) {
                        sheetName = name;
                        break;
                    }
                }
            }

            if (!sheetName) sheetName = workbook.SheetNames[0];

            const worksheet = workbook.Sheets[sheetName];

            // Read as array-of-arrays to get header row and preserve column order
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            if (!rows || rows.length < 2) {
                toast.error('No data found in Excel file');
                return;
            }

            const rawHeaders = rows[0].map(h => ('' + h).trim());
            const norm = s => ('' + (s || '')).toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
            const headersNorm = rawHeaders.map(h => norm(h));

            // Determine column indices for canonical fields
            const col = {};
            const nameCandidates = [];
            headersNorm.forEach((h, i) => {
                if (/house/.test(h) && /(id|number|no)/.test(h)) col.house_id = col.house_id ?? i;
                if (/house\s*pk|house_pk|house\s*primary|house\s*id\s*pk/.test(h)) col.house_pk = col.house_pk ?? i;
                if (/apartment/.test(h) && /(id|name)/.test(h)) {
                    if (/id/.test(h)) col.apartment_id = col.apartment_id ?? i;
                    else col.apartment_name = col.apartment_name ?? i;
                }
                if (/floor/.test(h)) col.floor_id = col.floor_id ?? i;
                if (/owner/.test(h) && /name/.test(h)) col.owner_name = col.owner_name ?? i;
                if (h === 'name') nameCandidates.push(i);
                if (/email/.test(h)) col.email = col.email ?? i;
                if (/nic/.test(h) || /id ?no/.test(h)) col.nic = col.nic ?? i;
                if (/mobile|phone|contact/.test(h)) col.mobile = col.mobile ?? i;
                if (/occupation/.test(h)) col.occupation = col.occupation ?? i;
                if (/country/.test(h)) col.country = col.country ?? i;
                if (/occupied/.test(h)) col.occupied = col.occupied ?? i;
            });

            // Resolve ambiguous 'name' columns: prefer a name column that is not apartment name
            if (!col.owner_name && nameCandidates.length > 0) {
                // If apartment_name exists, choose the name index that is not apartment_name
                if (col.apartment_name) {
                    const pick = nameCandidates.find(i => i !== col.apartment_name);
                    col.owner_name = pick ?? nameCandidates[nameCandidates.length - 1];
                } else {
                    // pick last name column (likely owner name)
                    col.owner_name = nameCandidates[nameCandidates.length - 1];
                }
            }

            // If house_id not found but House Number exists, try that
            if (!col.house_id) {
                const hn = headersNorm.find((h, i) => /(house|house number|house no|house_no)/.test(h));
                if (hn) col.house_id = headersNorm.indexOf(hn);
            }

            // Build objects from rows using column indices
            const dataRows = rows.slice(1).map((r, idx) => {
                return {
                    _row: idx + 2,
                    house_pk: col.house_pk !== undefined ? r[col.house_pk] : undefined,
                    house_id: col.house_id !== undefined ? r[col.house_id] : undefined,
                    apartment_id: col.apartment_id !== undefined ? r[col.apartment_id] : undefined,
                    floor_id: col.floor_id !== undefined ? r[col.floor_id] : undefined,
                    name: col.owner_name !== undefined ? r[col.owner_name] : undefined,
                    nic: col.nic !== undefined ? r[col.nic] : undefined,
                    occupation: col.occupation !== undefined ? r[col.occupation] : undefined,
                    country: col.country !== undefined ? r[col.country] : undefined,
                    mobile: col.mobile !== undefined ? r[col.mobile] : undefined,
                    email: col.email !== undefined ? r[col.email] : undefined,
                    occupied_raw: col.occupied !== undefined ? r[col.occupied] : undefined
                };
            }).filter(r => Object.values(r).some(v => v !== undefined && v !== ''));

            if (dataRows.length === 0) {
                toast.error('No data rows found in template');
                return;
            }

            // Validate and normalize data rows
            const validatedData = dataRows.map(row => {
                const rowNum = row._row;
                // Prefer explicit PK when available
                const houseId = row.house_pk || row.house_id;
                const ownerName = row.name;
                const email = row.email;

                if (!houseId || !ownerName || !email) {
                    throw new Error(`Row ${rowNum}: House ID, Owner Name, and Email are required`);
                }

                if (typeof email === 'string' && !email.includes('@')) {
                    throw new Error(`Row ${rowNum}: Invalid email format`);
                }

                const occupiedType = (row.occupied_raw || 'own').toString().trim();
                if (!['own', 'for rent', 'For rent', 'Own'].map(v => v.toLowerCase()).includes(occupiedType.toLowerCase())) {
                    throw new Error(`Row ${rowNum}: Occupied Type must be "own" or "For rent"`);
                }

                return {
                    house_id: houseId,
                    apartment_id: row.apartment_id,
                    floor_id: row.floor_id,
                    name: ownerName,
                    nic: row.nic || '',
                    occupation: row.occupation || '',
                    country: row.country || '',
                    mobile: row.mobile || '',
                    email: email,
                    occupied_way: occupiedType.toLowerCase() === 'for rent' ? 'For rent' : 'own',
                };
            });
            
            setImportedData({
                fileName: file.name,
                totalRows: validatedData.length,
                data: validatedData
            });
            // Keep original file for upload so hidden mapping sheet is preserved
            setUploadedFile(file);

            toast.success(`Successfully parsed ${validatedData.length} records`);
            
        } catch (err) {
            console.error('Error parsing Excel file:', err);
            toast.error(err.message || 'Failed to parse Excel file');
        } finally {
            setUploading(false);
            event.target.value = ''; // Reset file input
        }
    };

    // Replace your entire importData function with this:
    const importData = async () => {
        if (!importedData || importedData.data.length === 0) {
            toast.error('No data to import');
            return;
        }
        
        try {
            setUploading(true);
            
            // Use the originally uploaded file (contains hidden mapping) for import
            if (!uploadedFile) {
                toast.error('Original file not found. Please upload the Excel file again.');
                return;
            }
            const formData = new FormData();
            formData.append('excelFile', uploadedFile, uploadedFile.name);
            
            // Send single request with the file
            const response = await api.post('/house-owners/bulk/bulk-import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            if (response.data.success) {
                toast.success(`Import completed: ${response.data.data?.success || 0} successful, ${response.data.data?.failed || 0} failed`);
                
                // Show detailed errors if any
                if (response.data.data?.errors && response.data.data.errors.length > 0) {
                    console.error('Import errors:', response.data.data.errors);
                    // Optionally show errors in a modal
                    toast.error(`Some rows failed:\n${response.data.data.errors.map(e => `Row ${e.row}: ${e.error}`).join('\n')}`);
                }
            } else {
                toast.error(response.data.message || 'Import failed');
            }
            
            // Reset imported data
            setImportedData(null);
            
            // Reload apartments to reflect changes
            loadApartments();
            
        } catch (err) {
            console.error('Import error:', err);
            toast.error(err.response?.data?.message || 'Failed to import data');
        } finally {
            setUploading(false);
        }
    };

    const getSelectedCounts = () => {
        const apartmentCount = Object.values(selectedApartments).filter(Boolean).length;
        const floorCount = Object.values(selectedFloors).filter(Boolean).length;
        const houseCount = Object.values(selectedHouses).filter(Boolean).length;
        
        return { apartmentCount, floorCount, houseCount };
    };

    const { apartmentCount, floorCount, houseCount } = getSelectedCounts();

    return (
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200'>
            <Sidebar onCollapse={setIsSidebarCollapsed}/>
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar/>
                <div className='flex-1 overflow-y-auto p-6'>
                    <div className='mx-auto max-w-7xl'>
                        {/* Header */}
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-6 mb-6'>
                            <div className='flex items-center'>
                                <UserCheck size={40} className='text-purple-600 dark:text-purple-400 mr-3'/>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                                        Bulk Import House Owners
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                                        Select apartments, floors, and houses to create Excel template
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Panel - Selection */}
                            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Select Houses
                                    </h2>
                                    <div className="flex items-center gap-4">
                                        {/* <span className="text-sm text-gray-600 dark:text-gray-400">
                                            Selected: {houseCount} houses, {floorCount} floors, {apartmentCount} apartments
                                        </span> */}
                                        <button
                                            onClick={() => selectAllApartments(apartmentCount !== apartments.length)}
                                            className="px-4 py-2 text-sm bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                        >
                                            {apartmentCount === apartments.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                </div>

                                {loading && apartments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading apartments...</p>
                                    </div>
                                ) : apartments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">No apartments found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                        {apartments.map(apartment => (
                                            <div key={apartment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg">
                                                {/* Apartment Header */}
                                                <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-t-lg">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!selectedApartments[apartment.id]}
                                                        onChange={(e) => handleSelectApartment(apartment.id, e.target.checked)}
                                                        className="h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                    />
                                                    <button
                                                        onClick={() => toggleApartment(apartment.id)}
                                                        className="ml-3 flex-1 flex items-center justify-between"
                                                    >
                                                        <div className="flex items-center">
                                                            <Building className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                                                            <span className="font-medium text-gray-800 dark:text-white">
                                                                {apartment.name}
                                                            </span>
                                                        </div>
                                                        {expandedApartments[apartment.id] ? (
                                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                                        ) : (
                                                            <ChevronRight className="h-5 w-5 text-gray-500" />
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Floors (Collapsible) */}
                                                {expandedApartments[apartment.id] && (
                                                    <div className="p-4 pt-0">
                                                        {!floors[apartment.id] ? (
                                                            <div className="text-center py-4">
                                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                                                            </div>
                                                        ) : floors[apartment.id].length === 0 ? (
                                                            <p className="text-gray-500 dark:text-gray-400 text-sm py-4 text-center">
                                                                No floors found
                                                            </p>
                                                        ) : (
                                                            floors[apartment.id].map(floor => (
                                                                <div key={floor.id} className="ml-6 mb-4">
                                                                    {/* Floor Header */}
                                                                    <div className="flex items-center mb-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={!!selectedFloors[floor.id]}
                                                                            onChange={(e) => handleSelectFloor(apartment.id, floor.id, e.target.checked)}
                                                                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                                        />
                                                                        <button
                                                                            onClick={() => toggleFloor(apartment.id, floor.id)}
                                                                            className="ml-2 flex-1 flex items-center justify-between"
                                                                        >
                                                                            <div className="flex items-center">
                                                                                <Layers className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                                                                                <span className="text-gray-700 dark:text-gray-300">
                                                                                    Floor {floor.floor_id}
                                                                                </span>
                                                                            </div>
                                                                            {expandedFloors[`${apartment.id}_${floor.id}`] ? (
                                                                                <ChevronDown className="h-4 w-4 text-gray-500" />
                                                                            ) : (
                                                                                <ChevronRight className="h-4 w-4 text-gray-500" />
                                                                            )}
                                                                        </button>
                                                                    </div>

                                                                    {/* Houses (Collapsible) */}
                                                                    {expandedFloors[`${apartment.id}_${floor.id}`] && (
                                                                        <div className="ml-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                                                            {!houses[floor.id] ? (
                                                                                <div className="col-span-full text-center py-2">
                                                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mx-auto"></div>
                                                                                </div>
                                                                            ) : houses[floor.id].length === 0 ? (
                                                                                <p className="col-span-full text-gray-500 dark:text-gray-400 text-sm py-2">
                                                                                    No houses found
                                                                                </p>
                                                                            ) : (
                                                                                houses[floor.id].map(house => (
                                                                                    <div key={house.id} className="flex items-center">
                                                                                        <input
                                                                                            type="checkbox"
                                                                                            checked={!!selectedHouses[house.id]}
                                                                                            onChange={(e) => handleSelectHouse(apartment.id, floor.id, house.id, e.target.checked)}
                                                                                            className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                                                                                        />
                                                                                        <label className="ml-2 flex items-center">
                                                                                            <Home className="h-3 w-3 text-gray-500 dark:text-gray-400 mr-1" />
                                                                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                                                                {house.house_id || house.house_number}
                                                                                            </span>
                                                                                        </label>
                                                                                    </div>
                                                                                ))
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right Panel - Actions */}
                            <div className="space-y-6">
                                {/* Download Template Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                        Download Excel Template
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                        Download a pre-filled Excel template with the selected houses.
                                    </p>
                                    <button
                                        onClick={downloadExcelTemplate}
                                        disabled={loading || houseCount === 0}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Preparing Template...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="h-5 w-5" />
                                                <span>Download Template ({houseCount} houses)</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Upload Excel Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                                        Upload & Import
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                                        Upload the filled Excel sheet to import house owners in bulk. No verification emails will be sent.
                                    </p>
                                    
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Upload Excel File
                                        </label>
                                        <input
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 dark:file:bg-purple-900 dark:file:text-purple-300"
                                        />
                                    </div>

                                    {importedData && (
                                        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                            <div className="flex items-center">
                                                <Check className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                                                <span className="font-medium text-green-800 dark:text-green-300">
                                                    Ready to Import
                                                </span>
                                            </div>
                                            <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                                                {importedData.fileName} - {importedData.totalRows} records loaded
                                            </p>
                                            <div className="mt-3 text-xs text-green-600 dark:text-green-400 space-y-1">
                                                <p>✓ File parsed successfully</p>
                                                <p>✓ Data validated</p>
                                                <p>✓ Ready for bulk import</p>
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        onClick={importData}
                                        disabled={uploading || !importedData}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {uploading ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                <span>Importing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-5 w-5" />
                                                <span>Start Bulk Import</span>
                                            </>
                                        )}
                                    </button>
                                </div>

                                {/* Instructions Card */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                                        Instructions
                                    </h4>
                                    <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                                        <li className="flex items-start">
                                            <span className="inline-block w-5">1.</span>
                                            <span>Select apartments, floors, and houses using checkboxes</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-5">2.</span>
                                            <span>Click "Download Template" to get Excel file</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-5">3.</span>
                                            <span>Fill owner details in Excel (don't add/delete rows)</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-5">4.</span>
                                            <span>Upload the filled Excel file</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="inline-block w-5">5.</span>
                                            <span>Click "Start Bulk Import"</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer position='top-center' autoClose={3000}/>
        </div>
    );
}
