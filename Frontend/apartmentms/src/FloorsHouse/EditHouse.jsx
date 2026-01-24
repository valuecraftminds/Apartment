// //EditHouse.jsx
// import React, { useEffect, useState } from 'react';
// import api from '../api/axios';
// import { Loader, ChevronDown, ChevronUp } from 'lucide-react';

// export default function EditHouse({ house, onClose, onUpdated, apartment_id, floor_id }) {
//     const [formData, setFormData] = useState({
//         house_id: house.house_id,
//         status: house.status,
//         housetype_id: house.housetype_id,
//         houseowner_id: house.houseowner_id
//     });
    
//     const [ownerFormData, setOwnerFormData] = useState({
//         name: '',
//         nic: '',
//         occupation: '',
//         country: '',
//         mobile: '',
//         email:'',
//         occupied_way: 'own',
//         proof: null
//     });
    
//     const [houseTypes, setHouseTypes] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [showOwnerForm, setShowOwnerForm] = useState(false);
//     const [file, setFile] = useState(null);
//     const [countries, setCountries] = useState([]);
//     const [ownerFormExpanded, setOwnerFormExpanded] = useState(true);

//     useEffect(() => {
//         const fetchCountries = async () => {
//             try {
//                 const res = await api.get('/countries');
//                 setCountries(res.data.data);
//             } catch (err) {
//                 console.error("Error fetching countries:", err);
//             }
//         };
//         fetchCountries();
//     }, []);

//     const handleCountryChange = (e) => {
//         const countryId = e.target.value;
//         const selectedCountry = countries.find(c => c.id.toString() === countryId);

//         if (selectedCountry) {
//             setOwnerFormData(prev => ({
//                 ...prev,
//                 country: selectedCountry.country_name,
//                 mobile: selectedCountry.phone_code + ' '
//             }));
//         } else {
//             setOwnerFormData(prev => ({
//                 ...prev,
//                 country: '',
//                 mobile: ''
//             }));
//         }
//     };

//     const handleMobileChange = (e) => {
//         const value = e.target.value;
        
//         if (ownerFormData.mobile && ownerFormData.mobile.includes('+')) {
//             const countryCodeMatch = ownerFormData.mobile.match(/^(\+\d+)(?:\s|$)/);
//             if (countryCodeMatch) {
//                 const countryCode = countryCodeMatch[1];
//                 if (value.startsWith(countryCode)) {
//                     setOwnerFormData(prev => ({
//                         ...prev,
//                         mobile: value
//                     }));
//                 } else {
//                     setOwnerFormData(prev => ({
//                         ...prev,
//                         mobile: countryCode + ' ' + value.replace(/^\+\d+\s?/, '')
//                     }));
//                 }
//                 return;
//             }
//         }
        
//         setOwnerFormData(prev => ({
//             ...prev,
//             mobile: value
//         }));
//     };

//     useEffect(() => {
//         const fetchHouseTypes = async () => {
//             try {
//                 const res = await api.get(`/housetype?apartment_id=${apartment_id}`, {
//                     headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//                 });
//                 setHouseTypes(res.data.data || []);
//             } catch (err) {
//                 console.error("Error fetching house types:", err);
//             }
//         };
//         fetchHouseTypes();
//     }, [apartment_id]);

//     useEffect(() => {
//         if (formData.status === 'occupied' && house.status !== 'occupied') {
//             setShowOwnerForm(true);
//             setOwnerFormExpanded(true);
//         } else if (formData.status !== 'occupied') {
//             setShowOwnerForm(false);
//         }
//     }, [formData.status, house.status]);

//     const handleChange = (e) => {
//         setFormData({
//             ...formData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleOwnerChange = (e) => {
//         setOwnerFormData({
//             ...ownerFormData,
//             [e.target.name]: e.target.value
//         });
//     };

//     const handleFileChange = (e) => {
//         setFile(e.target.files[0]);
//     };


// const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//         let houseOwnerId = formData.houseowner_id;
//         let newHouseOwnerCreated = false;

//         if (formData.status === 'occupied' && !houseOwnerId) {
//             const ownerFormDataToSend = new FormData();
//             ownerFormDataToSend.append('name', ownerFormData.name);
//             ownerFormDataToSend.append('nic', ownerFormData.nic);
//             ownerFormDataToSend.append('occupation', ownerFormData.occupation);
//             ownerFormDataToSend.append('country', ownerFormData.country);
//             ownerFormDataToSend.append('mobile', ownerFormData.mobile);
//             ownerFormDataToSend.append('email', ownerFormData.email);
//             ownerFormDataToSend.append('occupied_way', ownerFormData.occupied_way);
//             ownerFormDataToSend.append('apartment_id', apartment_id);
//             if (file) {
//                 ownerFormDataToSend.append('proof', file);
//             }

//             const ownerRes = await api.post('/houseowner', ownerFormDataToSend, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data',
//                 },
//             });

//             if (ownerRes.data.success) {
//                 houseOwnerId = ownerRes.data.data.id;
//                 newHouseOwnerCreated = true;
                
//                 // IMPORTANT: Update the formData state immediately
//                 setFormData(prev => ({ 
//                     ...prev, 
//                     houseowner_id: houseOwnerId 
//                 }));
//             }
//         }

//         const updateData = {
//             ...formData,
//             house_owner_id: houseOwnerId || houseOwnerId
//         };

//         const res = await api.put(`/houses/${house.id}`, updateData);
//         if (res.data.success) {
//             // If we created a new house owner, refresh the house data
//             if (newHouseOwnerCreated) {
//                 // Call the parent's update function
//                 onUpdated();
//                 alert('✅ House owner saved successfully! You can now setup login.');
//             } else {
//                 onUpdated();
//             }
//             return houseOwnerId;
//         }
//     } catch (err) {
//         console.error('Error updating house:', err);
//         alert('Error updating house. Please try again.');
//     } finally {
//         setLoading(false);
//     }
// };

//     const selectedCountry = countries.find(c => c.country_name === ownerFormData.country);

//     const handleSetPasswordAndVerify = async () => {
//     try {
//         setLoading(true);
        
//         // Get the house owner ID from state
//         const houseownerId = formData.houseowner_id;
        
//         if (!houseownerId) {
//             alert('House owner ID not found. Please save the house owner first.');
//             return;
//         }
        
//         // Get the email from form data
//         const houseOwnerEmail = ownerFormData.email;
        
//         if (!houseOwnerEmail || !houseOwnerEmail.includes('@')) {
//             alert('Please enter a valid email address for the house owner');
//             return;
//         }
        
//         // Show password dialog
//         // const password = prompt(`Set password for house owner (${houseOwnerEmail}):`);
//         // if (!password || password.length < 6) {
//         //     alert('Password must be at least 6 characters');
//         //     return;
//         // }
        
//         // Confirm with admin
//         const confirmSetup = window.confirm(
//             `Send verification email to ${houseOwnerEmail}?\n\n` +
//             `The house owner will receive an email with verification link.`
//         );
        
//         if (!confirmSetup) {
//             setLoading(false);
//             return;
//         }
        
//         // Call admin setup endpoint
//         const res = await api.post('/houseowner-auth/admin/setup', {
//             houseowner_id: houseownerId,
//             // password: password,
//             send_email: true
//         });
        
//         if (res.data.success) {
//             alert(`✅ Setup successful!\n\nVerification email sent to: ${houseOwnerEmail}\n\n${res.data.message}`);
//             onUpdated();
//         } else {
//             alert(res.data.message || 'Failed to set up house owner');
//         }
//     } catch (err) {
//         console.error('Error setting up house owner:', err);
//         alert('Error setting up house owner. Please try again.');
//     } finally {
//         setLoading(false);
//     }
// };

//     return (
//         <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
//             <div className="flex-1 overflow-y-auto space-y-4 pr-2 pl-1">
//                 {/* Basic House Information */}
//                 <div className="space-y-4">
//                     <div>
//                         <label className="block text-gray-700 dark:text-gray-200 mb-1">House ID</label>
//                         <input
//                             type="text"
//                             name="house_id"
//                             value={formData.house_id}
//                             onChange={handleChange}
//                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                             required
//                         />
//                     </div>

//                     <div>
//                         <label className="block text-gray-700 dark:text-gray-200 mb-1">House Type</label>
//                         <select
//                             name="housetype_id"
//                             value={formData.housetype_id}
//                             onChange={handleChange}
//                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                             required
//                         >
//                             <option value="">Select Type</option>
//                             {houseTypes && houseTypes.length > 0 ? (
//                                 houseTypes.map((housetype) => (
//                                     <option key={housetype.id} value={housetype.id}>
//                                         {housetype.name || housetype.type_name || 'Unnamed Type'}
//                                     </option>
//                                 ))
//                             ) : (
//                                 <option value="" disabled>No house types available</option>
//                             )}
//                         </select>
//                     </div>

//                     <div>
//                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Status</label>
//                         <select
//                             name="status"
//                             value={formData.status}
//                             onChange={handleChange}
//                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                             required
//                         >
//                             <option value="vacant">Vacant</option>
//                             <option value="occupied">Occupied</option>
//                             <option value="maintenance">Maintenance</option>
//                         </select>
//                     </div>
//                 </div>

//                 {/* Owner Form - Collapsible Section */}
//                 {showOwnerForm && (
//                     <div className="border-t pt-4 mt-4">
//                         <button
//                             type="button"
//                             onClick={() => setOwnerFormExpanded(!ownerFormExpanded)}
//                             className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
//                         >
//                             <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
//                                 Owner Information
//                             </h3>
//                             {ownerFormExpanded ? (
//                                 <ChevronUp size={20} className="text-gray-500" />
//                             ) : (
//                                 <ChevronDown size={20} className="text-gray-500" />
//                             )}
//                         </button>
                        
//                         {ownerFormExpanded && (
//                             <div className="space-y-4">
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Name *</label>
//                                         <input
//                                             type="text"
//                                             name="name"
//                                             value={ownerFormData.name}
//                                             onChange={handleOwnerChange}
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">NIC *</label>
//                                         <input
//                                             type="text"
//                                             name="nic"
//                                             value={ownerFormData.nic}
//                                             onChange={handleOwnerChange}
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation *</label>
//                                         <input
//                                             type="text"
//                                             name="occupation"
//                                             value={ownerFormData.occupation}
//                                             onChange={handleOwnerChange}
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                             required
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Country *</label>
//                                         <select
//                                             name="country"
//                                             value={countries.find(c => c.country_name === ownerFormData.country)?.id || ''}
//                                             onChange={handleCountryChange}
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                             required
//                                         >
//                                             <option value="">Select country *</option>
//                                             {countries.map(country => (
//                                                 <option key={country.id} value={country.id}>
//                                                     {country.country_name} ({country.phone_code})
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-4">
//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Mobile *</label>
//                                         <div className="flex items-center">
//                                             {selectedCountry && (
//                                                 <span className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 whitespace-nowrap">
//                                                     {selectedCountry.phone_code}
//                                                 </span>
//                                             )}
//                                             <input
//                                                 name="mobile"
//                                                 value={ownerFormData.mobile}
//                                                 onChange={handleMobileChange}
//                                                 placeholder={selectedCountry ? "Enter phone number" : "Select country first"}
//                                                 className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white ${
//                                                     selectedCountry ? 'rounded-l-none' : ''
//                                                 }`}
//                                                 required
//                                                 disabled={!selectedCountry}
//                                             />
//                                         </div>
//                                         <p className="text-xs text-gray-500 mt-1">
//                                             Format: {selectedCountry?.phone_code || '+XX'} XXXXXXXXX
//                                         </p>
//                                     </div>
//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Email *</label>
//                                         <input 
//                                             name="email" 
//                                             type="email"
//                                             value={ownerFormData.email} 
//                                             onChange={handleOwnerChange}
//                                             placeholder="Email *" 
//                                             className='w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white'
//                                         />
//                                     </div>

//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation Type</label>
//                                         <select
//                                             name="occupied_way"
//                                             value={ownerFormData.occupied_way}
//                                             onChange={handleOwnerChange}
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                         >
//                                             <option value="own">Own</option>
//                                             <option value="For rent">For Rent</option>
//                                         </select>
//                                     </div>

//                                     <div>
//                                         <label className="block text-gray-700 dark:text-gray-200 mb-1">Proof Document</label>
//                                         <input
//                                             type="file"
//                                             onChange={handleFileChange}
//                                             accept="image/*"
//                                             className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
//                                         />
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 )}
//             </div>

//             {/* Fixed Footer with Action Buttons */}
//             <div className="border-t dark:border-gray-700 pt-4 mt-4 sticky bottom-0 bg-white dark:bg-gray-900">
//                 <div className="flex justify-end space-x-2">
//                     <button 
//                         type="button" 
//                         onClick={onClose} 
//                         className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
//                     >
//                         Cancel
//                     </button>
//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50"
//                     >
//                         {loading && <Loader size={16} className="animate-spin" />}
//                         {showOwnerForm ? 'Save House & Owner' : 'Save Changes'}
//                     </button>
//                     {(formData.houseowner_id || (showOwnerForm && ownerFormData.email)) && (
//                         <button
//                             type="button"
//                             onClick={handleSetPasswordAndVerify}
//                             disabled={loading || !ownerFormData.email}
//                             className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
//                             title={!ownerFormData.email ? "Enter email first" : "Setup login for house owner"}
//                         >
//                             Setup Login for Owner
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </form>
//     );
// }

import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Loader, ChevronDown, ChevronUp, Upload, FileSpreadsheet, X, Check, Download } from 'lucide-react';
import ImportHouseOwnerModal from './ImportHouseOwnerModal';

export default function EditHouse({ house, onClose, onUpdated, apartment_id, floor_id }) {
    const [formData, setFormData] = useState({
        house_id: house.house_id,
        status: house.status,
        housetype_id: house.housetype_id,
        houseowner_id: house.houseowner_id
    });
    
    const [ownerFormData, setOwnerFormData] = useState({
        name: '',
        nic: '',
        occupation: '',
        country: '',
        mobile: '',
        email: '',
        occupied_way: 'own',
        proof: null
    });
    
    const [houseTypes, setHouseTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showOwnerForm, setShowOwnerForm] = useState(false);
    const [file, setFile] = useState(null);
    const [countries, setCountries] = useState([]);
    const [ownerFormExpanded, setOwnerFormExpanded] = useState(true);
    const [uploadMethod, setUploadMethod] = useState('manual'); // 'manual' or 'excel'
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [parsing, setParsing] = useState(false);
    const [parseError, setParseError] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await api.get('/countries');
                setCountries(res.data.data);
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };
        fetchCountries();
    }, []);

    const handleCountryChange = (e) => {
        const countryId = e.target.value;
        const selectedCountry = countries.find(c => c.id.toString() === countryId);

        if (selectedCountry) {
            setOwnerFormData(prev => ({
                ...prev,
                country: selectedCountry.country_name,
                mobile: selectedCountry.phone_code + ' '
            }));
        } else {
            setOwnerFormData(prev => ({
                ...prev,
                country: '',
                mobile: ''
            }));
        }
    };

    const handleMobileChange = (e) => {
        const value = e.target.value;
        
        if (ownerFormData.mobile && ownerFormData.mobile.includes('+')) {
            const countryCodeMatch = ownerFormData.mobile.match(/^(\+\d+)(?:\s|$)/);
            if (countryCodeMatch) {
                const countryCode = countryCodeMatch[1];
                if (value.startsWith(countryCode)) {
                    setOwnerFormData(prev => ({
                        ...prev,
                        mobile: value
                    }));
                } else {
                    setOwnerFormData(prev => ({
                        ...prev,
                        mobile: countryCode + ' ' + value.replace(/^\+\d+\s?/, '')
                    }));
                }
                return;
            }
        }
        
        setOwnerFormData(prev => ({
            ...prev,
            mobile: value
        }));
    };

    useEffect(() => {
        const fetchHouseTypes = async () => {
            try {
                const res = await api.get(`/housetype?apartment_id=${apartment_id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                });
                setHouseTypes(res.data.data || []);
            } catch (err) {
                console.error("Error fetching house types:", err);
            }
        };
        fetchHouseTypes();
    }, [apartment_id]);

    useEffect(() => {
        if (formData.status === 'occupied' && house.status !== 'occupied') {
            setShowOwnerForm(true);
            setOwnerFormExpanded(true);
        } else if (formData.status !== 'occupied') {
            setShowOwnerForm(false);
        }
    }, [formData.status, house.status]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleOwnerChange = (e) => {
        setOwnerFormData({
            ...ownerFormData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    // Handle Excel file upload
    const handleExcelFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Check file type
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(selectedFile.type)) {
            alert('Please select an Excel file (.xlsx, .xls, .csv)');
            return;
        }

        // Check file size
        if (selectedFile.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setExcelFile(selectedFile);
        setExcelData(null);
        setParseError(null);
    };

    // Parse Excel file using backend API
    const parseExcelFile = async () => {
        if (!excelFile) {
            setParseError('Please upload an Excel file first');
            return;
        }

        setParsing(true);
        setParseError(null);

        try {
            const formData = new FormData();
            formData.append('excelFile', excelFile);

            const response = await api.post('/houseowner/parse-excel', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                const extractedData = response.data.data;
                setExcelData(extractedData);
                
                // Auto-fill the form with extracted data
                setOwnerFormData(prev => ({
                    ...prev,
                    name: extractedData.name || prev.name,
                    nic: extractedData.nic || prev.nic,
                    occupation: extractedData.occupation || prev.occupation,
                    country: extractedData.country || prev.country,
                    mobile: extractedData.mobile || prev.mobile,
                    email: extractedData.email || prev.email,
                    occupied_way: extractedData.occupied_way || prev.occupied_way
                }));
            } else {
                setParseError(response.data.message || 'Failed to parse Excel file');
            }
        } catch (error) {
            console.error('Error parsing Excel file:', error);
            setParseError('Failed to parse Excel file. Please check the format.');
        } finally {
            setParsing(false);
        }
    };

    const clearExcelFile = () => {
        setExcelFile(null);
        setExcelData(null);
        setParseError(null);
    };

    // Download Excel template
    const downloadTemplate = () => {
        // Create template content
        const templateContent = `name,nic,occupation,country,mobile,email,occupied_way
John Doe,123456789V,Software Engineer,Sri Lanka,+94 771234567,john@example.com,own

Instructions:
1. Fill in the house owner details in the second row
2. Keep the column headers as shown in the first row
3. Save the file and upload it here
4. The system will extract the information automatically

Important:
- Fill only one row (single house owner)
- Email is required for verification
- Mobile should include country code
- occupied_way can be "own" or "For rent"`;

        // Create a Blob with the template content
        const blob = new Blob([templateContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'house_owner_template.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            let houseOwnerId = formData.houseowner_id;
            let newHouseOwnerCreated = false;

            if (formData.status === 'occupied' && !houseOwnerId) {
                const ownerFormDataToSend = new FormData();
                ownerFormDataToSend.append('name', ownerFormData.name);
                ownerFormDataToSend.append('nic', ownerFormData.nic);
                ownerFormDataToSend.append('occupation', ownerFormData.occupation);
                ownerFormDataToSend.append('country', ownerFormData.country);
                ownerFormDataToSend.append('mobile', ownerFormData.mobile);
                ownerFormDataToSend.append('email', ownerFormData.email);
                ownerFormDataToSend.append('occupied_way', ownerFormData.occupied_way);
                ownerFormDataToSend.append('apartment_id', apartment_id);
                ownerFormDataToSend.append('house_id', house.id);
                ownerFormDataToSend.append('floor_id', floor_id);
                
                // Add additional proof if uploaded
                if (file) {
                    ownerFormDataToSend.append('proof', file);
                }

                const ownerRes = await api.post('/houseowner', ownerFormDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                if (ownerRes.data.success) {
                    houseOwnerId = ownerRes.data.data.id;
                    newHouseOwnerCreated = true;
                    
                    setFormData(prev => ({ 
                        ...prev, 
                        houseowner_id: houseOwnerId 
                    }));

                    // Send verification email if email is provided
                    if (ownerFormData.email) {
                        try {
                            await api.post('/houseowner-auth/admin/send-verification', {
                                houseowner_id: houseOwnerId,
                                email: ownerFormData.email
                            });
                        } catch (emailError) {
                            console.error('Error sending verification email:', emailError);
                            // Continue even if email fails
                        }
                    }
                }
            }

            const updateData = {
                ...formData,
                house_owner_id: houseOwnerId || formData.houseowner_id
            };

            const res = await api.put(`/houses/${house.id}`, updateData);
            if (res.data.success) {
                if (newHouseOwnerCreated) {
                    onUpdated();
                    alert(`✅ House owner saved successfully!\n\nVerification email has been sent to ${ownerFormData.email || 'the provided email address'}.`);
                } else {
                    onUpdated();
                }
                return houseOwnerId;
            }
        } catch (err) {
            console.error('Error updating house:', err);
            const errorMsg = err.response?.data?.message || 'Error updating house. Please try again.';
            alert(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const selectedCountry = countries.find(c => c.country_name === ownerFormData.country);

    const handleImportSuccess = (newOwner) => {
        // Update the form data with the new house owner ID
        setFormData(prev => ({
            ...prev,
            houseowner_id: newOwner.id,
            status: 'occupied' // Automatically set status to occupied
        }));
        
        // Show a success message
        alert(`✅ House owner imported successfully!\n\nName: ${newOwner.name}\nEmail: ${newOwner.email}\n\nVerification email has been sent.`);
        
        // Close the import modal
        setShowImportModal(false);
        
        // Optionally, you can also update the local owner form data
        setOwnerFormData({
            name: newOwner.name,
            nic: newOwner.nic,
            occupation: newOwner.occupation,
            country: newOwner.country,
            mobile: newOwner.mobile,
            email: newOwner.email,
            occupied_way: newOwner.occupied_way || 'own',
            proof: null
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col max-h-[80vh]">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 pl-1">
                {/* Basic House Information */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">House ID</label>
                        <input
                            type="text"
                            name="house_id"
                            value={formData.house_id}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">House Type</label>
                        <select
                            name="housetype_id"
                            value={formData.housetype_id}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                            required
                        >
                            <option value="">Select Type</option>
                            {houseTypes && houseTypes.length > 0 ? (
                                houseTypes.map((housetype) => (
                                    <option key={housetype.id} value={housetype.id}>
                                        {housetype.name || housetype.type_name || 'Unnamed Type'}
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>No house types available</option>
                            )}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-700 dark:text-gray-200 mb-1">Status</label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                            required
                        >
                            <option value="vacant">Vacant</option>
                            <option value="occupied">Occupied</option>
                            <option value="maintenance">Maintenance</option>
                        </select>
                    </div>
                </div>

                {/* Owner Form - Collapsible Section */}
                {showOwnerForm && (
                    <div className="border-t pt-4 mt-4">
                        <button
                            type="button"
                            onClick={() => setOwnerFormExpanded(!ownerFormExpanded)}
                            className="flex items-center justify-between w-full mb-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
                        >
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                                Owner Information
                            </h3>
                            {ownerFormExpanded ? (
                                <ChevronUp size={20} className="text-gray-500" />
                            ) : (
                                <ChevronDown size={20} className="text-gray-500" />
                            )}
                        </button>
                        
                        {ownerFormExpanded && (
                            <div className="space-y-6">
                                {/* Data Entry Method Selection */}
                                <div className="mb-4">
                                    <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                        How would you like to add owner details?
                                    </label>
                                    <div className="flex space-x-4">
                                        <button
                                            type="button"
                                            onClick={() => setUploadMethod('manual')}
                                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                                uploadMethod === 'manual'
                                                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl mb-2">✏️</span>
                                                <span className="font-medium">Manual Entry</span>
                                                <span className="text-xs mt-1">Type details one by one</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => setShowImportModal(true)}
                                            className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                                                uploadMethod === 'import'
                                                    ? 'border-green-600 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 text-gray-700 dark:text-gray-300'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center">
                                                <Upload size={24} className="mb-2" />
                                                <span className="font-medium">Import from Excel</span>
                                                <span className="text-xs mt-1">Upload Excel file</span>
                                            </div>
                                        </button>
                                    </div>
                                    
                                    {uploadMethod === 'excel' && (
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={downloadTemplate}
                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                            >
                                                <Download size={14} />
                                                Download Excel Template
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Excel Upload Section */}
                                {uploadMethod === 'excel' && (
                                    <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-2 font-medium">
                                                Upload House Owner Details Excel File
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                Download the template, fill in the details for this house owner, and upload it here.
                                            </p>
                                            
                                            {!excelFile ? (
                                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                                                    <input
                                                        type="file"
                                                        id="excel-file"
                                                        onChange={handleExcelFileChange}
                                                        accept=".xlsx,.xls,.csv"
                                                        className="hidden"
                                                    />
                                                    <label htmlFor="excel-file" className="cursor-pointer">
                                                        <Upload size={48} className="mx-auto mb-3 text-gray-400" />
                                                        <p className="text-gray-700 dark:text-gray-300 font-medium">
                                                            Click to upload Excel/CSV file
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            XLSX, XLS, CSV (Max 10MB)
                                                        </p>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border">
                                                        <div className="flex items-center">
                                                            <FileSpreadsheet size={24} className="text-green-500 mr-3" />
                                                            <div>
                                                                <p className="font-medium text-gray-800 dark:text-white">
                                                                    {excelFile.name}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {(excelFile.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={parseExcelFile}
                                                                disabled={parsing}
                                                                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                            >
                                                                {parsing ? 'Parsing...' : 'Extract Data'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={clearExcelFile}
                                                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                            >
                                                                <X size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    {parsing && (
                                                        <div className="text-center py-4">
                                                            <Loader size={24} className="animate-spin mx-auto text-blue-600" />
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                Parsing Excel file...
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {parseError && (
                                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                                            <p className="text-red-700 dark:text-red-300 text-sm">
                                                                {parseError}
                                                            </p>
                                                            <button
                                                                type="button"
                                                                onClick={downloadTemplate}
                                                                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                                            >
                                                                Download template for correct format
                                                            </button>
                                                        </div>
                                                    )}
                                                    
                                                    {excelData && (
                                                        <div className="p-3 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
                                                            <div className="flex items-center mb-2">
                                                                <Check size={20} className="text-green-600 mr-2" />
                                                                <h4 className="font-medium text-green-800 dark:text-green-300">
                                                                    ✅ Data Extracted Successfully
                                                                </h4>
                                                            </div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                                Review the extracted information below. You can edit any field if needed.
                                                            </p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                                {excelData.name && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">Name:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.name}</p>
                                                                    </div>
                                                                )}
                                                                {excelData.nic && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">NIC:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.nic}</p>
                                                                    </div>
                                                                )}
                                                                {excelData.occupation && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">Occupation:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.occupation}</p>
                                                                    </div>
                                                                )}
                                                                {excelData.email && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">Email:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.email}</p>
                                                                    </div>
                                                                )}
                                                                {excelData.mobile && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">Mobile:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.mobile}</p>
                                                                    </div>
                                                                )}
                                                                {excelData.country && (
                                                                    <div>
                                                                        <span className="text-gray-600 dark:text-gray-400">Country:</span>
                                                                        <p className="font-medium text-gray-800 dark:text-white">{excelData.country}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Owner Form Fields (shown for both methods) */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={ownerFormData.name}
                                                onChange={handleOwnerChange}
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                                required
                                                placeholder="Full name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">NIC/Passport *</label>
                                            <input
                                                type="text"
                                                name="nic"
                                                value={ownerFormData.nic}
                                                onChange={handleOwnerChange}
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                                required
                                                placeholder="NIC or passport number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation *</label>
                                            <input
                                                type="text"
                                                name="occupation"
                                                value={ownerFormData.occupation}
                                                onChange={handleOwnerChange}
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                                required
                                                placeholder="Occupation"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Country *</label>
                                            <select
                                                name="country"
                                                value={countries.find(c => c.country_name === ownerFormData.country)?.id || ''}
                                                onChange={handleCountryChange}
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                                required
                                            >
                                                <option value="">Select country *</option>
                                                {countries.map(country => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.country_name} ({country.phone_code})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Mobile *</label>
                                            <div className="flex items-center">
                                                {selectedCountry && (
                                                    <span className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 whitespace-nowrap">
                                                        {selectedCountry.phone_code}
                                                    </span>
                                                )}
                                                <input
                                                    name="mobile"
                                                    value={ownerFormData.mobile}
                                                    onChange={handleMobileChange}
                                                    placeholder={selectedCountry ? "Enter phone number" : "Select country first"}
                                                    className={`w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white ${
                                                        selectedCountry ? 'rounded-l-none' : ''
                                                    }`}
                                                    required
                                                    disabled={!selectedCountry}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Format: {selectedCountry?.phone_code || '+XX'} XXXXXXXXX
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Email *</label>
                                            <input 
                                                name="email" 
                                                type="email"
                                                value={ownerFormData.email} 
                                                onChange={handleOwnerChange}
                                                placeholder="Email address (for verification link)" 
                                                className='w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white'
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Verification email will be sent to this address
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">Occupation Type</label>
                                            <select
                                                name="occupied_way"
                                                value={ownerFormData.occupied_way}
                                                onChange={handleOwnerChange}
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                            >
                                                <option value="own">Own</option>
                                                <option value="For rent">For Rent</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-gray-700 dark:text-gray-200 mb-1">
                                                Additional Proof Document
                                                <span className="text-sm text-gray-500 ml-1">(Optional)</span>
                                            </label>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                accept="image/*,.pdf,.doc,.docx"
                                                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Upload additional proof like utility bill, lease agreement, etc.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Fixed Footer with Action Buttons */}
            <div className="border-t dark:border-gray-700 pt-4 mt-4 sticky bottom-0 bg-white dark:bg-gray-900">
                <div className="flex justify-end space-x-2">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                        {loading && <Loader size={16} className="animate-spin" />}
                        {showOwnerForm ? 'Save House & Owner' : 'Save Changes'}
                    </button>
                </div>
            </div>
            <ImportHouseOwnerModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImportSuccess={handleImportSuccess}
                apartment_id={apartment_id}
                floor_id={floor_id}
                house_id={house.id}
            />
        </form>
    );
}