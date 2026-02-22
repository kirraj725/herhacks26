import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ForecastChart from '../components/ForecastChart';
import DataTable from '../components/DataTable';
import RiskBadge from '../components/RiskBadge';
import { getRiskScores, getForecast } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function Dashboard() {
    const [risk, setRisk] = useState(null);
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        Promise.all([getRiskScores(), getForecast()])
            .then(([r, f]) => {
                setRisk(r.data);
                setForecast(f.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Loading dashboard...</div>;
    }

    const columns = [
        { key: 'account_id', label: 'Account', clickable: true },
        { key: 'risk_score', label: 'Risk Score', render: (v) => <strong>{v}</strong> },
        {
            key: 'risk_category',
            label: 'Category',
            render: (v) => <RiskBadge category={v} />,
        },
        {
            key: 'expected_collection_probability',
            label: 'Collection Prob.',
            render: (v) => `${v}%`,
        },
        {
            key: 'patient_balance',
            label: 'Balance',
            render: (v) => formatCurrency(v),
        },
        { key: 'payer_type', label: 'Payer' },
        { key: 'service_category', label: 'Service' },
    ];

    return (
        <div className="page page--dashboard">

            <div className="stats-grid">
                <StatCard
                    icon="💰"
                    title="Revenue at Risk"
                    value={formatCurrency(forecast?.revenue_at_risk || 0)}
                    status="danger"
                />
                <StatCard
                    icon="⚠️"
                    title="High Risk Accounts"
                    value={`${risk?.high_risk || 0} / ${risk?.total || 0}`}
                    status="warning"
                />
                <StatCard
                    icon="📈"
                    title="Collection Rate"
                    value={`${forecast?.expected_collection_rate || 0}%`}
                    status="success"
                />
                <StatCard
                    icon="📋"
                    title="Total Outstanding"
                    value={formatCurrency(forecast?.total_outstanding || 0)}
                    status="info"
                />
            </div>

            <ForecastChart data={forecast?.forecast_series} />

            <div className="card">
                <div className="card__header">
                    <h3>All Accounts — Risk Scores</h3>
                    <span className="badge">{risk?.total || 0} accounts</span>
                </div>
                <DataTable
                    columns={columns}
                    rows={risk?.scores || []}
                    onRowClick={(row) => navigate(`/accounts/${row.account_id}`)}
                />
            </div>
        </div>
    );
}
