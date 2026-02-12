import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api';
import { setToken, getToken, authEvents } from '@/api/config';
import { insforge } from '@/lib/insforge';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext(null);

// Access levels: 'guest' (browser, no auth), 'limited' (pending verification), 'verified' (full access)
export const ACCESS_LEVELS = {
  GUEST: 'guest',
  LIMITED: 'limited',
  VERIFIED: 'verified'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState(null);

  // New: Access level and Telegram detection
  const [accessLevel, setAccessLevel] = useState(ACCESS_LEVELS.GUEST);
  const [isTelegram, setIsTelegram] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Detect Telegram WebApp environment
    const inTelegram = typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
    setIsTelegram(inTelegram);

    checkAppState();

    // Listen for 401s from API
    const handleUnauthorized = () => {
      console.warn('🔒 Session expired (401 received). Logging out...');
      if (getToken()) { // Only notify if we thought we were logged in
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        setAccessLevel(ACCESS_LEVELS.GUEST);
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          variant: "destructive",
        });
      }
    };

    authEvents.on('unauthorized', handleUnauthorized);
    return () => authEvents.off('unauthorized', handleUnauthorized);
  }, []);

  // NOTE: Realtime user subscription removed — InsForge Realtime uses connect/subscribe/on pattern,
  // not db.channel().on().subscribe(). See RealtimeService.js for correct usage.

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(false);
      setAuthError(null);

      // Check if user is authenticated via Backend JWT
      const token = getToken();
      if (token) {
        await checkUserAuth();
      } else {
        // No backend JWT — check for InsForge OAuth session
        console.log('No backend token, checking InsForge session...');
        try {
          const { data, error } = await insforge.auth.getCurrentSession();
          if (data?.session?.user && !error) {
            console.log('✅ InsForge session found:', data.session.user.email);
            // Set user from InsForge session data
            const insforgeUser = data.session.user;
            setUser({
              id: insforgeUser.id,
              email: insforgeUser.email,
              full_name: insforgeUser.profile?.name || insforgeUser.email?.split('@')[0] || 'User',
              avatar_url: insforgeUser.profile?.avatar_url || null,
              role: 'user',
              verification_status: 'verified', // OAuth users are auto-verified
              user_metadata: insforgeUser.profile || {},
            });
            setIsAuthenticated(true);
            setAccessLevel(ACCESS_LEVELS.VERIFIED);
            setIsLoadingAuth(false);
          } else {
            console.log('No InsForge session, defaulting to guest mode');
            setIsLoadingAuth(false);
            setIsAuthenticated(false);
            setAccessLevel(ACCESS_LEVELS.GUEST);
          }
        } catch (insforgeError) {
          console.warn('InsForge session check failed:', insforgeError);
          setIsLoadingAuth(false);
          setIsAuthenticated(false);
          setAccessLevel(ACCESS_LEVELS.GUEST);
        }
      }
      setIsLoadingPublicSettings(false);
    } catch (error) {
      console.error('App state check failed:', error);
      setAuthError({
        type: 'unknown',
        message: error.message || 'Failed to load app'
      });
      setIsLoadingPublicSettings(false);
      setIsLoadingAuth(false);
      setAccessLevel(ACCESS_LEVELS.GUEST);
    }
  };

  const checkUserAuth = async () => {
    try {
      setIsLoadingAuth(true);
      // Double check token exists before calling API to prevent 401s
      if (!getToken()) {
        throw new Error('No token found');
      }

      const currentUser = await api.auth.me();
      setUser(currentUser);
      setIsAuthenticated(true);

      // Determine access level based on verification status
      if (currentUser.verification_status === 'verified') {
        setAccessLevel(ACCESS_LEVELS.VERIFIED);
      } else if (currentUser.verification_status === 'pending') {
        setAccessLevel(ACCESS_LEVELS.LIMITED);
      } else {
        setAccessLevel(ACCESS_LEVELS.LIMITED);
      }

      setIsLoadingAuth(false);
    } catch (error) {
      console.error('User auth check failed:', error);
      setIsLoadingAuth(false);
      setIsAuthenticated(false);
      setAccessLevel(ACCESS_LEVELS.GUEST);

      // If user auth fails with 401/403, clear token and stay in guest mode
      if (error.status === 401 || error.status === 403) {
        console.log('Token expired or invalid, clearing...');
        setToken(null);
      }
    }
  };

  // Helper to check if user has required access level
  const hasAccess = (requiredLevel) => {
    const levels = [ACCESS_LEVELS.GUEST, ACCESS_LEVELS.LIMITED, ACCESS_LEVELS.VERIFIED];
    const currentIndex = levels.indexOf(accessLevel);
    const requiredIndex = levels.indexOf(requiredLevel);
    return currentIndex >= requiredIndex;
  };

  // Helper to check if verification is required for action
  const requiresVerification = () => {
    return accessLevel !== ACCESS_LEVELS.VERIFIED;
  };

  const logout = async (shouldRedirect = true) => {
    setUser(null);
    setIsAuthenticated(false);
    setAccessLevel(ACCESS_LEVELS.GUEST);
    setToken(null);

    // Sign out from InsForge too
    try { await insforge.auth.signOut(); } catch (e) { /* ignore */ }

    if (shouldRedirect) {
      window.location.href = '/login';
    }
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
      // New access control values
      accessLevel,
      isTelegram,
      hasAccess,
      requiresVerification
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
