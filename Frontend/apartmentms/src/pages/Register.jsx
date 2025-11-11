import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, ChevronLeft, ChevronRight, Check, X } from "lucide-react";

export default function CombinedRegistration() {
  // User data state
  const [userData, setUserData] = useState({
    firstname:'',
    lastname:'',
    country:'',
    mobile:'',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Company data state
  const [companyData, setCompanyData] = useState({
    regNo: '',
    name: '',
    address: '',
    employees: ''
  });

  const [errors, setErrors] = useState({
    firstname:'',
    lastname:'',
    country:'',
    mobile:'',
    email: '',
    password: '',
    confirmPassword: '',
    regNo:'',
    name: '',
    address: '',
    employees: ''
  });

  const [touched, setTouched] = useState({
    firstname:false,
    lastname:false,
    country:false,
    mobile:false,
    email: false,
    password: false,
    confirmPassword: false,
    regNo:false,
    name: false,
    address: false,
    employees: false
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [countries, setCountries] = useState([]);

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
      setUserData(prev => ({
        ...prev,
        country: selectedCountry.country_name, //set country
        mobile: selectedCountry.phone_code // auto set phone code
      }));
    }
  };
  
  const navigate = useNavigate();
  const totalSteps = 3;

  // Validation rules
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      // User validation
      case 'firstname':
        if (!value.trim()) error = 'First name is required';
        else if (value.length < 3) error = 'First name must be at least 3 characters';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'First name can only contain letters, and numbers';
        else if (value.length > 20) error = 'First name cannot exceed 20 characters';
        break;

      case 'lastname':
        if (!value.trim()) error = 'Last name is required';
        else if (value.length < 3) error = 'Last name must be at least 3 characters';
        else if (!/^[a-zA-Z0-9]+$/.test(value)) error = 'Last name can only contain letters, and numbers';
        else if (value.length > 20) error = 'Last name cannot exceed 20 characters';
        break;

      case 'country':
        if (!value.trim()) error = 'Country is required';
        break;

      case 'mobile':
        if (!value.trim()) error = 'Mobile Number is required';
        else if (!/^\+\d{2} \d{9}$/.test(value)) error = 'Mobile must be in format +XX XXXXXXXXX';
        else if (value.length > 15) error = 'Mobile cannot exceed 15 digits';
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
        else if (value !== userData.password) error = 'Passwords do not match';
        break;

      // Company validation
      case 'regNo':
        if (!value.trim()) error = 'Business Registration No is required';
        else if (value.length < 2) error = 'Business REgistration No must be at least 2 characters';
        break;

      case 'name':
        if (!value.trim()) error = 'Company name is required';
        else if (value.length < 2) error = 'Company name must be at least 2 characters';
        break;
        
      case 'address':
        if (!value.trim()) error = 'Company address is required';
        else if (value.length < 3) error = 'Company address must be at least 3 characters';
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

  const handleInputChange = (e, isCompany = false) => {
    const { name, value } = e.target;
    
    if (isCompany) {
      setCompanyData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setUserData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Validate field in real-time if it's been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e, isCompany = false) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Validate field on blur
    const value = isCompany ? companyData[name] : userData[name];
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleConfirmPwd = (value) => {
    setUserData(prev => ({ ...prev, confirmPassword: value }));
    
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
      1: ['regNo','name', 'address', 'employees'], // Company details
      2: ['firstname','lastname','country','mobile','email'], // User details
      3: ['password', 'confirmPassword'], // Security
    }[step];

    stepFields.forEach(field => {
      newTouched[field] = true;
      const value = field in companyData ? companyData[field] : userData[field];
      const error = validateField(field, value);
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

//   async function submit(e) {
//     e.preventDefault();
  
//     // Validate all steps before submitting
//     let allValid = true;
//     for (let step = 1; step <= totalSteps; step++) {
//       if (!validateStep(step)) {
//         allValid = false;
//         if (step !== currentStep) {
//           setCurrentStep(step);
//         }
//         break;
//       }
//     }

//     if (!allValid) {
//       toast.error("Please fix all validation errors before submitting");
//       return;
//     }

//     try {
//       // Prepare company data
//       const companyPayload = {
//         regNo: companyData.regNo,
//         name: companyData.name,
//         address: companyData.address,
//         employees: parseInt(companyData.employees, 10)
//       };

//     console.log('Sending company data to /tenants:', companyPayload);
    
//     // First register the company
//     const companyResponse = await api.post('/tenants', companyPayload);
//     console.log('Company registration successful:', companyResponse.data);

//     // Create default admin role for the company
//     const defaultRoleResponse = await api.post('/roles', {
//       role_name: 'Admin'
//     }, {
//       headers: {
//         Authorization: `Bearer ${companyResponse.data.accessToken}` // You might need to adjust this
//       }
//     });

//     // Then register the user with the company ID
//     const userResponse = await api.post('/auth/register', {
//       firstname: userData.firstname,
//       lastname: userData.lastname,
//       country: userData.country,
//       mobile:userData.mobile,
//       email: userData.email,
//       password: userData.password,
//       company_id: companyResponse.data.data.id // Send as company_id (not companyId)
//     });

//       toast.success("Registration successful! Company and user account created.");
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (err) {
//       console.error('Registration error:', err);
//       toast.error(err.response?.data?.message || "❌ Registration failed");
//     }
// }

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
    // Prepare company data
    const companyPayload = {
      regNo: companyData.regNo,
      name: companyData.name,
      address: companyData.address,
      employees: parseInt(companyData.employees, 10)
    };

    console.log('Sending company data to /tenants:', companyPayload);
    
    // First register the company
    const companyResponse = await api.post('/tenants', companyPayload);
    console.log('Company registration successful:', companyResponse.data);

    // Get the company ID from the response
    const companyId = companyResponse.data.data.id;

    // Then register the user with the company ID
    const userResponse = await api.post('/auth/register', {
      firstname: userData.firstname,
      lastname: userData.lastname,
      country: userData.country,
      mobile: userData.mobile,
      email: userData.email,
      password: userData.password,
      company_id: companyId
    });

    console.log('User registration successful:', userResponse.data);

    toast.success("Registration successful! Company and user account created. Please check your email to verify your account.");
    setTimeout(() => navigate('/login'), 3000);
    
  } catch (err) {
    console.error('Registration error:', err);
    
    // More specific error handling
    if (err.response?.status === 403) {
      toast.error("Access denied. Please try registering again.");
    } else if (err.response?.data?.message) {
      toast.error(err.response.data.message);
    } else {
      toast.error("Registration failed. Please try again.");
    }
  }
}

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!userData.password) return { strength: 0, label: '' };
    
    let strength = 0;
    if (userData.password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(userData.password)) strength++;
    if (/(?=.*[A-Z])/.test(userData.password)) strength++;
    if (/(?=.*\d)/.test(userData.password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(userData.password)) strength++;
    
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return { strength, label: labels[strength] };
  };

  const passwordStrength = getPasswordStrength();

  // Progress steps
  const steps = [
    { number: 1, title: "Company Info" },
    { number: 2, title: "User Info" },
    { number: 3, title: "Security" }
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
            <h1 className="font-bold text-4xl items-center">Get Start with AptSync</h1>
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
            {/* Step 1: Company Details */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4">Company Information</h2>
                
                <div>
                  <input 
                    name="regNo" 
                    value={companyData.regNo} 
                    onChange={(e) => handleInputChange(e, true)}
                    onBlur={(e) => handleBlur(e, true)}
                    placeholder="Company Registration No *" 
                    className={`loginInput ${errors.regNo ? 'border-red-500' : touched.regNo && 'border-green-500'}`}
                  />
                  {touched.regNo && errors.regNo && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.regNo}
                    </div>
                  )}
                  {/* {touched.regNo && !errors.regNo && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>

                <div>
                  <input 
                    name="name" 
                    value={companyData.name} 
                    onChange={(e) => handleInputChange(e, true)}
                    onBlur={(e) => handleBlur(e, true)}
                    placeholder="Company Name *" 
                    className={`loginInput ${errors.name ? 'border-red-500' : touched.name && 'border-green-500'}`}
                  />
                  {touched.name && errors.name && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.name}
                    </div>
                  )}
                  {/* {touched.name && !errors.name && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>
                
                <div>
                  <input 
                    name="address" 
                    value={companyData.address} 
                    onChange={(e) => handleInputChange(e, true)}
                    onBlur={(e) => handleBlur(e, true)}
                    placeholder="Company Address *" 
                    className={`loginInput ${errors.address ? 'border-red-500' : touched.address && 'border-green-500'}`}
                  />
                  {touched.businessInfo && errors.businessInfo && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.businessInfo}
                    </div>
                  )}
                  {/* {touched.businessInfo && !errors.businessInfo && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>

                <div>
                  <input 
                    name="employees" 
                    value={companyData.employees} 
                    onChange={(e) => handleInputChange(e, true)}
                    onBlur={(e) => handleBlur(e, true)}
                    placeholder="Number of Employees *" 
                    className={`loginInput ${errors.employees ? 'border-red-500' : touched.employees && 'border-green-500'}`}
                  />
                  {touched.employees && errors.employees && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.employees}
                    </div>
                  )}
                  {/* {touched.employees && !errors.employees && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>
              </div>
            )}
            {/* Step 2: User email */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h2 className="text-lg font-semibold mb-4">User Info</h2>
                                
                <div>
                  <input 
                    name="firstname" 
                    value={userData.firstname} 
                    onChange={(e) => handleInputChange(e, false)}
                    onBlur={(e) => handleBlur(e, false)}
                    placeholder="First Name *" 
                    className={`loginInput ${errors.firstname ? 'border-red-500' : touched.firstname && 'border-green-500'}`}
                  />
                  {touched.firstname && errors.firstname && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.firstname}
                    </div>
                  )}
                  {/* {touched.firstname && !errors.firstname && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>

                <div>
                  <input 
                    name="lastname" 
                    value={userData.lastname} 
                    onChange={(e) => handleInputChange(e, false)}
                    onBlur={(e) => handleBlur(e, false)}
                    placeholder="Last Name *" 
                    className={`loginInput ${errors.lastname ? 'border-red-500' : touched.lastname && 'border-green-500'}`}
                  />
                  {touched.lastname && errors.lastname && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.lastname}
                    </div>
                  )}
                  {/* {touched.lastname && !errors.lastname && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" />
                    </div>
                  )} */}
                </div>

                <div>
                  <select
                    name="country"
                    value={countries.find(c => c.country_name === userData.country)?.id || ''}
                    onChange={handleCountryChange}
                    onBlur={(e) => handleBlur(e, false)}
                    className={`loginInput ${errors.country ? 'border-red-500' : touched.country && 'border-green-500'}`}
                  >
                    <option value="">Select country *</option>
                    {countries.map(country => (
                      <option key={country.id} value={country.id}>
                        {country.country_name}
                      </option>
                    ))}
                  </select>
                  {touched.country && errors.country && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.country}
                    </div>
                  )}
                </div>


                <div>
                  <input
                    name="mobile"
                    value={userData.mobile}
                    onChange={(e) => handleInputChange(e, false)}
                    onBlur={(e) => handleBlur(e, false)}
                    placeholder="Mobile *"
                    className={`loginInput ${errors.mobile ? 'border-red-500' : touched.mobile && 'border-green-500'}`}
                  />
                  {touched.mobile && errors.mobile && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.mobile}
                    </div>
                  )}
                </div>

                <div>
                  <input 
                    name="email" 
                    type="email"
                    value={userData.email} 
                    onChange={(e) => handleInputChange(e, false)}
                    onBlur={(e) => handleBlur(e, false)}
                    placeholder="Email *" 
                    className={`loginInput ${errors.email ? 'border-red-500' : touched.email && 'border-green-500'}`}
                  />
                  {touched.email && errors.email && (
                    <div className="text-red-500 text-sm mt-1 flex items-center">
                      <X size={14} className="mr-1" /> {errors.email}
                    </div>
                  )}
                  {/* {touched.email && !errors.email && (
                    <div className="text-green-500 text-sm mt-1 flex items-center">
                      <Check size={14} className="mr-1" /> Valid email
                    </div>
                  )} */}
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
                    value={userData.password} 
                    onChange={(e) => handleInputChange(e, false)}
                    onBlur={(e) => handleBlur(e, false)}
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
                          passwordStrength.strength < 2 
                          ? 'bg-red-500' 
                          :passwordStrength.strength < 4 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
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
                
                {/* {touched.password && !errors.password && (
                  <div className="text-green-500 text-sm mt-1 flex items-center">
                    <Check size={14} className="mr-1" /> Strong password!
                  </div>
                )} */}
                
                <div className='passwordField'>
                  <input 
                    value={userData.confirmPassword} 
                    onChange={e => handleConfirmPwd(e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, confirmPassword: true }))}
                    placeholder="Confirm Password *" 
                    type={showConfirmPwd ? "text" : "password"} 
                    className={`loginInput ${errors.confirmPassword ? 'border-red-500' : touched.confirmPassword && userData.confirmPassword && 'border-green-500'}`}
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
                
                {touched.confirmPassword && !errors.confirmPassword && userData.confirmPassword && (
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