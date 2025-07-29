/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, PanelRow, ToggleControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { DEFAULTS, DEVICE_BREAKPOINTS } from './constants';
import { DeviceFocalPointControl } from './components/device-focal-point-control';

/**
 * Responsive focal point settings UI
 * @param props               Component props
 * @param props.attributes    Block attributes
 * @param props.setAttributes Function to update attributes
 */
export const ResponsiveFocalControls = (
	props: ResponsiveFocalControlsProps
) => {
	const {
		attributes,
		setAttributes,
		previewFocalPoint,
		setPreviewFocalPoint,
	} = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [], url } = safeAttributes;
	const previewEnabled = !! previewFocalPoint;

	// Device-specific state management
	const [ mobileEnabled, setMobileEnabled ] = useState(
		responsiveFocal.some( ( fp ) => fp.device === 'mobile' )
	);
	const [ tabletEnabled, setTabletEnabled ] = useState(
		responsiveFocal.some( ( fp ) => fp.device === 'tablet' )
	);

	// Find existing focal points by device
	const mobileFocalPoint = responsiveFocal.find(
		( fp ) => fp.device === 'mobile'
	);
	const tabletFocalPoint = responsiveFocal.find(
		( fp ) => fp.device === 'tablet'
	);

	/**
	 * Update focal point for specific device
	 * @param device
	 * @param x
	 * @param y
	 */
	const updateDeviceFocalPoint = (
		device: 'mobile' | 'tablet',
		x: number,
		y: number
	) => {
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
	};

	/**
	 * Remove focal point for specific device
	 * @param device
	 */
	const removeDeviceFocalPoint = ( device: 'mobile' | 'tablet' ) => {
		const updatedFocals = responsiveFocal.filter(
			( fp ) => fp.device !== device
		);
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Toggle device focal point
	 * @param device
	 * @param enabled
	 */
	const toggleDeviceFocalPoint = (
		device: 'mobile' | 'tablet',
		enabled: boolean
	) => {
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

		// Update local state
		if ( device === 'mobile' ) {
			setMobileEnabled( enabled );
		} else {
			setTabletEnabled( enabled );
		}
	};

	return (
		<PanelBody
			title={ __( 'Responsive Focal Points', 'cover-responsive-focal' ) }
			initialOpen={ false }
		>
			<ToggleControl
				label={ __( 'Preview in Editor', 'cover-responsive-focal' ) }
				help={
					previewEnabled
						? __(
								'Showing responsive focal point preview',
								'cover-responsive-focal'
						  )
						: __(
								'Preview disabled, showing core focal point',
								'cover-responsive-focal'
						  )
				}
				checked={ previewEnabled }
				onChange={ ( value ) => {
					if ( value && responsiveFocal.length > 0 ) {
						// Use first available responsive focal point as preview
						const firstFocal = responsiveFocal[ 0 ];
						setPreviewFocalPoint( {
							x: firstFocal.x,
							y: firstFocal.y,
						} );
					} else {
						// Disable preview
						setPreviewFocalPoint( null );
					}
				} }
			/>

			{ /* Mobile Focal Point Settings */ }
			<DeviceFocalPointControl
				device="mobile"
				label={ __( 'Mobile Focal Point', 'cover-responsive-focal' ) }
				description={ DEVICE_BREAKPOINTS.mobile.description }
				enabled={ mobileEnabled }
				focalPoint={ mobileFocalPoint }
				url={ url }
				onToggle={ ( enabled ) =>
					toggleDeviceFocalPoint( 'mobile', enabled )
				}
				onFocalPointChange={ ( x, y ) =>
					updateDeviceFocalPoint( 'mobile', x, y )
				}
			/>

			{ /* Tablet Focal Point Settings */ }
			<DeviceFocalPointControl
				device="tablet"
				label={ __( 'Tablet Focal Point', 'cover-responsive-focal' ) }
				description={ DEVICE_BREAKPOINTS.tablet.description }
				enabled={ tabletEnabled }
				focalPoint={ tabletFocalPoint }
				url={ url }
				onToggle={ ( enabled ) =>
					toggleDeviceFocalPoint( 'tablet', enabled )
				}
				onFocalPointChange={ ( x, y ) =>
					updateDeviceFocalPoint( 'tablet', x, y )
				}
			/>

			{ ! mobileEnabled && ! tabletEnabled && (
				<PanelRow>
					<p
						style={ {
							fontStyle: 'italic',
							color: '#666',
						} }
					>
						{ __(
							'No responsive focal points enabled. Using default focal point for all devices.',
							'cover-responsive-focal'
						) }
					</p>
				</PanelRow>
			) }
		</PanelBody>
	);
};
