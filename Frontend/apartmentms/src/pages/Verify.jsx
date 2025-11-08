import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    if (token && id) {
      verifyEmail(token, id);
    }
  }, [searchParams]);

  const verifyEmail = async (token, id) => {
    try {
      setLoading(true);
      const result = await api.post('/auth/verify', { token, id });
      setMessage(result.data.message);
      toast.success('Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Verification error:', err);
      setMessage(err.response?.data?.message || 'Verification failed');
      toast.error('Email verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Email Verification
        </h2>
        
        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Verifying your email...</p>
          </div>
        ) : message ? (
          <div className="text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">{message}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-300">
            <p>No verification token found</p>
          </div>
        )}
      </div>
    </div>
  );
}