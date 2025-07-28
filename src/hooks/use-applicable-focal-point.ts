/**
 * Custom hook to find applicable focal point for current viewport
 */

import { useMemo } from '@wordpress/element';
import type { ResponsiveFocalPoint } from '../types';
import { useEffectiveViewportWidth } from './use-device-type';

/**
 * Find the focal point that applies to current viewport
 * @param responsiveFocal Array of responsive focal points
 * @returns The applicable focal point or null
 */
export const useApplicableFocalPoint = ( 
	responsiveFocal: ResponsiveFocalPoint[] 
): ResponsiveFocalPoint | null => {
	const viewportWidth = useEffectiveViewportWidth();
	
	return useMemo( () => {
		if ( ! responsiveFocal || responsiveFocal.length === 0 ) {
			return null;
		}
		
		// Sort by breakpoint descending
		const sortedFocals = [ ...responsiveFocal ].sort(
			( a, b ) => ( b.breakpoint || 0 ) - ( a.breakpoint || 0 )
		);
		
		// Find applicable focal point
		for ( const focal of sortedFocals ) {
			const bp = focal.breakpoint || 0;
			const mt = focal.mediaType || 'max-width';
			
			if (
				mt === 'max-width' &&
				viewportWidth <= bp
			) {
				return focal;
			} else if (
				mt === 'min-width' &&
				viewportWidth >= bp
			) {
				return focal;
			}
		}
		
		return null;
	}, [ responsiveFocal, viewportWidth ] );
};

/**
 * Check if a specific focal point is active for current viewport
 * @param focal The focal point to check
 * @param responsiveFocal All responsive focal points
 * @returns Whether the focal point is active
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
		
		return (
			applicableFocal.breakpoint === focal.breakpoint &&
			applicableFocal.mediaType === focal.mediaType
		);
	}, [ applicableFocal, focal ] );
};

/**
 * Check if a breakpoint applies to current viewport
 * @param breakpoint The breakpoint value
 * @param mediaType The media query type
 * @returns Whether the breakpoint applies
 */
export const useBreakpointApplies = (
	breakpoint: number,
	mediaType: 'min-width' | 'max-width'
): boolean => {
	const viewportWidth = useEffectiveViewportWidth();
	
	return useMemo( () => {
		return mediaType === 'max-width' 
			? viewportWidth <= breakpoint
			: viewportWidth >= breakpoint;
	}, [ breakpoint, mediaType, viewportWidth ] );
};