import { supabase } from './supabase';
import type { User, Organization } from '@/types/models';
import { LoginInput, SignupInput } from './validation';

/**
 * Authentication utility functions
 */

/**
 * Sign up a new user with email and password
 */
export async function signUp(
  data: SignupInput
): Promise<{ user: any; error: any }> {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
        },
      },
    });

    if (authError) {
      return { user: null, error: authError };
    }

    if (!authData.user) {
      return { user: null, error: new Error('Failed to create user') };
    }

    // Create organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: data.organizationName,
        slug: data.organizationName.toLowerCase().replace(/\s+/g, '-'),
      })
      .select()
      .single();

    if (orgError) {
      return { user: null, error: orgError };
    }

    // Create user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        organization_id: orgData.id,
        email: data.email,
        full_name: data.fullName,
        role: 'admin', // First user is admin
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      return { user: null, error: userError };
    }

    return { user: userProfile, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: LoginInput): Promise<{ user: any; error: any }> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { user: null, error };
    }

    // Fetch user profile
    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (userError) {
      return { user: null, error: userError };
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    return { user: userProfile, error: null };
  } catch (error) {
    return { user: null, error };
  }
}

/**
 * Sign out current user
 */
export async function signOut(): Promise<{ error: any }> {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session, error };
}

/**
 * Get current user with profile
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getSession();

    if (!data.session?.user?.id) {
      return null;
    }

    const { data: userProfile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return userProfile as User;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Get user's organization
 */
export async function getUserOrganization(): Promise<Organization | null> {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    const { data: org, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', user.organization_id)
      .single();

    if (error) {
      console.error('Error fetching organization:', error);
      return null;
    }

    return org as Organization;
  } catch (error) {
    console.error('Error in getUserOrganization:', error);
    return null;
  }
}

/**
 * Check if user has specific role
 */
export async function hasRole(requiredRole: string): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  const roleHierarchy = {
    admin: 5,
    project_manager: 4,
    supervisor: 3,
    crew_lead: 2,
    technician: 1,
    customer: 0,
  };

  const userRoleLevel = roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
  const requiredRoleLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userRoleLevel >= requiredRoleLevel;
}

/**
 * Reset password with email
 */
export async function resetPassword(email: string): Promise<{ error: any }> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/update-password`,
  });

  return { error };
}

/**
 * Update password
 */
export async function updatePassword(newPassword: string): Promise<{ error: any }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  return { error };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (user: any | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const user = await getCurrentUser();
      callback(user);
    } else {
      callback(null);
    }
  });

  return data.subscription;
}
