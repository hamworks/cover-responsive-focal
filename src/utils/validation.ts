/**
 * Validation utilities
 */

import { VALIDATION } from '../constants';

/**
 * Clamp breakpoint value to valid range
 * @param value The value to clamp
 * @return Clamped value between MIN_BREAKPOINT and MAX_BREAKPOINT
 */
export const clampBreakpoint = ( value: number ): number => {
	return Math.max(
		VALIDATION.MIN_BREAKPOINT,
		Math.min( VALIDATION.MAX_BREAKPOINT, value )
	);
};
