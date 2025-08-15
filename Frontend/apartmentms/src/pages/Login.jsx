import React, { useContext, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const navigate=useNavigate();

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth({ accessToken: res.data.accessToken, user: res.data.user });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
    }
  }

  const handleLogin=()=>{
    navigate('/admindashboard');
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      {msg && <div className="mb-4 text-red-600">{msg}</div>}
      <form onSubmit={submit} className="space-y-4">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full" />
        <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={handleLogin}>Login</button>
      </form>
    </div>
  );
}
