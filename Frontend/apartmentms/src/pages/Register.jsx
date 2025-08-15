import React, { useState } from 'react';
import api from '../api/axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

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
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Register</h2>
      {msg && <div className="mb-4">{msg}</div>}
      <form onSubmit={submit} className="space-y-4">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" className="w-full" />
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full" />
        <button className="px-4 py-2 bg-blue-600 text-white rounded">Register</button>
      </form>
    </div>
  );
}
