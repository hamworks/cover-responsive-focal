/**
 * Cover Responsive Focal - Block Save Extension Tests (Simplified TDD)
 */

// Mock WordPress hooks
const mockAddFilter = jest.fn();

jest.mock( '@wordpress/hooks', () => ( {
	addFilter: mockAddFilter,
} ) );

// Mock React for createElement
const mockCreateElement = jest.fn();
global.React = { createElement: mockCreateElement } as any;

// Import the function for direct testing
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
			const element = { type: 'div', props: {} };
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
			const element = { type: 'div', props: {} };
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
			const element = {
				type: 'div',
				props: { className: 'wp-block-cover' },
			};
			const blockType = { name: 'core/cover' };
			const attributes = {
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
			const element = { type: 'div', props: {} };
			const blockType = { name: 'core/cover' };
			const attributes = {
				responsiveFocal: [
					{ mediaType: 'max-width', breakpoint: 767, x: 0.6, y: 0.4 },
				],
			};

			// Mock Date.now for predictable ID
			const mockNow = jest
				.spyOn( Date, 'now' )
				.mockReturnValue( 123456789 );

			extendCoverBlockSave( element, blockType, attributes );

			expect( mockCreateElement ).toHaveBeenCalledWith(
				'div',
				{ 'data-fp-id': 'crf-123456789' },
				element
			);

			mockNow.mockRestore();
		} );

		test( 'should handle null/undefined gracefully', () => {
			// Test null blockType
			expect( extendCoverBlockSave( {}, null, {} ) ).toEqual( {} );

			// Test null attributes
			expect(
				extendCoverBlockSave( {}, { name: 'core/cover' }, null )
			).toEqual( {} );

			// Test undefined responsiveFocal
			const attributes = { responsiveFocal: undefined };
			expect(
				extendCoverBlockSave( {}, { name: 'core/cover' }, attributes )
			).toEqual( {} );

			// Test non-array responsiveFocal
			const invalidAttributes = { responsiveFocal: 'invalid' };
			expect(
				extendCoverBlockSave(
					{},
					{ name: 'core/cover' },
					invalidAttributes
				)
			).toEqual( {} );
		} );

		test( 'should preserve existing element props', () => {
			const element = {
				type: 'div',
				props: { className: 'wp-block-cover', style: { color: 'red' } },
			};
			const blockType = { name: 'core/cover' };
			const attributes = {
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
