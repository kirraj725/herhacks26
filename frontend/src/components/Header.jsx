import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const titles = {
    '/': { title: 'Revenue Risk Overview' },
    '/fraud': { title: 'Fraud & Refund Alerts' },
    '/anomalies': { title: 'Anomaly Monitor' },
    '/plans': { title: 'Payment Plan Optimizer' },
    '/audit': { title: 'Audit & Security' },
    '/upload': { title: 'Upload Data' },
};

export default function Header() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const basePath = '/' + (location.pathname.split('/')[1] || '');
    const page = titles[basePath] || titles['/'];

    return (
        <header className="header">
            <div className="header__title">
                <h1>{page.title}</h1>
                {page.sub && <p>{page.sub}</p>}
            </div>
            <div className="header__actions">

                <button className="btn btn--outline" onClick={logout}>
                    Logout
                </button>
            </div>
        </header>
    );
}
