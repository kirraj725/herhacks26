import React from 'react';

export default function StatCard({ title, value, icon, status = 'default', change, changeDir }) {
    return (
        <div className={`stat-card stat-card--${status}`}>
            {icon && <div className="stat-card__icon">{icon}</div>}
            <p className="stat-card__title">{title}</p>
            <h3 className="stat-card__value">{value}</h3>
            {change && (
                <span className={`stat-card__change stat-card__change--${changeDir || 'up'}`}>
                    {changeDir === 'down' ? '↓' : '↑'} {change}
                </span>
            )}
        </div>
    );
}
