/**
 * Environment utilities
 */

/**
 * Extended Window interface with wpDevMode property
 */
interface WindowWithWpDevMode extends Window {
	wpDevMode?: boolean;
}

/**
 * Node.js process type definition for environment detection
 * Only defines the minimal interface we need
 */
declare const process:
	| {
			env?: {
				NODE_ENV?: string;
				[ key: string ]: string | undefined;
			};
	  }
	| undefined;

/**
 * Check if we're in development mode
 * @return true if in development mode
 */
export const isDevelopment = (): boolean => {
	try {
		// Check NODE_ENV first (most common)
		if (
			typeof process !== 'undefined' &&
			process.env?.NODE_ENV === 'development'
		) {
			return true;
		}
		// Check if we're in development mode, safely handle both browser and Node environments
		return (
			typeof window !== 'undefined' &&
			( window as WindowWithWpDevMode ).wpDevMode === true
		);
	} catch {
		return false;
	}
};
