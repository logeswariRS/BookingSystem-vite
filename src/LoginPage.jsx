import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Get users from localStorage
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Find user by email and password
            const user = users.find(u => u.email === formData.email && u.password === formData.password);
            
            if (user) {
                // Set current user as logged in
                localStorage.setItem('userToken', JSON.stringify({
                    id: user.id,
                    name: user.name,
                    email: user.email
                }));
                
                alert('Login successful!');
                navigate('/dashboard'); // Redirect to dashboard after successful login
            } else {
                setError('Invalid email or password');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="login-containerr">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="input-field">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="login-buttonn">Login</button>
                </form>
                <div className="signup-link">
                    <p>Don't have an account?</p>
                    <button type="button" onClick={() => navigate('/signup')}>
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;


