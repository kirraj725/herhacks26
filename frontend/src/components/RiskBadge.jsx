import React from 'react';

export default function RiskBadge({ category }) {
    return (
        <span className={`risk-badge risk-badge--${(category || '').toLowerCase()}`}>
            {category}
        </span>
    );
}
