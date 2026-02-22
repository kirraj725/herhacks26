import React, { useRef, useState } from 'react';

export default function FileUpload({ onUpload, uploading }) {
    const inputRef = useRef(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFiles = (fileList) => {
        if (!fileList || fileList.length === 0 || !onUpload) return;
        onUpload(Array.from(fileList));
    };

    return (
        <div
            className={`file-upload ${dragOver ? 'file-upload--dragover' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFiles(e.dataTransfer.files);
            }}
            onClick={() => inputRef.current?.click()}
        >
            <div className="file-upload__icon">↑</div>
            <p className="file-upload__text">
                {uploading ? 'Uploading...' : 'Drag & drop files here, or click to browse'}
            </p>
            <p className="file-upload__subtext">
                Upload one or more .csv files, a .zip file, or a folder
            </p>
            <input
                ref={inputRef}
                type="file"
                accept=".zip,.csv"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    );
}
