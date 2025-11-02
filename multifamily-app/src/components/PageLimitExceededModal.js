import React, { useState } from 'react';
import axios from 'axios';
import { X, AlertCircle, CreditCard, CheckCircle } from 'lucide-react';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '') || 'http://localhost:8010';

const PageLimitExceededModal = ({ 
  isOpen, 
  onClose, 
  currentUser, 
  remainingPages, 
  pagesRequested, 
  onPurchaseComplete 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePurchaseAdditionalPages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the backend API to get Stripe checkout session
      const response = await axios.post(`${BACKEND_URL}/api/purchase-additional-pages`, {
        user_id: currentUser?.id
      });
      
      if (response.data.success && response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      }
    } catch (err) {
      console.error('Error purchasing additional pages:', err);
      setError('Failed to process your purchase. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '20px'
          }}
        >
          <X size={24} />
        </button>
        
        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ marginBottom: '16px', color: '#4CAF50' }}>
              <CheckCircle size={48} />
            </div>
            <h2 style={{ marginBottom: '16px', color: '#333' }}>Purchase Successful!</h2>
            <p style={{ marginBottom: '24px', color: '#666' }}>
              You've added 50 more pages to your account. You can now continue with your document analysis.
            </p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '16px', color: '#ff9800', display: 'flex', justifyContent: 'center' }}>
              <AlertCircle size={48} />
            </div>
            <h2 style={{ marginBottom: '16px', textAlign: 'center' }}>Page Limit Reached</h2>
            
            <p style={{ marginBottom: '24px', color: '#666' }}>
              {remainingPages === 0 ? 
                `You've used all the pages included in your subscription.` : 
                `You have ${remainingPages} pages remaining, but this document requires ${pagesRequested} pages.`
              }
            </p>
            
            <div style={{
              backgroundColor: '#f5f8ff',
              border: '1px solid #e1e7ff',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '24px'
            }}>
              <h3 style={{ marginBottom: '8px', fontSize: '18px' }}>Add More Pages</h3>
              <p style={{ marginBottom: '16px', color: '#555' }}>
                Get 60 additional pages for $25 to continue analyzing documents.
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0',
                borderBottom: '1px solid #e1e7ff'
              }}>
                <span style={{ fontWeight: '500' }}>Package:</span>
                <span>60 Additional Pages</span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0'
              }}>
                <span style={{ fontWeight: '500' }}>Price:</span>
                <span style={{ fontWeight: '600', fontSize: '18px' }}>$25.00</span>
              </div>
            </div>
            
            {error && (
              <div style={{
                backgroundColor: '#ffebee',
                color: '#c62828',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '16px'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  backgroundColor: 'transparent',
                  color: '#555',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={handlePurchaseAdditionalPages}
                disabled={isLoading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                <CreditCard size={18} />
                {isLoading ? 'Processing...' : 'Purchase More Pages'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PageLimitExceededModal;