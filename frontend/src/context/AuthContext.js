import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 1. Add a loading state (starts as true so the app waits)
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authService.getProfile(token)
        .then((res) => {
          setUser(res.data.user);
        })
        .catch((err) => {
          console.error("Session expired", err);
          localStorage.removeItem('token');
          setUser(null);
        })
        .finally(() => {
          // 2. Tell the app we are done checking, regardless of success or fail
          setLoading(false); 
        });
    } else {
      // 3. If no token at all, stop loading immediately
      setLoading(false); 
    }
  }, []);

  // --- DEMO FUNCTIONS FOR CA2 PRESENTATION ---
  const loginAs = (rolesArray) => {
    // 1. Destroy any real backend tokens hiding in the browser!
    localStorage.removeItem('token');
    
    // 2. Set the fake user (using 'role' so it perfectly matches the backend format)
    setUser({ 
      name: 'CA2 Demo Tester', 
      email: 'demo@shareplate.com',
      role: rolesArray, 
      verificationStatus: 'Verified' 
    });
  };

  // --- STANDARD LOGOUT ---
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

return (
    // 4. Pass the loading state down to the rest of the app
    <AuthContext.Provider value={{ user, setUser, loading, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use this context in other files
export const useAuth = () => useContext(AuthContext);