import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import { getAnomalies, getHeatmap } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function AnomalyMonitor() {
    const [anomalies, setAnomalies] = useState(null);
    const [heatmap, setHeatmap] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAnomalies(), getHeatmap()])
            .then(([a, h]) => {
                setAnomalies(a.data);
                setHeatmap(h.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Detecting anomalies...</div>;
    }

    const severityColor = (severity) => {
        if (severity === 'critical') return { background: 'rgba(248, 113, 113, 0.15)', color: '#f87171' };
        if (severity === 'warning') return { background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' };
        return { background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' };
    };

    const riskColumns = [
        {
            key: 'department', label: 'Department', render: (v, row) => {
                const colors = severityColor(row.severity);
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                            width: 10, height: 10, borderRadius: '50%',
                            background: colors.color, display: 'inline-block', flexShrink: 0,
                        }}></span>
                        <Link to={`/anomalies/department?name=${encodeURIComponent(v)}`}>
                            <strong>{v}</strong>
                        </Link>
                    </div>
                );
            }
        },
        {
            key: 'risk_score', label: 'Risk Score', render: (v, row) => {
                const colors = severityColor(row.severity);
                return (
                    <span style={{
                        padding: '2px 10px', borderRadius: '12px', fontWeight: 700,
                        fontSize: '0.85rem', ...colors,
                    }}>
                        {v}
                    </span>
                );
            }
        },
        {
            key: 'severity', label: 'Severity', render: (v) => {
                const colors = severityColor(v);
                return (
                    <span style={{
                        padding: '2px 10px', borderRadius: '12px', fontWeight: 600,
                        fontSize: '0.8rem', textTransform: 'capitalize', ...colors,
                    }}>
                        {v}
                    </span>
                );
            }
        },
        { key: 'avg_balance', label: 'Avg Balance', render: (v) => formatCurrency(v) },
        { key: 'avg_days_past_due', label: 'Avg DPD', render: (v) => `${v} days` },
        { key: 'high_risk_pct', label: 'High Risk %', render: (v) => `${v}%` },
        { key: 'total_at_risk', label: 'Total at Risk', render: (v) => formatCurrency(v) },
        { key: 'refund_count', label: 'Refunds' },
        { key: 'chargeback_count', label: 'Chargebacks' },
    ];

    const sortedData = [...(heatmap?.heatmap || [])].sort((a, b) => b.risk_score - a.risk_score);

    return (
        <div className="page page--anomaly">
            <div className="card">
                <div className="card__header">
                    <h3>Department Risk Assessment</h3>
                    <span className="badge">{sortedData.length} departments</span>
                </div>
                <DataTable columns={riskColumns} rows={sortedData} />
            </div>
        </div>
    );
}
