import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Components/Navbar';
import ShoppingList from './Components/ShoppingList';
import Recipe from './Components/Recipe';
import Inventory from './Components/Inventory';
import Budget from './Components/Budget';
import PriceComparison from './Components/PriceComparison';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import './style.css';

const ProtectedRouteWrapper = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    return children;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <div className="app">
                    <Navbar />
                    <Routes>
                        <Route path="/signup" element={<SignUp />} />
                        <Route path="/" element={<Login />} />
                        <Route path="/shopping-list" element={
                            <ProtectedRouteWrapper>
                                <ShoppingList />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="/recipe" element={
                            <ProtectedRouteWrapper>
                                <Recipe />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="/inventory" element={
                            <ProtectedRouteWrapper>
                                <Inventory />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="/budget" element={
                            <ProtectedRouteWrapper>
                                <Budget />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="/price-comparison" element={
                            <ProtectedRouteWrapper>
                                <PriceComparison />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="/shoppinglist" element={
                            <ProtectedRouteWrapper>
                                <Navigate to="/shopping-list" />
                            </ProtectedRouteWrapper>
                        } />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                    <Toaster />
                </div>
            </Router>
        </AuthProvider>
    );
};

export default App;