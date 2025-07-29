/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, Button, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { DEFAULTS } from './constants';
// Note: ResponsiveFocalItem will be replaced with new device-based UI components
// TODO: Task 4.2 - These imports will be needed for new device-based UI
// import { isDevelopment } from './utils/environment';
// import {
// 	useApplicableFocalPoint,
// 	findApplicableFocalPoint,
// } from './hooks/use-applicable-focal-point';
// import { useEffectiveViewportWidth } from './hooks/use-device-type';

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
	const { responsiveFocal = [] } = safeAttributes;
	const previewEnabled = !! previewFocalPoint;

	// TODO: Task 4.2 - These hooks will be needed for new device-based UI
	// const applicableFocalPoint = useApplicableFocalPoint( responsiveFocal );
	// const viewportWidth = useEffectiveViewportWidth();

	/**
	 * Add new focal point row
	 */
	const addNewFocalPoint = () => {
		const newFocalPoint: ResponsiveFocalPoint = {
			device: DEFAULTS.DEVICE,
			x: DEFAULTS.FOCAL_X,
			y: DEFAULTS.FOCAL_Y,
		};

		setAttributes( {
			responsiveFocal: [ ...responsiveFocal, newFocalPoint ],
		} );
	};

	// TODO: Task 4.2 - Implement device-based UI components
	// TODO: Task 4.3 - Device state management
	// The following functions will be needed when implementing new device-based UI

	/*
	const removeFocalPoint = ( index: number ) => {
		const updatedFocals = responsiveFocal.filter(
			( _: ResponsiveFocalPoint, i: number ) => i !== index
		);
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	const updateFocalPoint = (
		index: number,
		updates: Partial< ResponsiveFocalPoint >
	) => {
		// Safe handling of index and updates
		if (
			typeof index !== 'number' ||
			index < 0 ||
			index >= responsiveFocal.length
		) {
			if ( isDevelopment() ) {
				console.warn( 'Invalid index for updateFocalPoint:', index );
			}
			return;
		}

		if ( ! updates || typeof updates !== 'object' ) {
			if ( isDevelopment() ) {
				console.warn(
					'Invalid updates for updateFocalPoint:',
					updates
				);
			}
			return;
		}

		// Safe handling with fallbacks for invalid values
		const safeUpdates: Partial< ResponsiveFocalPoint > = {};

		if ( 'device' in updates ) {
			safeUpdates.device =
				updates.device === 'mobile' || updates.device === 'tablet'
					? updates.device
					: DEFAULTS.DEVICE;
		}

		if ( 'x' in updates ) {
			safeUpdates.x =
				typeof updates.x === 'number' && ! isNaN( updates.x )
					? Math.max( 0, Math.min( 1, updates.x ) )
					: DEFAULTS.FOCAL_X;
		}

		if ( 'y' in updates ) {
			safeUpdates.y =
				typeof updates.y === 'number' && ! isNaN( updates.y )
					? Math.max( 0, Math.min( 1, updates.y ) )
					: DEFAULTS.FOCAL_Y;
		}

		const updatedFocals = [ ...responsiveFocal ];
		updatedFocals[ index ] = { ...updatedFocals[ index ], ...safeUpdates };
		setAttributes( { responsiveFocal: updatedFocals } );

		// Update preview only if the edited focal point is the applicable one
		if ( previewFocalPoint !== null ) {
			const updatedApplicableFocal = findApplicableFocalPoint(
				updatedFocals,
				viewportWidth
			);
			const editedFocal = updatedFocals[ index ];

			// Only update preview if the edited focal point is the one that applies to current viewport
			if (
				updatedApplicableFocal &&
				editedFocal &&
				updatedApplicableFocal.device === editedFocal.device
			) {
				const newX = editedFocal.x || 0.5;
				const newY = editedFocal.y || 0.5;
				const newPoint = { x: newX, y: newY };
				setPreviewFocalPoint( newPoint );
			}
		}
	};
	*/

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
					// TODO: Task 4.2 - Implement preview logic for device-based UI
					if ( value && responsiveFocal.length > 0 ) {
						// Temporary fallback - use core focal point
						setPreviewFocalPoint( {
							x: attributes.focalPoint?.x || 0.5,
							y: attributes.focalPoint?.y || 0.5,
						} );
					} else {
						// Disable preview
						setPreviewFocalPoint( null );
					}
				} }
			/>
			{ responsiveFocal.length === 0 ? (
				<p>
					{ __(
						'No responsive focal points set.',
						'cover-responsive-focal'
					) }
				</p>
			) : (
				<div>
					{ responsiveFocal.map(
						( focal: ResponsiveFocalPoint, index: number ) => {
							// TODO: Task 4.2 - Use these variables when implementing new device-based UI
							/*
							const isActive = applicableFocalPoint
								? applicableFocalPoint.device === focal.device
								: false;

							const duplicates = responsiveFocal.filter(
								( f, i ) =>
									i !== index && f.device === focal.device
							);
							const isDuplicate = duplicates.length > 0;
							*/

							return (
								<Fragment key={ index }>
									{ /* TODO: Replace with new device-based UI component */ }
									<div>
										Device: { focal.device }, X: { focal.x }
										, Y: { focal.y }
									</div>
									<hr />
								</Fragment>
							);
						}
					) }
				</div>
			) }

			<Button
				variant="primary"
				onClick={ addNewFocalPoint }
				className="crf-add-focal-point"
			>
				{ __( 'Add New Device', 'cover-responsive-focal' ) }
			</Button>
		</PanelBody>
	);
};
