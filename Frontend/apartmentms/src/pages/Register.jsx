import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

export default function Register() {
  const [firstName, setFirstname] = useState('');
  const [lastName, setLastname] = useState('');
  const [country, setCountry] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmpassword] = useState('');
  const [msg, setMsg] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPwd,setShowConfirmPwd] = useState(false);
  
  const navigate=useNavigate();

  const handleCancel=()=>{
    navigate('/')
  }


   const handleConfirmPwd = (value) => {
    setConfirmpassword(value);
    if (password !== value) {
      setPwdError("Passwords don't match");
    } else {
      setPwdError('');
    }
  };

  async function submit(e) {
    e.preventDefault();

    if (password !== confirmPassword) {
      setPwdError("Passwords don't match");
      return;
    }

    try {
      await api.post('/auth/register', { firstName,lastName,country,mobile, email, password });
      // setMsg('Registered! Check your inbox for a verification email.');
      toast.success("🎉 Registered! Check your inbox for a verification email.");
    } catch (err) {
      // setMsg(err.response?.data?.message || 'Register failed');
      toast.error(err.response?.data?.message || "❌ Registration failed");
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
        <input value={firstName} onChange={e => setFirstname(e.target.value)} placeholder="Firstname" className="loginInput" />
        </div>
        <div>
        <input value={lastName} onChange={e => setLastname(e.target.value)} placeholder="Lastname" className="loginInput" />
        </div>
        <div>
        <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Country" className="loginInput" />
        </div>
        <div>
        <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile" className="loginInput" />
        </div>
        <div>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="loginInput" />
        </div>
        <div className='passwordField'>
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type={showPassword ? "text" : "password"} className="loginInput" />
         <span
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="passwordToggle"
    aria-label={showPassword ? "Hide password" : "Show password"}
  >
    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
  </span>
        </div>
        <div className='passwordField'>
        <input value={confirmPassword} onChange={e => handleConfirmPwd(e.target.value)} placeholder="Confirm Password" type={showConfirmPwd ? "text" : "password"} className="loginInput" />
        <span
    type="button"
    onClick={() => setShowConfirmPwd(!showConfirmPwd)}
    className="passwordToggle"
    aria-label={showConfirmPwd ? "Hide password" : "Show password"}
  >
    {showConfirmPwd ? <EyeOff size={20} /> : <Eye size={20} />}
  </span>
        </div>
         {/* Inline password error */}
          {pwdError && (
            <div className="mb-2 text-red-600 text-sm font-semibold">
              {pwdError}
            </div>
          )}
        <div className='loginButtonGroup'>
        <button className="loginButton loginButton--submit">Register</button>
        <button className="loginButton loginButton--cancel" onClick={handleCancel} >Cancel</button>
        </div>
      </form>
      </div>
    </div>
    {/* Toast container should be at root of your app (or here works too) */}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}
