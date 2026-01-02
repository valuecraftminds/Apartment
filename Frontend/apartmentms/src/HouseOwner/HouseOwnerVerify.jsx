import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';

export default function HouseOwnerVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showSetPassword, setShowSetPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [ownerId, setOwnerId] = useState('');
  const [token, setToken] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const id = searchParams.get('id');

    if (tokenParam && id) {
      setToken(tokenParam);
      setOwnerId(id);
      verifyEmail(tokenParam, id);
    } else {
      setError('Invalid verification link');
      setLoading(false);
    }
  }, []);

  const verifyEmail = async (token, id) => {
    try {
      const res = await api.post('/houseowner-auth/verify', {
        token,
        id
      });
      
      if (res.data.success) {
        setMessage(res.data.message);
        // Show password setup form if password is required
        if (res.data.requires_password) {
          setShowSetPassword(true);
        } else {
          // If already has password, redirect to login
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    // Reset previous errors
    setPasswordError('');

    // Validation
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    // Password strength validation (optional)
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      setPasswordError('Password must contain uppercase, lowercase, numbers, and special characters');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/houseowner-auth/setup-password', {
        token,
        id: ownerId,
        password
      });

      if (res.data.success) {
        setMessage(res.data.message);
        setShowSetPassword(false);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to set password');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    // Clear error when user starts typing
    if (passwordError) setPasswordError('');
  };

  if (loading && !showSetPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying your email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        {error ? (
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Verification Failed</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-green-500 text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {showSetPassword ? 'Set Your Password' : 'Email Verified Successfully!'}
            </h2>
            
            {message && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
            )}
            
            {showSetPassword ? (
              <div className="mt-6">
                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      placeholder="Enter password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1 text-left">
                      Must be at least 6 characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                  
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  {passwordError && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-red-600 dark:text-red-400 text-sm">{passwordError}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleSetPassword}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Setting Password...
                      </span>
                    ) : (
                      'Set Password'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-purple-600 text-white py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                Go to Login
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}