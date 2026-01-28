//ProfilePage.jsx
import React, { useState, useEffect, useContext } from 'react';
import { User, Mail, MapPin, Phone, Calendar, Shield, Edit, Save, X } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/navbar';


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
        const userData = response.data.data[0];
        setProfile(userData);
        setFormData({
          firstname: userData.firstname || '',
          lastname: userData.lastname || '',
          country: userData.country || '',
          mobile: userData.mobile || ''
        });
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
        setProfile(prev => ({
          ...prev,
          ...response.data.data
        }));
        setEditing(false);
        toast.success('Profile updated successfully');
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
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      <Sidebar onCollapse={setIsSidebarCollapsed} />
      
      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <Navbar />
        
        {/* Main Content */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            {/* Header Section - Mobile Responsive */}
            <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl p-3 md:p-4 mb-4 md:mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
                <div className="flex items-center">
                  <User size={24} className="md:size-6 text-purple-600 dark:text-purple-400 mr-2 md:mr-3" />
                  <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-white">
                    Profile
                  </h1>
                </div>
                
                {!editing ? (
                  <button
                    onClick={handleEdit}
                    className="flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-medium md:font-semibold text-sm md:text-base text-white bg-purple-600 hover:bg-purple-700 transition-all duration-300 w-full sm:w-auto"
                  >
                    <Edit size={16} className="md:size-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleCancel}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm md:text-base"
                    >
                      <X size={16} className="md:size-4" />
                      <span>Cancel</span>
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm md:text-base"
                    >
                      <Save size={16} className="md:size-4" />
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Grid - Stack on mobile, side-by-side on desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Left Column - Profile Card */}
              <div className="lg:col-span-1">
                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <div className="text-center">
                    {/* Profile Avatar */}
                    <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                      <span className="text-white text-xl md:text-2xl lg:text-3xl font-bold">
                        {profile.firstname?.charAt(0)?.toUpperCase()}
                        {profile.lastname?.charAt(0)?.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Name and Role */}
                    <h2 className="text-base md:text-lg lg:text-xl font-semibold text-gray-800 dark:text-white break-words">
                      {profile.firstname} {profile.lastname}
                    </h2>
                    <p className="text-purple-600 dark:text-purple-400 capitalize mt-1 text-sm md:text-base">
                      {profile.role}
                    </p>
                    
                    {/* Additional Info */}
                    <div className="mt-3 md:mt-4 space-y-1.5 md:space-y-2">
                      <div className="flex items-center justify-center text-xs md:text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} className="md:size-4 mr-1.5 md:mr-2" />
                        Joined {formatDate(profile.created_at)}
                      </div>
                      <div className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs ${
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
                <div className="bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl shadow-sm p-4 md:p-6">
                  <h3 className="text-base md:text-lg lg:text-lg font-semibold text-gray-800 dark:text-white mb-4 md:mb-6">
                    Personal Information
                  </h3>

                  <div className="space-y-4 md:space-y-6">
                    {/* Name - Stack on mobile, side-by-side on tablet/desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                          First Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="firstname"
                            value={formData.firstname}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {profile.firstname || 'Not set'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2">
                          Last Name
                        </label>
                        {editing ? (
                          <input
                            type="text"
                            name="lastname"
                            value={formData.lastname}
                            onChange={handleChange}
                            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            {profile.lastname || 'Not set'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 items-center">
                        <MapPin size={16} className="md:size-4 mr-1.5 md:mr-2" />
                        Country
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          {profile.country || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 items-center">
                        <Phone size={16} className="md:size-4 mr-1.5 md:mr-2" />
                        Mobile Number
                      </label>
                      {editing ? (
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm md:text-base bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          {profile.mobile || 'Not set'}
                        </p>
                      )}
                    </div>

                    {/* Email (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 items-center">
                        <Mail size={16} className="md:size-4 mr-1.5 md:mr-2" />
                        Email
                      </label>
                      <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        {profile.email}
                      </p>
                    </div>

                    {/* Role (Read-only) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 md:mb-2 items-center">
                        <Shield size={16} className="md:size-4 mr-1.5 md:mr-2" />
                        Role
                      </label>
                      <p className="text-gray-800 dark:text-white text-sm md:text-base p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg capitalize">
                        {profile.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        className="mt-14 md:mt-0"
        toastClassName="text-sm md:text-base"
      />
    </div>
  );
}