/**
 * Editor styles utilities for responsive focal points
 */

import type { ResponsiveFocalPoint } from '../types';
import { generateObjectPosition as generateObjectPositionFromCSS } from './css-generator';

interface FocalPointCSS {
	x: number;
	y: number;
}

/**
 * Get the appropriate focal point for current device type
 * @param responsiveFocal - Array of responsive focal points
 * @param deviceType      - Current device type from WordPress editor
 * @return Focal point to apply or null if no override needed
 */
export const getFocalPointForDevice = (
	responsiveFocal: ResponsiveFocalPoint[],
	deviceType: string
): FocalPointCSS | null => {
	// If no responsive focal points are set, don't override
	if ( ! responsiveFocal || responsiveFocal.length === 0 ) {
		return null;
	}

	// Map WordPress editor device types to our device types
	let targetDevice: 'mobile' | 'tablet' | null = null;
	switch ( deviceType ) {
		case 'Mobile':
			targetDevice = 'mobile';
			break;
		case 'Tablet':
			targetDevice = 'tablet';
			break;
		case 'Desktop':
		default:
			// For desktop, use default focal point (no override)
			return null;
	}

	// Find matching responsive focal point
	const matchingFocal = responsiveFocal.find(
		( focal ) => focal.device === targetDevice
	);

	if ( matchingFocal ) {
		return {
			x: matchingFocal.x,
			y: matchingFocal.y,
		};
	}

	// No matching focal point found
	return null;
};

/**
 * Generate CSS object-position value from focal point
 * @param focalPoint - Focal point coordinates (0-1 range)
 * @return CSS object-position value (e.g., "60% 40%")
 */
export const generateObjectPosition = ( focalPoint: FocalPointCSS ): string => {
	return generateObjectPositionFromCSS( focalPoint.x, focalPoint.y );
};
