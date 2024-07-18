import React from 'react';
import { Link } from 'react-router-dom';
import '../style.css'; // Assuming you have a separate CSS file

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <img src="/grocery-logo.jpg" alt="Grocery Store Logo" className="logo-img" />
                <h1>GRAB GROCERY STORE</h1>
            </div>
            <ul className="navbar-links">
                <li><Link to="/shopping-list">Shopping List</Link></li>
                <li><Link to="/recipe">Recipe</Link></li>
                <li><Link to="/inventory">Inventory</Link></li>
                <li><Link to="/budget">Budget</Link></li>
                <li><Link to="/price-comparison">Price Comparison</Link></li>
                <li><Link to="/login">Login</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
