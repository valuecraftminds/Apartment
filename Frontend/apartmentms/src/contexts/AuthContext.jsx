// import React, { createContext, useState } from 'react';

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [auth, setAuth] = useState({ accessToken: null, user: null });
  
//   return 
//   <AuthContext.Provider value={{ 
//     auth, setAuth 
//   }}>
//     {children}
//   </AuthContext.Provider>;
// }

// import React, { createContext, useState, useEffect } from 'react';
// import { useNavigate } from "react-router-dom";

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [auth, setAuth] = useState({ accessToken: null, user: null });
//   const navigate = useNavigate();

//   // Auto-logout after 5 minutes (300,000 ms)
//   const AUTO_LOGOUT_TIME = 5 * 60 * 1000;

//   useEffect(() => {
//     let timeout;

//     const resetTimer = () => {
//       clearTimeout(timeout);
//       timeout = setTimeout(() => {
//         setAuth({ accessToken: null, user: null });
//         navigate("/");
//         console.log('Auto logged out')
//       }, AUTO_LOGOUT_TIME);
//     };

//     // Reset on activity
//     const activityEvents = ["mousemove", "keydown", "scroll", "click", "touchstart"];

//     activityEvents.forEach(event => {
//       window.addEventListener(event, resetTimer);
//     });

//     resetTimer(); // start timer on load

//     return () => {
//       activityEvents.forEach(event => {
//         window.removeEventListener(event, resetTimer);
//       });
//       clearTimeout(timeout);
//     };
//   }, [navigate]);

//   return (
//     <AuthContext.Provider value={{ auth, setAuth }}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

// import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
// import { useNavigate } from "react-router-dom";
// import api from '../api/axios';

// export const AuthContext = createContext(null);

// export function AuthProvider({ children }) {
//   const [auth, setAuth] = useState(() => {
//     const savedAuth = localStorage.getItem('auth');
//     return savedAuth ? JSON.parse(savedAuth) : { accessToken: null, user: null };
//   });
  
//   const navigate = useNavigate();
//   const timeoutRef = useRef(null);

//   // Auto-logout after 5 minutes
//   const AUTO_LOGOUT_TIME = 5 * 60 * 1000;

//   const logout = useCallback(() => {
//     setAuth({ accessToken: null, user: null });
//     localStorage.removeItem('auth');
//     localStorage.removeItem('lastActivity');
//     navigate("/login");
//     console.log('Auto logged out due to inactivity');
//   }, [navigate]);

//   const resetTimer = useCallback(() => {
//     // Clear existing timeout
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }

//     // Update last activity time
//     localStorage.setItem('lastActivity', Date.now().toString());

//     // Set new timeout
//     timeoutRef.current = setTimeout(() => {
//       logout();
//     }, AUTO_LOGOUT_TIME);
//   }, [logout, AUTO_LOGOUT_TIME]);

//   const setupActivityListeners = useCallback(() => {
//     const activityEvents = [
//       "mousemove", "mousedown", "keydown", "scroll", "click", 
//       "touchstart", "touchmove", "wheel", "resize", "focus"
//     ];

//     const handleActivity = () => {
//       resetTimer();
//     };

//     // Add event listeners
//     activityEvents.forEach(event => {
//       window.addEventListener(event, handleActivity, { passive: true });
//     });

//     // Handle visibility change
//     const handleVisibilityChange = () => {
//       if (!document.hidden) {
//         resetTimer();
//       }
//     };
    
//     document.addEventListener('visibilitychange', handleVisibilityChange);

//     // Cleanup function
//     return () => {
//       activityEvents.forEach(event => {
//         window.removeEventListener(event, handleActivity);
//       });
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     };
//   }, [resetTimer]);

//   // Check for existing activity on mount
//   useEffect(() => {
//     if (auth.accessToken) {
//       const savedActivity = localStorage.getItem('lastActivity');
//       if (savedActivity) {
//         const lastActivity = parseInt(savedActivity, 10);
//         const timeSinceLastActivity = Date.now() - lastActivity;
        
//         // If more than 5 minutes have passed, logout immediately
//         if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
//           logout();
//           return;
//         }
        
//         // Otherwise, set timeout for remaining time
//         const remainingTime = AUTO_LOGOUT_TIME - timeSinceLastActivity;
//         timeoutRef.current = setTimeout(logout, remainingTime);
//       } else {
//         // No previous activity, start fresh
//         resetTimer();
//       }

//       // Setup activity listeners
//       const cleanup = setupActivityListeners();

//       return cleanup;
//     }
//   }, [auth.accessToken, resetTimer, setupActivityListeners, logout, AUTO_LOGOUT_TIME]);

//   // Enhanced setAuth that handles localStorage and auto-logout
//   const setAuthWithAutoLogout = useCallback((newAuth) => {
//     setAuth(newAuth);
    
//     if (newAuth.accessToken) {
//       localStorage.setItem('auth', JSON.stringify(newAuth));
//       resetTimer();
//     } else {
//       localStorage.removeItem('auth');
//       localStorage.removeItem('lastActivity');
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     }
//   }, [resetTimer]);

//   const manualLogout = useCallback(async () => {
//     try {
//       await api.post('/auth/logout');
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       logout();
//     }
//   }, [logout]);

//   const value = {
//     auth,
//     setAuth: setAuthWithAutoLogout,
//     logout: manualLogout,
//     resetActivityTimer: resetTimer
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// }

import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('auth');
    return savedAuth ? JSON.parse(savedAuth) : { accessToken: null, user: null };
  });
  
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // Auto-logout after 5 minutes
  const AUTO_LOGOUT_TIME = 10 * 60 * 1000;

  const logout = useCallback(() => {
    setAuth({ accessToken: null, user: null });
    localStorage.removeItem('auth');
    localStorage.removeItem('lastActivity');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigate("/login");
    console.log('Auto logged out due to inactivity');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    localStorage.setItem('lastActivity', Date.now().toString());

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, AUTO_LOGOUT_TIME);
  }, [logout, AUTO_LOGOUT_TIME]);

  const setupActivityListeners = useCallback(() => {
    const activityEvents = [
      "mousemove", "mousedown", "keydown", "scroll", "click", 
      "touchstart", "touchmove", "wheel", "resize", "focus"
    ];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    activityEvents.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        resetTimer();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resetTimer]);

  // Check for existing activity on mount and when auth changes
  useEffect(() => {
    // Only setup auto-logout if user is authenticated
    if (auth && auth.accessToken) {
      const savedActivity = localStorage.getItem('lastActivity');
      if (savedActivity) {
        const lastActivity = parseInt(savedActivity, 10);
        const timeSinceLastActivity = Date.now() - lastActivity;
        
        // If more than 5 minutes have passed, logout immediately
        if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
          logout();
          return;
        }
        
        // Otherwise, set timeout for remaining time
        const remainingTime = AUTO_LOGOUT_TIME - timeSinceLastActivity;
        timeoutRef.current = setTimeout(logout, remainingTime);
      } else {
        // No previous activity, start fresh
        resetTimer();
      }

      // Setup activity listeners
      const cleanup = setupActivityListeners();

      return cleanup;
    } else {
      // If not authenticated, clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [auth, resetTimer, setupActivityListeners, logout, AUTO_LOGOUT_TIME]);

  // Enhanced setAuth that handles localStorage and auto-logout
  const setAuthWithAutoLogout = useCallback((newAuth) => {
    setAuth(newAuth);
    
    if (newAuth && newAuth.accessToken) {
      localStorage.setItem('auth', JSON.stringify(newAuth));
      resetTimer();
    } else {
      localStorage.removeItem('auth');
      localStorage.removeItem('lastActivity');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [resetTimer]);

  const manualLogout = useCallback(async () => {
    try {
      // Create a simple fetch request instead of using api instance
      await api.post('/auth/logout', {
        // method: 'POST',
        credentials: 'include', // Important for cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Use the logout function that properly clears everything
      logout();
    }
  }, [logout]);

  const value = {
    auth,
    setAuth: setAuthWithAutoLogout,
    logout: manualLogout,
    resetActivityTimer: resetTimer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}