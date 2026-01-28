// //EditHouse.jsx
// import React, { useEffect, useState } from 'react';
// import api from '../api/axios';
// import { Loader, ChevronDown, ChevronUp } from 'lucide-react';
// import ImportHouseOwnerModal from './ImportHouseOwnerModal';

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
//             <ImportHouseOwnerModal
//                 isOpen={false}
//                 onClose={() => {}}
//                 onImportSuccess={(newOwnerId) => {
//                     setFormData(prev => ({
//                         ...prev,
//                         houseowner_id: newOwnerId
//                     }));
//                 }}
//                 apartment_id={apartment_id}
//             />
//         </form>
//     );
// }


import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Loader, ChevronDown, ChevronUp, Upload } from 'lucide-react';
import ImportHouseOwnerModal from './ImportHouseOwnerModal';
import { toast } from 'react-toastify';
import { use } from 'react';

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
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const res = await fetch('https://general.apivcm.shop/countries');
                const data = await res.json();
                setCountries(data.data);
            } catch (err) {
                console.error("Error fetching countries:", err);
            }
        };
        fetchCountries();
    }, []);

    const handleCountryChange = (e) => {
        const countryName = e.target.value;
        const selectedCountry = countries.find(c => c.country === countryName);
        
        if (selectedCountry) {
            setOwnerFormData(prev => ({
                ...prev,
                country: selectedCountry.country,
                mobile: selectedCountry.international_dialing + ' ' // Add space after country code
            }));
        } else {
            setOwnerFormData(prev => ({
                ...prev,
                country: '',
                mobile: ''
            }));
        }
    };

    // const handleCountryChange = (e) => {
    //     const countryName = e.target.value;
    //     const selectedCountry = countries.find(c => c.country === countryName);
        
    //     if (selectedCountry) {
    //         setUserData(prev => ({
    //         ...prev,
    //         country: selectedCountry.country,
    //         mobile: selectedCountry.international_dialing + ' ' 
    //         }));
    //     }
    // };

    // const handleMobileChange = (e) => {
    //     const value = e.target.value;
        
    //     if (ownerFormData.mobile && ownerFormData.mobile.includes('+')) {
    //         const countryCodeMatch = ownerFormData.mobile.match(/^(\+\d+)(?:\s|$)/);
    //         if (countryCodeMatch) {
    //             const countryCode = countryCodeMatch[1];
    //             if (value.startsWith(countryCode)) {
    //                 setOwnerFormData(prev => ({
    //                     ...prev,
    //                     mobile: value
    //                 }));
    //             } else {
    //                 setOwnerFormData(prev => ({
    //                     ...prev,
    //                     mobile: countryCode + ' ' + value.replace(/^\+\d+\s?/, '')
    //                 }));
    //             }
    //             return;
    //         }
    //     }
        
    //     setOwnerFormData(prev => ({
    //         ...prev,
    //         mobile: value
    //     }));
    // };

    
    const handleMobileChange = (e) => {
        const value = e.target.value;
        
        // If country is selected, ensure country code is included
        if (selectedCountry) {
            // Extract only numbers from input
            const numbers = value.replace(/\D/g, '');
            const countryCode = selectedCountry.international_dialing.replace(/\D/g, '');
            
            // Remove country code if it's at the beginning
            const userNumber = numbers.startsWith(countryCode) 
                ? numbers.slice(countryCode.length)
                : numbers;
            
            setOwnerFormData(prev => ({
                ...prev,
                mobile: selectedCountry.international_dialing + (userNumber ? ' ' + userNumber : '')
            }));
        } else {
            // No country selected
            setOwnerFormData(prev => ({
                ...prev,
                mobile: value
            }));
        }
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
                }
            }

            const updateData = {
                ...formData,
                house_owner_id: houseOwnerId || houseOwnerId
            };

            const res = await api.put(`/houses/${house.id}`, updateData);
            if (res.data.success) {
                if (newHouseOwnerCreated) {
                    onUpdated();
                    toast.success('House owner saved successfully! You can now setup login.');
                } else {
                    onUpdated();
                }
                return houseOwnerId;
            }
        } catch (err) {
            console.error('Error updating house:', err);
            toast.error('Error updating house. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // const selectedCountry = countries.find(c => c.country_name === ownerFormData.country);
    const selectedCountry = countries.find(c => c.country === ownerFormData.country);


    const handleSetPasswordAndVerify = async () => {
        try {
            setLoading(true);
            
            const houseownerId = formData.houseowner_id;
            
            if (!houseownerId) {
                toast.error('House owner ID not found. Please save the house owner first.');
                return;
            }
            
            const houseOwnerEmail = ownerFormData.email;
            
            if (!houseOwnerEmail || !houseOwnerEmail.includes('@')) {
                toast.error('Please enter a valid email address for the house owner');
                return;
            }
            
            const confirmSetup = window.confirm(
                `Send verification email to ${houseOwnerEmail}?\n\n` +
                `The house owner will receive an email with verification link.`
            );
            
            if (!confirmSetup) {
                setLoading(false);
                return;
            }
            
            const res = await api.post('/houseowner-auth/admin/setup', {
                houseowner_id: houseownerId,
                send_email: true
            });
            
            if (res.data.success) {
                toast.success('Verification email sent. Check your inbox ');
                onUpdated();
                
            } else {
                toast.error(res.data.message || 'Failed to set up house owner');
            }
        } catch (err) {
            console.error('Error setting up house owner:', err);
            toast.error('Error setting up house owner. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleImportSuccess = (importedOwner) => {
        // Auto-fill form with imported data
        setOwnerFormData({
            name: importedOwner.name || '',
            nic: importedOwner.nic || '',
            occupation: importedOwner.occupation || '',
            country: importedOwner.country || '',
            mobile: importedOwner.mobile || '',
            email: importedOwner.email || '',
            occupied_way: importedOwner.occupied_way || 'own',
            proof: null
        });
        
        // Set the houseowner_id if available
        if (importedOwner.id) {
            setFormData(prev => ({
                ...prev,
                houseowner_id: importedOwner.id
            }));
        }
        
        setShowImportModal(false);
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
                        <div className="flex items-center justify-between mb-3">
                            <button
                                type="button"
                                onClick={() => setOwnerFormExpanded(!ownerFormExpanded)}
                                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-md transition-colors"
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
                            
                            {/* Import from Excel Button */}
                            <button
                                type="button"
                                onClick={() => setShowImportModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                                <Upload size={16} />
                                Import from Excel
                            </button>
                        </div>
                        
                        {ownerFormExpanded && (
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
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-1">NIC *</label>
                                        <input
                                            type="text"
                                            name="nic"
                                            value={ownerFormData.nic}
                                            onChange={handleOwnerChange}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                            required
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
                                        />
                                    </div>

                                    {/* <div>
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
                                    </div> */}
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-1">Country *</label>
                                        <select
                                            name="country"
                                            value={ownerFormData.country || ''}
                                            onChange={handleCountryChange}
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                            required
                                        >
                                            <option value="">Select country *</option>
                                            {countries.map(country => (
                                                <option key={country.country} value={country.country}>
                                                    {country.country} 
                                                    {/*({country.international_dialing})*/}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* <div>
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
                                    </div> */}
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-1">Mobile *</label>
                                        <div className="flex items-center">
                                            {selectedCountry && (
                                                <span className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-l-md border border-r-0 border-gray-300 dark:border-gray-600 whitespace-nowrap">
                                                    {selectedCountry.international_dialing}
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
                                            Format: {selectedCountry?.international_dialing || '+XX'} XXXXXXXXX
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-gray-700 dark:text-gray-200 mb-1">Email *</label>
                                        <input 
                                            name="email" 
                                            type="email"
                                            value={ownerFormData.email} 
                                            onChange={handleOwnerChange}
                                            placeholder="Email *" 
                                            className='w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white'
                                            required
                                        />
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
                                        <label className="block text-gray-700 dark:text-gray-200 mb-1">Proof Document</label>
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            accept="image/*"
                                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white text-black bg-white"
                                        />
                                    </div>
                                </div>
                                
                                {/* Excel Import Hint */}
                                <div className="text-center pt-2 border-t">
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Or{' '}
                                        <button
                                            type="button"
                                            onClick={() => setShowImportModal(true)}
                                            className="text-purple-600 hover:text-purple-700 underline"
                                        >
                                            import from Excel file
                                        </button>
                                        {' '}instead of manual entry
                                    </p>
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
                    {(formData.houseowner_id || (showOwnerForm && ownerFormData.email)) && (
                        <button
                            type="button"
                            onClick={handleSetPasswordAndVerify}
                            disabled={loading || !ownerFormData.email}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                            title={!ownerFormData.email ? "Enter email first" : "Setup login for house owner"}
                        >
                            Setup Auth
                        </button>
                    )}
                </div>
            </div>

            {/* Import House Owner Modal */}
            <ImportHouseOwnerModal
                isOpen={showImportModal}
                onClose={() => setShowImportModal(false)}
                onImportSuccess={handleImportSuccess}
                apartment_id={apartment_id}
                house_id={house.id}
                floor_id={floor_id}
            />
        </form>
    );
}
