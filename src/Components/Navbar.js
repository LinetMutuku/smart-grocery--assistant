import React from 'react';
import { Link } from 'react-router-dom';
import '../style.css'; // Assuming you have a separate CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <img src="/grocery-logo.jpg" alt="Grocery Store Logo" className="logo-img" />
                    <h1 className="store-name">SMART GROCERY ASSISTANT</h1>
                </div>
                <ul className="navbar-links">
                    <li className="nav-item"><Link to="/shopping-list" className="nav-link">Shopping List</Link></li>
                    <li className="nav-item"><Link to="/recipe" className="nav-link">Recipe</Link></li>
                    <li className="nav-item"><Link to="/inventory" className="nav-link">Inventory</Link></li>
                    <li className="nav-item"><Link to="/budget" className="nav-link">Budget</Link></li>
                    <li className="nav-item"><Link to="/price-comparison" className="nav-link">Price Comparison</Link></li>
                    <li className="nav-item"><Link to="/login" className="nav-link">Login</Link></li>
                    <li className="nav-item"><Link to="/signup" className="nav-link">Signup</Link></li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;