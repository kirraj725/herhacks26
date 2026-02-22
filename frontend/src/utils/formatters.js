/**
 * Formatting utilities for currency, dates, and percentages.
 */

export const formatCurrency = (value) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export const formatPercent = (value) =>
    `${(value * 100).toFixed(1)}%`;

export const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
