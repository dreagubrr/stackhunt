import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('stackhunt_user') || sessionStorage.getItem('stackhunt_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [githubValidatedSkills, setGithubValidatedSkills] = useState([]);

  const login = (userData, remember = true) => {
    if (remember) {
      localStorage.setItem('stackhunt_user', JSON.stringify(userData));
      sessionStorage.removeItem('stackhunt_user');
    } else {
      sessionStorage.setItem('stackhunt_user', JSON.stringify(userData));
      localStorage.removeItem('stackhunt_user');
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('stackhunt_user');
    sessionStorage.removeItem('stackhunt_user');
    setUser(null);
    setGithubValidatedSkills([]);
  };

  const updateUser = (fields) => {
    if (!user) return;
    const updated = { ...user, ...fields };
    if (localStorage.getItem('stackhunt_user')) {
      localStorage.setItem('stackhunt_user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('stackhunt_user', JSON.stringify(updated));
    }
    setUser(updated);
  };

  const updateSavedJobs = (savedJobs) => {
    if (!user) return;
    const updated = { ...user, savedJobs };
    if (localStorage.getItem('stackhunt_user')) {
      localStorage.setItem('stackhunt_user', JSON.stringify(updated));
    } else {
      sessionStorage.setItem('stackhunt_user', JSON.stringify(updated));
    }
    setUser(updated);
  };

  const updateGithubValidatedSkills = (validatedSkills) => {
    const validated = validatedSkills
      .filter(s => s.validated)
      .map(s => s.skill);
    setGithubValidatedSkills(validated);
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout, updateSavedJobs, updateUser,
      githubValidatedSkills, updateGithubValidatedSkills,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);