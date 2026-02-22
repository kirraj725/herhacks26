import React from 'react';

export default function DataTable({ columns, rows, onRowClick }) {
    if (!rows || rows.length === 0) {
        return <div className="loading">No data available</div>;
    }

    return (
        <div className="data-table-wrapper">
            <table className="data-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={row.id || i} onClick={() => onRowClick && onRowClick(row)}>
                            {columns.map((col) => (
                                <td key={col.key} className={col.clickable ? 'clickable' : ''}>
                                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
