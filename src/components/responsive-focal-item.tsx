/**
 * Responsive Focal Item Component
 * Single responsive focal point item component
 */

import { __ } from '@wordpress/i18n';
import { Button, FocalPointPicker } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import type { ResponsiveFocalPoint } from '../types';
import { DEFAULTS } from '../constants';
import { SafeMediaTypeControl } from './safe-media-type-control';
import { SafeBreakpointControl } from './safe-breakpoint-control';
import { SafeStackLayout } from './safe-stack-layout';

/**
 * Props for ResponsiveFocalItem
 */
interface ResponsiveFocalItemProps {
	focal: ResponsiveFocalPoint;
	index: number;
	imageUrl?: string;
	isActive?: boolean;
	onUpdate: (
		index: number,
		updates: Partial< ResponsiveFocalPoint >
	) => void;
	onRemove: ( index: number ) => void;
}

/**
 * Single responsive focal point item component
 * @param props Component props
 */
export const ResponsiveFocalItem = ( props: ResponsiveFocalItemProps ) => {
	const { focal, index, imageUrl, isActive, onUpdate, onRemove } = props;
	
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
	
	// Get effective viewport width based on device preview mode
	const getEffectiveViewportWidth = () => {
		switch ( deviceType ) {
			case 'Mobile':
				return 360; // Common mobile width
			case 'Tablet':
				return 768; // Common tablet width
			default:
				return window.innerWidth; // Desktop uses actual viewport
		}
	};
	
	// Safe handling of focal point data
	const safeFocal = {
		mediaType: focal?.mediaType || DEFAULTS.MEDIA_TYPE,
		breakpoint:
			typeof focal?.breakpoint === 'number' && ! isNaN( focal.breakpoint )
				? focal.breakpoint
				: DEFAULTS.BREAKPOINT,
		x:
			typeof focal?.x === 'number' && ! isNaN( focal.x )
				? focal.x
				: DEFAULTS.FOCAL_X,
		y:
			typeof focal?.y === 'number' && ! isNaN( focal.y )
				? focal.y
				: DEFAULTS.FOCAL_Y,
	};

	// Check if this breakpoint applies to current viewport
	const viewportWidth = getEffectiveViewportWidth();
	const appliesToViewport = safeFocal.mediaType === 'max-width' 
		? viewportWidth <= safeFocal.breakpoint
		: viewportWidth >= safeFocal.breakpoint;

	return (
		<SafeStackLayout spacing={ 3 }>
			{ isActive && (
				<div
					style={ {
						padding: '8px',
						backgroundColor: '#e0f2fe',
						borderRadius: '4px',
						marginBottom: '8px',
						fontSize: '12px',
						color: '#0369a1',
					} }
				>
					{ __(
						'Active for current viewport',
						'cover-responsive-focal'
					) }
				</div>
			) }
			{ !appliesToViewport && (
				<div
					style={ {
						padding: '8px',
						backgroundColor: '#fef3c7',
						borderRadius: '4px',
						marginBottom: '8px',
						fontSize: '12px',
						color: '#92400e',
					} }
				>
					{ __(
						'Note: This breakpoint does not apply to current viewport size',
						'cover-responsive-focal'
					) }
				</div>
			) }
			<SafeMediaTypeControl
				label={ __( 'Media Query Type', 'cover-responsive-focal' ) }
				value={ safeFocal.mediaType }
				onChange={ ( mediaType ) =>
					onUpdate( index, {
						mediaType,
					} )
				}
			/>

			<SafeBreakpointControl
				label={ __( 'Breakpoint (px)', 'cover-responsive-focal' ) }
				value={ safeFocal.breakpoint }
				onChange={ ( breakpoint ) =>
					onUpdate( index, {
						breakpoint,
					} )
				}
			/>

			{ imageUrl && (
				<FocalPointPicker
					label={ __( 'Focal Point', 'cover-responsive-focal' ) }
					url={ imageUrl }
					value={ { x: safeFocal.x, y: safeFocal.y } }
					onChange={ ( focalPoint ) => {
						const safeX =
							typeof focalPoint?.x === 'number' &&
							! isNaN( focalPoint.x )
								? focalPoint.x
								: DEFAULTS.FOCAL_X;
						const safeY =
							typeof focalPoint?.y === 'number' &&
							! isNaN( focalPoint.y )
								? focalPoint.y
								: DEFAULTS.FOCAL_Y;
						onUpdate( index, {
							x: safeX,
							y: safeY,
						} );
					} }
				/>
			) }
			<Button variant="secondary" onClick={ () => onRemove( index ) }>
				{ __( 'Remove', 'cover-responsive-focal' ) }
			</Button>
		</SafeStackLayout>
	);
};
