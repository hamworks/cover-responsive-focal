/**
 * Cover Responsive Focal - Block Save Extension
 * Extends the core/cover block save functionality to add data-fp-id attribute
 */

import { addFilter } from '@wordpress/hooks';
import { createElement } from '@wordpress/element';
import type { ReactNode, ReactElement } from 'react';
import type { CoverBlockAttributes } from './types';

// Interface for block type
interface BlockType {
	name?: string;
}

/**
 * Filter function to extend cover block save processing
 * Adds data-fp-id attribute when responsiveFocal is not empty
 *
 * @param element    - Original save element
 * @param blockType  - Block type object
 * @param attributes - Block attributes
 * @return Modified save element or original element
 */
const extendCoverBlockSave = (
	element: ReactNode,
	blockType: BlockType | null | undefined,
	attributes: CoverBlockAttributes | null | undefined
): ReactNode => {
	// Only process core/cover blocks
	if ( ! blockType || blockType.name !== 'core/cover' ) {
		return element;
	}

	// Handle null/undefined attributes
	if ( ! attributes ) {
		return element;
	}

	const { responsiveFocal, dataFpId } = attributes;

	// Return original element if responsiveFocal is empty or invalid
	if (
		! responsiveFocal ||
		! Array.isArray( responsiveFocal ) ||
		responsiveFocal.length === 0
	) {
		return element;
	}

	// Generate or use existing dataFpId
	// Using WordPress-style unique ID generation similar to instance IDs
	const fpId =
		dataFpId ||
		`crf-${ Date.now() }-${ Math.floor( Math.random() * 10000 ) }`;

	// Type guard to check if element is a React element with props
	const isReactElement = ( el: ReactNode ): el is ReactElement => {
		return el !== null && typeof el === 'object' && 'props' in el;
	};

	// Get existing props from element (if it's a React element with props)
	const existingProps = isReactElement( element ) ? element.props : {};

	// Create new element with data-fp-id attribute
	// Using WordPress createElement function for proper type compatibility
	return createElement(
		'div',
		{
			...existingProps,
			'data-fp-id': fpId,
		},
		element
	);
};

// Register the filter hook
addFilter( 'blocks.getSaveElement', 'crf/extend-save', extendCoverBlockSave );

// Export for testing
export { extendCoverBlockSave };
