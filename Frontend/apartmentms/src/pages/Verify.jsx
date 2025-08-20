import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Verify() {
  const q = useQuery();
  const token = q.get('token');
  const id = q.get('id');
  const [status, setStatus] = useState('verifying');
  const navigate=useNavigate();

  useEffect(() => {
    if (!token || !id) {
      setStatus('invalid');
      toast.error('Invalid verification link.')
      return;
    }
    (async () => {
      try {
        await api.post('/auth/verify', { token, id });
        setStatus('success');
        toast.success('Email Verified')
        
      } catch (err) {
        setStatus('error');
        toast.error("Verification failed. Token may be invalid or expired.")

      }
    })();
  }, [token, id]);

  return (
    <div className="Container">
      <div className='loginPage'>
        <div className='loginCard animate-fadeIn'>
          {/* <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
            <h1 className="font-bold text-xl">Get Login</h1>
          </div>  */}
      {status === 'verifying' && <p>Verifying…</p>}
      {status === 'success' && <p>Email verified! You can now login.</p>}
      {status === 'error' && <p>Verification failed. Token may be invalid or expired.</p>}
      {status === 'invalid' && <p>Invalid verification link.</p>}
      </div>
      </div>
    </div>
  );
}
