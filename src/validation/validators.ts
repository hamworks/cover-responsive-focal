/**
 * Cover Responsive Focal - Basic Validation Functions
 */

import type { ValidateFocalPoint, ValidateDeviceType } from '../types';
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
 * Validate device type (simplified for mobile/tablet only)
 * Ensures the device type is one of the supported values
 *
 * @param device - Device type to validate
 * @return true if valid, false otherwise
 */
export const validateDeviceType: ValidateDeviceType = (
	device: unknown
): boolean => {
	// Type check: must be string
	if ( typeof device !== 'string' ) {
		return false;
	}

	// Check against allowed values using constants
	return VALIDATION.DEVICE_TYPES.includes( device as 'mobile' | 'tablet' );
};
