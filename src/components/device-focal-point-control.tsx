/**
 * Cover Responsive Focal - Device Focal Point Control Component
 */

import { __ } from '@wordpress/i18n';
import {
	PanelRow,
	ToggleControl,
	FocalPointPicker,
} from '@wordpress/components';
import type { ResponsiveFocalPoint } from '../types';

interface DeviceFocalPointControlProps {
	device: 'mobile' | 'tablet';
	label: string;
	description: string;
	enabled: boolean;
	focalPoint: ResponsiveFocalPoint | undefined;
	url: string | undefined;
	onToggle: ( enabled: boolean ) => void;
	onFocalPointChange: ( x: number, y: number ) => void;
}

/**
 * Device-specific focal point control component
 * Combines toggle control and focal point picker
 * @param props                    Component properties
 * @param props.device             Device type (mobile/tablet)
 * @param props.label              Display label for the control
 * @param props.description        Device description (e.g., "600px and below")
 * @param props.enabled            Whether the focal point is enabled
 * @param props.focalPoint         Current focal point settings
 * @param props.url                Image URL for the focal point picker
 * @param props.onToggle           Callback when toggle state changes
 * @param props.onFocalPointChange Callback when focal point changes
 */
export const DeviceFocalPointControl = ( {
	device,
	label,
	description,
	enabled,
	focalPoint,
	url,
	onToggle,
	onFocalPointChange,
}: DeviceFocalPointControlProps ) => {
	return (
		<>
			<PanelRow>
				<ToggleControl
					label={ label }
					help={ `${
						device === 'mobile'
							? __( 'Mobile', 'cover-responsive-focal' )
							: __( 'Tablet', 'cover-responsive-focal' )
					} (${ description })` }
					checked={ enabled }
					onChange={ onToggle }
				/>
			</PanelRow>

			{ enabled && url && (
				<PanelRow>
					<FocalPointPicker
						url={ url }
						value={
							focalPoint
								? {
										x: focalPoint.x,
										y: focalPoint.y,
								  }
								: { x: 0.5, y: 0.5 }
						}
						onChange={ ( newFocalPoint ) => {
							onFocalPointChange(
								newFocalPoint.x,
								newFocalPoint.y
							);
						} }
					/>
				</PanelRow>
			) }
		</>
	);
};
