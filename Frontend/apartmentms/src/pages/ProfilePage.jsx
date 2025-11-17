import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, MapPin, Phone, Calendar, Shield, Edit, Save, X, User2 } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function ProfilePage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    country: '',
    mobile: ''
  });
  const { auth } = useContext(AuthContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data && response.data.data.length > 0) {
        const userData = response.data.data[0]; // Get the first user from the array
        setProfile(userData);
        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          country: userData.country || '',
          mobile: userData.mobile || ''
        });
        console.log('Profile data loaded:', userData);
      } else {
        toast.error('No profile data found');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstname: profile.firstname || '',
        lastname: profile.lastname || '',
        country: profile.country || '',
        mobile: profile.mobile || ''
      });
    }
  };

  const handleSave = async () => {
    try {
      const response = await api.put(`/auth/users/${profile.id}`, formData);
      if (response.data.success) {
        // Update profile with the returned data
        setProfile(prev => ({
          ...prev,
          ...response.data.data
        }));
        setEditing(false);
        toast.success('Profile updated successfully');
        
        // Refresh profile data to get latest from server
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-screen transition-colors duration-200">
        <Sidebar onCollapse={setIsSidebarCollapsed} />
        <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
            <Navbar />
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mx-auto max-w-7xl">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6">
                        <div className="flex items-center">
                            <User size={40} className="text-purple-600 dark:text-purple-400 mr-3" />
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile</h1>
                        </div>
                            {!editing ? (
                                <button
                                    onClick={handleEdit}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition-all duration-300 text-white bg-purple-600 hover:bg-purple-700 hover:scale-105"
                                >
                                    <Edit size={18} />
                                    Edit Profile
                                </button>
                                ) : (
                                <div className="flex gap-2">
                                    <button
                                    onClick={handleCancel}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                    <X size={18} />
                                    Cancel
                                    </button>
                                    <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                    <Save size={18} />
                                    Save
                                    </button>
                                </div>
                            )}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">
                                {profile.firstname?.charAt(0)?.toUpperCase()}
                                {profile.lastname?.charAt(0)?.toUpperCase()}
                            </span>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                            {profile.firstname} {profile.lastname}
                            </h2>
                            <p className="text-purple-600 dark:text-purple-400 capitalize mt-1">
                            {profile.role}
                            </p>
                            <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center text-sm text-gray-600 dark:text-gray-400">
                                <Calendar size={16} className="mr-2" />
                                Joined {formatDate(profile.created_at)}
                            </div>
                            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                profile.is_verified 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                                {profile.is_verified ? 'Verified' : 'Pending Verification'}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">
                            Personal Information
                        </h3>

                        <div className="space-y-6">
                            {/* Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                First Name
                                </label>
                                {editing ? (
                                <input
                                    type="text"
                                    name="firstname"
                                    value={formData.firstname}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                                ) : (
                                <p className="text-gray-800 dark:text-white">{profile.firstname || 'Not set'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Last Name
                                </label>
                                {editing ? (
                                <input
                                    type="text"
                                    name="lastname"
                                    value={formData.lastname}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                                ) : (
                                <p className="text-gray-800 dark:text-white">{profile.lastname || 'Not set'}</p>
                                )}
                            </div>
                            </div>

                            {/* Country */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <MapPin size={16} className="inline mr-2" />
                                Country
                            </label>
                            {editing ? (
                                <input
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            ) : (
                                <p className="text-gray-800 dark:text-white">{profile.country || 'Not set'}</p>
                            )}
                            </div>

                            {/* Mobile */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Phone size={16} className="inline mr-2" />
                                Mobile Number
                            </label>
                            {editing ? (
                                <input
                                type="tel"
                                name="mobile"
                                value={formData.mobile}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500"
                                />
                            ) : (
                                <p className="text-gray-800 dark:text-white">{profile.mobile || 'Not set'}</p>
                            )}
                            </div>

                            {/* Email (Read-only) */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Mail size={16} className="inline mr-2" />
                                Email
                            </label>
                            <p className="text-gray-800 dark:text-white">{profile.email}</p>
                            </div>

                            {/* Role (Read-only) */}
                            <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                <Shield size={16} className="inline mr-2" />
                                Role
                            </label>
                            <p className="text-gray-800 dark:text-white capitalize">{profile.role}</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
            </div>
        </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}