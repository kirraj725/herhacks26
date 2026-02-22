import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import { getAuditLogs, getAccessAlerts, getExportLogs } from '../services/api';

export default function AuditLog() {
    const navigate = useNavigate();
    const [logs, setLogs] = useState(null);
    const [alerts, setAlerts] = useState(null);
    const [exports, setExports] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getAuditLogs(), getAccessAlerts(), getExportLogs()])
            .then(([l, a, e]) => {
                setLogs(l.data);
                setAlerts(a.data);
                setExports(e.data);
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="loading__spinner"></div>Loading audit data...</div>;
    }

    const logColumns = [
        { key: 'log_id', label: 'Log ID' },
        { key: 'user_id', label: 'User' },
        {
            key: 'action', label: 'Action', render: (v) => (
                <span style={{
                    color: v === 'export' ? 'var(--color-warning)' : v === 'approve_refund' ? 'var(--color-danger)' : 'var(--color-text-primary)',
                    fontWeight: 600,
                }}>
                    {v}
                </span>
            )
        },
        { key: 'resource', label: 'Resource' },
        { key: 'timestamp', label: 'Timestamp' },
    ];

    return (
        <div className="page page--audit">
            <div className="stats-grid">
                <div onClick={() => document.getElementById('audit-logs')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                    <StatCard title="Total Log Entries" value={logs?.total || 0} status="info" />
                </div>
                <div onClick={() => document.getElementById('security-alerts')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                    <StatCard title="Security Alerts" value={alerts?.total || 0} status={alerts?.total > 0 ? 'danger' : 'success'} />
                </div>
                <div onClick={() => document.getElementById('data-exports')?.scrollIntoView({ behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                    <StatCard title="Data Exports" value={exports?.total || 0} status="warning" />
                </div>
            </div>

            {alerts?.alerts?.length > 0 && (
                <div id="security-alerts" style={{ marginBottom: 'var(--space-6)' }}>
                    <h3 style={{ marginBottom: 'var(--space-4)' }}>Suspicious Activity Alerts</h3>
                    {alerts.alerts.map((alert) => (
                        <div
                            key={alert.alert_id}
                            className={`alert-card alert-card--${alert.severity} alert-card--clickable`}
                            onClick={() => navigate(`/audit/user/${alert.user_id}`)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="alert-card__content">
                                <div className="alert-card__title">User: {alert.user_id}</div>
                                <div className="alert-card__desc">{alert.reason}</div>
                            </div>
                            <div className="alert-card__badge">
                                <span className={`risk-badge risk-badge--${alert.severity === 'critical' ? 'high' : 'medium'}`}>
                                    {alert.severity}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div id="audit-logs" className="card">
                <div className="card__header">
                    <h3>Audit Log</h3>
                    <span className="badge">{logs?.total || 0} entries</span>
                </div>
                <DataTable columns={logColumns} rows={logs?.logs || []} />
            </div>

            {exports?.exports?.length > 0 && (
                <div id="data-exports" className="card" style={{ marginTop: 'var(--space-6)' }}>
                    <div className="card__header">
                        <h3>Data Exports</h3>
                        <span className="badge">{exports?.total || 0} exports</span>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'log_id', label: 'Log ID' },
                            { key: 'user_id', label: 'User' },
                            { key: 'resource', label: 'Resource' },
                            { key: 'timestamp', label: 'Timestamp' },
                        ]}
                        rows={exports.exports}
                    />
                </div>
            )}
        </div>
    );
}
