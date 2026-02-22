import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import axios from 'axios';
import { formatCurrency } from '../utils/formatters';

export default function DepartmentDetail() {
    const [searchParams] = useSearchParams();
    const department = searchParams.get('name') || '';
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/anomaly/department?name=${encodeURIComponent(department)}`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load department'))
            .finally(() => setLoading(false));
    }, [department]);

    if (loading) return <div className="loading"><div className="loading__spinner"></div>Loading {department} details...</div>;
    if (error) return (
        <div className="page">
            <div className="auth-error" style={{ maxWidth: 500, margin: '2rem auto' }}>{error}</div>
            <button className="btn btn--outline" onClick={() => navigate('/anomalies')} style={{ margin: '1rem auto', display: 'block' }}>
                ← Back to Anomaly Monitor
            </button>
        </div>
    );

    const summary = data?.summary || {};
    const severityColor = (s) => {
        if (s === 'critical') return { background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' };
        if (s === 'warning') return { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' };
        return { background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' };
    };
    const cfg = severityColor(summary.severity);

    const columns = [
        { key: 'account_id', label: 'Account ID' },
        { key: 'patient_balance', label: 'Balance', render: (v) => formatCurrency(v) },
        { key: 'total_charges', label: 'Total Charges', render: (v) => formatCurrency(v) },
        { key: 'days_past_due', label: 'Days Past Due' },
        { key: 'payer_type', label: 'Payer Type' },
        { key: 'historical_late_payments_12m', label: 'Late Payments (12m)' },
    ];

    return (
        <div className="page page--dept-detail">
            <div className="csv-viewer__header">
                <button className="btn btn--outline" onClick={() => navigate('/anomalies')}>
                    ← Back to Anomaly Monitor
                </button>
                <div>
                    <h1>{department}</h1>
                    <p>{data?.total_accounts || 0} accounts</p>
                </div>
            </div>

            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Risk Score</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700, color: cfg.color }}>{summary.risk_score}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Severity</div>
                    <span style={{ padding: '4px 14px', borderRadius: '12px', fontWeight: 600, textTransform: 'capitalize', ...cfg }}>
                        {summary.severity}
                    </span>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Total at Risk</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{formatCurrency(summary.total_at_risk)}</div>
                </div>
                <div className="card" style={{ padding: 'var(--space-5)', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>Avg DPD</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{summary.avg_days_past_due} days</div>
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <h3>Accounts in {department}</h3>
                    <span className="badge">{data?.total_accounts || 0} accounts</span>
                </div>
                <DataTable columns={columns} rows={data?.accounts || []} />
            </div>
        </div>
    );
}
