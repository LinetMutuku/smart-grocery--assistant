import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Components/Navbar';
import ShoppingList from './Components/ShoppingList';
import Recipe from './Components/Recipe';
import Inventory from './Components/Inventory';
import Budget from './Components/Budget';
import PriceComparison from './Components/PriceComparison';
import SignUp from './Components/SignUp';
import Login from './Components/Login';
import './style.css';

const App = () => {
    return (
        <Router>
            <div className="app">
                <Navbar />
                <Routes>
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/shopping-list" element={<ShoppingList />} />
                    <Route path="/recipe" element={<Recipe />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/budget" element={<Budget />} />
                    <Route path="/price-comparison" element={<PriceComparison />} />
                    <Route path="*" element={
                        <div>
                            <h2>Welcome to Smart Grocery Assistant</h2>
                            <p>Select a section from the navigation bar to get started.</p>
                        </div>
                    } />
                </Routes>
                <Toaster />
            </div>
        </Router>
    );
};

export default App;
