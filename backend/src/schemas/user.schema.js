
import { z } from 'zod';

export const userUpdateSchema = z.object({
    body: z.object({
        role: z.enum(['user', 'admin']).optional(),
        is_vip: z.boolean().optional(),
        // Add other fields as needed, but strict on what can be updated
    }),
    params: z.object({
        id: z.string().uuid().or(z.string()), // UUID is typical but existing IDs might be strings.
    }),
});
