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
 * @param root0
 * @param root0.device
 * @param root0.label
 * @param root0.description
 * @param root0.enabled
 * @param root0.focalPoint
 * @param root0.url
 * @param root0.onToggle
 * @param root0.onFocalPointChange
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
