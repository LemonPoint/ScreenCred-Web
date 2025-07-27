export function camelize(obj: any): any {
	if (obj === null || typeof obj !== 'object') return obj;

	if (Array.isArray(obj)) {
		return obj.map(camelize);
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
		result[camelKey] = camelize(value);
	}
	return result;
}
