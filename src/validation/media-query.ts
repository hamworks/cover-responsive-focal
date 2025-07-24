/**
 * Cover Responsive Focal - Media Query Generation
 */

import type { GenerateMediaQuery } from '../types';

/**
 * Generate media query string
 * Creates a CSS media query from media type and breakpoint
 *
 * @param mediaType  - Media query type
 * @param breakpoint - Breakpoint value
 * @return Formatted media query string
 */
export const generateMediaQuery: GenerateMediaQuery = (
	mediaType: string,
	breakpoint: number
): string => {
	// Convert to string and remove unnecessary decimal zeros
	const breakpointValue = Number.isInteger( breakpoint )
		? breakpoint
		: breakpoint;
	return `(${ mediaType }: ${ breakpointValue }px)`;
};
