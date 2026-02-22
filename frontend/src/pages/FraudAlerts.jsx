import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFraudAlerts } from '../services/api';

export default function FraudAlerts() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getFraudAlerts()
            .then((r) => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Scanning for fraud...</div>;
    }

    return (
        <div className="page page--fraud">
            <div className="fraud-cards-stack">
                <div className="fraud-card" onClick={() => navigate('/fraud/flagged')}>
                    <div className="fraud-card__info">
                        <h3>Total Flagged</h3>
                        <p>All transactions identified as suspicious</p>
                    </div>
                    <div className="fraud-card__count fraud-card__count--danger">
                        {data?.total_flagged || 0}
                    </div>
                </div>
                <div className="fraud-card" onClick={() => navigate('/fraud/high-confidence')}>
                    <div className="fraud-card__info">
                        <h3>High Confidence</h3>
                        <p>Alerts with ≥80% confidence score</p>
                    </div>
                    <div className="fraud-card__count fraud-card__count--warning">
                        {data?.high_confidence || 0}
                    </div>
                </div>
            </div>
        </div>
    );
}
