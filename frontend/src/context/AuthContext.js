import React, { createContext, useState, useContext } from 'react';

// Create the context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  // state will eventually hold the real user data from Member 1's backend
  // e.g., { name: 'John', role: 'donator' }
  const [user, setUser] = useState(null); 

  // --- DEMO FUNCTIONS FOR CA2 PRESENTATION ---
  const loginAs = (role) => {
    setUser({ name: 'Demo User', role: role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginAs, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily use this context in other files
export const useAuth = () => useContext(AuthContext);