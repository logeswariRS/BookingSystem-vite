// Adjusted React SignUpPage Component
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignupPage.css'; // Ensure you have the necessary CSS for styling

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const navigate = useNavigate();

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

   
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate passwords match
        if (formData.password === formData.confirmPassword) {
            try {
                // Store user data in localStorage (demo purposes)
                const users = JSON.parse(localStorage.getItem('users') || '[]');
                
                // Check if email already exists
                const emailExists = users.some(user => user.email === formData.email);
                if (emailExists) {
                    alert('This email is already registered. Please use a different email.');
                    return;
                }
                
                // Add new user
                users.push({
                    id: Date.now(),
                    name: formData.name,
                    email: formData.email,
                    password: formData.password // Note: Never store plain passwords in production!
                });
                
                // Save to localStorage
                localStorage.setItem('users', JSON.stringify(users));
                
                // Set current user as logged in
                localStorage.setItem('userToken', JSON.stringify({
                    id: users[users.length - 1].id,
                    name: formData.name,
                    email: formData.email
                }));
                
                alert('User registered successfully!');
                navigate('/dashboard');
            } catch (error) {
                alert('There was an error registering the user. Please try again later.');
                console.error('Error registering the user:', error);
            }
            
        } else {
            alert("Passwords don't match!");
        }
    };

    // Navigate to login page
    const navigateToLogin = () => {
        navigate('/login');
    };

    return (
        <div className="signup-container">
            <div className="signup-box">
                <h2>Sign Up</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="Enter your name"
                        />
                    </div>
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
                    <div className="input-field">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button type="submit" className="signup-button">Sign Up</button>
                </form>
                <div className="login-link">
                    <p>Already have an account?</p>
                    <button onClick={navigateToLogin} className="login-button">Login</button>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;

