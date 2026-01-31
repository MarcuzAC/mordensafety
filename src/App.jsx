import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Notifications from './pages/Notifications';
import Register from './pages/Register';
import Products from './pages/Products';
import Orders from './pages/Orders';
import Cart from './pages/Cart';
import ServiceRequest from './pages/ServiceRequest';
import MyRequests from './pages/MyRequests';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route path="/cart" element={<Cart />} />
              <Route 
                path="/service-request" 
                element={
                  <ProtectedRoute>
                    <ServiceRequest />
                  </ProtectedRoute>
                } 
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="/my-requests" 
                element={
                  <ProtectedRoute>
                    <MyRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/orders" 
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } 
              />
              
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;