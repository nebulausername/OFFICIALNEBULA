import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '@/api';
import { setToken, getToken, authEvents } from '@/api/config';
import { insforge, db } from '@/lib/insforge';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

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

  // Realtime Subscription
  useEffect(() => {
    let subscription;
    if (user?.id && isAuthenticated) {
      console.log('🔌 Subscribing to user updates:', user.id);
      subscription = db
        .channel(`user:${user.id}`)
        .on('postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${user.id}` },
          (payload) => {
            console.log('🔄 User profile updated:', payload);
            checkUserAuth();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        console.log('🔌 Unsubscribing from user updates');
        db.removeChannel(subscription);
      }
    };
  }, [user?.id, isAuthenticated]);

  const checkAppState = async () => {
    try {
      setIsLoadingPublicSettings(false);
      setAuthError(null);

      // Check if user is authenticated
      const token = getToken();
      if (token) {
        await checkUserAuth();
      } else {
        setIsLoadingAuth(false);
        setIsAuthenticated(false);
        setAccessLevel(ACCESS_LEVELS.GUEST);
        console.log('No token found, defaulting to guest mode');
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

      // If user auth fails, it might be an expired token, but we allow guest access
      if (error.status === 401 || error.status === 403) {
        console.log('Guest mode active');
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

    if (shouldRedirect) {
      await api.auth.logout(window.location.href);
    } else {
      await api.auth.logout();
    }
  };

  const navigateToLogin = () => {
    // Check if in Telegram WebApp
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      window.location.href = '/login';
    } else {
      api.auth.redirectToLogin(window.location.href);
    }
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
