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

<form
	onsubmit={handleSubmit}
	class="mx-auto max-w-md space-y-6 rounded-lg border border-border bg-surface p-6"
	style="box-shadow: var(--shadow-md);"
>
	<div>
		<h2 class="text-2xl font-bold text-foreground">Create Your Property</h2>
		<p class="mt-1 text-sm text-muted">Set up your garden space to get started.</p>
	</div>

	<div>
		<label for="property-name" class="mb-1 block text-sm font-medium text-foreground"
			>Property Name</label
		>
		<input
			id="property-name"
			type="text"
			bind:value={name}
			maxlength={500}
			placeholder="e.g., My Garden"
			class="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
		/>
	</div>

	{#if error}
		<p class="text-sm text-destructive">{error}</p>
	{/if}

	<fieldset class="space-y-3 rounded-md border border-border/60 p-4">
		<legend class="px-1 text-sm font-medium text-muted">Dimensions (optional)</legend>

		<div class="grid grid-cols-2 gap-3">
			<div>
				<label for="property-width" class="mb-1 block text-sm text-foreground">Width</label>
				<input
					id="property-width"
					type="number"
					bind:value={width}
					min="0"
					step="any"
					placeholder="0"
					class="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
				/>
			</div>
			<div>
				<label for="property-length" class="mb-1 block text-sm text-foreground">Length</label>
				<input
					id="property-length"
					type="number"
					bind:value={length}
					min="0"
					step="any"
					placeholder="0"
					class="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground placeholder-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
				/>
			</div>
		</div>

		<div>
			<label for="property-unit" class="mb-1 block text-sm text-foreground">Unit</label>
			<select
				id="property-unit"
				bind:value={unit}
				class="w-full rounded-md border border-border bg-input px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
			>
				<option value="ft">Feet</option>
				<option value="m">Meters</option>
			</select>
		</div>
	</fieldset>

	<button
		type="submit"
		disabled={submitting}
		class="w-full rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground hover:bg-primary-hover disabled:opacity-50"
	>
		{submitting ? 'Creating...' : 'Create Property'}
	</button>
</form>
