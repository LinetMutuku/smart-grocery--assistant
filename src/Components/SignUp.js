import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db, googleProvider } from '../firebaseConfig';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import toast from 'react-hot-toast';
import "../style.css";

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleEmailSignUp = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await set(ref(db, 'users/' + user.uid), {
                email: user.email,
            });

            toast.success('Account created successfully!');
            navigate('/login');
        } catch (err) {
            console.error('Signup error:', err.code, err.message);
            const errorMessage = err.code === 'auth/email-already-in-use'
                ? 'Email already in use. Please use a different email.'
                : err.message || 'Failed to create an account';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleGoogleSignUp = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            await set(ref(db, 'users/' + user.uid), {
                email: user.email,
            });

            toast.success('Signed up successfully with Google!');
            navigate('/shopping-list');
        } catch (err) {
            console.error('Google signup error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                toast.info('Google sign-up was cancelled. Please try again if you want to sign up with Google.');
            } else {
                setError(err.message);
                toast.error(err.message);
            }
        }
    };

    return (
        <div className="signup-container">
            <h2>Sign Up</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleEmailSignUp}>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                />
                <div className="password-input-container">
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        required
                        minLength="6"
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                    </button>
                </div>
                <button type="submit" className="email-signup-button">Sign Up with Email</button>
            </form>
            <div className="separator">
                <span>or</span>
            </div>
            <button onClick={handleGoogleSignUp} className="google-signup-button">
                <img src="/google-logo.png" alt="Continue with Google" className="google-signin-image"/>
            </button>
            <p>Already have an account? <Link to="/login">Log in</Link></p>
        </div>
    );
};

export default SignUp;