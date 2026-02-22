import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [authStep, setAuthStep] = useState('login'); // 'login' | 'totp' | 'authenticated'
    const [totpData, setTotpData] = useState(null);

    const loginStep1 = useCallback((data) => {
        setTotpData(data);
        setAuthStep('totp');
    }, []);

    const loginComplete = useCallback((userData) => {
        setUser(userData);
        setAuthStep('authenticated');
        setTotpData(null);
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setAuthStep('login');
        setTotpData(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, authStep, totpData, loginStep1, loginComplete, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
