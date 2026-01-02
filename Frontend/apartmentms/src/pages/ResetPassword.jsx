// ResetPassword.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, ArrowLeft, CheckCircle, XCircle, Building, Home } from "lucide-react";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'houseowner'
  const [isValidLink, setIsValidLink] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);

  // Password validation states
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
    match: false
  });

  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const idParam = searchParams.get("id");
    
    setToken(tokenParam);
    setId(idParam);
    
    // Auto-detect user type by trying to verify which endpoint works
    // First, check if it's a house owner token by hitting the verify endpoint
    const detectUserType = async () => {
      if (!tokenParam || !idParam) {
        setIsValidLink(false);
        toast.error("Invalid reset link");
        setIsVerifying(false);
        return;
      }

      try {
        // Try house owner verify first (since house owner tokens are more specific)
        await api.post('/houseowner-auth/verify', { 
          token: tokenParam, 
          id: idParam 
        });
        setUserType('houseowner');
      } catch (err) {
        // If house owner verify fails, assume it's a regular user
        setUserType('admin');
      }
      
      setIsVerifying(false);
    };

    detectUserType();
    
  }, [searchParams]);

  // Validate password in real-time
  useEffect(() => {
    if (password) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const hasMinLength = password.length >= 6;
      
      setValidations(prev => ({
        ...prev,
        length: hasMinLength,
        uppercase: hasUpperCase,
        lowercase: hasLowerCase,
        number: hasNumbers,
        special: hasSpecialChar
      }));
    }
  }, [password]);

  // Validate password match in real-time
  useEffect(() => {
    setValidations(prev => ({
      ...prev,
      match: password === confirm && confirm.length > 0
    }));
  }, [password, confirm]);

  const handleBackToLogin = () => {
    navigate('/login');
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "Very Weak" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    return { strength, label: labels[strength] || "Very Weak" };
  };

  const passwordStrength = getPasswordStrength();

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center gap-2 text-sm">
      {isValid ? (
        <CheckCircle size={14} className="text-green-500" />
      ) : (
        <XCircle size={14} className="text-red-500" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-red-600'}>
        {text}
      </span>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if all validations pass
    const allValid = Object.values(validations).every(v => v === true);
    if (!allValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    setIsResetting(true);
    try {
      let endpoint = "/auth/reset-password";
      let successMessage = "Password reset successful! Redirecting to login...";
      
      if (userType === 'houseowner') {
        endpoint = "/houseowner-auth/reset-password";
        successMessage = "Password reset successful! Redirecting to login...";
      }
      
      await api.post(endpoint, { token, id, password });
      toast.success(successMessage);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Reset failed. The link may have expired.";
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('expired')) {
          toast.error("Reset link has expired. Please request a new one.");
        } else if (errorMessage.includes('Invalid')) {
          toast.error("Invalid reset link. Please request a new one.");
        } else if (errorMessage.includes('already used')) {
          toast.error("This reset link has already been used. Please request a new one.");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="container">
        <div className="loginPage">
          <div className='loginCard animate-fadeIn'>
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="mt-4 text-gray-600">Verifying reset link...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="container">
        <div className="absolute top-4 left-6 flex -6 mt-5">
          <button 
            onClick={handleBackToLogin}
            className="flex items-center gap-2 mb-4 text-white hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
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
              <h2 className="text-xl font-bold mb-4 text-red-600">Invalid Reset Link</h2>
            </div>
            <p className="text-gray-600 mb-4">
              This password reset link is invalid or has expired.
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="loginButton loginButton--submit w-full mb-3"
            >
              Request New Reset Link
            </button>
            <button
              onClick={handleBackToLogin}
              className="loginButton loginButton--cancel w-full"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 mb-4 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>    
      
      <div className="loginPage">
        <div className="loginCard animate-fadeIn">
          {/* User Type Indicator */}
          <div className="flex justify-center mb-4">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${
              userType === 'houseowner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
            }`}>
              {userType === 'houseowner' ? (
                <>
                  <Home size={14} />
                  <span className="text-sm font-medium">House Owner Account</span>
                </>
              ) : (
                <>
                  <Building size={14} />
                  <span className="text-sm font-medium">Admin/Employee Account</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            <h1 className="font-bold text-xl">Reset Password</h1>
          </div>
          
          <p className="text-gray-600 mb-6 text-sm text-center">
            Set a new password for your account
          </p>

          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                New Password
              </label>
              <div className="passwordField">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="loginInput"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="passwordToggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600 mb-1">
                    Password strength: <span className="font-semibold">{passwordStrength.label}</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className={`h-2 rounded transition-all duration-300 ${
                        passwordStrength.strength < 2
                          ? "bg-red-500"
                          : passwordStrength.strength < 4
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Password Requirements */}
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-md">
              <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Password Requirements:
              </h4>
              <div className="space-y-1">
                <ValidationItem 
                  isValid={validations.length} 
                  text="At least 6 characters" 
                />
                <ValidationItem 
                  isValid={validations.uppercase} 
                  text="At least one uppercase letter" 
                />
                <ValidationItem 
                  isValid={validations.lowercase} 
                  text="At least one lowercase letter" 
                />
                <ValidationItem 
                  isValid={validations.number} 
                  text="At least one number" 
                />
                <ValidationItem 
                  isValid={validations.special} 
                  text="At least one special character (!@#$%^&*)" 
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Confirm Password
              </label>
              <div className="passwordField">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="loginInput"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <span
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="passwordToggle"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </span>
              </div>
              
              {/* Password Match Validation */}
              <div className="mt-2">
                <ValidationItem 
                  isValid={validations.match} 
                  text="Passwords match" 
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="loginButton loginButton--submit w-full flex items-center justify-center"
              disabled={isResetting || !Object.values(validations).every(v => v === true)}
            >
              {isResetting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resetting...
                </>
              ) : (
                `Reset Password`
              )}
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-purple-700 dark:text-purple-400 hover:underline text-center text-sm"
              >
                ← Back to Login
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-gray-600 dark:text-gray-400 hover:underline text-center text-sm"
              >
                Need a new reset link?
              </button>
            </div>
          </div>
        </div>
      </div>    
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}