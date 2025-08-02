import { browser } from '$app/environment';

export class LocalStorage<T> {
	private readonly _key: string;
	value = $state<T>() as T;

	constructor(key: string, initialValue: T) {
		this._key = key;
		this.value = initialValue;

		if (browser) {
			const item = localStorage.getItem(key);
			if (item) {
				this.value = JSON.parse(item);
			}
		}

		$effect.root(() => {
			$effect(() => {
				localStorage.setItem(this._key, JSON.stringify(this.value));
			});
		});
	}
}

export function localStore<T>(key: string, initialValue: T): LocalStorage<T> {
	return new LocalStorage(key, initialValue);
}
