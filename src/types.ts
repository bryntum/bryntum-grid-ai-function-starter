import { z } from 'zod';
import { ReviewSchema } from './zodSchema';

export type ReviewSchemaType = z.infer<typeof ReviewSchema>;