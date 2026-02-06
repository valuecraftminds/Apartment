// // api/axios.js
// import axios from 'axios';
// import React from 'react';
// import { AuthContext } from '../contexts/AuthContext';

// const api = axios.create({
//   //baseURL: 'http://localhost:2500/api',
//   // baseURL: 'http://192.168.8.101:2500/api',
//   baseURL: 'https://apmt.apivcm.shop/api',
//   withCredentials: true,
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // Attach Authorization header from storage if present
// api.interceptors.request.use((config) => {
//   try {
//     const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (e) { /* ignore storage errors */ }
//   return config;
// }, (err) => Promise.reject(err));

// // On 401 try to refresh once, then retry original request
// // api.interceptors.response.use(
// //   (res) => res,
// //   async (error) => {
// //     const originalRequest = error.config;
// //     if (error.response && error.response.status === 401 && !originalRequest?._retry) {
// //       originalRequest._retry = true;
// //       try {
// //         const refreshRes = await api.post('/auth/refresh'); // withCredentials true sends refresh cookie
// //         const newAccess = refreshRes.data?.accessToken;
// //         if (newAccess) {
// //           try { localStorage.setItem('accessToken', newAccess); } catch(e){/*ignore*/ }
// //           api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
// //           originalRequest.headers = originalRequest.headers || {};
// //           originalRequest.headers.Authorization = `Bearer ${newAccess}`;
// //         }
// //         return api(originalRequest);
// //       } catch (refreshErr) {
// //         // fallback: navigate to login (client-side) so user can re-authenticate
// //         try { window.location.href = '/login'; } catch(e){/*ignore*/ }
// //         return Promise.reject(refreshErr);
// //       }
// //     }
// //     return Promise.reject(error);
// //   }
// // );

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;

//     const publicEndpoints = ['/auth/register', '/auth/login', '/tenants'];
//     if (publicEndpoints.some(url => originalRequest.url.includes(url))) {
//       return Promise.reject(error);
//     }
    
//     // Only handle 401 errors for non-refresh endpoints
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       originalRequest._retry = true;
      
//       // If we're already refreshing, add to queue
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         }).catch(err => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         // Call refresh endpoint WITHOUT using the interceptor
//         const refreshRes = await axios.post(
//           'https://apmt.apivcm.shop/api/auth/refresh', 
//           {},
//           { 
//             withCredentials: true,
//             // Don't retry refresh calls if they fail
//             validateStatus: status => status < 500
//           }
//         );

//         if (refreshRes.status === 200 && refreshRes.data?.accessToken) {
//           const newAccess = refreshRes.data.accessToken;
          
//           localStorage.setItem('accessToken', newAccess);
//           sessionStorage.setItem('accessToken', newAccess);

//           api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
//           originalRequest.headers.Authorization = `Bearer ${newAccess}`;

//           processQueue(null, newAccess);
//           return api(originalRequest);
//         } else {
//           // Refresh failed - clear tokens and redirect to login
//           throw new Error('Refresh failed');
//         }
        
//       } catch (refreshErr) {
//         localStorage.removeItem('accessToken');
//         sessionStorage.removeItem('accessToken');
//         delete api.defaults.headers.common.Authorization;

//         processQueue(refreshErr, null);

//         if (typeof window !== 'undefined') {
//           window.location.href = '/login?session=expired';
//         }

//         return Promise.reject(refreshErr);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     // For 429 errors, show rate limit message
//     if (error.response && error.response.status === 429) {
//       console.error('Rate limited. Please wait before trying again.');
//     }
    
//     return Promise.reject(error);
//   }
// );


// export default api;

// api/axios.js
// import axios from 'axios';

// const api = axios.create({
//   baseURL: 'https://apmt.apivcm.shop/api',
//   withCredentials: true,
// });

// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach(prom => {
//     if (error) {
//       prom.reject(error);
//     } else {
//       prom.resolve(token);
//     }
//   });
//   failedQueue = [];
// };

// // Attach Authorization header from storage if present
// api.interceptors.request.use((config) => {
//   try {
//     const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
//     if (token) {
//       config.headers = config.headers || {};
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//   } catch (e) { /* ignore storage errors */ }
//   return config;
// }, (err) => Promise.reject(err));

// api.interceptors.response.use(
//   (res) => res,
//   async (error) => {
//     const originalRequest = error.config;
    
//     // Get the relative path from the URL
//     const requestUrl = originalRequest.url || '';
    
//     // SKIP INTERCEPTOR FOR PUBLIC ENDPOINTS
//     const publicEndpoints = [
//       '/auth/register',
//       '/auth/verify',
//       '/auth/resend',
//       '/auth/login-unified',
//       '/auth/refresh',
//       '/auth/forgot-password-unified',
//       '/auth/reset-password-unified',
//       '/auth/check-reset-token',
//       '/auth/verify-invite-link',
//       '/auth/complete-registration',  
//       '/countries'
//     ];
    
//     // Check if this is a public endpoint
//     const isPublicEndpoint = publicEndpoints.some(url => {
//       // Check if the request URL contains the public endpoint
//       // This handles both full URLs and relative paths
//       return requestUrl.includes(url) || 
//              originalRequest.baseURL?.includes('api') && requestUrl === url;
//     });
    
//     // DEBUG: Log what's happening
//     console.log('Interceptor check:', {
//       url: requestUrl,
//       baseURL: originalRequest.baseURL,
//       fullUrl: `${originalRequest.baseURL}${requestUrl}`,
//       isPublicEndpoint,
//       status: error.response?.status
//     });
    
//     // If it's a public endpoint, don't try to refresh
//     if (isPublicEndpoint) {
//       console.log('Skipping interceptor for public endpoint:', requestUrl);
//       return Promise.reject(error);
//     }
    
//     // Only handle 401 errors for non-public endpoints
//     if (error.response && error.response.status === 401 && !originalRequest._retry) {
//       console.log('Handling 401 for protected endpoint:', requestUrl);
//       originalRequest._retry = true;
      
//       // If we're already refreshing, add to queue
//       if (isRefreshing) {
//         return new Promise((resolve, reject) => {
//           failedQueue.push({ resolve, reject });
//         }).then(token => {
//           originalRequest.headers.Authorization = `Bearer ${token}`;
//           return api(originalRequest);
//         }).catch(err => Promise.reject(err));
//       }

//       isRefreshing = true;

//       try {
//         // Call refresh endpoint WITHOUT using the interceptor
//         const refreshRes = await axios.post(
//           'https://apmt.apivcm.shop/api/auth/refresh', 
//           {},
//           { 
//             withCredentials: true,
//             // Don't retry refresh calls if they fail
//             validateStatus: status => status < 500
//           }
//         );

//         if (refreshRes.status === 200 && refreshRes.data?.accessToken) {
//           const newAccess = refreshRes.data.accessToken;
          
//           localStorage.setItem('accessToken', newAccess);
//           sessionStorage.setItem('accessToken', newAccess);

//           api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
//           originalRequest.headers.Authorization = `Bearer ${newAccess}`;

//           processQueue(null, newAccess);
//           return api(originalRequest);
//         } else {
//           // Refresh failed - clear tokens
//           throw new Error('Refresh failed');
//         }
        
//       } catch (refreshErr) {
//         localStorage.removeItem('accessToken');
//         sessionStorage.removeItem('accessToken');
//         delete api.defaults.headers.common.Authorization;

//         processQueue(refreshErr, null);

//         if (typeof window !== 'undefined') {
//           window.location.href = '/login?session=expired';
//         }

//         return Promise.reject(refreshErr);
//       } finally {
//         isRefreshing = false;
//       }
//     }
    
//     // For 429 errors, show rate limit message
//     if (error.response && error.response.status === 429) {
//       console.error('Rate limited. Please wait before trying again.');
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;

// api/axios.js - Updated version
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://apmt.apivcm.shop/api',
  // baseURL: 'http://localhost:2500/api',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};


// Attach Authorization header from storage if present, but NOT for public endpoints
api.interceptors.request.use((config) => {
  // List of endpoints that should NOT have Authorization header
  const publicEndpoints = [
    '/auth/register',
    '/auth/login-unified',
    '/auth/refresh',
    '/tenants',
    '/countries',
    '/auth/verify',
    '/auth/resend',
    '/auth/forgot-password-unified',
    '/auth/reset-password-unified',
    '/auth/check-reset-token',
    '/auth/verify-invite-link',
    '/auth/complete-registration'
  ];
  const url = config.url || '';
  const isPublic = publicEndpoints.some(endpoint => {
    // match against relative path and full url
    if (!url) return false;
    return url.includes(endpoint) || (config.baseURL && (config.baseURL + url).includes(endpoint));
  });

  if (isPublic) {
    // Do not send cookies or Authorization header for public endpoints
    config.withCredentials = false;
    if (config.headers && config.headers.Authorization) delete config.headers.Authorization;
    return config;
  }

  // Protected endpoint: attach token and allow credentials
  try {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    // ensure cookies are sent for protected endpoints
    config.withCredentials = true;
  } catch (e) {
    /* ignore storage errors */
  }
  return config;
}, (err) => Promise.reject(err));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    
    // Get the relative path from the URL
    const requestUrl = originalRequest.url || '';
    
    // FIXED: Define which endpoints should skip token refresh
    const skipRefreshForEndpoints = [
      '/auth/register',         // User registration
      '/auth/login-unified',    // Login
      '/auth/refresh',          // Refresh itself
      '/tenants',               // Company registration (doesn't need auth)
      '/countries'              // Public data
    ];
    
    // Check if this endpoint should skip token refresh attempts
    const shouldSkipRefresh = skipRefreshForEndpoints.some(url => {
      return requestUrl.includes(url);
    });
    
    // DEBUG: Log what's happening
    //console.log('Interceptor check:', {
      // url: requestUrl,
      // shouldSkipRefresh,
      // status: error.response?.status
    //});
    
    // For registration/login endpoints, don't try to refresh
    if (shouldSkipRefresh) {
      //console.log('Skipping token refresh for endpoint:', requestUrl);
      return Promise.reject(error);
    }
    
    // Handle auth errors (401 and some 403 cases) for endpoints that need auth
    const statusCode = error.response?.status;
    const requiresLoginFlag = error.response?.data?.requiresLogin;

    if ((requiresLoginFlag || (statusCode === 401) || (statusCode === 403)) && !originalRequest._retry) {
      //console.log('Attempting token refresh for protected endpoint:', requestUrl);
      originalRequest._retry = true;
      
      // If we're already refreshing, add to queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // Call refresh endpoint
        const refreshRes = await axios.post(
          'https://apmt.apivcm.shop/api/auth/refresh', 
          {},
          { 
            withCredentials: true,
            // Don't retry refresh calls if they fail
            validateStatus: status => status < 500
          }
        );

        if (refreshRes.status === 200 && refreshRes.data?.accessToken) {
          const newAccess = refreshRes.data.accessToken;
          
          // Store the new token
          localStorage.setItem('accessToken', newAccess);
          sessionStorage.setItem('accessToken', newAccess);

          // Update headers
          api.defaults.headers.common.Authorization = `Bearer ${newAccess}`;
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;

          processQueue(null, newAccess);
          return api(originalRequest);
        } else {
          // Refresh failed - clear tokens
          throw new Error('Refresh failed');
        }
        
      } catch (refreshErr) {
        console.log('Token refresh failed, clearing tokens');
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
        delete api.defaults.headers.common.Authorization;

        processQueue(refreshErr, null);

        // Only redirect to login for authenticated endpoints
        if (typeof window !== 'undefined') {
          window.location.href = '/login?session=expired';
        }

        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    
    // If backend explicitly asks client to re-authenticate, clear tokens and redirect
    if (error.response && error.response.data && error.response.data.requiresLogin) {
      try { localStorage.removeItem('accessToken'); sessionStorage.removeItem('accessToken'); } catch(e){}
      delete api.defaults.headers.common.Authorization;
      if (typeof window !== 'undefined') window.location.href = '/login?session=expired';
      return Promise.reject(error);
    }

    // For 429 errors, show rate limit message
    if (error.response && error.response.status === 429) {
      console.error('Rate limited. Please wait before trying again.');
    }
    
    return Promise.reject(error);
  }
);

export default api;