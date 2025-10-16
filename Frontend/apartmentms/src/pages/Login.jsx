import React, { useContext, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate,useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react';

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword,setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate=useNavigate();

  let [searchParams, setSearchParams] = useSearchParams();

  // Effect to handle email verification
  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');

    // If verification parameters are present in the URL
    if (token && id) {
      verifyEmail(token, id);
    }
  }, [searchParams]); // Run when the searchParams change

  // Function to call the verify endpoint
  const verifyEmail = async (token, id) => {
    setIsVerifying(true); // Start loading
    setMsg(null); // Clear any previous messages

    try {
      await api.post('/auth/verify', { token, id });
      // On success, show a message and clear the URL parameters
      toast.success('Email verified successfully! You can now log in.');
      // Remove the token and id from the URL without refreshing the page
      setSearchParams({});
    } catch (err) {
      // On error, show the error message
      toast.error(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
    } finally {
      setIsVerifying(false); // Stop loading regardless of outcome
    }
  };

  async function submit(e) {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { email, password });
      setAuth({ accessToken: res.data.accessToken, user: res.data.user });
      toast.success("Log in Successfull");
      navigate('/admindashboard');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Login failed');
      toast.error(err.response?.data?.message || "Login failed");
    }
  }

   const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }
    
    setIsResending(true);
    try {
      await api.post('/auth/resend', { email });
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  }

  const handleForgotPassword = () => {
  navigate('/forgot-password');
};

  const handleCancel=()=>{
    navigate('/');
  }

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>
    <div className="loginPage">
        <div className='loginCard animate-fadeIn'>
            <div className="flex items-center justify-center gap-2 mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
            <h1 className="font-bold text-xl">Log In</h1>
          </div>
      {/* Show a loading message only while verifying */}
          {isVerifying && <div className="mb-4 text-purple-600">Verifying your email...</div>}
          {/* Show other non-toast messages (e.g., from login) */}
          {/* {msg && <div className="mb-4 text-red-600">{msg}</div>} */}
      <form onSubmit={submit} className="loginForm">
        <div>
            <input 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            placeholder="Email" 
            className="loginInput"
            type="email" // Better for mobile keyboards
                required />
        </div>
        <div className='passwordField'>
        <input 
        value={password} 
        onChange={e => setPassword(e.target.value)} 
        placeholder="Password" type={showPassword ? "text" : "password"} 
        className="loginInput" 
        required/>
        <span
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="passwordToggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </span>
        </div>
        <div className="loginButtonGroup">
               <button type="submit" name="submit" className="loginButton loginButton--submit" disabled={isVerifying}>
                {/* Disable button while verifying */}
                {isVerifying ? 'Please Wait...' : 'Login'}
              </button>
              <button type="button" name="cancel" className="loginButton loginButton--cancel" onClick={handleCancel} disabled={isVerifying}>
                Cancel
              </button>
            </div>
      </form>
      <p className="mt-4 text-sm text-center text-gray-600">
        Forgot password?{" "}
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-purple-700 hover:underline bg-white"
        >
          Reset
        </button>
      </p>
       {/* Add a link to resend verification if needed? */}
          <p className="mt-4 text-sm text-center text-gray-600">
            Didn't get a verification email? <button 
              type="button" 
              onClick={handleResend}
              disabled={isResending}
              className="text-purple-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed bg-white"
            >
              {isResending ? 'Sending...' : 'Resend'}
            </button>
          </p>
      </div>
    </div>
     {/* Toast container should be at root of your app (or here works too) */}
          <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
