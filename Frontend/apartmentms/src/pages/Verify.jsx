import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';

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
      return;
    }
    (async () => {
      try {
        await api.post('/auth/verify', { token, id });
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    })();
  }, [token, id]);

  const handleLogin=()=>{
    navigate('/login');
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      {status === 'verifying' && <p>Verifying…</p>}
      {status === 'success' && <p>Email verified! You can now login.</p>}
      <button className='className="px-4 py-2 bg-blue-600 text-white rounded' onClick={handleLogin}>Login</button>
      {status === 'error' && <p>Verification failed. Token may be invalid or expired.</p>}
      {status === 'invalid' && <p>Invalid verification link.</p>}
    </div>
  );
}
