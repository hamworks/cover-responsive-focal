/**
 * CSS generation utilities for responsive focal points
 */

/**
 * Generate object-position CSS value from focal point coordinates
 * @param x - X coordinate (0-1 range)
 * @param y - Y coordinate (0-1 range)
 * @return CSS object-position value (e.g., "60% 40%")
 */
export const generateObjectPosition = ( x: number, y: number ): string => {
	const xPercent = Math.round( x * 100 );
	const yPercent = Math.round( y * 100 );
	return `${ xPercent }% ${ yPercent }%`;
};
