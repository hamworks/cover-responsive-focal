/**
 * Safe Stack Layout Component
 * Provides a safe wrapper for stack layout with fallback to div
 */

/* eslint-disable @wordpress/no-unsafe-wp-apis */
// eslint-disable-next-line import/no-extraneous-dependencies
import type { ReactNode } from 'react';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { isDevelopment } from '../utils/environment';

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
		if ( typeof VStack === 'function' ) {
			return (
				<VStack spacing={ spacing } className={ className }>
					{ children }
				</VStack>
			);
		}
		// If VStack is not available, throw to trigger fallback
		throw new Error( 'VStack is not available' );
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
