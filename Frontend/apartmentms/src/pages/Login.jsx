// // //Login.jsx
// // import React, { useContext, useState } from 'react';
// // import api from '../api/axios';
// // import { AuthContext } from '../contexts/AuthContext';
// // import { useNavigate, useSearchParams } from 'react-router-dom';
// // import { Eye, EyeOff } from "lucide-react";
// // import { ToastContainer, toast } from "react-toastify";
// // import "react-toastify/dist/ReactToastify.css";
// // import { useEffect } from 'react';

// // export default function Login() {
// //   const { setAuth } = useContext(AuthContext);
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [msg, setMsg] = useState(null);
// //   const [isVerifying, setIsVerifying] = useState(false);
// //   const [isResending, setIsResending] = useState(false);
// //   const [isRetrying, setIsRetrying] = useState(false);
// //   const [isRateLimited, setIsRateLimited] = useState(false);
// //   const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
// //   const navigate = useNavigate();

// //   let [searchParams, setSearchParams] = useSearchParams();

// //   // Effect to handle email verification
// //   useEffect(() => {
// //     const token = searchParams.get('token');
// //     const id = searchParams.get('id');

// //     if (token && id) {
// //       verifyEmail(token, id);
// //     }
// //   }, [searchParams]);

// //   const verifyEmail = async (token, id) => {
// //     setIsVerifying(true);
// //     setMsg(null);

// //     try {
// //       await api.post('/auth/verify', { token, id });
// //       toast.success('Email verified successfully! You can now log in.');
// //       setSearchParams({});
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
// //     } finally {
// //       setIsVerifying(false);
// //     }
// //   };

// //   async function submit(e) {
// //     e.preventDefault();
// //     setMsg(null);
// //     setIsVerifying(true);
// //     try {
// //       const res = await api.post('/auth/login', { email, password });
// //       setAuth({ accessToken: res.data.accessToken, user: res.data.user });
// //       toast.success("Login Successful!");
// //       return navigateToDashboard(res.data.user.role);
// //     } catch (err) {
// //       const status = err.response?.status;
// //       if (status === 429) {
// //         const ra = err.response?.headers?.['retry-after'];
// //         const wait = ra ? Math.max(1, Number(ra)) : 60;
// //         toast.error(`Too many requests. Please wait ${wait}s before trying again.`);
// //         setIsRateLimited(true);
// //         setRateLimitSeconds(wait);
// //         let remaining = wait;
// //         const interval = setInterval(() => {
// //           remaining -= 1;
// //           setRateLimitSeconds(remaining);
// //           if (remaining <= 0) {
// //             clearInterval(interval);
// //             setIsRateLimited(false);
// //             setRateLimitSeconds(0);
// //           }
// //         }, 1000);
// //       } else {
// //         setMsg(err.response?.data?.message || 'Login failed');
// //         toast.error(err.response?.data?.message || "Login failed");
// //       }
// //     } finally {
// //       setIsVerifying(false);
// //       setIsRetrying(false);
// //     }
// //   }

// //   const navigateToDashboard = (role) => {
// //     // switch (role) {
// //     //   case 'Admin':
// //     //     navigate('/admindashboard');
// //     //     break;
// //     //   case 'Apartment_owner':
// //     //     navigate('/employee-dashboard');
// //     //     break;
// //     //   case 'Apartment_manager':
// //     //     navigate('/employee-dashboard');
// //     //     break;
// //     //   case 'Apartment_technician':
// //     //     navigate('/employee-dashboard');
// //     //     break;
// //     //   default:
// //     //     navigate('/admindashboard'); 
// //     // }
// //     if(role === 'Admin'){
// //       navigate('/admindashboard')
// //     }else{
// //       navigate('/employee-dashboard')
// //     }
// //   };

// //   const handleResend = async (e) => {
// //     e.preventDefault();
// //     if (!email) {
// //       toast.error("Please enter your email first");
// //       return;
// //     }
    
// //     setIsResending(true);
// //     try {
// //       await api.post('/auth/resend', { email });
// //       toast.success("Verification email sent! Please check your inbox.");
// //     } catch (err) {
// //       toast.error(err.response?.data?.message || "Failed to resend verification email");
// //     } finally {
// //       setIsResending(false);
// //     }
// //   }

// //   const handleForgotPassword = () => {
// //     navigate('/forgot-password');
// //   };

// //   const handleCancel = () => {
// //     navigate('/');
// //   }

// //   return (
// //     <div className="container">
// //       <div className="absolute top-4 left-6 flex -6 mt-5">
// //         <img
// //           src="/apartment.png"
// //           alt="Apartment Logo"
// //           className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
// //         />
// //         <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
// //       </div>
// //       <div className="loginPage">
// //         <div className='loginCard animate-fadeIn'>
// //             <div className="flex items-center justify-center gap-2 mb-4">
// //               <img
// //                 src="/favicon.ico"
// //                 alt="AptSync Logo"
// //                 className="w-10 h-10"
// //               />
// //               <h1 className="font-bold text-xl">Log In</h1>
// //             </div>
// //           {isVerifying && <div className="mb-4 text-purple-600">Verifying your email...</div>}
// //           <form onSubmit={submit} className="loginForm">
// //             <div>
// //               <input 
// //               value={email} 
// //               onChange={e => setEmail(e.target.value)} 
// //               placeholder="Email" 
// //               className="loginInput"
// //               type="email"
// //               required />
// //             </div>
// //             <div className='passwordField'>
// //               <input 
// //               value={password} 
// //               onChange={e => setPassword(e.target.value)} 
// //               placeholder="Password" 
// //               type={showPassword ? "text" : "password"} 
// //               className="loginInput" 
// //               required/>
// //               <span
// //                   type="button"
// //                   onClick={() => setShowPassword(!showPassword)}
// //                   className="passwordToggle"
// //                   aria-label={showPassword ? "Hide password" : "Show password"}
// //                 >
// //                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// //               </span>
// //             </div>
// //             <div className="loginButtonGroup">
// //               <button
// //                 type="submit"
// //                 name="submit"
// //                 className="loginButton loginButton--submit"
// //                 disabled={isVerifying || isRateLimited}
// //               >
// //                 {isRateLimited ? `Try again in ${rateLimitSeconds}s` : (isVerifying ? 'Please Wait...' : 'Login')}
// //               </button>
// //               <button type="button" name="cancel" className="loginButton loginButton--cancel" onClick={handleCancel} disabled={isVerifying}>
// //                 Cancel
// //               </button>
// //             </div>
// //           </form>
// //           <p className="mt-4 text-sm text-center text-gray-600">
// //             Forgot password?{" "}
// //             <button
// //               type="button"
// //               onClick={handleForgotPassword}
// //               className="text-purple-700 hover:underline bg-white"
// //             >
// //               Reset
// //             </button>
// //           </p>
// //           <p className="mt-4 text-sm text-center text-gray-600">
// //             Didn't get a verification email? <button 
// //               type="button" 
// //               onClick={handleResend}
// //               disabled={isResending}
// //               className="text-purple-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed bg-white"
// //             >
// //               {isResending ? 'Sending...' : 'Resend'}
// //             </button>
// //           </p>
// //         </div>
// //       </div>
// //       <ToastContainer position="top-center" autoClose={3000} />
// //     </div>
// //   );
// // }

// //Login.jsx
// import React, { useContext, useState } from 'react';
// import api from '../api/axios';
// import { AuthContext } from '../contexts/AuthContext';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { Eye, EyeOff } from "lucide-react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useEffect } from 'react';

// export default function Login() {
//   const { setAuth } = useContext(AuthContext);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [msg, setMsg] = useState(null);
//   const [isVerifying, setIsVerifying] = useState(false);
//   const [isResending, setIsResending] = useState(false);
//   const [isRetrying, setIsRetrying] = useState(false);
//   const [isRateLimited, setIsRateLimited] = useState(false);
//   const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
//   const navigate = useNavigate();

//   let [searchParams, setSearchParams] = useSearchParams();

//   // Effect to handle email verification
//   useEffect(() => {
//     const token = searchParams.get('token');
//     const id = searchParams.get('id');

//     if (token && id) {
//       verifyEmail(token, id);
//     }
//   }, [searchParams]);

//   // Effect to check for existing rate limit
//   useEffect(() => {
//     try {
//       const rateLimitedUntil = localStorage.getItem('rateLimitedUntil');
//       if (rateLimitedUntil) {
//         const remainingTime = Number(rateLimitedUntil) - Date.now();
//         if (remainingTime > 0) {
//           const seconds = Math.ceil(remainingTime / 1000);
//           setIsRateLimited(true);
//           setRateLimitSeconds(seconds);
          
//           // Start countdown if page was refreshed during rate limit
//           let remaining = seconds;
//           const interval = setInterval(() => {
//             remaining -= 1;
//             setRateLimitSeconds(remaining);
            
//             if (remaining <= 0) {
//               clearInterval(interval);
//               setIsRateLimited(false);
//               setRateLimitSeconds(0);
//               localStorage.removeItem('rateLimitedUntil');
//             }
//           }, 1000);
          
//           return () => clearInterval(interval);
//         } else {
//           localStorage.removeItem('rateLimitedUntil');
//         }
//       }
//     } catch (e) {
//       console.warn('Could not read rate limit info:', e);
//     }
//   }, []);

//   const verifyEmail = async (token, id) => {
//     setIsVerifying(true);
//     setMsg(null);

//     try {
//       await api.post('/auth/verify', { token, id });
//       toast.success('Email verified successfully! You can now log in.');
//       setSearchParams({});
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
//     } finally {
//       setIsVerifying(false);
//     }
//   };

//   async function submit(e) {
//     e.preventDefault();
    
//     // Prevent multiple submissions
//     if (isVerifying || isRateLimited) {
//       return;
//     }
    
//     setMsg(null);
//     setIsVerifying(true);
    
//     try {
//       const res = await api.post('/auth/login', { email, password });
//       setAuth({ accessToken: res.data.accessToken, user: res.data.user });
//       toast.success("Login Successful!");
      
//       // Store token in localStorage
//       if (res.data.accessToken) {
//         try {
//           localStorage.setItem('accessToken', res.data.accessToken);
//           localStorage.setItem('user', JSON.stringify(res.data.user));
//         } catch (storageError) {
//           console.warn('Could not save to localStorage:', storageError);
//         }
//       }
      
//       return navigateToDashboard(res.data.user.role);
//     } catch (err) {
//       const status = err.response?.status;
      
//       if (status === 429) {
//         const ra = err.response?.headers?.['retry-after'];
//         const wait = ra ? Math.max(1, Number(ra)) : 60;
        
//         toast.error(`Too many requests. Please wait ${wait}s before trying again.`);
//         setIsRateLimited(true);
//         setRateLimitSeconds(wait);
        
//         // Store the rate limit info in localStorage to persist across refreshes
//         try {
//           localStorage.setItem('rateLimitedUntil', Date.now() + (wait * 1000));
//         } catch (e) {
//           console.warn('Could not save rate limit info:', e);
//         }
        
//         // Countdown timer
//         let remaining = wait;
//         const interval = setInterval(() => {
//           remaining -= 1;
//           setRateLimitSeconds(remaining);
          
//           if (remaining <= 0) {
//             clearInterval(interval);
//             setIsRateLimited(false);
//             setRateLimitSeconds(0);
            
//             // Clear localStorage entry
//             try {
//               localStorage.removeItem('rateLimitedUntil');
//             } catch (e) {
//               console.warn('Could not clear rate limit info:', e);
//             }
//           }
//         }, 1000);
//       } else {
//         const errorMessage = err.response?.data?.message || 'Login failed';
//         setMsg(errorMessage);
//         toast.error(errorMessage);
        
//         // If the error is about email verification, show resend option
//         if (errorMessage.includes('verify') || errorMessage.includes('verified')) {
//           toast.info(
//             <div>
//               <p>Need a new verification email?</p>
//               <button 
//                 onClick={handleResend} 
//                 className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
//                 disabled={isResending}
//               >
//                 {isResending ? 'Sending...' : 'Resend Verification'}
//               </button>
//             </div>,
//             { autoClose: 5000 }
//           );
//         }
//       }
//     } finally {
//       setIsVerifying(false);
//       setIsRetrying(false);
//     }
//   }

//   const navigateToDashboard = (role) => {
//     if(role === 'Admin'){
//       navigate('/admindashboard')
//     }else{
//       navigate('/employee-dashboard')
//     }
//   };

//   const handleResend = async (e) => {
//     e.preventDefault();
//     if (!email) {
//       toast.error("Please enter your email first");
//       return;
//     }
    
//     setIsResending(true);
//     try {
//       await api.post('/auth/resend', { email });
//       toast.success("Verification email sent! Please check your inbox.");
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to resend verification email");
//     } finally {
//       setIsResending(false);
//     }
//   }

//   const handleForgotPassword = () => {
//     navigate('/forgot-password');
//   };

//   const handleCancel = () => {
//     navigate('/');
//   }

//   return (
//     <div className="container">
//       <div className="absolute top-4 left-6 flex -6 mt-5">
//         <img
//           src="/apartment.png"
//           alt="Apartment Logo"
//           className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
//         />
//         <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
//       </div>
//       <div className="loginPage">
//         <div className='loginCard animate-fadeIn'>
//             <div className="flex items-center justify-center gap-2 mb-4">
//               <img
//                 src="/favicon.ico"
//                 alt="AptSync Logo"
//                 className="w-10 h-10"
//               />
//               <h1 className="font-bold text-xl">Log In</h1>
//             </div>
//           {isVerifying && <div className="mb-4 text-purple-600">Verifying your email...</div>}
//           <form onSubmit={submit} className="loginForm">
//             <div>
//               <input 
//               value={email} 
//               onChange={e => setEmail(e.target.value)} 
//               placeholder="Email" 
//               className="loginInput"
//               type="email"
//               required />
//             </div>
//             <div className='passwordField'>
//               <input 
//               value={password} 
//               onChange={e => setPassword(e.target.value)} 
//               placeholder="Password" 
//               type={showPassword ? "text" : "password"} 
//               className="loginInput" 
//               required/>
//               <span
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="passwordToggle"
//                   aria-label={showPassword ? "Hide password" : "Show password"}
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </span>
//             </div>
//             <div className="loginButtonGroup">
//               <button
//                 type="submit"
//                 name="submit"
//                 className="loginButton loginButton--submit"
//                 disabled={isVerifying || isRateLimited}
//               >
//                 {isRateLimited ? `Try again in ${rateLimitSeconds}s` : (isVerifying ? 'Please Wait...' : 'Login')}
//               </button>
//               <button type="button" name="cancel" className="loginButton loginButton--cancel" onClick={handleCancel} disabled={isVerifying}>
//                 Cancel
//               </button>
//             </div>
//           </form>
//           {msg && (
//             <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
//               {msg}
//             </div>
//           )}
//           <p className="mt-4 text-sm text-center text-gray-600">
//             Forgot password?{" "}
//             <button
//               type="button"
//               onClick={handleForgotPassword}
//               className="text-purple-700 hover:underline bg-white"
//             >
//               Reset
//             </button>
//           </p>
//           <p className="mt-4 text-sm text-center text-gray-600">
//             Didn't get a verification email? <button 
//               type="button" 
//               onClick={handleResend}
//               disabled={isResending}
//               className="text-purple-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed bg-white"
//             >
//               {isResending ? 'Sending...' : 'Resend'}
//             </button>
//           </p>
//         </div>
//       </div>
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// }
//Login.jsx
import React, { useContext, useState } from 'react';
import api from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Building, Home } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect } from 'react';

export default function Login() {
  const { setAuth } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitSeconds, setRateLimitSeconds] = useState(0);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'houseowner'
  const navigate = useNavigate();

  let [searchParams, setSearchParams] = useSearchParams();

  // Effect to handle email verification
  useEffect(() => {
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const type = searchParams.get('type'); // Check for user type

    if (token && id) {
      if (type === 'houseowner') {
        // This is a house owner verification link
        verifyHouseOwnerEmail(token, id);
      } else {
        // Regular user verification
        verifyEmail(token, id);
      }
    }
  }, [searchParams]);

  const verifyEmail = async (token, id) => {
    setIsVerifying(true);
    setMsg(null);

    try {
      await api.post('/auth/verify', { token, id });
      toast.success('Email verified successfully! You can now log in.');
      setSearchParams({});
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  const verifyHouseOwnerEmail = async (token, id) => {
    setIsVerifying(true);
    setMsg(null);

    try {
      const res = await api.post('/houseowner-auth/verify', { token, id });
      
      if (res.data.success) {
        if (res.data.requires_password) {
          // Redirect to password setup for house owner
          toast.success('Email verified! Please set your password.');
          navigate(`/houseowner/set-password?token=${token}&id=${id}`);
        } else {
          toast.success('Email verified successfully! You can now log in.');
          setSearchParams({});
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. The link may be invalid or expired.');
    } finally {
      setIsVerifying(false);
    }
  };

  // async function submit(e) {
  //   e.preventDefault();
    
  //   // Prevent multiple submissions
  //   if (isVerifying || isRateLimited) {
  //     return;
  //   }
    
  //   setMsg(null);
  //   setIsVerifying(true);
    
  //   try {
  //     let res;
      
  //     if (userType === 'houseowner') {
  //       // House owner login
  //       res = await api.post('/houseowner-auth/login', { email, password });
        
  //       if (res.data.success) {
  //         // Store house owner data differently
  //         const houseOwnerData = {
  //           accessToken: res.data.accessToken,
  //           user: {
  //             ...res.data.owner,
  //             isHouseOwner: true // Flag to identify this as a house owner
  //           }
  //         };
          
  //         setAuth(houseOwnerData);
  //         toast.success("Login Successful!");
          
  //         // Store in localStorage
  //         try {
  //           localStorage.setItem('accessToken', res.data.accessToken);
  //           localStorage.setItem('user', JSON.stringify(houseOwnerData.user));
  //           localStorage.setItem('userType', 'houseowner');
  //         } catch (storageError) {
  //           console.warn('Could not save to localStorage:', storageError);
  //         }
          
  //         // Navigate to house owner dashboard
  //         navigate('/houseowner/dashboard');
  //         return;
  //       }
  //     } else {
  //       // Regular user login
  //       res = await api.post('/auth/login', { email, password });
        
  //       if (res.data.accessToken) {
  //         setAuth({ accessToken: res.data.accessToken, user: res.data.user });
  //         toast.success("Login Successful!");
          
  //         // Store token in localStorage
  //         try {
  //           localStorage.setItem('accessToken', res.data.accessToken);
  //           localStorage.setItem('user', JSON.stringify(res.data.user));
  //           localStorage.setItem('userType', 'admin');
  //         } catch (storageError) {
  //           console.warn('Could not save to localStorage:', storageError);
  //         }
          
  //         return navigateToDashboard(res.data.user.role);
  //       }
  //     }
  //   } catch (err) {
  //     handleLoginError(err);
  //   } finally {
  //     setIsVerifying(false);
  //   }
  // }

  // Remove the userType state and buttons for selecting user type
// Keep only the unified login logic

async function submit(e) {
  e.preventDefault();
  
  if (isVerifying || isRateLimited) {
    return;
  }
  
  setMsg(null);
  setIsVerifying(true);
  
  try {
    // Use the unified login endpoint
    const res = await api.post('/auth/login-unified', { email, password });
    
    if (res.data.accessToken) {
      setAuth({ accessToken: res.data.accessToken, user: res.data.user });
      toast.success("Login Successful!");
      
      // Store in localStorage
      try {
        localStorage.setItem('accessToken', res.data.accessToken);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        localStorage.setItem('userType', res.data.user.user_type);
      } catch (storageError) {
        console.warn('Could not save to localStorage:', storageError);
      }
      
      // Navigate based on user type and role
      navigateToDashboard(res.data.user);
      return;
    }
  } catch (err) {
    handleLoginError(err);
  } finally {
    setIsVerifying(false);
  }
}

const navigateToDashboard = (user) => {
  if (user.user_type === 'houseowner') {
    navigate('/houseowner/dashboard');
  } else {
    // Regular user
    if (user.role === 'Admin') {
      navigate('/admindashboard');
    } else {
      navigate('/employee-dashboard');
    }
  }
};

  const handleLoginError = (err) => {
    const status = err.response?.status;
    
    if (status === 429) {
      handleRateLimitError(err);
    } else {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setMsg(errorMessage);
      toast.error(errorMessage);
      
      // If the error is about email verification, show resend option
      if (errorMessage.includes('verify') || errorMessage.includes('verified')) {
        showResendVerification();
      }
    }
  };

  const handleRateLimitError = (err) => {
    const ra = err.response?.headers?.['retry-after'];
    const wait = ra ? Math.max(1, Number(ra)) : 60;
    
    toast.error(`Too many requests. Please wait ${wait}s before trying again.`);
    setIsRateLimited(true);
    setRateLimitSeconds(wait);
    
    // Store the rate limit info in localStorage to persist across refreshes
    try {
      localStorage.setItem('rateLimitedUntil', Date.now() + (wait * 1000));
    } catch (e) {
      console.warn('Could not save rate limit info:', e);
    }
    
    // Countdown timer
    let remaining = wait;
    const interval = setInterval(() => {
      remaining -= 1;
      setRateLimitSeconds(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        setIsRateLimited(false);
        setRateLimitSeconds(0);
        
        // Clear localStorage entry
        try {
          localStorage.removeItem('rateLimitedUntil');
        } catch (e) {
          console.warn('Could not clear rate limit info:', e);
        }
      }
    }, 1000);
  };

  const showResendVerification = () => {
    toast.info(
      <div>
        <p>Need a new verification email?</p>
        <button 
          onClick={handleResend} 
          className="mt-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          disabled={isResending}
        >
          {isResending ? 'Sending...' : 'Resend Verification'}
        </button>
      </div>,
      { autoClose: 5000 }
    );
  };

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email first");
      return;
    }
    
    setIsResending(true);
    try {
      // Determine which resend endpoint to use based on user type
      if (userType === 'houseowner') {
        await api.post('/houseowner-auth/resend-verification', { email });
      } else {
        await api.post('/auth/resend', { email });
      }
      toast.success("Verification email sent! Please check your inbox.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  }

  const handleForgotPassword = () => {
    if (userType === 'houseowner') {
      navigate('/forgot-password');
    } else {
      navigate('/forgot-password');
    }
  };

  const handleCancel = () => {
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

          {isVerifying && <div className="mb-4 text-purple-600">Verifying your email...</div>}
          
          <form onSubmit={submit} className="loginForm">
            <div>
              <input 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Email" 
                className="loginInput"
                type="email"
                required 
              />
            </div>
            <div className='passwordField'>
              <input 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Password" 
                type={showPassword ? "text" : "password"} 
                className="loginInput" 
                required
              />
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
              <button
                type="submit"
                name="submit"
                className="loginButton loginButton--submit"
                disabled={isVerifying || isRateLimited}
              >
                {isRateLimited 
                  ? `Try again in ${rateLimitSeconds}s` 
                  : isVerifying 
                    ? 'Please Wait...' 
                    : 'Login'
                }
              </button>
              <button 
                type="button" 
                name="cancel" 
                className="loginButton loginButton--cancel" 
                onClick={handleCancel} 
                disabled={isVerifying}
              >
                Cancel
              </button>
            </div>
          </form>
          
          {msg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-center">
              {msg}
            </div>
          )}
          
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
          
          {userType === 'admin' && (
            <p className="mt-4 text-sm text-center text-gray-600">
              Didn't get a verification email?{" "}
              <button 
                type="button" 
                onClick={handleResend}
                disabled={isResending}
                className="text-purple-700 hover:underline disabled:text-gray-400 disabled:cursor-not-allowed bg-white"
              >
                {isResending ? 'Sending...' : 'Resend'}
              </button>
            </p>
          )}

          {userType === 'houseowner' && (
            <p className="mt-4 text-sm text-center text-gray-600">
              Need help? Contact your apartment administrator.
            </p>
          )}
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
