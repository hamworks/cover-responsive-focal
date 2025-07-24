/**
 * Cover Responsive Focal - ResponsiveFocalPoint Factory
 */

import type {
	CreateResponsiveFocalPoint,
	ResponsiveFocalPoint,
} from '../types';
import {
	validateFocalPoint,
	validateMediaType,
	validateBreakpoint,
} from './validators';

/**
 * Create a ResponsiveFocalPoint object
 * Validates all inputs and returns null if any validation fails
 *
 * @param mediaType  - Media query type
 * @param breakpoint - Breakpoint value
 * @param x          - X coordinate
 * @param y          - Y coordinate
 * @return ResponsiveFocalPoint object or null if invalid
 */
export const createResponsiveFocalPoint: CreateResponsiveFocalPoint = (
	mediaType: string,
	breakpoint: number,
	x: number,
	y: number
): ResponsiveFocalPoint | null => {
	// Validate media type
	if ( ! validateMediaType( mediaType ) ) {
		return null;
	}

	// Validate breakpoint
	if ( ! validateBreakpoint( breakpoint ) ) {
		return null;
	}

	// Validate focal point
	if ( ! validateFocalPoint( x, y ) ) {
		return null;
	}

	// All validations passed, create the object
	return {
		mediaType: mediaType as 'min-width' | 'max-width',
		breakpoint,
		x,
		y,
	};
};
