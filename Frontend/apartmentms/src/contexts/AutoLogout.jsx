import { useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const AutoLogout = () => {
  const { updateActivity } = useContext(AuthContext);

  useEffect(() => {
    // Set up periodic activity updates (every 30 seconds) to catch missed events
    const interval = setInterval(() => {
      updateActivity();
    }, 30000);

    // Additional event listeners for better coverage
    const events = [
      'resize',
      'focus',
      'blur',
      'load',
      'beforeunload',
      'pageshow',
      'pagehide'
    ];

    const handleActivity = () => {
      updateActivity();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    // Network activity detection
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      updateActivity();
      return originalFetch.apply(this, args);
    };

    return () => {
      clearInterval(interval);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      window.fetch = originalFetch;
    };
  }, [updateActivity]);

  return null;
};

export default AutoLogout;