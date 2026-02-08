/**
 * Auth Context - InsForge Integration
 * Provides authentication state using InsForge hooks
 */
import React, { createContext, useContext } from 'react';
import { useAuth as useInsforgeAuth, useUser as useInsforgeUser } from '@insforge/react';

// Create context for backward compatibility with existing app code
const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context) return context;

    // Fallback to InsForge hooks directly
    return useInsforgeAuth();
};

export const useUser = () => {
    return useInsforgeUser();
};

/**
 * AuthProvider component that wraps existing app code
 * Note: InsforgeProvider should already be set up in main.jsx
 */
export const AuthProvider = ({ children }) => {
    const auth = useInsforgeAuth();
    const { user, isLoaded } = useInsforgeUser();

    const value = {
        // InsForge auth state
        isSignedIn: auth.isSignedIn,
        isLoaded: auth.isLoaded && isLoaded,
        user,

        // Backward compatibility mappings
        isAuthenticated: auth.isSignedIn,
        currentUser: user,
        loading: !auth.isLoaded,

        // User info helpers
        userId: user?.id,
        email: user?.email,
        role: user?.profile?.role || 'user',
        isAdmin: user?.profile?.role === 'admin',

        // Legacy method placeholders (redirect to InsForge hosted auth)
        login: () => {
            window.location.href = `${import.meta.env.VITE_INSFORGE_BASE_URL}/auth/login?redirect=${encodeURIComponent(window.location.origin)}`;
        },
        logout: async () => {
            // InsForge SDK handles logout
            window.location.href = `${import.meta.env.VITE_INSFORGE_BASE_URL}/auth/logout?redirect=${encodeURIComponent(window.location.origin)}`;
        },
        register: () => {
            window.location.href = `${import.meta.env.VITE_INSFORGE_BASE_URL}/auth/register?redirect=${encodeURIComponent(window.location.origin)}`;
        },
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
