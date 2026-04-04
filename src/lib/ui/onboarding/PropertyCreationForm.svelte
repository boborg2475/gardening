<script lang="ts">
	import { createProperty } from '../../domain/property.js';

	let name = $state('');
	let width = $state('');
	let length = $state('');
	let unit = $state<'ft' | 'm'>('ft');
	let error = $state('');
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		error = '';

		const trimmedName = name.trim();
		if (trimmedName.length === 0) {
			error = 'Name is required';
			return;
		}

		submitting = true;

		try {
			const dimensions =
				width && length ? { width: Number(width), length: Number(length), unit } : undefined;

			await createProperty({ name: trimmedName, dimensions });
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create property';
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="mx-auto max-w-md space-y-6 p-4">
	<h2 class="text-2xl font-bold">Create Your Property</h2>

	<div>
		<label for="property-name" class="mb-1 block text-sm font-medium">Property Name</label>
		<input
			id="property-name"
			type="text"
			bind:value={name}
			placeholder="e.g., My Garden"
			class="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
		/>
	</div>

	{#if error}
		<p class="text-sm text-red-600">{error}</p>
	{/if}

	<fieldset class="space-y-3">
		<legend class="text-sm font-medium text-gray-600">Dimensions (optional)</legend>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="property-width" class="mb-1 block text-sm">Width</label>
				<input
					id="property-width"
					type="number"
					bind:value={width}
					min="0"
					step="any"
					placeholder="0"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
				/>
			</div>
			<div>
				<label for="property-length" class="mb-1 block text-sm">Length</label>
				<input
					id="property-length"
					type="number"
					bind:value={length}
					min="0"
					step="any"
					placeholder="0"
					class="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
				/>
			</div>
		</div>

		<div>
			<label for="property-unit" class="mb-1 block text-sm">Unit</label>
			<select
				id="property-unit"
				bind:value={unit}
				class="w-full rounded border border-gray-300 px-3 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
			>
				<option value="ft">Feet</option>
				<option value="m">Meters</option>
			</select>
		</div>
	</fieldset>

	<button
		type="submit"
		disabled={submitting}
		class="w-full rounded bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50"
	>
		{submitting ? 'Creating...' : 'Create Property'}
	</button>
</form>
