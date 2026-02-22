import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { getFraudAlerts } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function FraudFlagged() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFraudAlerts()
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Loading flagged transactions...</div>;
    }

    const columns = [
        { key: 'transaction_id', label: 'Transaction ID' },
        { key: 'account_id', label: 'Account' },
        {
            key: 'reason_code', label: 'Reason Code', render: (v) => (
                <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>{v}</span>
            )
        },
        {
            key: 'confidence_score', label: 'Confidence', render: (v) => (
                <div className="confidence-bar">
                    <div className="confidence-bar__track">
                        <div className="confidence-bar__fill" style={{ width: `${v * 100}%` }}></div>
                    </div>
                    <span className="confidence-bar__label">{(v * 100).toFixed(0)}%</span>
                </div>
            )
        },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
        { key: 'description', label: 'Description' },
    ];

    return (
        <div className="page page--fraud-detail">
            <div className="csv-viewer__header">
                <button className="btn btn--outline" onClick={() => navigate('/fraud')}>
                    ← Back to Fraud Alerts
                </button>
                <div>
                    <h1>Total Flagged Transactions</h1>
                    <p>{data?.total_flagged || 0} alerts detected</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card__header">
                    <h3>How This Is Calculated</h3>
                </div>
                <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The <strong>Total Flagged</strong> count represents all transactions identified as suspicious by three detection methods:
                    </p>
                    <ul style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginTop: 'var(--space-3)', paddingLeft: 'var(--space-5)' }}>
                        <li><strong>Duplicate Refund Detection</strong> — flags groups of refunds with the same account and amount appearing 2 or more times</li>
                        <li><strong>Repeated Chargeback Detection</strong> — flags accounts with 2 or more chargebacks, indicating potential abuse</li>
                        <li><strong>Z-Score Anomaly Detection</strong> — flags individual refund amounts that deviate more than 1.5 standard deviations from the mean</li>
                    </ul>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginTop: 'var(--space-3)' }}>
                        Results are de-duplicated by transaction ID. Each alert includes a confidence score that reflects the severity of the anomaly.
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <h3>Flagged Transactions</h3>
                    <span className="badge">{data?.total_flagged || 0} alerts</span>
                </div>
                <DataTable columns={columns} rows={data?.alerts || []} />
            </div>
        </div>
    );
}
