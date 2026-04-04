import { z } from 'zod';

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
		name: z.string().min(1),
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
		name: z.string().min(1).optional(),
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

export const EventSchema = z.discriminatedUnion('type', [
	PropertyCreatedSchema,
	PropertyUpdatedSchema
]);

export type AppEvent = z.infer<typeof EventSchema>;
export type PropertyCreatedEvent = z.infer<typeof PropertyCreatedSchema>;
export type PropertyUpdatedEvent = z.infer<typeof PropertyUpdatedSchema>;
