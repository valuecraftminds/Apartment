import React, { useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate=useNavigate();

  const handleCancel=()=>{
    navigate('/')
  }

  async function submit(e) {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      setMsg('Registered! Check your inbox for a verification email.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Register failed');
    }
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
            <h1 className="font-bold text-xl">Register</h1>
          </div>
      {msg && <div className="mb-4">{msg}</div>}
      <form onSubmit={submit} className="loginForm">
        <div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="loginInput" />
        </div>
        <div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="loginInput" />
        </div>
        <div>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="loginInput" />
        </div>
        <div>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Confirm Password" type="password" className="loginInput" />
        </div>
        <div className='loginButtonGroup'>
        <button className="loginButton loginButton--submit">Register</button>
        <button className="loginButton loginButton--cancel" onClick={handleCancel} >Cancel</button>
        </div>
      </form>
      </div>
    </div>
    </div>
  );
}
