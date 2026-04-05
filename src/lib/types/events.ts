import { z } from 'zod';
import { PointSchema } from './geometry.js';

const BaseEventSchema = z.object({
	id: z.string().uuid(),
	entityId: z.string().uuid(),
	entityType: z.string(),
	timestamp: z.string().datetime()
});

export const PropertyCreatedSchema = BaseEventSchema.extend({
	type: z.literal('PropertyCreated'),
	entityType: z.literal('property'),
	payload: z.object({
		name: z.string().min(1).max(500),
		dimensions: z
			.object({
				width: z.number().positive(),
				length: z.number().positive(),
				unit: z.enum(['ft', 'm'])
			})
			.optional()
	})
});

export const PropertyUpdatedSchema = BaseEventSchema.extend({
	type: z.literal('PropertyUpdated'),
	entityType: z.literal('property'),
	payload: z.object({
		name: z.string().min(1).max(500).optional(),
		dimensions: z
			.object({
				width: z.number().positive(),
				length: z.number().positive(),
				unit: z.enum(['ft', 'm'])
			})
			.nullable()
			.optional(),
		northOrientation: z.number().min(0).max(360).nullable().optional()
	})
});

export const PolygonDrawnSchema = BaseEventSchema.extend({
	type: z.literal('PolygonDrawn'),
	payload: z.object({
		points: z.array(PointSchema).min(3).max(10000)
	})
});

export const PropertyBoundarySetSchema = BaseEventSchema.extend({
	type: z.literal('PropertyBoundarySet'),
	entityType: z.literal('property'),
	payload: z.object({
		points: z.array(PointSchema).min(3).max(10000)
	})
});

export const NorthOrientationSetSchema = BaseEventSchema.extend({
	type: z.literal('NorthOrientationSet'),
	entityType: z.literal('property'),
	payload: z.object({
		degrees: z.number().min(0).max(359)
	})
});

export const EventSchema = z.discriminatedUnion('type', [
	PropertyCreatedSchema,
	PropertyUpdatedSchema,
	PolygonDrawnSchema,
	PropertyBoundarySetSchema,
	NorthOrientationSetSchema
]);

export type AppEvent = z.infer<typeof EventSchema>;
export type PropertyCreatedEvent = z.infer<typeof PropertyCreatedSchema>;
export type PropertyUpdatedEvent = z.infer<typeof PropertyUpdatedSchema>;
export type PolygonDrawnEvent = z.infer<typeof PolygonDrawnSchema>;
export type PropertyBoundarySetEvent = z.infer<typeof PropertyBoundarySetSchema>;
export type NorthOrientationSetEvent = z.infer<typeof NorthOrientationSetSchema>;
