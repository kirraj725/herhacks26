import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';

export default function ForecastChart({ data }) {
    if (!data || data.length === 0) return null;

    return (
        <div className="chart-container">
            <h3>Revenue at Risk — 6 Month Forecast</h3>
            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="collectGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#234170" />
                    <XAxis dataKey="month" stroke="#a8c4e0" fontSize={12} />
                    <YAxis stroke="#a8c4e0" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                        contentStyle={{
                            background: '#112240',
                            border: '1px solid #234170',
                            borderRadius: '8px',
                            color: '#fff',
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Legend />
                    <Area
                        type="monotone"
                        dataKey="projected_risk"
                        stroke="#f87171"
                        fill="url(#riskGrad)"
                        name="Projected Risk"
                    />
                    <Area
                        type="monotone"
                        dataKey="projected_collections"
                        stroke="#34d399"
                        fill="url(#collectGrad)"
                        name="Projected Collections"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
