import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CSVViewer() {
    const { filename } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`/api/upload/files/${filename}`)
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load file'))
            .finally(() => setLoading(false));
    }, [filename]);

    if (loading) return <div className="loading">Loading {filename}...</div>;
    if (error) return (
        <div className="page">
            <div className="auth-error" style={{ maxWidth: 500, margin: '2rem auto' }}>{error}</div>
            <button className="btn btn--outline" onClick={() => navigate('/upload')} style={{ margin: '1rem auto', display: 'block' }}>
                ← Back to Upload
            </button>
        </div>
    );

    return (
        <div className="page page--csv-viewer">
            <div className="csv-viewer__header">
                <button className="btn btn--outline" onClick={() => navigate('/upload')}>
                    ← Back to Upload
                </button>
                <div>
                    <h1>{data.filename}</h1>
                    <p>{data.total} rows · {data.columns.length} columns</p>
                </div>
            </div>

            <div className="card">
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                {data.columns.map((col) => (
                                    <th key={col}>{col}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.rows.map((row, i) => (
                                <tr key={i}>
                                    {data.columns.map((col) => (
                                        <td key={col}>{String(row[col] ?? '')}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
