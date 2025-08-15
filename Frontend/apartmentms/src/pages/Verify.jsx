import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Verify() {
  const q = useQuery();
  const token = q.get('token');
  const id = q.get('id');
  const [status, setStatus] = useState('verifying');

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

  return (
    <div className="p-6 max-w-md mx-auto">
      {status === 'verifying' && <p>Verifying…</p>}
      {status === 'success' && <p>Email verified! You can now login.</p>}
      {status === 'error' && <p>Verification failed. Token may be invalid or expired.</p>}
      {status === 'invalid' && <p>Invalid verification link.</p>}
    </div>
  );
}
