<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		delay?: number;
		onSearch: (value: string) => void;
	}

	let {
		value = $bindable(''),
		delay = 300,
		placeholder = '',
		onSearch,
		...restProps
	}: Props = $props();

	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;

		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			onSearch(value);
		}, delay);
	}

	$effect(() => {
		return () => clearTimeout(debounceTimer);
	});
</script>

<input type="text" {value} {placeholder} oninput={handleInput} {...restProps} />

<style>
	input {
		width: 100%;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 10px;
		box-shadow: var(--shadow-2);
	}
</style>
