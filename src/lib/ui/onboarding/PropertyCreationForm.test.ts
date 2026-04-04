import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import { db } from '../../data/db.js';
import { _reset } from '../../stores/materialized-state.svelte.js';
import PropertyCreationForm from './PropertyCreationForm.svelte';

describe('PropertyCreationForm', () => {
	beforeEach(async () => {
		await db.delete();
		await db.open();
		_reset();
	});

	it('renders the property name input and submit button', () => {
		render(PropertyCreationForm);

		expect(screen.getByLabelText(/property name/i)).toBeDefined();
		expect(screen.getByRole('button', { name: /create property/i })).toBeDefined();
	});

	it('shows validation error when submitting with empty name', async () => {
		render(PropertyCreationForm);

		const submitButton = screen.getByRole('button', { name: /create property/i });
		await fireEvent.click(submitButton);

		expect(screen.getByText(/name is required/i)).toBeDefined();
	});

	it('dispatches PropertyCreated event on valid submission with name only', async () => {
		render(PropertyCreationForm);

		const nameInput = screen.getByLabelText(/property name/i);
		await fireEvent.input(nameInput, { target: { value: 'My Garden' } });

		const submitButton = screen.getByRole('button', { name: /create property/i });
		await fireEvent.click(submitButton);

		// Verify event was committed to the store
		const events = await db.events.toArray();
		expect(events).toHaveLength(1);
		expect(events[0].type).toBe('PropertyCreated');
		expect(events[0].payload.name).toBe('My Garden');
		expect(events[0].payload.dimensions).toBeUndefined();
	});

	it('dispatches PropertyCreated event with dimensions when provided', async () => {
		render(PropertyCreationForm);

		const nameInput = screen.getByLabelText(/property name/i);
		await fireEvent.input(nameInput, { target: { value: 'Big Garden' } });

		const widthInput = screen.getByLabelText(/width/i);
		await fireEvent.input(widthInput, { target: { value: '50' } });

		const lengthInput = screen.getByLabelText(/length/i);
		await fireEvent.input(lengthInput, { target: { value: '100' } });

		const submitButton = screen.getByRole('button', { name: /create property/i });
		await fireEvent.click(submitButton);

		const events = await db.events.toArray();
		expect(events).toHaveLength(1);
		expect(events[0].payload.name).toBe('Big Garden');
		expect(events[0].payload.dimensions).toEqual({ width: 50, length: 100, unit: 'ft' });
	});

	it('creates property with undefined dimensions when fields are empty', async () => {
		render(PropertyCreationForm);

		const nameInput = screen.getByLabelText(/property name/i);
		await fireEvent.input(nameInput, { target: { value: 'Simple Garden' } });

		const submitButton = screen.getByRole('button', { name: /create property/i });
		await fireEvent.click(submitButton);

		const events = await db.events.toArray();
		expect(events).toHaveLength(1);
		expect(events[0].payload.dimensions).toBeUndefined();
	});
});
