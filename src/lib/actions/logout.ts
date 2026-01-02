'use server';

import { signOut } from '@/lib/auth';

export async function logoutAction() {
  try {
    // Logout and redirect to the login page
    await signOut({ redirectTo: '/login' });
  } catch (error) {
    // Default error handling
    throw error;
  }
}
