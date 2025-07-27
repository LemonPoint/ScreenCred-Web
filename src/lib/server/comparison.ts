import type { MediaDetails, MediaType, SimpleCredit } from '../interfaces';
import { getCredits } from './tmdb';

export interface UnionComparison {
	type: 'union';
	credits: CombinedCredit[];
}

interface CombinedCredit {
	id: number;
	name: string;
	profilePath?: string;
	roles: {
		firstCast: string[];
		secondCast: string[];
		firstCrew: string[];
		secondCrew: string[];
	};
	type: MediaType;
}

export interface SimpleComparison {
	type: 'simple';
	castCredits: SimpleCredit[];
	crewCredits: SimpleCredit[];
}

function typesAreLike(type: MediaType, other: MediaType) {
	const similarTypes = canBeLike(type);
	return similarTypes.includes(other);
}

function canBeLike(type: MediaType): MediaType[] {
	switch (type) {
		case 'movie':
		case 'tv':
			return ['movie', 'tv'];
		case 'person':
			return ['person'];
	}
}

export async function compare(
	first: MediaDetails,
	second: MediaDetails
): Promise<UnionComparison | SimpleComparison> {
	if (typesAreLike(first.mediaType, second.mediaType)) {
		return compareLikeTypes(first, second);
	} else {
		return compareDifferentTypes(first, second);
	}
}

async function compareLikeTypes(
	first: MediaDetails,
	second: MediaDetails
): Promise<UnionComparison> {
	if (
		(first.mediaType === 'person' && first.id === -1) ||
		(second.mediaType === 'person' && second.id === -1)
	) {
		// Sam
		return {
			type: 'union',
			credits: []
		};
	}

	const { cast: firstCast, crew: firstCrew } = await getCredits(first.mediaType, first.id);
	const { cast: secondCast, crew: secondCrew } = await getCredits(second.mediaType, second.id);
	let combinedCredits: CombinedCredit[] = [];
	addCredits(firstCast, combinedCredits, 'firstCast');
	addCredits(firstCrew, combinedCredits, 'firstCrew');
	addCredits(secondCast, combinedCredits, 'secondCast');
	addCredits(secondCrew, combinedCredits, 'secondCrew');

	combinedCredits = combinedCredits
		.filter((c) => {
			return (
				c.roles.firstCast.length + c.roles.firstCrew.length > 0 &&
				c.roles.secondCast.length + c.roles.secondCrew.length > 0
			);
		})
		// TODO: Make this configurable and stuff
		.toSorted((a, b) => {
			const aCount =
				a.roles.firstCast.length +
				a.roles.firstCrew.length +
				a.roles.secondCast.length +
				a.roles.secondCrew.length;
			const bCount =
				b.roles.firstCast.length +
				b.roles.firstCrew.length +
				b.roles.secondCast.length +
				b.roles.secondCrew.length;
			if (aCount == bCount) {
				return a.name.localeCompare(b.name);
			}
			return bCount - aCount;
		});

	return {
		type: 'union',
		credits: combinedCredits
	};
}

function addCredits(
	credits: SimpleCredit[],
	combinedCredits: CombinedCredit[],
	key: keyof CombinedCredit['roles']
) {
	credits.forEach((credit) => {
		const existing = combinedCredits.find((c) => c.id === credit.id);
		if (existing) {
			existing.roles[key].push(credit.role);
		} else {
			const combinedCredit: CombinedCredit = {
				id: credit.id,
				name: credit.name,
				profilePath: credit.profilePath,
				roles: { firstCast: [], secondCast: [], firstCrew: [], secondCrew: [] },
				type: credit.type
			};
			combinedCredit.roles[key].push(credit.role);
			combinedCredits.push(combinedCredit);
		}
	});
}

async function compareDifferentTypes(
	first: MediaDetails,
	second: MediaDetails
): Promise<SimpleComparison> {
	const person = first.mediaType === 'person' ? first : second;
	const media = first.mediaType !== 'person' ? first : second;

	if (person.id === -1) {
		return {
			type: 'simple',
			castCredits: [],
			crewCredits: []
		};
	}

	const { cast, crew } = await getCredits(media.mediaType, media.id);
	const castCredits = cast.filter((c) => c.id === person.id);
	const crewCredits = crew.filter((c) => c.id === person.id);

	return {
		type: 'simple',
		castCredits,
		crewCredits
	};
}
