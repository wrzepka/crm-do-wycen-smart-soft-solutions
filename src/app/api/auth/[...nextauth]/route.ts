import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

// Create handler using config
const handler = NextAuth(authOptions);

// Export handler as GET and POST to control whole authorization routing
export { handler as GET, handler as POST };
