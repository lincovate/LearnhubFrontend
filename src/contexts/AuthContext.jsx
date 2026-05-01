// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.getProfile();
      setUser(response.data);
      setProfileType(response.data.profile_type);
      setProfileData(response.data.profile);
    } catch (error) {
      console.error('Error fetching profile:', error);
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.login(username, password);
      const { access, refresh, user: userData, profile_type, profile_data } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      setUser(userData);
      setProfileType(profile_type);
      setProfileData(profile_data);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
      setProfileType(null);
      setProfileData(null);
    }
  };

  const registerStudent = async (data) => {
    try {
      await api.registerStudent(data);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const registerTeacher = async (data) => {
    try {
      await api.registerTeacher(data);
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.response?.data || 'Registration failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.forgotPassword(email);
      return { success: true };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: error.response?.data?.error || 'Request failed' };
    }
  };

  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      await api.resetPassword(token, newPassword, confirmPassword);
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: error.response?.data?.error || 'Reset failed' };
    }
  };

  const changePassword = async (oldPassword, newPassword, confirmPassword) => {
    try {
      await api.changePassword(oldPassword, newPassword, confirmPassword);
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, error: error.response?.data?.error || 'Change failed' };
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await api.updateProfile(data);
      setUser(response.data.user);
      await fetchUserProfile(); // Refresh profile data
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.response?.data || 'Update failed' };
    }
  };

  const value = {
    user,
    profileType,
    profileData,
    loading,
    error,
    login,
    logout,
    registerStudent,
    registerTeacher,
    forgotPassword,
    resetPassword,
    changePassword,
    updateProfile,
    getProfileType: () => profileType,
    isAuthenticated: !!user,
    isStudent: profileType === 'student',
    isTeacher: profileType === 'teacher',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};