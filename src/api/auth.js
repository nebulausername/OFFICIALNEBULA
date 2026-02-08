import { auth as insforgeAuth, db } from '@/lib/insforge';
import { setToken, removeToken } from './config';

export const auth = {
  // Get current authenticated user (MERGE Auth User + Public Profile)
  me: async () => {
    // 1. Get Auth User
    const { data: { user: authUser }, error: authError } = await insforgeAuth.getUser();
    if (authError || !authUser) throw authError || new Error('Not authenticated');

    // 2. Get Public Profile
    const { data: profile, error: profileError } = await db
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    // If profile missing (sync issue), return authUser basics
    if (profileError) {
      // console.warn('Profile fetch error:', profileError);
      return {
        ...authUser,
        id: authUser.id,
        email: authUser.email,
        role: 'user',
        rank: 'nutzer',
        verification_status: 'unverified'
      };
    }

    // Merge: profile takes precedence for shared fields, but id/email from auth are source of truth
    return { ...authUser, ...profile };
  },

  // Logout current user
  logout: async (redirectUrl = null) => {
    try {
      await insforgeAuth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  },

  // Update current user
  updateMe: async (data) => {
    const { data: { user } } = await insforgeAuth.getUser();
    if (!user) throw new Error('No user');

    const { data: updated, error } = await db
      .from('users')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  },

  // Redirect to login page
  redirectToLogin: (returnUrl = null) => {
    const url = returnUrl || window.location.href;
    window.location.href = `/login?returnUrl=${encodeURIComponent(url)}`;
  },

  // Telegram WebApp authentication (Still requires Backend or Edge Function!)
  // For now, we keep the signature, but it might fail if backend is down.
  telegramWebApp: async (initData) => {
    // TODO: Move to Edge Function
    // return await api.post('/auth/telegram-webapp', { initData });
    console.warn('Telegram Auth requires Edge Function migration');
    return { error: 'Not implemented yet in serverless mode' };
  },
};

export default auth;

