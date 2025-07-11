import React, { useState } from 'react';

export default function Settings({ user, onUpdateUser, onLogout }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        darkMode: user?.preferences?.darkMode !== false,
        language: user?.preferences?.language || 'English',
        timezone: user?.preferences?.timezone || 'AEST',
        emailNotifications: user?.preferences?.emailNotifications !== false
    });

    const getMemberSince = () => {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const currentUser = registeredUsers.find(u => u.email === user?.email);
        if (currentUser?.joinDate) {
            return new Date(currentUser.joinDate).toLocaleDateString();
        }
        return new Date().toLocaleDateString();
    };

    const handleSave = () => {
        const updatedUser = {
            ...user,
            name: formData.name,
            email: formData.email,
            preferences: {
                ...user?.preferences,
                darkMode: formData.darkMode,
                language: formData.language,
                timezone: formData.timezone,
                emailNotifications: formData.emailNotifications
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
                <h3>Profile Information</h3>
                <div className="form-group">
                    <label>Full Name</label>
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
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                </div>
                <div className="form-group">
                    <label>Member Since</label>
                    <input
                        type="text"
                        value={getMemberSince()}
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                </div>
            </div>

            <div className="settings-section">
                <h3>Preferences</h3>
                <div className="form-group">
                    <label>Dark/Light Mode</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={formData.darkMode}
                            onChange={(e) => setFormData({...formData, darkMode: e.target.checked})}
                        />
                        <span>Use dark theme throughout the app</span>
                    </div>
                </div>
                <div className="form-group">
                    <label>Language</label>
                    <select
                        value={formData.language}
                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                    >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                    </select>
                </div>
                <div className="form-group">
                    <label>Timezone</label>
                    <select
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    >
                        <option value="AEST">AEST (Australian Eastern)</option>
                        <option value="PST">PST (Pacific)</option>
                        <option value="EST">EST (Eastern)</option>
                        <option value="GMT">GMT (Greenwich)</option>
                        <option value="CET">CET (Central European)</option>
                    </select>
                </div>
            </div>

            <div className="settings-section">
                <h3>Notifications</h3>
                <div className="form-group">
                    <label>Email Notifications</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <input
                            type="checkbox"
                            checked={formData.emailNotifications}
                            onChange={(e) => setFormData({...formData, emailNotifications: e.target.checked})}
                        />
                        <span>Receive notifications via email</span>
                    </div>
                </div>
            </div>

            <div className="settings-section">
                <h3>Account Actions</h3>
                <div className="button-group">
                    <button className="save-button" onClick={handleSave}>
                        Save Settings
                    </button>
                    <button className="delete-button" onClick={handleDeleteAccount}>
                        Delete Account
                    </button>
                </div>
            </div>
        </div>
    );
}