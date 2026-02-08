import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ACCESS_LEVELS } from '@/lib/AuthContext';
import { TeaserModal } from './TeaserOverlay';
import { createPageUrl } from '@/utils';

/**
 * ProtectedRoute - Wrapper for routes that require authentication/verification
 * 
 * Usage:
 * <Route path="/checkout" element={
 *   <ProtectedRoute requiredLevel="verified">
 *     <Checkout />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({
    children,
    requiredLevel = ACCESS_LEVELS.VERIFIED,
    redirectTo = null,
    showModal = true // Show modal instead of redirect for better UX
}) {
    const { hasAccess, isLoadingAuth, isAuthenticated } = useAuth();
    const location = useLocation();
    const [showBlockedModal, setShowBlockedModal] = useState(true);

    // Still loading auth state
    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
                <div className="w-8 h-8 border-4 border-[#D6B25E]/20 border-t-[#D6B25E] rounded-full animate-spin" />
            </div>
        );
    }

    // Check if user has required access
    if (hasAccess(requiredLevel)) {
        return <>{children}</>;
    }

    // User doesn't have access - show modal or redirect
    if (showModal) {
        return (
            <>
                {/* Show the page content blurred in background */}
                <div className="filter blur-lg pointer-events-none">
                    {children}
                </div>

                {/* Verification modal */}
                <TeaserModal
                    isOpen={showBlockedModal}
                    onClose={() => {
                        setShowBlockedModal(false);
                        // Redirect to home after closing modal
                        window.history.back();
                    }}
                    title="Zugang gesperrt"
                    message="Diese Seite ist nur für verifizierte Mitglieder zugänglich. Verifiziere dich jetzt, um fortzufahren."
                />
            </>
        );
    }

    // Redirect to login or custom page
    const redirectPath = redirectTo || createPageUrl('Login');
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
}

/**
 * AdminRoute - Special wrapper for admin-only routes
 */
export function AdminRoute({ children }) {
    const { user, isLoadingAuth, hasAccess } = useAuth();
    const location = useLocation();

    if (isLoadingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0A0C10]">
                <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Must be verified and have admin role
    if (!hasAccess(ACCESS_LEVELS.VERIFIED) || user?.role !== 'admin') {
        return <Navigate to={createPageUrl('Home')} state={{ from: location }} replace />;
    }

    return <>{children}</>;
}
