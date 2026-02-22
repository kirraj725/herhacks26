import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import axios from 'axios';

export default function Upload() {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);

    const handleUpload = async (files) => {
        setUploading(true);
        setResult(null);
        try {
            const formData = new FormData();
            files.forEach((f) => formData.append('files', f));
            const res = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
        } catch (err) {
            setResult({ status: 'error', message: err.response?.data?.detail || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="page page--upload">
            <FileUpload onUpload={handleUpload} uploading={uploading} />

            {result && (
                <div className={`upload-status upload-status--${result.status}`}>
                    <h4>{result.status === 'success' ? 'Upload Successful' : 'Upload Failed'}</h4>
                    <p>{result.message}</p>
                    {result.files_found && (
                        <p style={{ marginTop: 'var(--space-2)' }}>
                            Files loaded: {result.files_found.join(', ')}
                        </p>
                    )}
                </div>
            )}

            <div className="card" style={{ marginTop: 'var(--space-6)', padding: 'var(--space-6)' }}>
                <h3 style={{ marginBottom: 'var(--space-4)' }}>Required Files</h3>
                <div className="data-table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>File</th>
                                <th>Status</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { name: 'accounts.csv', req: true, desc: 'Patient account balances and payment history' },
                                { name: 'payments.csv', req: true, desc: 'Payment transactions' },
                                { name: 'refunds.csv', req: true, desc: 'Refund records' },
                                { name: 'chargebacks.csv', req: true, desc: 'Chargeback records' },
                                { name: 'audit_log.csv', req: true, desc: 'User access and activity logs' },
                                { name: 'claims.csv', req: false, desc: 'Insurance claims (optional)' },
                            ].map((f) => (
                                <tr key={f.name}>
                                    <td>
                                        <Link to={`/upload/view/${f.name}`} className="clickable">
                                            <strong>{f.name}</strong>
                                        </Link>
                                    </td>
                                    <td>
                                        <span className={`risk-badge risk-badge--${f.req ? 'high' : 'low'}`}>
                                            {f.req ? 'Required' : 'Optional'}
                                        </span>
                                    </td>
                                    <td>{f.desc}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
