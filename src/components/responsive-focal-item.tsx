/**
 * Responsive Focal Item Component
 * Single responsive focal point item component
 */

import { __ } from '@wordpress/i18n';
import { Button, FocalPointPicker } from '@wordpress/components';
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
	const { focal, index, imageUrl, onUpdate, onRemove } = props;
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

	return (
		<SafeStackLayout spacing={ 3 }>
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
