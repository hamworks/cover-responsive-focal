/**
 * Cover Responsive Focal - Device State Management Hook
 */

import { useState, useEffect, useCallback, useMemo } from '@wordpress/element';
import type { ResponsiveFocalPoint } from '../types';
import { DEFAULTS } from '../constants';
import {
	validateDeviceType,
	validateFocalPoint,
} from '../validation/validators';

interface DeviceStateManagement {
	// State getters
	mobileEnabled: boolean;
	tabletEnabled: boolean;
	mobileFocalPoint: ResponsiveFocalPoint | undefined;
	tabletFocalPoint: ResponsiveFocalPoint | undefined;

	// Action functions
	toggleDeviceFocalPoint: (
		device: 'mobile' | 'tablet',
		enabled: boolean
	) => void;
	updateDeviceFocalPoint: (
		device: 'mobile' | 'tablet',
		x: number,
		y: number
	) => void;
	removeDeviceFocalPoint: ( device: 'mobile' | 'tablet' ) => void;

	// Computed values
	hasAnyDeviceEnabled: boolean;
	enabledDeviceCount: number;
}

/**
 * Custom hook for managing device-specific focal point state
 * Provides centralized state management for mobile and tablet focal points
 *
 * @param responsiveFocal Current responsive focal points array
 * @param setAttributes   Function to update block attributes
 * @return Device state management object
 */
export const useDeviceStateManagement = (
	responsiveFocal: ResponsiveFocalPoint[],
	setAttributes: ( attrs: {
		responsiveFocal: ResponsiveFocalPoint[];
	} ) => void
): DeviceStateManagement => {
	// Local enabled state for UI performance
	const [ mobileEnabled, setMobileEnabled ] = useState( false );
	const [ tabletEnabled, setTabletEnabled ] = useState( false );

	// Find device-specific focal points with memoization
	const mobileFocalPoint = useMemo(
		() => responsiveFocal.find( ( fp ) => fp.device === 'mobile' ),
		[ responsiveFocal ]
	);

	const tabletFocalPoint = useMemo(
		() => responsiveFocal.find( ( fp ) => fp.device === 'tablet' ),
		[ responsiveFocal ]
	);

	// Sync local state with responsiveFocal array changes
	useEffect( () => {
		setMobileEnabled( !! mobileFocalPoint );
		setTabletEnabled( !! tabletFocalPoint );
	}, [ mobileFocalPoint, tabletFocalPoint ] );

	// Update focal point for specific device with validation
	const updateDeviceFocalPoint = useCallback(
		( device: 'mobile' | 'tablet', x: number, y: number ) => {
			// Input validation
			if ( ! validateDeviceType( device ) ) {
				return;
			}

			if ( ! validateFocalPoint( x, y ) ) {
				return;
			}

			const existingIndex = responsiveFocal.findIndex(
				( fp ) => fp.device === device
			);

			if ( existingIndex >= 0 ) {
				// Update existing focal point
				const updatedFocals = [ ...responsiveFocal ];
				updatedFocals[ existingIndex ] = { device, x, y };
				setAttributes( { responsiveFocal: updatedFocals } );
			} else {
				// Add new focal point
				const newFocalPoint: ResponsiveFocalPoint = { device, x, y };
				setAttributes( {
					responsiveFocal: [ ...responsiveFocal, newFocalPoint ],
				} );
			}
		},
		[ responsiveFocal, setAttributes ]
	);

	// Remove focal point for specific device
	const removeDeviceFocalPoint = useCallback(
		( device: 'mobile' | 'tablet' ) => {
			// Input validation
			if ( ! validateDeviceType( device ) ) {
				return;
			}

			const updatedFocals = responsiveFocal.filter(
				( fp ) => fp.device !== device
			);
			setAttributes( { responsiveFocal: updatedFocals } );
		},
		[ responsiveFocal, setAttributes ]
	);

	// Toggle device focal point with error handling
	const toggleDeviceFocalPoint = useCallback(
		( device: 'mobile' | 'tablet', enabled: boolean ) => {
			// Input validation
			if ( ! validateDeviceType( device ) ) {
				return;
			}

			if ( enabled ) {
				// Add default focal point for this device
				updateDeviceFocalPoint(
					device,
					DEFAULTS.FOCAL_X,
					DEFAULTS.FOCAL_Y
				);
			} else {
				// Remove focal point for this device
				removeDeviceFocalPoint( device );
			}
		},
		[ updateDeviceFocalPoint, removeDeviceFocalPoint ]
	);

	// Computed values for UI logic
	const hasAnyDeviceEnabled = useMemo(
		() => mobileEnabled || tabletEnabled,
		[ mobileEnabled, tabletEnabled ]
	);

	const enabledDeviceCount = useMemo(
		() => ( mobileEnabled ? 1 : 0 ) + ( tabletEnabled ? 1 : 0 ),
		[ mobileEnabled, tabletEnabled ]
	);

	return {
		// State getters
		mobileEnabled,
		tabletEnabled,
		mobileFocalPoint,
		tabletFocalPoint,

		// Action functions
		toggleDeviceFocalPoint,
		updateDeviceFocalPoint,
		removeDeviceFocalPoint,

		// Computed values
		hasAnyDeviceEnabled,
		enabledDeviceCount,
	};
};
