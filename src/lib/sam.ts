import type { PersonDetails } from '$lib/interfaces';

export const SAM: PersonDetails = {
	id: -1,
	name: 'Sam Warnick',
	popularity: 1000000,
	mediaType: 'person',
	profilePath: '/img/sam.jpg',
	knownFor: [
		{ id: -1, title: 'Decce', mediaType: 'movie', posterPath: '', releaseDate: '' },
		{ id: -2, title: 'ScreenCred', mediaType: 'movie', posterPath: '', releaseDate: '' }
	]
};
