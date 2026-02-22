import React from 'react';

export default function HeatmapChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="heatmap-grid">
            {data.map((cell) => (
                <div key={cell.department} className={`heatmap-cell heatmap-cell--${cell.severity}`}>
                    <div className="heatmap-cell__dept">{cell.department}</div>
                    <div className="heatmap-cell__metric">
                        <span>Avg Balance</span>
                        <span>${cell.avg_balance?.toLocaleString()}</span>
                    </div>
                    <div className="heatmap-cell__metric">
                        <span>Avg DPD</span>
                        <span>{cell.avg_days_past_due} days</span>
                    </div>
                    <div className="heatmap-cell__metric">
                        <span>High Risk %</span>
                        <span>{cell.high_risk_pct}%</span>
                    </div>
                    <div className="heatmap-cell__metric">
                        <span>Refunds</span>
                        <span>{cell.refund_count}</span>
                    </div>
                    <div className="heatmap-cell__metric">
                        <span>Chargebacks</span>
                        <span>{cell.chargeback_count}</span>
                    </div>
                    <div className="heatmap-cell__score" style={{
                        color: cell.severity === 'critical' ? 'var(--color-danger)' :
                            cell.severity === 'warning' ? 'var(--color-warning)' : 'var(--color-success)'
                    }}>
                        {cell.risk_score}
                    </div>
                </div>
            ))}
        </div>
    );
}
