import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';

// DEPRECATED: Redirects to AdminRequests
export default function AdminOrders() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(createPageUrl('AdminRequests'));
  }, [navigate]);

  return null;
}

