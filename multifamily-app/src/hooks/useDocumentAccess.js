import { useState } from 'react';
import { supabase } from '../lib/supabase';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '') || 'http://localhost:8010';

/**
 * Hook for document access checking and page limit management
 */
export const useDocumentAccess = (currentUser, setShowPageLimitModal, setPageModalData) => {
  const [isChecking, setIsChecking] = useState(false);

  /**
   * Check document access via direct API call (without file upload)
   */
  const checkDocumentAccess = async (pagesRequested = 1) => {
    try {
      setIsChecking(true);
      
      // Get the session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Please log in to continue');
        return { allowed: false, error: 'Authentication required' };
      }
      
      // Call the JSON endpoint
      const response = await fetch(`${BACKEND_URL}/api/document/check-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          user_id: currentUser?.id,
          pages_requested: pagesRequested
        })
      });
      
      const data = await response.json();
      
      // If access denied and needs addon, show the modal
      if (!data.allowed && data.needs_addon) {
        setPageModalData({
          remainingPages: data.remaining_pages,
          pagesRequested: data.pages_requested
        });
        setShowPageLimitModal(true);
        return { allowed: false, error: data.error, needsAddon: true };
      } else if (!data.allowed) {
        // Handle other access denial reasons
        return { allowed: false, error: data.error };
      }
      
      // Access allowed
      return { 
        allowed: true, 
        remainingPages: data.remaining_pages,
        totalPages: data.total_pages
      };
    } catch (error) {
      console.error('Error checking document access:', error);
      return { allowed: false, error: 'Error checking access' };
    } finally {
      setIsChecking(false);
    }
  };

  /**
   * Check document access by uploading a file
   */
  const checkFileAccess = async (file) => {
    try {
      if (!file) return { allowed: false, error: 'No file provided' };
      setIsChecking(true);
      
      // Get the session for the authorization header
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return { allowed: false, error: 'Authentication required' };
      }
      
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', currentUser?.id);
      
      // Make a preflight request to check if the user has enough pages
      const response = await fetch(`${BACKEND_URL}/api/document/check-file`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      
      const data = await response.json();
      
      // If access denied and needs addon, show the modal
      if (!data.allowed && data.needs_addon) {
        setPageModalData({
          remainingPages: data.remaining_pages,
          pagesRequested: data.pages_requested
        });
        setShowPageLimitModal(true);
        return { allowed: false, error: data.error, needsAddon: true };
      } else if (!data.allowed) {
        // Handle other access denial reasons
        return { allowed: false, error: data.error };
      }
      
      // Access allowed
      return { 
        allowed: true, 
        remainingPages: data.remaining_pages,
        pagesRequested: data.pages_requested,
        totalPages: data.total_pages,
        fileName: data.filename
      };
    } catch (error) {
      console.error('Error checking file access:', error);
      return { allowed: false, error: 'Error checking access' };
    } finally {
      setIsChecking(false);
    }
  };

  return {
    checkDocumentAccess,
    checkFileAccess,
    isChecking
  };
};