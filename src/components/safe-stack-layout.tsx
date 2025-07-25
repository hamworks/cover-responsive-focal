/**
 * Safe Stack Layout Component
 * Provides a safe wrapper for stack layout with fallback to div
 */

/* eslint-disable @wordpress/no-unsafe-wp-apis */
// eslint-disable-next-line import/no-extraneous-dependencies
import type { ReactNode } from 'react';
import { __experimentalVStack as VStack } from '@wordpress/components';

// Environment check helper for development logging
const isDevelopment = (): boolean => {
	try {
		// Check if we're in development mode, safely handle both browser and Node environments
		return (
			typeof window !== 'undefined' &&
			( window as any )?.wpDevMode === true
		);
	} catch {
		return false;
	}
};

/**
 * Props for SafeStackLayout
 */
interface SafeStackLayoutProps {
	children: ReactNode;
	spacing?: number;
	className?: string;
}

/**
 * Safe wrapper for stack layout with fallback to div
 * @param props Component props
 */
export const SafeStackLayout = ( props: SafeStackLayoutProps ) => {
	const { children, spacing = 3, className } = props;
	// Try VStack first, fallback to regular div
	try {
		if ( VStack ) {
			return (
				<VStack spacing={ spacing } className={ className }>
					{ children }
				</VStack>
			);
		}
	} catch ( error ) {
		// Fallback to regular div if VStack fails
		if ( isDevelopment() ) {
			// eslint-disable-next-line no-console
			console.warn( 'VStack failed, falling back to div:', error );
		}
	}

	// Fallback implementation
	return (
		<div
			className={ `crf-focal-point-item${
				className ? ` ${ className }` : ''
			}` }
			style={ { marginBottom: `${ spacing * 8 }px` } }
		>
			{ children }
		</div>
	);
};
