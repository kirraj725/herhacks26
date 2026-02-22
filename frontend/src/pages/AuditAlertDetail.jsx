import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AuditAlertDetail() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/audit/user/${userId}`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load user activity'))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <div className="loading"><div className="loading__spinner"></div>Loading activity for {userId}...</div>;
    if (error) return (
        <div className="page">
            <div className="auth-error" style={{ maxWidth: 500, margin: '2rem auto' }}>{error}</div>
            <button className="btn btn--outline" onClick={() => navigate('/audit')} style={{ margin: '1rem auto', display: 'block' }}>
                ← Back to Audit & Security
            </button>
        </div>
    );

    const columns = data?.columns || [];

    return (
        <div className="page page--audit-detail">
            <div className="csv-viewer__header">
                <button className="btn btn--outline" onClick={() => navigate('/audit')}>
                    ← Back to Audit & Security
                </button>
                <div>
                    <h1>User Activity — {userId}</h1>
                    <p>{data?.total || 0} log entries</p>
                </div>
            </div>

            <div className="card">
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col}>{col.replace(/_/g, ' ').toUpperCase()}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {(data?.logs || []).length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                        No activity found for {userId}
                                    </td>
                                </tr>
                            ) : (
                                data.logs.map((row, i) => (
                                    <tr key={i}>
                                        {columns.map((col) => (
                                            <td key={col}>
                                                {col === 'action' ? (
                                                    <span style={{
                                                        color: row[col] === 'export' ? 'var(--color-warning)' : row[col] === 'approve_refund' ? 'var(--color-danger)' : 'var(--color-text-primary)',
                                                        fontWeight: 600,
                                                    }}>
                                                        {row[col]}
                                                    </span>
                                                ) : String(row[col] ?? '')}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
