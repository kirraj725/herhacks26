import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { getFraudAlerts } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function FraudHighConfidence() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFraudAlerts()
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Loading high confidence alerts...</div>;
    }

    const highConfAlerts = (data?.alerts || []).filter((a) => a.confidence_score >= 0.8);

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
                    <h1>High Confidence Alerts</h1>
                    <p>{highConfAlerts.length} alerts with ≥80% confidence</p>
                </div>
            </div>

            <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
                <div className="card__header">
                    <h3>How This Is Calculated</h3>
                </div>
                <div style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7 }}>
                        The <strong>High Confidence</strong> count includes only alerts with a confidence score of <strong>80% or higher</strong>. Confidence scores are calculated based on:
                    </p>
                    <ul style={{ color: 'var(--color-text-secondary)', lineHeight: 1.8, marginTop: 'var(--space-3)', paddingLeft: 'var(--space-5)' }}>
                        <li><strong>Duplicate Refunds</strong> — base confidence of 50%, plus 15% for each additional duplicate (e.g., 2 duplicates = 80%, 3 = 95%)</li>
                        <li><strong>Repeated Chargebacks</strong> — base confidence of 60%, plus 10% per additional chargeback (e.g., 2 chargebacks = 80%, 3 = 90%)</li>
                        <li><strong>Unusual Refund Amounts</strong> — confidence equals 30% × the Z-score deviation (e.g., a 3σ outlier = 90% confidence)</li>
                    </ul>
                    <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.7, marginTop: 'var(--space-3)' }}>
                        All confidence scores are capped at 95%. High confidence alerts are the most actionable and should be investigated first.
                    </p>
                </div>
            </div>

            <div className="card">
                <div className="card__header">
                    <h3>High Confidence Transactions</h3>
                    <span className="badge">{highConfAlerts.length} alerts</span>
                </div>
                <DataTable columns={columns} rows={highConfAlerts} />
            </div>
        </div>
    );
}
