/**
 * Cover Responsive Focal - Basic Validation Functions
 */

import type {
	ValidateFocalPoint,
	ValidateMediaType,
	ValidateBreakpoint,
} from '../types';
import { VALIDATION } from '../constants';

/**
 * Validate focal point coordinates
 * Ensures both x and y are numbers within the range 0-1
 *
 * @param x - X coordinate (should be 0-1)
 * @param y - Y coordinate (should be 0-1)
 * @return true if valid, false otherwise
 */
export const validateFocalPoint: ValidateFocalPoint = (
	x: unknown,
	y: unknown
): boolean => {
	// Type check: must be numbers
	if ( typeof x !== 'number' || typeof y !== 'number' ) {
		return false;
	}

	// NaN and Infinity check combined
	if ( ! isFinite( x ) || ! isFinite( y ) ) {
		return false;
	}

	// Range check using constants
	return (
		x >= VALIDATION.MIN_FOCAL_POINT &&
		x <= VALIDATION.MAX_FOCAL_POINT &&
		y >= VALIDATION.MIN_FOCAL_POINT &&
		y <= VALIDATION.MAX_FOCAL_POINT
	);
};

/**
 * Validate media type
 * Ensures the media type is one of the supported values
 *
 * @param mediaType - Media type to validate
 * @return true if valid, false otherwise
 */
export const validateMediaType: ValidateMediaType = (
	mediaType: unknown
): boolean => {
	// Type check: must be string
	if ( typeof mediaType !== 'string' ) {
		return false;
	}

	// Check against allowed values using array includes for better maintainability
	const allowedMediaTypes = [ 'min-width', 'max-width' ] as const;
	return allowedMediaTypes.includes( mediaType as 'min-width' | 'max-width' );
};

/**
 * Validate breakpoint value
 * Ensures the breakpoint is a number within the valid range
 *
 * @param breakpoint - Breakpoint value to validate
 * @return true if valid, false otherwise
 */
export const validateBreakpoint: ValidateBreakpoint = (
	breakpoint: unknown
): boolean => {
	// Type check: must be number
	if ( typeof breakpoint !== 'number' ) {
		return false;
	}

	// NaN and Infinity check
	if ( ! isFinite( breakpoint ) ) {
		return false;
	}

	// Range check using constants
	return (
		breakpoint >= VALIDATION.MIN_BREAKPOINT &&
		breakpoint <= VALIDATION.MAX_BREAKPOINT
	);
};
