import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import RiskBadge from '../components/RiskBadge';
import { getAccountRisk, getPaymentPlan } from '../services/api';
import { formatCurrency } from '../utils/formatters';

export default function AccountDrillDown() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [risk, setRisk] = useState(null);
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAccountRisk(id), getPaymentPlan(id)])
            .then(([r, p]) => {
                setRisk(r.data);
                setPlan(p.data);
            })
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Loading account details...</div>;
    }

    if (risk?.error) {
        return (
            <div className="page">
                <p>Account not found.</p>
                <button className="btn btn--primary" onClick={() => navigate('/')}>← Back to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="page page--account">
            <div className="page__header">
                <button className="btn btn--outline" onClick={() => navigate('/')} style={{ marginBottom: 'var(--space-4)' }}>
                    ← Back to Dashboard
                </button>
                <h1>Account {id}</h1>
                <p>Detailed risk analysis and payment plan recommendation</p>
            </div>

            <div className="detail-grid">
                <div className="detail-item">
                    <div className="detail-item__label">Risk Score</div>
                    <div className="detail-item__value">{risk?.risk_score}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Risk Category</div>
                    <div className="detail-item__value"><RiskBadge category={risk?.risk_category} /></div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Patient Balance</div>
                    <div className="detail-item__value">{formatCurrency(risk?.patient_balance || 0)}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Total Charges</div>
                    <div className="detail-item__value">{formatCurrency(risk?.total_charges || 0)}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Days Past Due</div>
                    <div className="detail-item__value">{risk?.days_past_due} days</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Collection Probability</div>
                    <div className="detail-item__value">{risk?.expected_collection_probability}%</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Payer Type</div>
                    <div className="detail-item__value" style={{ textTransform: 'capitalize' }}>{risk?.payer_type}</div>
                </div>
                <div className="detail-item">
                    <div className="detail-item__label">Service Category</div>
                    <div className="detail-item__value" style={{ textTransform: 'capitalize' }}>{risk?.service_category}</div>
                </div>
            </div>

            {plan && !plan.error && (
                <div className="card" style={{ padding: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>💳 Recommended Payment Plan</h3>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <div className="detail-item__label">Plan Length</div>
                            <div className="detail-item__value">{plan.plan_length_months} months</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-item__label">First Payment</div>
                            <div className="detail-item__value">{formatCurrency(plan.first_payment)}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-item__label">Monthly Payment</div>
                            <div className="detail-item__value">{formatCurrency(plan.monthly_payment)}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-item__label">Projected Revenue</div>
                            <div className="detail-item__value">{formatCurrency(plan.projected_revenue)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
