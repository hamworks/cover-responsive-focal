/**
 * Editor Styles Tests
 */

import {
	getFocalPointForDevice,
	generateObjectPosition,
} from '../../src/utils/editor-styles';
import type { ResponsiveFocalPoint } from '../../src/types';

describe( 'Editor Styles', () => {
	const mockResponsiveFocal: ResponsiveFocalPoint[] = [
		{ device: 'mobile', x: 0.6, y: 0.4 },
		{ device: 'tablet', x: 0.3, y: 0.7 },
	];

	describe( 'getFocalPointForDevice', () => {
		test( 'returns correct focal point for mobile device', () => {
			const result = getFocalPointForDevice(
				mockResponsiveFocal,
				'Mobile'
			);
			expect( result ).toEqual( { x: 0.6, y: 0.4 } );
		} );

		test( 'returns correct focal point for tablet device', () => {
			const result = getFocalPointForDevice(
				mockResponsiveFocal,
				'Tablet'
			);
			expect( result ).toEqual( { x: 0.3, y: 0.7 } );
		} );

		test( 'returns null for desktop device', () => {
			const result = getFocalPointForDevice(
				mockResponsiveFocal,
				'Desktop'
			);
			expect( result ).toBeNull();
		} );

		test( 'returns null for unknown device', () => {
			const result = getFocalPointForDevice(
				mockResponsiveFocal,
				'Unknown'
			);
			expect( result ).toBeNull();
		} );

		test( 'returns null for empty responsive focal array', () => {
			const result = getFocalPointForDevice( [], 'Mobile' );
			expect( result ).toBeNull();
		} );

		test( 'returns null for null responsive focal array', () => {
			const result = getFocalPointForDevice( null as any, 'Mobile' );
			expect( result ).toBeNull();
		} );

		test( 'returns null when no matching device found', () => {
			const mobileFocal: ResponsiveFocalPoint[] = [
				{ device: 'mobile', x: 0.5, y: 0.5 },
			];
			const result = getFocalPointForDevice( mobileFocal, 'Tablet' );
			expect( result ).toBeNull();
		} );
	} );

	describe( 'generateObjectPosition', () => {
		test( 'generates correct CSS object-position value', () => {
			const focalPoint = { x: 0.6, y: 0.4 };
			const result = generateObjectPosition( focalPoint );
			expect( result ).toBe( '60% 40%' );
		} );

		test( 'handles boundary values', () => {
			expect( generateObjectPosition( { x: 0, y: 0 } ) ).toBe( '0% 0%' );
			expect( generateObjectPosition( { x: 1, y: 1 } ) ).toBe(
				'100% 100%'
			);
		} );

		test( 'rounds decimal values correctly', () => {
			expect( generateObjectPosition( { x: 0.335, y: 0.666 } ) ).toBe(
				'34% 67%'
			);
		} );
	} );
} );
