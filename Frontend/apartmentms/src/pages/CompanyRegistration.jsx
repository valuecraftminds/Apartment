import React, { useState } from 'react'
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Check, X } from "lucide-react";

export default function CompanyRegistration() {
  const [formData,setFormData]=useState({
    regNo:'',
    name:'',
    businessInfo:'',
    employees:''
  });

  const [errors,setErrors]=useState({
    regNo:'',
    name:'',
    businessInfo:'',
    employees:''
  });

  const [touched,setTouched]=useState({
    regNo:false,
    name:false,
    businessInfo:false,
    employees:false
  });


  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

   const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  async function submit(e) {
  e.preventDefault();

  // Validate all fields before submission
  const newErrors = {};
  const newTouched = {};
  let isValid = true;

  Object.keys(formData).forEach(field => {
    newTouched[field] = true;
    const error = validateField(field, formData[field]);
    newErrors[field] = error;
    if (error) isValid = false;
  });

  setTouched(prev => ({ ...prev, ...newTouched }));
  setErrors(prev => ({ ...prev, ...newErrors }));

  if (!isValid) {
    toast.error("Please fix all validation errors before submitting");
    return;
  }

  try {
    // Convert employees to number before sending
    const dataToSend = {
      ...formData,
      employees: parseInt(formData.employees, 10) // Convert to number
    };
    
    console.log('Sending data to server:', dataToSend);
    const response = await api.post('/tenants', dataToSend);
    console.log('Server response:', response.data);
    toast.success("Enterprise Registered Successfully");
    setTimeout(() => navigate('/admin/register'), 2000);
  } catch (err) {
    console.error('Error details:', err.response);
    toast.error(err.response?.data?.message || "❌ Registration failed");
  }
}

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'regNo':
        if (!value.trim()) error = 'Firm Registration Number is required';
        else if (value.length < 2) error = 'Firm Registration Number must be at least 2 characters';
        break;
        
      case 'name':
        if (!value.trim()) error = 'Firm name is required';
        else if (value.length < 2) error = 'Firm name must be at least 2 characters';
        break;
        
      case 'businessInfo':
        if (!value.trim()) error = 'Business Information is required';
        else if (value.length < 3) error = 'BusinessInfo must be at least 3 characters';
        // else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'BusinessInfo can only contain letters, numbers, and underscores';
        break;

      case 'employees':
        if (!value.trim()) error = 'Number of employees is required';
        else if (!/^\d+$/.test(value)) error = 'Number of employees must be a valid number';
        else if (parseInt(value) < 1) error = 'Number of employees must be at least 1';
        break;
                                
      default:
        break;
    }
    
    return error;
  };

  return (
    <div className='container'>
        <div className='absolute top-4 left-6 flex -6 mt-5'>
          <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
        </div>
        <div className='loginPage'>
          <div className='loginCard'>
            <div className='flex items-center justify-center gap-2 mb-4'>
              <img src="/favicon.ico" alt="AptSync Logo" className="w-10 h-10" />
              <h1 className="font-bold text-xl">Enterprise Registration</h1>
            </div>

          <form onSubmit={submit} className="loginForm">
            {/* Step 1: Personal Information */}
              <div className="space-y-4 animate-fadeIn">
                {/* <h2 className="text-lg font-semibold mb-4">Personal Information</h2> */}
                
                <div>
                  <input 
                    name="regNo" 
                    value={formData.regNo} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Firm Registration No *" 
                    className={`loginInput ${errors.regNo ? 'border-red-500' : touched.regNo && 'border-green-500'}`}
                  />
                  {touched.regNo && errors.regNo && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.regNo}
                    </div>
                  )}
                  {touched.regNo && !errors.regNo && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Firm Name *" 
                    className={`loginInput ${errors.name ? 'border-red-500' : touched.name && 'border-green-500'}`}
                  />
                  {touched.name && errors.name && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.name}
                    </div>
                  )}
                  {touched.name && !errors.name && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="businessInfo" 
                    value={formData.businessInfo} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Business Information *" 
                    className={`loginInput ${errors.businessInfo ? 'border-red-500' : touched.businessInfo && 'border-green-500'}`}
                  />
                  {touched.businessInfo && errors.businessInfo && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.businessInfo}
                    </div>
                  )}
                  {touched.businessInfo && !errors.businessInfo && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>

                <div>
                  <input 
                    name="employees" 
                    value={formData.employees} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="No of employees" 
                    className={`loginInput ${errors.employees ? 'border-red-500' : ''}`}
                  />
                  {errors.employees && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.employees}
                    </div>
                  )}
                </div>
              </div>            

            {/* Navigation Buttons */}
            <div className='loginButtonGroup mt-6'>            
              
                <button 
                  type="submit" 
                  className="loginButton loginButton--submit"
                >
                  Register
                </button>
              
              
              <button 
                type="button" 
                className="loginButton loginButton--cancel" 
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
            </div>
          </form>
          </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
    </div>
  )
}
