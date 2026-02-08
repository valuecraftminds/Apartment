// //AuthContext.jsx
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
//   const AUTO_LOGOUT_TIME = 10 * 60 * 1000;

//   const logout = useCallback(() => {
//     setAuth({ accessToken: null, user: null });
//     localStorage.removeItem('auth');
//     localStorage.removeItem('lastActivity');
//     if (timeoutRef.current) {
//       clearTimeout(timeoutRef.current);
//     }
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

//   // Check for existing activity on mount and when auth changes
//   useEffect(() => {
//     // Only setup auto-logout if user is authenticated
//     if (auth && auth.accessToken) {
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
//     } else {
//       // If not authenticated, clear any existing timeout
//       if (timeoutRef.current) {
//         clearTimeout(timeoutRef.current);
//       }
//     }
//   }, [auth, resetTimer, setupActivityListeners, logout, AUTO_LOGOUT_TIME]);

//   // Enhanced setAuth that handles localStorage and auto-logout
//   const setAuthWithAutoLogout = useCallback((newAuth) => {
//     setAuth(newAuth);
    
//     if (newAuth && newAuth.accessToken) {
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
//       // Create a simple fetch request instead of using api instance
//       await api.post('/auth/logout', {
//         // method: 'POST',
//         credentials: 'include', // Important for cookies
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       });
//     } catch (error) {
//       console.error('Logout error:', error);
//     } finally {
//       // Use the logout function that properly clears everything
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
//AuthContext.jsx
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import api from '../api/axios';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    // Check for house owner auth first
    const houseOwnerToken = localStorage.getItem('houseOwnerToken');
    const houseOwnerData = localStorage.getItem('houseOwnerData');
    const userType = localStorage.getItem('userType');
    
    if (houseOwnerToken && houseOwnerData && userType === 'houseowner') {
      return {
        accessToken: houseOwnerToken,
        user: JSON.parse(houseOwnerData),
        userType: 'houseowner'
      };
    }
    
    // Check for regular user auth
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const parsedAuth = JSON.parse(savedAuth);
      return {
        ...parsedAuth,
        userType: localStorage.getItem('userType') || 'admin'
      };
    }
    
    return { 
      accessToken: null, 
      user: null,
      userType: null 
    };
  });
  
  const navigate = useNavigate();
  const timeoutRef = useRef(null);

  // Auto-logout after 15 minutes
  const AUTO_LOGOUT_TIME = 15 * 60 * 1000;

  const logout = useCallback(() => {
    setAuth({ accessToken: null, user: null, userType: null });
    
    // Clear all auth-related storage
    localStorage.removeItem('auth');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('houseOwnerToken');
    localStorage.removeItem('houseOwnerData');
    localStorage.removeItem('lastActivity');
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // notify other tabs/windows to logout
    try {
      localStorage.setItem('logout', Date.now().toString());
    } catch (e) { /* ignore */ }

    navigate("/login");
    //console.log('Auto logged out due to inactivity');
  }, [navigate]);

  const resetTimer = useCallback(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity time
    try {
      localStorage.setItem('lastActivity', Date.now().toString());
    } catch (e) { /* ignore */ }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, AUTO_LOGOUT_TIME);
  }, [logout, AUTO_LOGOUT_TIME]);

  const setupActivityListeners = useCallback(() => {
    const activityEvents = [
      'mousemove','mousedown','pointerdown','keydown','scroll','click',
      'touchstart','touchmove','wheel','resize','focus'
    ];

    // Debounce repeated events to avoid excessive localStorage writes
    let lastReset = 0;
    const handleActivity = () => {
      const now = Date.now();
      if (now - lastReset > 1000) { // 1s throttle
        lastReset = now;
        resetTimer();
      }
    };

    // Add event listeners on document to capture more interactions
    activityEvents.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true, capture: true });
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
        document.removeEventListener(event, handleActivity, { capture: true });
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
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
        
        // If more than 10 minutes have passed, logout immediately
        if (timeSinceLastActivity > AUTO_LOGOUT_TIME) {
          logout();
          return;
        }
        
        // Otherwise, set timeout for remaining time
        const remainingTime = AUTO_LOGOUT_TIME - timeSinceLastActivity;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(logout, remainingTime);
      } else {
        // No previous activity, start fresh
        resetTimer();
      }

      // Setup activity listeners
      const cleanup = setupActivityListeners();

      // Listen for storage events to sync activity/logout across tabs
      const storageHandler = (e) => {
        try {
          if (e.key === 'lastActivity' && e.newValue) {
            const last = parseInt(e.newValue, 10);
            const elapsed = Date.now() - last;
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            const remaining = AUTO_LOGOUT_TIME - elapsed;
            if (remaining <= 0) {
              logout();
            } else {
              timeoutRef.current = setTimeout(logout, remaining);
            }
          }
          if (e.key === 'logout') {
            // Another tab initiated logout
            logout();
          }
        } catch (err) {
          // ignore parsing errors
        }
      };

      window.addEventListener('storage', storageHandler);

      return () => {
        window.removeEventListener('storage', storageHandler);
        cleanup();
      };
    } else {
      // If not authenticated, clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  }, [auth, resetTimer, setupActivityListeners, logout, AUTO_LOGOUT_TIME]);

  // Enhanced setAuth that handles localStorage and auto-logout
  const setAuthWithAutoLogout = useCallback((newAuth) => {
    const userType = newAuth.user?.isHouseOwner ? 'houseowner' : 'admin';
    const authData = {
      ...newAuth,
      userType
    };
    
    setAuth(authData);
    
    if (newAuth && newAuth.accessToken) {
      if (userType === 'houseowner') {
        // Store house owner data separately
        localStorage.setItem('houseOwnerToken', newAuth.accessToken);
        localStorage.setItem('houseOwnerData', JSON.stringify(newAuth.user));
      } else {
        // Store regular user data
        localStorage.setItem('auth', JSON.stringify(newAuth));
        localStorage.setItem('accessToken', newAuth.accessToken);
        localStorage.setItem('user', JSON.stringify(newAuth.user));
      }
      
      localStorage.setItem('userType', userType);
      resetTimer();
    } else {
      logout();
    }
  }, [resetTimer, logout]);

  const manualLogout = useCallback(async () => {
    try {
      if (auth.userType === 'houseowner') {
        // Logout house owner
        await api.post('/houseowner-auth/logout', {}, {
          credentials: 'include'
        });
      } else {
        // Logout regular user
        await api.post('/auth/logout', {}, {
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Use the logout function that properly clears everything
      logout();
    }
  }, [logout, auth.userType]);

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