import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function TOTPVerify() {
    const { totpData, loginComplete, logout } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSecret, setShowSecret] = useState(false);
    const [devCode, setDevCode] = useState(null);

    // Fetch the current code for easy demo
    useEffect(() => {
        if (totpData?.email) {
            axios.get(`/api/auth/current-code/${totpData.email}`)
                .then((r) => setDevCode(r.data))
                .catch(() => { });
        }
    }, [totpData?.email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post('/api/auth/verify-totp', {
                email: totpData.email,
                code,
            });
            loginComplete(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    // Auto-fill for quick demo
    const handleAutoFill = () => {
        if (devCode?.code) {
            setCode(devCode.code);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card auth-card--totp">
                <div className="auth-card__header">
                    <div className="auth-logo">
                        <div className="auth-logo__icon">🔐</div>
                        <h1>Two-Factor Authentication</h1>
                    </div>
                    <p className="auth-card__subtitle">
                        Welcome, <strong>{totpData?.name}</strong>. Verify your identity with Google Authenticator.
                    </p>
                </div>

                <div className="totp-setup">
                    <div className="totp-qr">
                        <p className="totp-qr__label">1. Scan this QR code with Google Authenticator</p>
                        {totpData?.qr_code && (
                            <img src={totpData.qr_code} alt="TOTP QR Code" className="totp-qr__image" />
                        )}
                    </div>

                    <div className="totp-secret-toggle">
                        <button
                            type="button"
                            className="btn btn--outline"
                            onClick={() => setShowSecret(!showSecret)}
                        >
                            {showSecret ? 'Hide' : 'Show'} Manual Setup Key
                        </button>
                        {showSecret && (
                            <code className="totp-secret-code">{totpData?.totp_secret}</code>
                        )}
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="auth-form__group">
                        <label htmlFor="totp-code">2. Enter the 6-digit code</label>
                        <input
                            id="totp-code"
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]{6}"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000000"
                            required
                            autoFocus
                            className="totp-input"
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="btn btn--primary auth-btn" disabled={loading || code.length !== 6}>
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                </form>

                <div className="auth-card__footer">
                    {devCode && (
                        <div className="totp-dev-helper">
                            <p>🧪 Demo Helper</p>
                            <button type="button" className="btn btn--outline" onClick={handleAutoFill}>
                                Auto-fill code: <strong>{devCode.code}</strong>
                            </button>
                        </div>
                    )}
                    <button type="button" className="btn btn--outline" onClick={logout} style={{ marginTop: 'var(--space-3)' }}>
                        ← Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}
