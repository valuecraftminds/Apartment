import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

export default function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    country: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    username: '',
    country: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [touched, setTouched] = useState({
    firstname: false,
    lastname: false,
    username: false,
    country: false,
    mobile: false,
    email: false,
    password: false,
    confirmPassword: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  
  const navigate = useNavigate();
  const totalSteps = 3;

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'firstname':
        if (!value.trim()) error = 'First name is required';
        else if (value.length < 2) error = 'First name must be at least 2 characters';
        else if (!/^[a-zA-Z\s-']+$/.test(value)) error = 'First name can only contain letters, spaces, hyphens, and apostrophes';
        break;
        
      case 'lastname':
        if (!value.trim()) error = 'Last name is required';
        else if (value.length < 2) error = 'Last name must be at least 2 characters';
        else if (!/^[a-zA-Z\s-']+$/.test(value)) error = 'Last name can only contain letters, spaces, hyphens, and apostrophes';
        break;
        
      case 'username':
        if (!value.trim()) error = 'Username is required';
        else if (value.length < 3) error = 'Username must be at least 3 characters';
        else if (!/^[a-zA-Z0-9_]+$/.test(value)) error = 'Username can only contain letters, numbers, and underscores';
        else if (value.length > 20) error = 'Username cannot exceed 20 characters';
        break;
        
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email address';
        break;
        
      case 'password':
        if (!value) error = 'Password is required';
        else if (value.length < 8) error = 'Password must be at least 8 characters';
        else if (!/(?=.*[a-z])/.test(value)) error = 'Password must contain at least one lowercase letter';
        else if (!/(?=.*[A-Z])/.test(value)) error = 'Password must contain at least one uppercase letter';
        else if (!/(?=.*\d)/.test(value)) error = 'Password must contain at least one number';
        else if (!/(?=.*[@$!%*?&])/.test(value)) error = 'Password must contain at least one special character (@$!%*?&)';
        break;
        
      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (value !== formData.password) error = 'Passwords do not match';
        break;
        
      case 'mobile':
        if (value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/[\s\-\(\)]/g, ''))) {
          error = 'Please enter a valid phone number';
        }
        break;
        
      default:
        break;
    }
    
    return error;
  };

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

  const handleConfirmPwd = (value) => {
    setFormData(prev => ({ ...prev, confirmPassword: value }));
    
    if (touched.confirmPassword) {
      const error = validateField('confirmPassword', value);
      setErrors(prev => ({ ...prev, confirmPassword: error }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    // Mark all fields in current step as touched and validate them
    const stepFields = {
      1: ['firstname', 'lastname', 'username'],
      2: ['country', 'mobile', 'email'],
      3: ['password', 'confirmPassword']
    }[step];

    stepFields.forEach(field => {
      newTouched[field] = true;
      const error = validateField(field, formData[field]);
      newErrors[field] = error;
      if (error) isValid = false;
    });

    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));

    return isValid;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else {
      toast.error("Please fix the validation errors before proceeding");
    }
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  async function submit(e) {
    e.preventDefault();
    
    // Validate all steps before submitting
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        if (step !== currentStep) {
          setCurrentStep(step);
        }
        break;
      }
    }

    if (!allValid) {
      toast.error("Please fix all validation errors before submitting");
      return;
    }

    try {
      await api.post('/auth/register', formData);
      toast.success("Registered! Check your inbox for a verification email.");
      // Optional: Redirect to login after successful registration
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Registration failed");
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(formData.password)) strength++;
    if (/(?=.*[A-Z])/.test(formData.password)) strength++;
    if (/(?=.*\d)/.test(formData.password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(formData.password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  // Progress steps
  const steps = [
    { number: 1, title: "Personal Info" },
    { number: 2, title: "Contact Details" },
    { number: 3, title: "Account Security" }
  ];

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>
      <div className="loginPage">
        <div className='loginCard animate-fadeIn'>
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/favicon.ico" alt="AptSync Logo" className="w-10 h-10" />
            <h1 className="font-bold text-xl">Sign Up</h1>
          </div>
          
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              {steps.map(step => (
                <div key={step.number} className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step.number 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step.number}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">{step.title}</span>
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-1 rounded">
              <div 
                className="bg-purple-600 h-1 rounded transition-all duration-300" 
                style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={submit} className="loginForm">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                
                <div>
                  <input 
                    name="firstname" 
                    value={formData.firstname} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="First Name *" 
                    className={`loginInput ${errors.firstname ? 'border-red-500' : touched.firstname && 'border-green-500'}`}
                  />
                  {touched.firstname && errors.firstname && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.firstname}
                    </div>
                  )}
                  {touched.firstname && !errors.firstname && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="lastname" 
                    value={formData.lastname} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Last Name *" 
                    className={`loginInput ${errors.lastname ? 'border-red-500' : touched.lastname && 'border-green-500'}`}
                  />
                  {touched.lastname && errors.lastname && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.lastname}
                    </div>
                  )}
                  {touched.lastname && !errors.lastname && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="username" 
                    value={formData.username} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Username *" 
                    className={`loginInput ${errors.username ? 'border-red-500' : touched.username && 'border-green-500'}`}
                  />
                  {touched.username && errors.username && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.username}
                    </div>
                  )}
                  {touched.username && !errors.username && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Looks good!
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
                
                <div>
                  <input 
                    name="country" 
                    value={formData.country} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Country" 
                    className={`loginInput ${errors.country ? 'border-red-500' : ''}`}
                  />
                  {errors.country && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.country}
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="mobile" 
                    value={formData.mobile} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Mobile Number" 
                    className={`loginInput ${errors.mobile ? 'border-red-500' : ''}`}
                  />
                  {errors.mobile && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.mobile}
                    </div>
                  )}
                </div>
                
                <div>
                  <input 
                    name="email" 
                    type="email"
                    value={formData.email} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Email *" 
                    className={`loginInput ${errors.email ? 'border-red-500' : touched.email && 'border-green-500'}`}
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.email}
                    </div>
                  )}
                  {touched.email && !errors.email && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Valid email
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Account Security */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4">Account Security</h2>
                
                <div className='passwordField'>
                  <input 
                    name="password"
                    value={formData.password} 
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    placeholder="Password *" 
                    type={showPassword ? "text" : "password"} 
                    className={`loginInput ${errors.password ? 'border-red-500' : touched.password && 'border-green-500'}`}
                  />
                  <span
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="passwordToggle"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                
                {touched.password && (
                  <div className="mb-2">
                    <div className="text-sm text-gray-600 mb-1">Password strength: {passwordStrength.label}</div>
                    <div className="w-full bg-gray-200 h-2 rounded">
                      <div 
                        className={`h-2 rounded transition-all duration-300 ${
                          passwordStrength.strength < 2 ? 'bg-red-500' :
                          passwordStrength.strength < 4 ? 'bg-yellow-500' : 'bg-green-500'
                        }`} 
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Must include: uppercase, lowercase, number, special character (@$!%*?&), and be at least 8 characters long.
                    </div>
                  </div>
                )}
                
                {touched.password && errors.password && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <X size={14} className="mr-1" /> {errors.password}
                  </div>
                )}
                
                {touched.password && !errors.password && (
                  <div className="text-green-500 text-sm mt-1 flex items-center">
                    <Check size={14} className="mr-1" /> Strong password!
                  </div>
                )}
                
                <div className='passwordField'>
                  <input 
                    value={formData.confirmPassword} 
                    onChange={e => handleConfirmPwd(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    placeholder="Confirm Password *" 
                    type={showConfirmPwd ? "text" : "password"} 
                    className={`loginInput ${errors.confirmPassword ? 'border-red-500' : touched.confirmPassword && formData.confirmPassword && 'border-green-500'}`}
                  />
                  <span
                    type="button"
                    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
                    className="passwordToggle"
                    aria-label={showConfirmPwd ? "Hide password" : "Show password"}
                  >
                    {showConfirmPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                  </span>
                </div>
                
                {touched.confirmPassword && errors.confirmPassword && (
                  <div className="text-red-500 text-sm mt-1 flex items-center">
                    <X size={14} className="mr-1" /> {errors.confirmPassword}
                  </div>
                )}
                
                {touched.confirmPassword && !errors.confirmPassword && formData.confirmPassword && (
                  <div className="text-green-500 text-sm mt-1 flex items-center">
                    <Check size={14} className="mr-1" /> Passwords match!
                  </div>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className='loginButtonGroup mt-6'>
              {currentStep > 1 && (
                <button 
                  type="button" 
                  onClick={prevStep}
                  className="loginButton loginButton--cancel flex items-center justify-center"
                >
                  <ChevronLeft size={18} className="mr-1" />
                  Back
                </button>
              )}
              
              {currentStep < totalSteps ? (
                <button 
                  type="button" 
                  onClick={nextStep}
                  className="loginButton loginButton--submit flex items-center justify-center"
                >
                  Next
                  <ChevronRight size={18} className="ml-1" />
                </button>
              ) : (
                <button 
                  type="submit" 
                  className="loginButton loginButton--submit"
                >
                  Register
                </button>
              )}
              
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
  );
}