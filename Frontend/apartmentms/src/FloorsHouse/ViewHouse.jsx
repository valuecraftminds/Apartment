import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bath, Bed, Briefcase, BriefcaseIcon, Calendar, ChevronLeft, CreditCard, DollarSign, Download, Edit, FileText, Globe, Home, House, IdCard, Loader, Mail, MailIcon, Phone, PhoneCall, Square, Trash2, User, UserPlus, Users } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { useNavigate, useParams } from 'react-router-dom';
import EditHouseOwner from './EditHouseOwner';
import NewMember from '../Residents/NewMember';
import EditMember from '../Residents/EditMember';

export default function ViewHouse() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("type");
    const { apartment_id, floor_id, id } = useParams();
    console.log('Apartment Id:',apartment_id);
    console.log('Floor ID: ',floor_id);
    console.log("House ID: ",id);
    const [apartment, setApartment] = useState(null);
    const [floor, setFloor] = useState(null);
    const [house, setHouse] = useState(null);
    const [housetype, setHouseType] = useState(null);
    const [houseowner,setHouseOwner] = useState(null);
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loadingFamily, setLoadingFamily] = useState(false);
    const [assignedBills, setAssignedBills] = useState([]);
    const [loadingAssignedBills, setLoadingAssignedBills] = useState(false);
    const [downloadingProof, setDownloadingProof] = useState(false);
    const [editOwnerModalOpen, setEditOwnerModalOpen] = useState(false);
    const [newMemberModalOpen, setNewMemberModalOpen] = useState(false);
    const [editMemberModalOpen, setEditMemberModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const navigate = useNavigate();

    // Fetch apartment
    useEffect(() => {
        if (!apartment_id) return;
        api.get(`/apartments/${apartment_id}`)
            .then(res => res.data.success && setApartment(res.data.data))
            .catch(err => console.error('Error fetching apartment:', err));
    }, [apartment_id]);

    // Fetch floor
    useEffect(() => {
        if (!floor_id) return;
        api.get(`/floors/${floor_id}`)
            .then(res => res.data.success && setFloor(res.data.data))
            .catch(err => console.error('Error fetching floor:', err));
    }, [floor_id]);

    // Fetch house
    useEffect(() => {
        if (!id) return;
        api.get(`/houses/${id}`)
            .then(res => res.data.success && setHouse(res.data.data))
            .catch(err => console.error("Error fetching house:", err));
    }, [id]);

    // Fetch house type when house is loaded
    useEffect(() => {
        if (house?.housetype_id) {
            api.get(`/housetype/${house.housetype_id}`)
                .then(res => res.data.success && setHouseType(res.data.data))
                .catch(err => console.error("Error fetching house type:", err));
        }
    }, [house]);

    //Fetch House owner
    useEffect(() => {
        if(house?.houseowner_id){
            api.get(`/houseowner/${house.houseowner_id}`)
                .then(res => res.data.success && setHouseOwner(res.data.data))
                .catch(err => console.error("Error fetching house owner: ", err));
        }
    },[house]);

    // useEffect(()=>{
    //     if(house?.family_id){
    //         api.get(`/family/${house.family_id}`)
    //         .then(res => res.data.success && setFamily(res.data.data))
    //         .catch(err => console.error("Error fetching family or residents: ",err));
    //     }
    // },[house]);

    // Fetch family members by houseowner_id
    useEffect(() => {
        if(house?.houseowner_id){
            fetchFamilyMembers(house.houseowner_id);
        }
    },[house]);

    const fetchFamilyMembers = async (houseownerId) => {
        try {
            setLoadingFamily(true);
            const response = await api.get(`/family/houseowner/${houseownerId}`);
            if (response.data.success) {
                setFamilyMembers(response.data.data || []);
            }
        } catch (error) {
            console.error("Error fetching family members: ", error);
            setFamilyMembers([]);
        } finally {
            setLoadingFamily(false);
        }
    };

     // Fetch assigned bills for this house
    useEffect(() => {
        if (id) {
            fetchAssignedBills();
        }
    }, [id]);

    const fetchAssignedBills = async () => {
        try {
            setLoadingAssignedBills(true);
            const response = await api.get(`/bill-assignments/house/${id}`);
            if (response.data.success) {
                setAssignedBills(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching assigned bills:', error);
            setAssignedBills([]);
        } finally {
            setLoadingAssignedBills(false);
        }
    };

    const handleBack = () => {
        navigate(`/houses/${apartment_id}/${floor_id}`);
    };

    // Format date for display
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Handle proof document download
    const handleDownloadProof = async () => {
        if (!houseowner?.proof) return;
        
        try {
            setDownloadingProof(true);
            
            // Get the file from the server
            const response = await api.get(houseowner.proof, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/octet-stream',
                }
            });
            
            // Extract filename from URL or use a default
            const urlParts = houseowner.proof.split('/');
            const filename = urlParts[urlParts.length - 1] || 'owner_proof.jpg';
            
            // Create a blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Error downloading proof:', error);
            alert('Failed to download proof document. Please try again.');
            
            // Fallback: Direct download link
            const link = document.createElement('a');
            link.href = houseowner.proof;
            link.download = houseowner.proof.split('/').pop() || 'owner_proof';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } finally {
            setDownloadingProof(false);
        }
    };    

    // Add new family member
    const handleAddFamilyMember = () => {
        if (house?.houseowner_id) {
            setNewMemberModalOpen(true);
        } else {
            alert('House owner information is required before adding family members.');
        }
    };

    // Edit family member
    const handleEditFamilyMember = (member) => {
        setSelectedMember(member);
        setEditMemberModalOpen(true);
    };

    // Delete family member
    const handleDeleteFamilyMember = async (familyId) => {
        if (window.confirm('Are you sure you want to delete this family member?')) {
            try {
                await api.delete(`/family/${familyId}`);
                // Refresh family members list
                if (house?.houseowner_id) {
                    fetchFamilyMembers(house.houseowner_id);
                }
            } catch (error) {
                console.error('Error deleting family member:', error);
                alert('Failed to delete family member');
            }
        }
    };


    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
            <Sidebar />
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <Navbar />
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mx-auto max-w-7xl">
                        {/* Title */}
                        <div className='flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6'>
                            <div className='flex flex-col'>
                                <div className='flex items-center'>
                                    <button onClick={handleBack} className='p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-purple-700'>
                                        <ChevronLeft size={25} />
                                    </button>
                                    <House size={40} className='text-purple-600 dark:text-purple-400 mr-3 ml-3' />
                                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white">House Details</h1>
                                </div>
                                {apartment && 
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Apartment: {apartment.name}
                                    </div>}
                                {floor && 
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        Floor: {floor.floor_id}
                                    </div>}
                                {house && (
                                    <div className='mt-1 text-gray-700 dark:text-gray-300 font-semibold ml-12'>
                                        {/* <p>House ID: {house.id}</p> */}
                                        <p>House No: {house.house_id}</p>
                                        {/* <p>Status: {house.status}</p> */}
                                    </div>
                                )}
                            </div>
                        </div>

                        
                        {/* Tabs */}
                        <div className="flex space-x-4 border-b border-gray-300 dark:border-gray-700 mb-4">
                            <button
                                onClick={() => setActiveTab("type")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "type"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                House Type
                            </button>
                            <button
                                onClick={() => setActiveTab("owner")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "owner"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                House Owner
                            </button>
                            <button
                                onClick={() => setActiveTab("residents")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "residents"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                Residents ({familyMembers.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("assignedBills")}
                                className={`px-4 py-2 font-semibold 
                                    ${activeTab === "assignedBills"
                                        ? "text-purple-600 border-b-2 border-purple-600"
                                        : "text-gray-600 dark:text-gray-300 hover:text-purple-600"}`}
                            >
                                Assigned Bills
                            </button>
                        </div>

                        {/* Content */}
                        {activeTab === "type" && housetype && (
                            <div className="animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                                    <Home className="mr-3 text-purple-600 dark:text-purple-400" size={24} />
                                    House Type Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <div className="flex items-center mb-4">
                                            <Square className="text-blue-600 dark:text-blue-400 mr-3" size={24} />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Type Name</p>
                                                <p className="text-lg font-bold text-gray-800 dark:text-white">{housetype.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-xl border border-purple-200 dark:border-purple-800">
                                        <div className="flex items-center mb-4">
                                            <Square className="text-purple-600 dark:text-purple-400 mr-3" size={24} />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Square Feet</p>
                                                <p className="text-lg font-bold text-gray-800 dark:text-white">{housetype.sqrfeet} sq ft</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-xl border border-green-200 dark:border-green-800">
                                        <div className="flex items-center mb-4">
                                            <Bed className="text-green-600 dark:text-green-400 mr-3" size={24} />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Rooms</p>
                                                <p className="text-lg font-bold text-gray-800 dark:text-white">{housetype.rooms}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
                                        <div className="flex items-center mb-4">
                                            <Bath className="text-orange-600 dark:text-orange-400 mr-3" size={24} />
                                            <div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</p>
                                                <p className="text-lg font-bold text-gray-800 dark:text-white">{housetype.bathrooms}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {/* House Owner */}
                        {activeTab === "owner" && houseowner && (
                            <div className="animate-fadeIn">
                                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                                    <User className="mr-3 text-purple-600 dark:text-purple-400" size={24} />
                                    House Owner Information
                                </h3>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Owner Details Card */}
                                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 p-6 rounded-xl border border-indigo-200 dark:border-indigo-800">
                                        <div className="flex items-start mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mr-4">
                                                {houseowner.name?.charAt(0) || 'O'}
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-bold text-gray-800 dark:text-white">{houseowner.name}</h4>
                                                <p className="text-gray-600 dark:text-gray-400">Owner</p>
                                            </div>
                                            <div className="flex space-x-2 ml-90">
                                            <button
                                                onClick={() => setEditOwnerModalOpen(true)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={18} />
                                            </button>
                                        </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <CreditCard className="text-gray-500 dark:text-gray-400 mr-3" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">NIC Number</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">{houseowner.NIC}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Briefcase className="text-gray-500 dark:text-gray-400 mr-3" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Occupation</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">{houseowner.occupation}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <div className="bg-purple-100 dark:bg-purple-900/50 px-3 py-1 rounded-lg mr-2">
                                                    <span className="text-purple-700 dark:text-purple-300 text-sm font-medium">
                                                        {houseowner.occupied_way}
                                                    </span>
                                                </div>
                                                <div className="bg-green-100 dark:bg-green-900/50 px-3 py-1 rounded-lg mr-2">
                                                    <span className="text-green-700 dark:text-green-300 text-sm font-medium">
                                                        {formatDate(house.occupied_at) }
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Contact Information Card */}
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Contact Information</h4>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center">
                                                <Globe className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Country</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">{houseowner.country}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Phone className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Mobile</p>
                                                    <p className="font-medium text-gray-800 dark:text-white">{houseowner.mobile}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center">
                                                <Mail className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                                                <div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                                                    <p className="font-medium text-gray-800 dark:text-white break-all">{houseowner.email || 'N/A'}</p>
                                                </div>
                                            </div>
                                            
                                            {houseowner.proof && (
                                                <div className="flex items-center">
                                                    <FileText className="text-blue-600 dark:text-blue-400 mr-3" size={20} />
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">Proof Document</p>
                                                        <button
                                                            onClick={handleDownloadProof}
                                                            disabled={downloadingProof}
                                                            className="flex items-center font-medium text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {downloadingProof ? (
                                                                <>
                                                                    <Loader size={16} className="mr-2 animate-spin" />
                                                                    Downloading...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Download size={16} className="mr-2" />
                                                                    Download Proof
                                                                </>
                                                            )}
                                                        </button>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                            {houseowner.proof.split('/').pop()}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                            
                        {/* Residents */}
                        {activeTab === "residents" && (
                            <div className="animate-fadeIn">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                                        <Users className="mr-3 text-purple-600 dark:text-purple-400" size={24} />
                                        Family Members / Residents
                                    </h3>
                                    <button
                                        onClick={handleAddFamilyMember}
                                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                                    >
                                        <UserPlus size={18} className="mr-2" />
                                        Add Family Member
                                    </button>
                                </div>

                                {loadingFamily ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size={28} className="animate-spin text-purple-600 mr-3" />
                                        <span className="text-gray-600 dark:text-gray-300">Loading family members...</span>
                                    </div>
                                ) : familyMembers.length === 0 ? (
                                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <Users size={64} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                                        <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                            No Family Members Found
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                                            There are no family members or residents registered for this house owner.
                                        </p>
                                        <button
                                            onClick={handleAddFamilyMember}
                                            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
                                        >
                                            <UserPlus size={18} className="mr-2" />
                                            Add First Family Member
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {familyMembers.map((member) => (
                                            <div 
                                                key={member.id}
                                                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow"
                                            >
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center">
                                                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-lg font-bold mr-3">
                                                            {member.name?.charAt(0) || 'F'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 dark:text-white text-lg">
                                                                {member.name}
                                                            </h4>
                                                            <div className="flex items-center mt-1">
                                                                <IdCard size={14} className="text-gray-500 mr-1" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {member.nic}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEditFamilyMember(member)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFamilyMember(member.id)}
                                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    {member.occupation && (
                                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                            <BriefcaseIcon size={16} className="mr-3 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Occupation</p>
                                                                <p className="font-medium">{member.occupation}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {member.email && (
                                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                            <MailIcon size={16} className="mr-3 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                                                                <p className="font-medium truncate">{member.email}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {member.phone && (
                                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                            <PhoneCall size={16} className="mr-3 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                                                                <p className="font-medium">{member.phone}</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {member.moved_at && (
                                                        <div className="flex items-center text-gray-700 dark:text-gray-300">
                                                            <Calendar size={16} className="mr-3 text-gray-500" />
                                                            <div>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">Added On</p>
                                                                <p className="font-medium">{formatDate(member.moved_at)}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>            
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === "assignedBills" && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
                                    <FileText className="mr-2" size={20} />
                                    Assigned Bills
                                </h3>
                                
                                {loadingAssignedBills ? (
                                    <div className="flex justify-center items-center py-8">
                                        <Loader size={24} className="animate-spin text-purple-600 mr-2" />
                                        <span className="text-gray-600 dark:text-gray-300">Loading assigned bills...</span>
                                    </div>
                                ) : assignedBills.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                        <p>No bills assigned to this house</p>
                                        <p className="text-sm">Bills will appear here once they are assigned to this house</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assignedBills.map((assignment) => (
                                            <div 
                                                key={assignment.id}
                                                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <DollarSign size={18} className="text-green-600 mr-2" />
                                                            <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                                                                {assignment.bill?.bill_name || 'Unknown Bill'}
                                                            </h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
                                                            <div className="flex items-center">
                                                                <span className="font-medium mr-2">Type:</span>
                                                                <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs">
                                                                    {assignment.bill?.billtype || 'N/A'}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <Calendar size={14} className="mr-2" />
                                                                <span className="font-medium mr-2">Assigned:</span>
                                                                <span>{formatDate(assignment.assigned_date)}</span>
                                                            </div>
                                                        </div>
                                                        {/* {assignment.bill?.description && (
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                                {assignment.bill.bill_name}
                                                            </p>
                                                        )} */}
                                                    </div>
                                                    <div className="flex flex-col items-end space-y-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                            assignment.status === 'active' 
                                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                        }`}>
                                                            {assignment.status || 'active'}
                                                        </span>
                                                        {/* You can add action buttons here if needed */}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Optional: Show CalculateBill component below the assigned bills */}
                                {/* <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
                                    <CalculateBill apartment_id={apartment_id} />
                                </div> */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Edit Owner Modal */}
            {editOwnerModalOpen && houseowner && (
                <EditHouseOwner
                    houseowner={houseowner}
                    onClose={() => setEditOwnerModalOpen(false)}
                    onUpdated={(updatedOwner) => {
                        setHouseOwner(updatedOwner);
                        // Optionally refresh any other data
                        setEditOwnerModalOpen(false);
                    }}
                />
            )}
            {/* Add New family Member Modal */}
            {newMemberModalOpen && house?.houseowner_id && (
                <NewMember
                    houseownerId={house.houseowner_id}
                    onClose={() => setNewMemberModalOpen(false)}
                    onSuccess={(newMember) => {
                        // Add the new member to the list
                        setFamilyMembers(prev => [newMember, ...prev]);
                        setNewMemberModalOpen(false);
                    }}
                />
            )}
            {/* Edit Family Member Modal */}
            {editMemberModalOpen && selectedMember && (
                <EditMember
                    member={selectedMember}
                    onClose={() => {
                        setEditMemberModalOpen(false);
                        setSelectedMember(null);
                    }}
                    onUpdated={(updatedMember) => {
                        fetchFamilyMembers();
                        // Update the member in the list
                        setFamilyMembers(prev => 
                            prev.map(m => m.id === updatedMember.id ? updatedMember : m)
                        );
                        setEditMemberModalOpen(false);
                        setSelectedMember(null);
                    }}
                />
            )}
        </div>
    );
}
