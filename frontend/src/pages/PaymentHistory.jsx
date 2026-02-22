import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

export default function PaymentHistory() {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/plans/${accountId}/history`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load history'))
            .finally(() => setLoading(false));
    }, [accountId]);

    if (loading) return <div className="loading"><div className="loading__spinner"></div>Loading payment history...</div>;
    if (error) return (
        <div className="page">
            <div className="auth-error" style={{ maxWidth: 500, margin: '2rem auto' }}>{error}</div>
            <button className="btn btn--outline" onClick={() => navigate('/plans')} style={{ margin: '1rem auto', display: 'block' }}>
                ← Back to Payment Plans
            </button>
        </div>
    );

    const columns = data?.columns || [];
    const currencyKeys = columns.filter((c) => c.toLowerCase().includes('amount') || c.toLowerCase().includes('balance'));

    return (
        <div className="page page--payment-history">
            <div className="csv-viewer__header">
                <button className="btn btn--outline" onClick={() => navigate('/plans')}>
                    ← Back to Payment Plans
                </button>
                <div>
                    <h1>Payment History — {accountId}</h1>
                    <p>{data?.total || 0} payment records</p>
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
                            {(data?.payments || []).length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-secondary)' }}>
                                        No payment records found for {accountId}
                                    </td>
                                </tr>
                            ) : (
                                data.payments.map((row, i) => (
                                    <tr key={i}>
                                        {columns.map((col) => (
                                            <td key={col}>
                                                {currencyKeys.includes(col)
                                                    ? formatCurrency(row[col])
                                                    : String(row[col] ?? '')}
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
