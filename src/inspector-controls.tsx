/**
 * Cover Responsive Focal - Inspector Controls
 */

import { __ } from '@wordpress/i18n';
import { PanelBody, Button, ToggleControl } from '@wordpress/components';
import { Fragment } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import type {
	ResponsiveFocalControlsProps,
	ResponsiveFocalPoint,
} from './types';
import { DEFAULTS } from './constants';
import { ResponsiveFocalItem } from './components/responsive-focal-item';
import { isDevelopment } from './utils/environment';
import { clampBreakpoint } from './utils/validation';

/**
 * Responsive focal point settings UI
 * @param props               Component props
 * @param props.attributes    Block attributes
 * @param props.setAttributes Function to update attributes
 */
export const ResponsiveFocalControls = (
	props: ResponsiveFocalControlsProps
) => {
	const { attributes, setAttributes, previewFocalPoint, setPreviewFocalPoint } = props;
	const safeAttributes = attributes || {};
	const { responsiveFocal = [] } = safeAttributes;
	const previewEnabled = !!previewFocalPoint;
	
	// Get the current device preview mode from WordPress editor
	const deviceType = useSelect( ( select ) => {
		const { __experimentalGetPreviewDeviceType } = select( 'core/edit-post' ) || {};
		if ( __experimentalGetPreviewDeviceType ) {
			return __experimentalGetPreviewDeviceType();
		}
		// Fallback for newer versions
		const { getDeviceType } = select( 'core/editor' ) || {};
		return getDeviceType ? getDeviceType() : 'Desktop';
	}, [] );

	/**
	 * Get effective viewport width based on device preview mode
	 */
	const getEffectiveViewportWidth = () => {
		// Use WordPress editor's device preview sizes
		switch ( deviceType ) {
			case 'Mobile':
				return 360; // Common mobile width
			case 'Tablet':
				return 768; // Common tablet width
			default:
				return window.innerWidth; // Desktop uses actual viewport
		}
	};

	/**
	 * Add new focal point row
	 */
	const addNewFocalPoint = () => {
		const newFocalPoint: ResponsiveFocalPoint = {
			mediaType: DEFAULTS.MEDIA_TYPE,
			breakpoint: DEFAULTS.BREAKPOINT,
			x: DEFAULTS.FOCAL_X,
			y: DEFAULTS.FOCAL_Y,
		};

		setAttributes( {
			responsiveFocal: [ ...responsiveFocal, newFocalPoint ],
		} );
	};

	/**
	 * Remove focal point row
	 * @param index Index to remove
	 */
	const removeFocalPoint = ( index: number ) => {
		const updatedFocals = responsiveFocal.filter(
			( _: ResponsiveFocalPoint, i: number ) => i !== index
		);
		setAttributes( { responsiveFocal: updatedFocals } );
	};

	/**
	 * Update focal point row
	 * @param index   Index to update
	 * @param updates Partial updates to apply
	 */
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
				// eslint-disable-next-line no-console
				console.warn( 'Invalid index for updateFocalPoint:', index );
			}
			return;
		}

		if ( ! updates || typeof updates !== 'object' ) {
			if ( isDevelopment() ) {
				// eslint-disable-next-line no-console
				console.warn(
					'Invalid updates for updateFocalPoint:',
					updates
				);
			}
			return;
		}

		// Safe handling with fallbacks for invalid values
		const safeUpdates: Partial< ResponsiveFocalPoint > = {};

		if ( 'mediaType' in updates ) {
			safeUpdates.mediaType =
				updates.mediaType === 'min-width' ||
				updates.mediaType === 'max-width'
					? updates.mediaType
					: DEFAULTS.MEDIA_TYPE;
		}

		if ( 'breakpoint' in updates ) {
			const numValue =
				typeof updates.breakpoint === 'number' &&
				! isNaN( updates.breakpoint )
					? updates.breakpoint
					: DEFAULTS.BREAKPOINT;
			safeUpdates.breakpoint = clampBreakpoint( numValue );
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

		// Always try to update preview if it's enabled
		if ( previewFocalPoint !== null ) {
			// Find which focal point should apply to current viewport
			const viewportWidth = getEffectiveViewportWidth();
			const sortedFocals = [ ...updatedFocals ].sort(
				( a, b ) => ( b.breakpoint || 0 ) - ( a.breakpoint || 0 )
			);

			let applicableFocal = null;
			for ( const focal of sortedFocals ) {
				const bp = focal.breakpoint || 0;
				const mt = focal.mediaType || 'max-width';

				if (
					mt === 'max-width' &&
					viewportWidth <= bp
				) {
					applicableFocal = focal;
					break;
				} else if (
					mt === 'min-width' &&
					viewportWidth >= bp
				) {
					applicableFocal = focal;
					break;
				}
			}

			// Always preview the focal point being edited for better UX
			// This allows users to see changes even when editing a breakpoint
			// that doesn't match the current viewport
			const focalToPreview = updatedFocals[ index ];
			
			if ( focalToPreview ) {
				const newX = focalToPreview.x || 0.5;
				const newY = focalToPreview.y || 0.5;
				const newPoint = JSON.parse( JSON.stringify( { x: newX, y: newY } ) );
				setPreviewFocalPoint( newPoint );
			}
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
						// Find the focal point that applies to current viewport
						const viewportWidth = getEffectiveViewportWidth();

						// Sort by breakpoint descending
						const sortedFocals = [ ...responsiveFocal ].sort(
							( a, b ) =>
								( b.breakpoint || 0 ) - ( a.breakpoint || 0 )
						);

						let applicableFocal = null;
						for ( const focal of sortedFocals ) {
							const breakpoint = focal.breakpoint || 0;
							const mediaType = focal.mediaType || 'max-width';

							if (
								mediaType === 'max-width' &&
								viewportWidth <= breakpoint
							) {
								applicableFocal = focal;
								break;
							} else if (
								mediaType === 'min-width' &&
								viewportWidth >= breakpoint
							) {
								applicableFocal = focal;
								break;
							}
						}

						// Set preview with applicable focal point or keep enabled with no changes
						if ( applicableFocal ) {
							setPreviewFocalPoint( {
								x: applicableFocal.x || 0.5,
								y: applicableFocal.y || 0.5,
							} );
						} else {
							// Keep preview enabled but with a placeholder value
							// This allows the toggle to stay on even when no focal point matches
							setPreviewFocalPoint( {
								x: attributes.focalPoint?.x || 0.5,
								y: attributes.focalPoint?.y || 0.5,
							} );
						}
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
							// Check if this focal point is active for current viewport
							const viewportWidth = getEffectiveViewportWidth();
							let isActive = false;

							// Sort all focal points by breakpoint descending
							const sortedFocals = [ ...responsiveFocal ].sort(
								( a, b ) =>
									( b.breakpoint || 0 ) -
									( a.breakpoint || 0 )
							);

							// Find which focal point should apply to current viewport
							for ( const sortedFocal of sortedFocals ) {
								const breakpoint = sortedFocal.breakpoint || 0;
								const mediaType =
									sortedFocal.mediaType || 'max-width';

								if (
									mediaType === 'max-width' &&
									viewportWidth <= breakpoint
								) {
									isActive = sortedFocal === focal;
									break;
								} else if (
									mediaType === 'min-width' &&
									viewportWidth >= breakpoint
								) {
									isActive = sortedFocal === focal;
									break;
								}
							}

							return (
								<Fragment key={ index }>
									<ResponsiveFocalItem
										focal={ focal }
										index={ index }
										imageUrl={ safeAttributes.url }
										isActive={ isActive }
										onUpdate={ updateFocalPoint }
										onRemove={ removeFocalPoint }
									/>
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
				{ __( 'Add New Breakpoint', 'cover-responsive-focal' ) }
			</Button>
		</PanelBody>
	);
};
