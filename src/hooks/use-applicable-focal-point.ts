/**
 * Custom hook to find applicable focal point for current viewport
 */

/* eslint-disable @wordpress/no-unused-vars-before-return */
import { useMemo } from '@wordpress/element';
import type { ResponsiveFocalPoint } from '../types';
import { useEffectiveViewportWidth } from './use-device-type';

/**
 * Find the focal point that applies to given viewport width (simplified for device types)
 * @param responsiveFocal Array of responsive focal points
 * @param viewportWidth   The viewport width to check against
 * @return The applicable focal point or null
 */
export const findApplicableFocalPoint = (
	responsiveFocal: ResponsiveFocalPoint[],
	viewportWidth: number
): ResponsiveFocalPoint | null => {
	if ( ! responsiveFocal || responsiveFocal.length === 0 ) {
		return null;
	}

	// Find the device type that applies to current viewport width
	// Mobile: <= 600px, Tablet: 601px-1024px
	let targetDevice: 'mobile' | 'tablet';
	if ( viewportWidth <= 600 ) {
		targetDevice = 'mobile';
	} else if ( viewportWidth <= 1024 ) {
		targetDevice = 'tablet';
	} else {
		// For desktop (>1024px), return null as we don't support it
		return null;
	}

	// Find focal point for the target device
	const deviceFocal = responsiveFocal.find(
		( f ) => f.device === targetDevice
	);

	return deviceFocal || null;
};

/**
 * Find the focal point that applies to current viewport
 * @param responsiveFocal Array of responsive focal points
 * @return The applicable focal point or null
 */
export const useApplicableFocalPoint = (
	responsiveFocal: ResponsiveFocalPoint[]
): ResponsiveFocalPoint | null => {
	const viewportWidth = useEffectiveViewportWidth();

	return useMemo( () => {
		return findApplicableFocalPoint( responsiveFocal, viewportWidth );
	}, [ responsiveFocal, viewportWidth ] );
};

/**
 * Check if a specific focal point is active for current viewport (simplified)
 * @param focal           The focal point to check
 * @param responsiveFocal All responsive focal points
 * @return Whether the focal point is active
 */
export const useIsFocalPointActive = (
	focal: ResponsiveFocalPoint,
	responsiveFocal: ResponsiveFocalPoint[]
): boolean => {
	const applicableFocal = useApplicableFocalPoint( responsiveFocal );

	return useMemo( () => {
		if ( ! applicableFocal || ! focal ) {
			return false;
		}

		return applicableFocal.device === focal.device;
	}, [ applicableFocal, focal ] );
};

/**
 * Check if a device applies to current viewport (simplified)
 * @param device The device type to check
 * @return Whether the device applies
 */
export const useDeviceApplies = ( device: 'mobile' | 'tablet' ): boolean => {
	const viewportWidth = useEffectiveViewportWidth();

	return useMemo( () => {
		if ( device === 'mobile' ) {
			return viewportWidth <= 600;
		} else if ( device === 'tablet' ) {
			return viewportWidth > 600 && viewportWidth <= 1024;
		}
		return false;
	}, [ device, viewportWidth ] );
};
