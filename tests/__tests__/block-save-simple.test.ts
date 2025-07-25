/**
 * Cover Responsive Focal - Block Save Extension Tests (Simplified TDD)
 */

// Mock WordPress hooks
const mockAddFilter = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

// Mock WordPress element for createElement
const mockCreateElement = jest.fn();

jest.mock( '@wordpress/element', () => ( {
	createElement: mockCreateElement,
} ) );

// Import types and function for direct testing
import type { ReactElement } from 'react';
import type { CoverBlockAttributes } from '../../src/types';
import { extendCoverBlockSave } from '../../src/block-save';

describe( 'Block Save Extension (TDD)', () => {
	beforeEach( () => {
		mockAddFilter.mockClear();
		mockCreateElement.mockClear();
	} );

	describe( 'filter registration', () => {
		test( 'should register blocks.getSaveElement filter', () => {
			// Clear module cache and require fresh
			jest.resetModules();

			// Import module to trigger side effects
			require( '../../src/block-save' );

			expect( mockAddFilter ).toHaveBeenCalledWith(
				'blocks.getSaveElement',
				'crf/extend-save',
				expect.any( Function )
			);
		} );
	} );

	describe( 'extendCoverBlockSave function behavior', () => {
		test( 'should not modify non-cover blocks', () => {
			const element: ReactElement = {
				type: 'div',
				props: {},
				key: null,
			};
			const blockType = { name: 'core/paragraph' };
			const attributes = {};

			const result = extendCoverBlockSave(
				element,
				blockType,
				attributes
			);

			expect( result ).toBe( element );
		} );

		test( 'should return original element for empty responsiveFocal', () => {
			const element: ReactElement = {
				type: 'div',
				props: {},
				key: null,
			};
			const blockType = { name: 'core/cover' };
			const attributes = { responsiveFocal: [] };

			const result = extendCoverBlockSave(
				element,
				blockType,
				attributes
			);

			expect( result ).toBe( element );
		} );

		test( 'should add data-fp-id when responsiveFocal has items', () => {
			const element: ReactElement = {
				type: 'div',
				props: { className: 'wp-block-cover' },
				key: null,
			};
			const blockType = { name: 'core/cover' };
			const attributes: CoverBlockAttributes = {
				responsiveFocal: [
					{ mediaType: 'max-width', breakpoint: 767, x: 0.6, y: 0.4 },
				],
				dataFpId: 'test-id',
			};

			const expectedElement = {
				type: 'div',
				props: { 'data-fp-id': 'test-id', className: 'wp-block-cover' },
			};
			mockCreateElement.mockReturnValue( expectedElement );

			const result = extendCoverBlockSave(
				element,
				blockType,
				attributes
			);

			expect( mockCreateElement ).toHaveBeenCalledWith(
				'div',
				{ 'data-fp-id': 'test-id', className: 'wp-block-cover' },
				element
			);
			expect( result ).toBe( expectedElement );
		} );

		test( 'should generate dataFpId when not provided', () => {
			const element: ReactElement = {
				type: 'div',
				props: {},
				key: null,
			};
			const blockType = { name: 'core/cover' };
			const attributes: CoverBlockAttributes = {
				responsiveFocal: [
					{ mediaType: 'max-width', breakpoint: 767, x: 0.6, y: 0.4 },
				],
			};

			// Mock Date.now and Math.random for predictable ID
			const mockNow = jest
				.spyOn( Date, 'now' )
				.mockReturnValue( 123456789 );
			const mockRandom = jest
				.spyOn( Math, 'random' )
				.mockReturnValue( 0.5 );

			extendCoverBlockSave( element, blockType, attributes );

			expect( mockCreateElement ).toHaveBeenCalledWith(
				'div',
				{ 'data-fp-id': 'crf-123456789-5000' },
				element
			);

			mockNow.mockRestore();
			mockRandom.mockRestore();
		} );

		test( 'should handle null/undefined gracefully', () => {
			const emptyElement: ReactElement = {
				type: 'div',
				props: {},
				key: null,
			};

			// Test null blockType
			expect( extendCoverBlockSave( emptyElement, null, {} ) ).toEqual(
				emptyElement
			);

			// Test null attributes
			expect(
				extendCoverBlockSave(
					emptyElement,
					{ name: 'core/cover' },
					null
				)
			).toEqual( emptyElement );

			// Test undefined responsiveFocal
			const attributes = { responsiveFocal: undefined };
			expect(
				extendCoverBlockSave(
					emptyElement,
					{ name: 'core/cover' },
					attributes
				)
			).toEqual( emptyElement );

			// Test non-array responsiveFocal - using valid interface with invalid runtime value
			const invalidAttributes: CoverBlockAttributes = {
				// @ts-expect-error: Intentionally testing invalid runtime type for validation
				responsiveFocal: 'invalid',
			};
			expect(
				extendCoverBlockSave(
					emptyElement,
					{ name: 'core/cover' },
					invalidAttributes
				)
			).toEqual( emptyElement );
		} );

		test( 'should preserve existing element props', () => {
			const element: ReactElement = {
				type: 'div',
				props: { className: 'wp-block-cover', style: { color: 'red' } },
				key: null,
			};
			const blockType = { name: 'core/cover' };
			const attributes: CoverBlockAttributes = {
				responsiveFocal: [
					{ mediaType: 'max-width', breakpoint: 767, x: 0.6, y: 0.4 },
				],
				dataFpId: 'test-id',
			};

			mockCreateElement.mockReturnValue( { modified: true } );

			extendCoverBlockSave( element, blockType, attributes );

			expect( mockCreateElement ).toHaveBeenCalledWith(
				'div',
				{
					'data-fp-id': 'test-id',
					className: 'wp-block-cover',
					style: { color: 'red' },
				},
				element
			);
		} );
	} );
} );
