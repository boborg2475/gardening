import { z } from 'zod';
import { PolygonSchema } from './geometry.js';

export const DimensionsSchema = z.object({
	width: z.number().positive(),
	length: z.number().positive(),
	unit: z.enum(['ft', 'm'])
});

export type Dimensions = z.infer<typeof DimensionsSchema>;

export const PropertySchema = z.object({
	id: z.string().uuid(),
	name: z.string().min(1).max(500),
	dimensions: DimensionsSchema.optional(),
	geometry: PolygonSchema.nullable().optional(),
	northOrientation: z.number().min(0).max(360).optional()
});

export type Property = z.infer<typeof PropertySchema>;
