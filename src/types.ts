/**
 * Cover Responsive Focal - Type Definitions
 */

import type { ComponentType } from 'react';
import type { FocalPointPicker } from '@wordpress/components';
import type { Element } from '@wordpress/element';

// Extract FocalPoint type from FocalPointPicker component props
type FocalPoint = NonNullable<
	React.ComponentProps< typeof FocalPointPicker >[ 'value' ]
>;

/**
 * WordPress Block Type definition
 */
export interface WPBlockType {
	/** Block name (e.g., 'core/cover') */
	name: string;
	/** Block title */
	title: string;
	/** Block category */
	category?: string;
	/** Block icon */
	icon?: string | ComponentType;
	/** Block keywords */
	keywords?: string[];
	/** Block supports */
	supports?: Record< string, unknown >;
	/** Block attributes definition */
	attributes?: Record< string, unknown >;
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
 * Cover block attributes (extended version including existing attributes)
 */
export interface CoverBlockAttributes {
	// Existing attributes
	/** Background image/video URL */
	url?: string;
	/** Media ID */
	id?: number;
	/** Existing focal point */
	focalPoint?: FocalPoint;
	/** Parallax effect enabled */
	hasParallax?: boolean;
	/** Background opacity */
	dimRatio?: number;
	/** Overlay color */
	overlayColor?: string;
	/** Background type */
	backgroundType?: string;
	/** Minimum height */
	minHeight?: number;
	/** Video poster image */
	poster?: string;

	// New attributes
	/** Array of responsive focal points */
	responsiveFocal: ResponsiveFocalPoint[];
	/** Unique ID for CSS identification */
	dataFpId?: string;
}

/**
 * Inspector controls component props
 */
export interface ResponsiveFocalControlsProps {
	/** Block attributes */
	attributes: CoverBlockAttributes;
	/** Function to update attributes */
	setAttributes: ( attrs: Partial< CoverBlockAttributes > ) => void;
}

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
 * Breakpoint preset
 */
export interface BreakpointPreset {
	/** Display label */
	label: string;
	/** Value in pixels */
	value: number;
}

/**
 * WordPress getSaveElement filter types
 */
export type WPSaveElement = Element | null;

/**
 * Validation function type definitions
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
