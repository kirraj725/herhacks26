import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Login() {
    const { loginStep1 } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/login', { email, password });
            loginStep1(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-card__header">
                    <div className="auth-logo">
                        <div className="auth-logo__icon">V</div>
                        <h1>Valentis</h1>
                    </div>
                    <p className="auth-card__subtitle">Hospital Revenue & Payment Risk Intelligence</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form__group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="auditor@hospital.org"
                            required
                            autoFocus
                        />
                    </div>

                    <div className="auth-form__group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="btn btn--primary auth-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-card__footer">
                    <p>Demo Credentials</p>
                    <div className="auth-demo-creds">
                        <code>auditor@hospital.org / Auditor2024!</code>
                    </div>
                </div>
            </div>
        </div>
    );
}
