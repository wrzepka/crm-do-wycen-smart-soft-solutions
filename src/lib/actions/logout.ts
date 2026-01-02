'use server';

import { signOut } from '@/lib/auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export async function logoutAction() {
  try {
    // Logout and redirect to the login page
    await signOut({ redirectTo: '/login' });
  } catch (error) {
    // If it is redirect error throw it further so redirection will work
    if (isRedirectError(error)) {
      throw error;
    }

    // Default error handling
    console.error('Logout Error:', error);
    return { error: 'Coś poszło nie tak podczas wylogowywania.' };
  }
}
