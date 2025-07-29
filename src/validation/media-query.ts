/**
 * Cover Responsive Focal - Media Query Generation (Simplified)
 */

import type { GetMediaQueryForDevice } from '../types';
import { DEVICE_BREAKPOINTS } from '../constants';

/**
 * Get media query string for device type (simplified)
 * Uses fixed breakpoints for mobile and tablet
 *
 * @param device - Device type (mobile/tablet)
 * @return Formatted media query string
 */
export const getMediaQueryForDevice: GetMediaQueryForDevice = (
	device: 'mobile' | 'tablet'
): string => {
	return DEVICE_BREAKPOINTS[ device ].mediaQuery;
};
