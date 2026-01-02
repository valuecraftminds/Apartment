// //ForgotPassword.jsx
// import React, { useState } from "react";
// import api from "../api/axios";
// import { toast, ToastContainer } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSending(true);
//     try {
//       await api.post("/auth/forgot-password", { email });
//       toast.success("📧 Password reset link sent! Check your inbox.");
//       setEmail(""); // Clear email after success
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Something went wrong");
//     } finally {
//       setIsSending(false);
//     }
//   };

//   const handleBackToLogin = () => {
//     navigate('/login');
//   };

//   return (
//     <div className="container">
//       <div className="absolute top-4 left-6 flex -6 mt-5">
//         <button 
//           onClick={handleBackToLogin}
//           className="flex items-center gap-2 mb-4 text-white hover:text-black transition-colors"
//         >
//           <ArrowLeft size={20} />
//         </button>
//         <img
//           src="/apartment.png"
//           alt="Apartment Logo"
//           className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
//         />
//         <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
//       </div>
//       <div className="loginPage">
//         <div className="loginCard animate-fadeIn">
//           {/* <img
//                 src="/favicon.ico"
//                 alt="AptSync Logo"
//                 className="w-10 h-10"
//           /> */}
//           <h1 className="font-bold text-xl text-center">Forgot Password</h1>
//           <p className="text-gray-600 mb-6 text-sm">
//             Enter your email address and we'll send you a link to reset your password.
//           </p>

//           <form onSubmit={handleSubmit}>
//             <input
//               type="email"
//               placeholder="Enter your email"
//               className="loginInput mb-4"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//             <button
//               type="submit"
//               className="loginButton loginButton--submit w-full"
//               disabled={isSending}
//             >
//               {isSending ? "Sending..." : "Send Reset Link"}
//             </button>
//           </form>
        
//           <p className="mt-4 text-sm text-center text-gray-600">
//             Remember your password?{" "}
//             <button
//               type="button"
//               onClick={handleBackToLogin}
//               className="text-purple-700 hover:underline"
//             >
//               Back to Login
//             </button>
//           </p>
//         </div> 
//       </div>
      
//       <ToastContainer position="top-center" autoClose={3000} />
//     </div>
//   );
// }

import React, { useState } from "react";
import api from "../api/axios";
import { toast, ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Building, Home } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [userType, setUserType] = useState('admin'); // 'admin' or 'houseowner'
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsSending(true);
    try {
      let endpoint = '/auth/forgot-password';
      let successMessage = "📧 Password reset link sent! Check your inbox.";
      
      if (userType === 'houseowner') {
        endpoint = '/houseowner-auth/forgot-password';
        successMessage = "📧 Password reset link sent! Check your inbox.";
      }
      
      await api.post(endpoint, { email });
      toast.success(successMessage);
      setEmail(""); // Clear email after success
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong";
      
      // Provide more helpful messages based on user type
      if (userType === 'houseowner') {
        if (err.response?.status === 404) {
          toast.error("No house owner account found with this email");
        } else if (err.response?.status === 400 && errorMessage.includes('verify')) {
          toast.error("Please verify your email first before resetting password");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="container">
      <div className="absolute top-4 left-6 flex -6 mt-5">
        <button 
          onClick={handleBackToLogin}
          className="flex items-center gap-2 mb-4 text-white hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <img
          src="/apartment.png"
          alt="Apartment Logo"
          className="w-12 sm:w-10 md:w-11 mx-auto mb-6"
        />
        <h2 className="text-3xl sm:text-3xl md:text-3xl font-bold text-white mb-4">AptSync</h2>
      </div>
      <div className="loginPage">
        <div className="loginCard animate-fadeIn">
          <div className="flex justify-center mb-4">
            <img
              src="/favicon.ico"
              alt="AptSync Logo"
              className="w-10 h-10"
            />
          </div>
          
          <h1 className="font-bold text-xl text-center mb-2">Forgot Password</h1>
          <p className="text-gray-600 mb-6 text-sm text-center">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {/* User Type Selection */}
          <div className="mb-6">
            <div className="flex justify-center space-x-4">
              <button
                type="button"
                onClick={() => setUserType('admin')}
                className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  userType === 'admin' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Building size={18} className="mr-2" />
                Admin/Employee
              </button>
              <button
                type="button"
                onClick={() => setUserType('houseowner')}
                className={`flex items-center justify-center px-4 py-2 rounded-md transition-colors ${
                  userType === 'houseowner' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <Home size={18} className="mr-2" />
                House Owner
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="loginInput w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              className="loginButton loginButton--submit w-full flex items-center justify-center"
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                `Send Reset Link to ${userType === 'admin' ? 'Admin' : 'House Owner'}`
              )}
            </button>
          </form>

          {/* Help Text */}
          {userType === 'houseowner' && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-700 dark:text-green-300 text-sm">
                <span className="font-semibold">Note:</span> House owners must have a verified email address to reset password.
              </p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col space-y-3">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-purple-700 dark:text-purple-400 hover:underline text-center"
              >
                ← Back to Login
              </button>
            </div>
          </div>
        </div> 
      </div>
      
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}