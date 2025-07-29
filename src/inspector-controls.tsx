/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, Notice } from '@wordpress/components';
import type { ResponsiveFocalControlsProps } from './types';
import { DEVICE_BREAKPOINTS } from './constants';
import { DeviceFocalPointControl } from './components/device-focal-point-control';
import { useDeviceStateManagement } from './hooks/use-device-state-management';

/**
 * Responsive focal point settings UI
 * @param props               Component props
 * @param props.attributes    Block attributes
 * @param props.setAttributes Function to update attributes
 */
export const ResponsiveFocalControls = (
	props: ResponsiveFocalControlsProps
) => {
	const { attributes, setAttributes } = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [] } = safeAttributes;

	// Device state management using custom hook
	const {
		mobileEnabled,
		tabletEnabled,
		mobileFocalPoint,
		tabletFocalPoint,
		toggleDeviceFocalPoint,
		updateDeviceFocalPoint,
		hasAnyDeviceEnabled,
	} = useDeviceStateManagement( responsiveFocal, setAttributes );

	// Extract URL only when needed for DeviceFocalPointControl components
	const { url } = safeAttributes;

	return (
		<PanelBody
			title={ __( 'Responsive Focal Points', 'cover-responsive-focal' ) }
			initialOpen={ false }
			opened={ true }
		>
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

			{ ! hasAnyDeviceEnabled && (
				<Notice status="info" isDismissible={ false }>
					{ __(
						'No responsive focal points enabled. Using default focal point for all devices.',
						'cover-responsive-focal'
					) }
				</Notice>
			) }
		</PanelBody>
	);
};
