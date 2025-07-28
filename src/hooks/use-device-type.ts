/**
 * Custom hook to get WordPress editor device preview type
 */

import { useSelect } from '@wordpress/data';

/**
 * Get the current device preview type from WordPress editor
 * @returns Device type: 'Desktop' | 'Tablet' | 'Mobile'
 */
export const useDeviceType = (): string => {
	return useSelect( ( select ) => {
		// Try different store/selector combinations for different WP versions
		const editPost = select( 'core/edit-post' ) as any;
		const editor = select( 'core/editor' ) as any;
		
		// WordPress 6.x uses this
		if ( editor && editor.getDeviceType ) {
			return editor.getDeviceType();
		}
		
		// Older versions might use this
		if ( editPost && editPost.__experimentalGetPreviewDeviceType ) {
			return editPost.__experimentalGetPreviewDeviceType();
		}
		
		// Default to Desktop if none available
		return 'Desktop';
	}, [] );
};

/**
 * Get effective viewport width based on device preview mode
 * @returns Viewport width in pixels
 */
export const useEffectiveViewportWidth = (): number => {
	const deviceType = useDeviceType();
	
	switch ( deviceType ) {
		case 'Mobile':
			return 360; // Common mobile width
		case 'Tablet':
			return 768; // Common tablet width
		default:
			return window.innerWidth; // Desktop uses actual viewport
	}
};