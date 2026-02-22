import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import StatCard from '../components/StatCard';
import { getAllPlans } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function PaymentPlans() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllPlans()
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Generating plans...</div>;
    }

    const columns = [
        { key: 'account_id', label: 'Account', render: (v) => <Link to={`/plans/history/${v}`} className="clickable">{v}</Link> },
        { key: 'risk_category', label: 'Risk', render: (v) => <RiskBadge category={v} /> },
        { key: 'risk_score', label: 'Score', render: (v) => <strong>{v}</strong> },
        { key: 'patient_balance', label: 'Balance', render: (v) => formatCurrency(v) },
        { key: 'plan_length_months', label: 'Plan Length', render: (v) => `${v} mo` },
        { key: 'first_payment', label: 'First Payment', render: (v) => formatCurrency(v) },
        { key: 'monthly_payment', label: 'Monthly', render: (v) => formatCurrency(v) },
        { key: 'expected_collection_probability', label: 'Collection Prob.', render: (v) => `${v}%` },
        { key: 'projected_revenue', label: 'Projected Revenue', render: (v) => formatCurrency(v) },
    ];

    const plans = data?.plans || [];
    const totalRevenue = plans.reduce((sum, p) => sum + (p.projected_revenue || 0), 0);
    const highRiskPlans = plans.filter(p => p.risk_category === 'High').length;
    const avgCollection = plans.length ? Math.round(plans.reduce((sum, p) => sum + p.expected_collection_probability, 0) / plans.length) : 0;

    return (
        <div className="page page--plans">
            <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
                <StatCard title="Active Plans" value={data?.total || 0} status="info" />
                <StatCard title="Projected Revenue" value={formatCurrency(totalRevenue)} status="success" />
                <StatCard title="Avg Collection Prob." value={`${avgCollection}%`} status="warning" />
                <StatCard title="High Risk Plans" value={highRiskPlans} status="danger" />
            </div>

            <div className="card">
                <div className="card__header">
                    <h3>Recommended Plans</h3>
                    <span className="badge">{data?.total || 0} accounts</span>
                </div>
                <DataTable columns={columns} rows={plans} />
            </div>
        </div>
    );
}
