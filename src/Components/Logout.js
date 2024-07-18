
import React from 'react';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import '../style.css'; // Import style.css for component styling

const Logout = () => {
    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('Logout successful!');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <div className="container">
            <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
    );
};

export default Logout;
