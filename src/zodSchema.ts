import { z } from 'zod';

export const ReviewSchema = z.object({
    id         : z.number(),
    restaurant : z.string().optional(),
    location   : z.string().optional(),
    review     : z.string().optional(),
    response   : z.string().optional(),
    foodItem   : z.string().optional(),
    sentiment  : z.string().optional(),
    notes      : z.string().optional()
});


