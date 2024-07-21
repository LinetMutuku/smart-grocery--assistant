import React from 'react';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
    const { user } = useAuth();

    if (!user) {
        return <div>Loading...</div>;
    }

    // Assuming you store role information in the user object or Firebase Database
    const isAdmin = user.email === 'linetmukai9@gmail.com'; // Simplified check

    return isAdmin ? (
        <div>
            <h1>Admin Page</h1>
            <p>Welcome, {user.email}</p>
        </div>
    ) : (
        <p>Access Denied</p>
    );
};

export default Admin;
