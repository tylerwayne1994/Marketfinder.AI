import React, { useState } from 'react';
import { Upload, ArrowRight, ArrowLeft } from 'lucide-react';
import { styles } from './styles';

const UploadPage = ({ setCurrentPage, uploadedFile, handleFileUpload }) => {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.container}>
        <div style={{ paddingTop: '48px', paddingBottom: '48px' }}>
          <button
            style={styles.backButton}
            onClick={() => setCurrentPage('underwrite')}
            onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
            onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h1 style={styles.pageTitle}>Upload Property Documents</h1>
          <p style={styles.pageSubtitle}>Upload your offering memorandum, T12, or other property documents</p>
          
          <div style={styles.formContainer}>
            <div 
              style={{
                ...styles.uploadArea,
                ...(hoveredCard === 'upload' || isDragOver ? styles.uploadAreaHover : {})
              }}
              onMouseEnter={() => setHoveredCard('upload')}
              onMouseLeave={() => setHoveredCard(null)}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div style={{...styles.iconBox, ...styles.iconBoxCyan, margin: '0 auto 24px'}}>
                <Upload size={48} color="white" />
              </div>
              <h3 style={{...styles.cardTitle, marginBottom: '16px', fontSize: '1.5rem'}}>
                {uploadedFile ? '✅ Document Uploaded' : 'Drop your PDF here or click to browse'}
              </h3>
              <p style={{...styles.cardText, marginBottom: '24px'}}>
                {uploadedFile 
                  ? `File: ${uploadedFile.name} - Data extracted successfully!`
                  : 'Supported formats: PDF (Offering Memorandums, T12 statements, Property Reports)'
                }
              </p>
              
              {/* File input - NO overlapping positioning */}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                style={{
                  ...styles.button,
                  ...(hoveredButton ? styles.buttonHover : {}),
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setHoveredButton(true)}
                onMouseLeave={() => setHoveredButton(false)}
              >
                <Upload size={20} /> Choose File
              </label>
            </div>
            
            {uploadedFile && (
              <div style={{ marginTop: '40px' }}>
                <button
                  style={{
                    ...styles.button,
                    width: '100%',
                    justifyContent: 'center'
                  }}
                  onClick={() => setCurrentPage('financing')}
                >
                  Continue to Financing <ArrowRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;