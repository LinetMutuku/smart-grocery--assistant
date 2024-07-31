import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, googleProvider } from '../firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../style.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { setUser } = useAuth();

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setUser(userCredential.user);
            toast.success('Logged in successfully!');
            navigate('/shopping-list');
        } catch (err) {
            console.error('Login error:', err.code, err.message);
            const errorMessage = err.code === 'auth/invalid-credential'
                ? 'Invalid email or password. Please try again.'
                : err.message || 'Failed to log in';
            setError(errorMessage);
            toast.error(errorMessage);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            setUser(result.user);
            toast.success('Logged in successfully with Google!');
            navigate('/shopping-list');
        } catch (err) {
            console.error('Google login error:', err);
            if (err.code === 'auth/popup-closed-by-user') {
                toast.info('Google sign-in was cancelled. Please try again if you want to sign in with Google.');
            } else {
                setError(err.message);
                toast.error(err.message);
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleEmailLogin}>
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
                <button type="submit" className="email-login-button">Login with Email</button>
            </form>
            <div className="separator">
                <span>or</span>
            </div>
            <button onClick={handleGoogleLogin} className="google-signin-button">
                <img src="/google-logo.png" alt="Continue with Google" className="google-signin-image"/>
            </button>
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
        </div>
    );
};

export default Login;