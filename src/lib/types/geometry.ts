import { z } from 'zod';

export const PointSchema = z.object({
	x: z.number(),
	y: z.number()
});

export type Point = z.infer<typeof PointSchema>;

export const PolygonSchema = z.object({
	points: z.array(PointSchema).min(3)
});

export type Polygon = z.infer<typeof PolygonSchema>;
