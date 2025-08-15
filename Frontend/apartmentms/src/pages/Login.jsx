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

  const handleCancel=()=>{
    navigate('/');
  }

  return (
    <div className="container">
    <div className="loginPage">
        <div className='loginCard animate-fadeIn'>
            <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
            <h1 className="font-bold text-xl">Get Login</h1>
          </div>
      {msg && <div className="mb-4 text-red-600">{msg}</div>}
      <form onSubmit={submit} className="loginForm">
        <div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="loginInput" />
        </div>
        <div>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="loginInput" />
        </div>
        <div className="loginButtonGroup">
              <button type="submit" name="submit" className="loginButton loginButton--submit" onClick={handleLogin}>
                Login
              </button>
              <button type="button" name="cancel" className="loginButton loginButton--cancel" onClick={handleCancel}>
                Cancel
              </button>
            </div>
      </form>
      </div>
    </div>
    </div>
  );
}
