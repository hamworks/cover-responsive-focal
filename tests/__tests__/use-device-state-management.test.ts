/**
 * Cover Responsive Focal - Device State Management Hook Tests (TDD)
 */

import { renderHook, act } from '@testing-library/react';
import { useDeviceStateManagement } from '../../src/hooks/use-device-state-management';
import type { ResponsiveFocalPoint } from '../../src/types';

describe( 'useDeviceStateManagement Hook (TDD)', () => {
	let mockSetAttributes: jest.Mock;
	let initialFocalPoints: ResponsiveFocalPoint[];

	beforeEach( () => {
		mockSetAttributes = jest.fn();
		initialFocalPoints = [];
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'Initial state', () => {
		test( 'should initialize with empty focal points array', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			expect( result.current.mobileEnabled ).toBe( false );
			expect( result.current.tabletEnabled ).toBe( false );
			expect( result.current.mobileFocalPoint ).toBeUndefined();
			expect( result.current.tabletFocalPoint ).toBeUndefined();
			expect( result.current.hasAnyDeviceEnabled ).toBe( false );
			expect( result.current.enabledDeviceCount ).toBe( 0 );
		} );

		test( 'should initialize with existing mobile focal point', () => {
			initialFocalPoints = [ { device: 'mobile', x: 0.3, y: 0.7 } ];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			expect( result.current.mobileEnabled ).toBe( true );
			expect( result.current.tabletEnabled ).toBe( false );
			expect( result.current.mobileFocalPoint ).toEqual( {
				device: 'mobile',
				x: 0.3,
				y: 0.7,
			} );
			expect( result.current.hasAnyDeviceEnabled ).toBe( true );
			expect( result.current.enabledDeviceCount ).toBe( 1 );
		} );

		test( 'should initialize with both mobile and tablet focal points', () => {
			initialFocalPoints = [
				{ device: 'mobile', x: 0.3, y: 0.7 },
				{ device: 'tablet', x: 0.6, y: 0.4 },
			];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			expect( result.current.mobileEnabled ).toBe( true );
			expect( result.current.tabletEnabled ).toBe( true );
			expect( result.current.enabledDeviceCount ).toBe( 2 );
		} );
	} );

	describe( 'toggleDeviceFocalPoint function', () => {
		test( 'should enable mobile device with default focal point', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.toggleDeviceFocalPoint( 'mobile', true );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'mobile', x: 0.5, y: 0.5 } ],
			} );
		} );

		test( 'should enable tablet device with default focal point', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.toggleDeviceFocalPoint( 'tablet', true );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'tablet', x: 0.5, y: 0.5 } ],
			} );
		} );

		test( 'should disable mobile device and remove focal point', () => {
			initialFocalPoints = [
				{ device: 'mobile', x: 0.3, y: 0.7 },
				{ device: 'tablet', x: 0.6, y: 0.4 },
			];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.toggleDeviceFocalPoint( 'mobile', false );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'tablet', x: 0.6, y: 0.4 } ],
			} );
		} );

		test( 'should handle invalid device type gracefully', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				// @ts-expect-error Testing invalid device type
				result.current.toggleDeviceFocalPoint( 'desktop', true );
			} );

			// Should not call setAttributes for invalid device type
			expect( mockSetAttributes ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'updateDeviceFocalPoint function', () => {
		test( 'should update existing mobile focal point', () => {
			initialFocalPoints = [ { device: 'mobile', x: 0.3, y: 0.7 } ];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.updateDeviceFocalPoint( 'mobile', 0.8, 0.2 );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'mobile', x: 0.8, y: 0.2 } ],
			} );
		} );

		test( 'should add new tablet focal point', () => {
			initialFocalPoints = [ { device: 'mobile', x: 0.3, y: 0.7 } ];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.updateDeviceFocalPoint( 'tablet', 0.9, 0.1 );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [
					{ device: 'mobile', x: 0.3, y: 0.7 },
					{ device: 'tablet', x: 0.9, y: 0.1 },
				],
			} );
		} );

		test( 'should handle invalid focal point coordinates gracefully', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.updateDeviceFocalPoint( 'mobile', -0.1, 1.5 );
			} );

			// Should not call setAttributes for invalid coordinates
			expect( mockSetAttributes ).not.toHaveBeenCalled();
		} );

		test( 'should handle invalid device type gracefully', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				// @ts-expect-error Testing invalid device type
				result.current.updateDeviceFocalPoint( 'desktop', 0.5, 0.5 );
			} );

			// Should not call setAttributes for invalid device type
			expect( mockSetAttributes ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'removeDeviceFocalPoint function', () => {
		test( 'should remove mobile focal point', () => {
			initialFocalPoints = [
				{ device: 'mobile', x: 0.3, y: 0.7 },
				{ device: 'tablet', x: 0.6, y: 0.4 },
			];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.removeDeviceFocalPoint( 'mobile' );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'tablet', x: 0.6, y: 0.4 } ],
			} );
		} );

		test( 'should remove tablet focal point', () => {
			initialFocalPoints = [
				{ device: 'mobile', x: 0.3, y: 0.7 },
				{ device: 'tablet', x: 0.6, y: 0.4 },
			];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				result.current.removeDeviceFocalPoint( 'tablet' );
			} );

			expect( mockSetAttributes ).toHaveBeenCalledWith( {
				responsiveFocal: [ { device: 'mobile', x: 0.3, y: 0.7 } ],
			} );
		} );

		test( 'should handle invalid device type gracefully', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			act( () => {
				// @ts-expect-error Testing invalid device type
				result.current.removeDeviceFocalPoint( 'desktop' );
			} );

			// Should not call setAttributes for invalid device type
			expect( mockSetAttributes ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'Computed values', () => {
		test( 'should update hasAnyDeviceEnabled when devices are toggled', () => {
			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			// Initially false
			expect( result.current.hasAnyDeviceEnabled ).toBe( false );

			// Enable mobile
			act( () => {
				result.current.toggleDeviceFocalPoint( 'mobile', true );
			} );

			// Should still be false until re-render with updated responsiveFocal
			expect( result.current.hasAnyDeviceEnabled ).toBe( false );
		} );

		test( 'should calculate enabledDeviceCount correctly', () => {
			initialFocalPoints = [
				{ device: 'mobile', x: 0.3, y: 0.7 },
				{ device: 'tablet', x: 0.6, y: 0.4 },
			];

			const { result } = renderHook( () =>
				useDeviceStateManagement(
					initialFocalPoints,
					mockSetAttributes
				)
			);

			expect( result.current.enabledDeviceCount ).toBe( 2 );
		} );
	} );

	describe( 'State synchronization', () => {
		test( 'should sync state when responsiveFocal prop changes', () => {
			const { result, rerender } = renderHook(
				( { responsiveFocal } ) =>
					useDeviceStateManagement(
						responsiveFocal,
						mockSetAttributes
					),
				{
					initialProps: { responsiveFocal: initialFocalPoints },
				}
			);

			// Initially no devices enabled
			expect( result.current.mobileEnabled ).toBe( false );
			expect( result.current.tabletEnabled ).toBe( false );

			// Update prop with mobile focal point
			const updatedFocalPoints = [
				{ device: 'mobile' as const, x: 0.3, y: 0.7 },
			];

			rerender( { responsiveFocal: updatedFocalPoints } );

			expect( result.current.mobileEnabled ).toBe( true );
			expect( result.current.tabletEnabled ).toBe( false );
			expect( result.current.mobileFocalPoint ).toEqual( {
				device: 'mobile',
				x: 0.3,
				y: 0.7,
			} );
		} );
	} );
} );
