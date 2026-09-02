import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from '../components/adminlayout/Layout';
import { getUser } from '../services/authService';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Employees from '../pages/Employees';
import CreateEmployee from '../pages/Employees/Create';
import EmployeeDetails from '../pages/Employees/Details';
import Onboarding from '../pages/Onboarding';
import Roles from '../pages/Roles';

const AdminRoute = () => {
  const user = getUser();
  const isAdmin = user?.role === 'admin' || user?.role?.toLowerCase().includes('admin');
  
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AuthRoute = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const GuestRoute = () => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>
        
        <Route element={<AuthRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/onboarding" element={<Onboarding />} />
            
            <Route element={<AdminRoute />}>
              <Route path="/employees" element={<Employees />} />
              <Route path="/employees/create" element={<CreateEmployee />} />
              <Route path="/employees/:id" element={<EmployeeDetails />} />
              <Route path="/roles" element={<Roles />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;