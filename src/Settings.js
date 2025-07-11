import React, { useState } from 'react';

export default function Settings({ user, onUpdateUser, onLogout }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        darkMode: user?.preferences?.darkMode !== false
    });

    const handleSave = () => {
        const updatedUser = {
            ...user,
            name: formData.name,
            email: formData.email,
            preferences: {
                ...user?.preferences,
                darkMode: formData.darkMode
            }
        };
        
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        onUpdateUser(updatedUser);
        alert('Settings saved!');
    };

    const handleDeleteAccount = () => {
        if (window.confirm('Are you sure you want to delete your account? This will remove all your data.')) {
            localStorage.clear();
            onLogout();
        }
    };

    return (
        <div className="settings-container">
            <h2>Settings</h2>
            
            <div className="settings-section">
                <h3>Profile</h3>
                <div className="form-group">
                    <label>Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            <div className="settings-section">
                <h3>Preferences</h3>
                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.darkMode}
                            onChange={(e) => setFormData({...formData, darkMode: e.target.checked})}
                        />
                        Dark Mode
                    </label>
                </div>
            </div>

            <div className="button-group">
                <button className="save-button" onClick={handleSave}>
                    Save Changes
                </button>
                <button className="delete-button" onClick={handleDeleteAccount}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}