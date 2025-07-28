/**
 * Cover Responsive Focal - Type Definitions
 */

import type { Element } from '@wordpress/element';
import type { BlockEditProps } from '@wordpress/blocks';

// FocalPoint type definition (matches WordPress FocalPointPicker)
interface FocalPoint {
	x: number;
	y: number;
}

/**
 * Responsive focal point settings
 */
export interface ResponsiveFocalPoint {
	/** Media query type */
	mediaType: 'min-width' | 'max-width';
	/** Breakpoint value in pixels */
	breakpoint: number;
	/** X coordinate (0-1 range) */
	x: number;
	/** Y coordinate (0-1 range) */
	y: number;
}

// Using @wordpress/components FocalPoint type instead of custom definition

/**
 * SelectControl option type
 */
export interface SelectOption {
	/** The label shown to the user */
	label: string;
	/** The internal value */
	value: string;
}

/**
 * Cover block attributes (minimal definition + plugin-specific)
 * Note: WordPress doesn't provide official Cover block types
 */
export interface CoverBlockAttributes {
	// Core attributes (only what we actually use)
	url?: string;
	id?: number;
	focalPoint?: FocalPoint;

	// Plugin-specific attributes
	responsiveFocal?: ResponsiveFocalPoint[];
	dataFpId?: string;

	// Allow any other core attributes
	[ key: string ]: unknown;
}

/**
 * Inspector controls component props (using WordPress standard)
 */
export type ResponsiveFocalControlsProps = Pick<
	BlockEditProps< CoverBlockAttributes >,
	'attributes' | 'setAttributes'
> & {
	previewFocalPoint: { x: number; y: number } | null;
	setPreviewFocalPoint: ( value: { x: number; y: number } | null ) => void;
};

/**
 * Media query configuration
 */
export interface MediaQueryConfig {
	/** Media query type */
	type: 'min-width' | 'max-width';
	/** Breakpoint value in pixels */
	value: number;
}

/**
 * WordPress getSaveElement filter types
 */
export type WPSaveElement = Element | null;

/**
 * Validation function type definitions
 * Note: These types are used in validation modules, keep them here for centralized type management
 */
export type ValidateFocalPoint = ( x: unknown, y: unknown ) => boolean;
export type ValidateMediaType = ( mediaType: unknown ) => boolean;
export type ValidateBreakpoint = ( breakpoint: unknown ) => boolean;
export type CreateResponsiveFocalPoint = (
	mediaType: string,
	breakpoint: number,
	x: number,
	y: number
) => ResponsiveFocalPoint | null;
export type GenerateMediaQuery = (
	mediaType: string,
	breakpoint: number
) => string;
