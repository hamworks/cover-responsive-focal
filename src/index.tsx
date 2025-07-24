/**
 * Cover Responsive Focal - Main Entry Point
 */

import { addFilter } from '@wordpress/hooks';
import type { BlockEditProps } from '@wordpress/blocks';
import { createHigherOrderComponent } from '@wordpress/compose';
import { InspectorControls } from '@wordpress/block-editor';

import { ResponsiveFocalControls } from './inspector-controls';
import type { CoverBlockAttributes, WPBlockType, WPSaveElement } from './types';
import './block-attributes'; // Load block attributes extension
import './editor.scss';

/**
 * Extend cover block editor UI
 */
const withResponsiveFocalControls = createHigherOrderComponent(
	( BlockEdit ) => {
		return ( props: BlockEditProps< CoverBlockAttributes > ) => {
			// Check if this is a cover block by checking props.name
			if ( props.name !== 'core/cover' ) {
				return <BlockEdit { ...props } />;
			}

			if ( ! props || ! props.attributes || ! props.setAttributes ) {
				return <BlockEdit { ...props } />;
			}

			const { attributes, setAttributes } = props;

			return (
				<>
					<BlockEdit { ...props } />
					<InspectorControls>
						<ResponsiveFocalControls
							attributes={ attributes }
							setAttributes={ setAttributes }
						/>
					</InspectorControls>
				</>
			);
		};
	},
	'withResponsiveFocalControls'
);

addFilter(
	'editor.BlockEdit',
	'crf/with-responsive-focal-controls',
	withResponsiveFocalControls
);

/**
 * Extend cover block save processing
 */
addFilter(
	'blocks.getSaveElement',
	'crf/extend-save',
	(
		element: WPSaveElement,
		blockType: WPBlockType,
		attributes: CoverBlockAttributes
	) => {
		if ( blockType.name !== 'core/cover' ) {
			return element;
		}

		const { responsiveFocal } = attributes;

		// Standard cover block behavior when responsiveFocal is empty
		if (
			! responsiveFocal ||
			! Array.isArray( responsiveFocal ) ||
			responsiveFocal.length === 0
		) {
			return element;
		}

		// Add data-fp-id attribute
		// TODO: Implement save processing (to be implemented in next task)
		// const fpId = dataFpId || `crf-${ Date.now() }`;

		return element;
	}
);
