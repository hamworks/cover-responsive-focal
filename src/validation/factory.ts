/**
 * Cover Responsive Focal - ResponsiveFocalPoint Factory
 */

import type {
	CreateResponsiveFocalPoint,
	ResponsiveFocalPoint,
} from '../types';
import { validateFocalPoint, validateDeviceType } from './validators';

/**
 * Create a ResponsiveFocalPoint object (simplified)
 * Validates all inputs and returns null if any validation fails
 *
 * @param device - Device type (mobile/tablet)
 * @param x      - X coordinate
 * @param y      - Y coordinate
 * @return ResponsiveFocalPoint object or null if invalid
 */
export const createResponsiveFocalPoint: CreateResponsiveFocalPoint = (
	device: string,
	x: number,
	y: number
): ResponsiveFocalPoint | null => {
	// Validate device type
	if ( ! validateDeviceType( device ) ) {
		return null;
	}

	// Validate focal point
	if ( ! validateFocalPoint( x, y ) ) {
		return null;
	}

	// All validations passed, create the object
	return {
		device: device as 'mobile' | 'tablet',
		x,
		y,
	};
};
