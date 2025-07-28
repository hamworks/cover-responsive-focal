/**
 * Custom hook to find applicable focal point for current viewport
 */

import { useMemo } from '@wordpress/element';
import type { ResponsiveFocalPoint } from '../types';
import { useEffectiveViewportWidth } from './use-device-type';

/**
 * Find the focal point that applies to given viewport width
 * @param responsiveFocal Array of responsive focal points
 * @param viewportWidth The viewport width to check against
 * @returns The applicable focal point or null
 */
export const findApplicableFocalPoint = ( 
	responsiveFocal: ResponsiveFocalPoint[],
	viewportWidth: number
): ResponsiveFocalPoint | null => {
	if ( ! responsiveFocal || responsiveFocal.length === 0 ) {
		return null;
	}
	
	// Separate by media type
	const maxWidthFocals = responsiveFocal.filter( 
		f => ( f.mediaType || 'max-width' ) === 'max-width' 
	);
	const minWidthFocals = responsiveFocal.filter( 
		f => f.mediaType === 'min-width' 
	);
	
	// For max-width: sort ascending (smaller values first for CSS specificity)
	const sortedMaxWidth = [ ...maxWidthFocals ].sort(
		( a, b ) => ( a.breakpoint || 0 ) - ( b.breakpoint || 0 )
	);
	
	// For min-width: sort descending (larger values first for CSS specificity)
	const sortedMinWidth = [ ...minWidthFocals ].sort(
		( a, b ) => ( b.breakpoint || 0 ) - ( a.breakpoint || 0 )
	);
	
	// Find the most specific max-width match
	for ( const focal of sortedMaxWidth ) {
		const bp = focal.breakpoint || 0;
		if ( viewportWidth <= bp ) {
			return focal;
		}
	}
	
	// Find the most specific min-width match
	for ( const focal of sortedMinWidth ) {
		const bp = focal.breakpoint || 0;
		if ( viewportWidth >= bp ) {
			return focal;
		}
	}
	
	return null;
};

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
		return findApplicableFocalPoint( responsiveFocal, viewportWidth );
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