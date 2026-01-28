//ResetPassword.jsx
import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { Eye, EyeOff, ArrowLeft, CheckCircle, XCircle, ShieldCheck } from "lucide-react";

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
  const [userType, setUserType] = useState(null);
  const [isValidLink, setIsValidLink] = useState(true);
  const [isVerifying, setIsVerifying] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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
    const userTypeParam = searchParams.get("user_type");
    
    if (!tokenParam || !idParam) {
      setIsValidLink(false);
      setIsVerifying(false);
      toast.error("Invalid or missing reset link parameters");
      return;
    }

    setToken(tokenParam);
    setId(idParam);
    setUserType(userTypeParam || 'user');
    
    const verifyToken = async () => {
      try {
        const response = await api.post('/auth/check-reset-token', {
          token: tokenParam,
          id: idParam
        });
        
        if (response.data.success) {
          setUserType(response.data.user_type);
          setUserEmail(response.data.email || '');
          setIsValidLink(true);
        } else {
          setIsValidLink(false);
          toast.error(response.data.message || "Invalid reset token");
        }
      } catch (err) {
        console.error("Error verifying token:", err);
        setIsValidLink(false);
        toast.error("Unable to verify reset token");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyToken();
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
    if (!password) return { strength: 0, label: "Very Weak", color: "bg-red-500" };

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/(?=.*[a-z])/.test(password)) strength++;
    if (/(?=.*[A-Z])/.test(password)) strength++;
    if (/(?=.*\d)/.test(password)) strength++;
    if (/(?=.*[@$!%*?&])/.test(password)) strength++;

    const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = ["bg-red-500", "bg-red-400", "bg-yellow-500", "bg-green-400", "bg-green-500", "bg-green-600"];
    
    return { 
      strength, 
      label: labels[strength] || "Very Weak",
      color: colors[strength] || "bg-red-500"
    };
  };

  const passwordStrength = getPasswordStrength();

  const ValidationItem = ({ isValid, text }) => (
    <div className="flex items-center gap-2 text-xs sm:text-sm">
      {isValid ? (
        <CheckCircle size={12} className="text-green-500 flex-shrink-0" />
      ) : (
        <XCircle size={12} className="text-red-500 flex-shrink-0" />
      )}
      <span className={`truncate ${isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {text}
      </span>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allValid = Object.values(validations).every(v => v === true);
    if (!allValid) {
      toast.error("Please meet all password requirements");
      return;
    }

    if (!userType) {
      toast.error("Unable to determine account type. Please request a new reset link.");
      return;
    }

    setIsResetting(true);
    try {
      await api.post('/auth/reset-password-unified', { 
        token, 
        id, 
        password,
        user_type: userType 
      });
      
      toast.success("✅ Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Reset failed. The link may have expired.";
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('expired')) {
          toast.error("Reset link has expired. Please request a new one.");
        } else if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
          toast.error("Invalid reset link. Please request a new one.");
        } else if (errorMessage.includes('already used')) {
          toast.error("This reset link has already been used. Please request a new one.");
        } else {
          toast.error(errorMessage);
        }
      } else if (err.response?.status === 404) {
        toast.error("Account not found. The link may be invalid.");
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsResetting(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 animate-fadeIn">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Verifying Reset Link
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
                Please wait while we verify your reset link...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="absolute top-4 left-4">
            <button 
              onClick={handleBackToLogin}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2"
              title="Back to Login"
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 animate-fadeIn">
            <div className="flex flex-col items-center justify-center gap-4">
              <XCircle size={64} className="text-red-500" />
              <h2 className="text-xl font-bold text-red-600 dark:text-red-400">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-center text-sm sm:text-base">
                This password reset link is invalid or has expired.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full mt-4">
                <button
                  onClick={() => navigate('/forgot-password')}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors flex-1"
                >
                  Request New Reset Link
                </button>
                <button
                  onClick={handleBackToLogin}
                  className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-colors flex-1"
                >
                  Back to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button 
            onClick={handleBackToLogin}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors p-2"
            title="Back to Login"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline text-sm">Back</span>
          </button>
        </div>

        {/* Logo */}
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-2">
            <img
              src="/apartment.png"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">AptSync</h1>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fadeIn max-h-[90vh] overflow-y-auto">
          <div className="p-5 sm:p-8">
            {/* Account Type Indicator */}
            {userType && (
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm ${
                  userType === 'houseowner' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                }`}>
                  <ShieldCheck size={14} className="flex-shrink-0" />
                  <span className="font-medium truncate">
                    {userType === 'houseowner' ? 'House Owner Account' : 'Admin/Employee Account'}
                  </span>
                  {userEmail && (
                    <span className="hidden sm:inline text-xs opacity-75 ml-1 truncate">
                      ({userEmail})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Set New Password
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Create a strong password for your account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* New Password */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-600 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Strength:
                      </span>
                      <span className={`text-xs sm:text-sm font-semibold ${
                        passwordStrength.strength < 2
                          ? "text-red-500"
                          : passwordStrength.strength < 4
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 sm:h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Password Requirements - Compact Mobile View */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-sm">
                  Password Requirements:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                  <ValidationItem 
                    isValid={validations.length} 
                    text="Min 6 characters" 
                  />
                  <ValidationItem 
                    isValid={validations.uppercase} 
                    text="Uppercase letter" 
                  />
                  <ValidationItem 
                    isValid={validations.lowercase} 
                    text="Lowercase letter" 
                  />
                  <ValidationItem 
                    isValid={validations.number} 
                    text="Number" 
                  />
                  <ValidationItem 
                    isValid={validations.special} 
                    text="Special character" 
                  />
                  <ValidationItem 
                    isValid={validations.match} 
                    text="Passwords match" 
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-600 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    disabled={isResetting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="w-full px-4 py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm sm:text-base transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isResetting || !Object.values(validations).every(v => v === true)}
              >
                {isResetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                    <span className="text-sm sm:text-base">Resetting Password...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} className="mr-2 sm:mr-3 flex-shrink-0" />
                    <span className="text-sm sm:text-base">Reset Password</span>
                  </>
                )}
              </button>
            </form>

            {/* Help & Navigation */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={handleBackToLogin}
                  className="text-purple-600 dark:text-purple-400 hover:underline text-center text-sm py-2"
                >
                  ← Back to Login
                </button>
                
                <div className="text-center">
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    Having trouble?{" "}
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs"
                    >
                      Request a new reset link
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} AptSync. All rights reserved.
          </p>
        </div>
      </div>
      
      <ToastContainer 
        position="top-center" 
        autoClose={3000}
        toastClassName="!text-sm"
      />
    </div>
  );
}