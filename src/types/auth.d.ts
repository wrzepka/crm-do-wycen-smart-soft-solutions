import { z } from 'zod';
import { loginSchema } from '@/lib/schemas/authSchema';

// Login type
export type LoginInput = z.infer<typeof loginSchema>;
