import React, { useState } from 'react';
// import { api } from './utils/supabase';

export default function Auth({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!email || !password) return;

        // Get existing users from localStorage
        const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (isLogin) {
            // Login: Check if user exists and password matches
            const user = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (!user) {
                alert(`Email "${email}" not registered. Please sign up first.`);
                return;
            }
            if (user.password !== password) {
                alert('Incorrect password.');
                return;
            }
            
            // Login successful
            const userData = {
                email: user.email,
                name: user.name,
                preferences: user.preferences || { darkMode: true }
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            onLogin(userData);
        } else {
            // Sign up: Check if user already exists
            const userExists = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (userExists) {
                alert('Email already registered. Please login instead.');
                return;
            }
            
            // Register new user
            const newUser = {
                email: email.toLowerCase(),
                password,
                name: name || email,
                joinDate: new Date().toISOString(),
                preferences: { 
                    darkMode: true,
                    language: 'English',
                    timezone: 'AEST',
                    emailNotifications: true
                }
            };
            
            existingUsers.push(newUser);
            localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
            
            // Auto login after signup
            const userData = {
                email: newUser.email,
                name: newUser.name,
                preferences: newUser.preferences
            };
            localStorage.setItem('currentUser', JSON.stringify(userData));
            onLogin(userData);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    )}
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <div className="password-input-container">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                    <button type="submit">
                        {isLogin ? 'Login' : 'Sign Up'}
                    </button>
                </form>
                <p>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                </p>
            </div>
        </div>
    );
}