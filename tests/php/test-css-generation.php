<?php
/**
 * CSS generation feature tests (TDD)
 *
 * @package CoverResponsiveFocal
 * @subpackage Tests
 */

/**
 * Test class for CSS generation functionality
 *
 * @covers crf_generate_css_rules
 * @covers crf_validate_media_type
 * @covers crf_validate_breakpoint
 * @covers crf_validate_focal_point_value
 */
class CRF_CSS_Generation_Test extends WP_UnitTestCase {
    
    /**
     * RED: Start with failing tests
     * CSS generation test with single focal point
     */
    public function test_generate_css_rules_single_focal_point() {
        // Test function not yet implemented
        $responsive_focal = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 767,
                'x' => 0.6,
                'y' => 0.4
            ]
        ];
        
        $css = crf_generate_css_rules($responsive_focal, 'test-id');
        
        // Clearly define expected output
        $expected_css = '@media (max-width: 767px) { [data-fp-id="test-id"] .wp-block-cover__image-background, [data-fp-id="test-id"] .wp-block-cover__video-background { object-position: 60% 40% !important; } }';
        
        $this->assertEquals($expected_css, $css);
    }
    
    /**
     * CSS generation test with multiple focal points
     */
    public function test_generate_css_rules_multiple_focal_points() {
        $responsive_focal = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 767,
                'x' => 0.6,
                'y' => 0.4
            ],
            [
                'mediaType' => 'min-width',
                'breakpoint' => 768,
                'x' => 0.3,
                'y' => 0.7
            ]
        ];
        
        $css = crf_generate_css_rules($responsive_focal, 'multi-test');
        
        $this->assertStringContainsString('@media (max-width: 767px)', $css);
        $this->assertStringContainsString('@media (min-width: 768px)', $css);
        $this->assertStringContainsString('object-position: 60% 40%', $css);
        $this->assertStringContainsString('object-position: 30% 70%', $css);
        $this->assertStringContainsString('[data-fp-id="multi-test"]', $css);
    }
    
    /**
     * CSS generation test with empty array
     */
    public function test_generate_css_rules_empty_array() {
        $css = crf_generate_css_rules([], 'empty-test');
        $this->assertEquals('', $css);
    }
    
    /**
     * Boundary value test: 0.0 and 1.0 focal points
     */
    public function test_generate_css_rules_boundary_values() {
        $responsive_focal = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 320,
                'x' => 0.0,
                'y' => 1.0
            ]
        ];
        
        $css = crf_generate_css_rules($responsive_focal, 'boundary-test');
        
        $this->assertStringContainsString('object-position: 0% 100%', $css);
    }
    
    /**
     * Invalid value handling test
     */
    public function test_generate_css_rules_invalid_values() {
        $responsive_focal = [
            [
                'mediaType' => 'invalid-type',
                'breakpoint' => -100,
                'x' => 1.5,
                'y' => -0.1
            ]
        ];
        
        $css = crf_generate_css_rules($responsive_focal, 'invalid-test');
        
        // Invalid values are skipped without processing
        $this->assertEquals('', $css);
    }
    
    /**
     * Media query validation function test
     */
    public function test_validate_media_type() {
        $this->assertTrue(crf_validate_media_type('min-width'));
        $this->assertTrue(crf_validate_media_type('max-width'));
        $this->assertFalse(crf_validate_media_type('invalid-type'));
        $this->assertFalse(crf_validate_media_type(''));
        $this->assertFalse(crf_validate_media_type(null));
    }
    
    /**
     * Breakpoint validation function test
     */
    public function test_validate_breakpoint() {
        $this->assertTrue(crf_validate_breakpoint(768));
        $this->assertTrue(crf_validate_breakpoint(1));
        $this->assertTrue(crf_validate_breakpoint(9999));
        $this->assertFalse(crf_validate_breakpoint(0));
        $this->assertFalse(crf_validate_breakpoint(10000));
        $this->assertFalse(crf_validate_breakpoint('invalid'));
        $this->assertFalse(crf_validate_breakpoint(-1));
    }
    
    /**
     * Focal point value validation test
     */
    public function test_validate_focal_point_values() {
        $this->assertTrue(crf_validate_focal_point_value(0.5));
        $this->assertTrue(crf_validate_focal_point_value(0.0));
        $this->assertTrue(crf_validate_focal_point_value(1.0));
        $this->assertFalse(crf_validate_focal_point_value(-0.1));
        $this->assertFalse(crf_validate_focal_point_value(1.1));
        $this->assertFalse(crf_validate_focal_point_value('invalid'));
        $this->assertFalse(crf_validate_focal_point_value(null));
    }
    
    /**
     * CSS escaping process test
     */
    public function test_css_escaping() {
        $responsive_focal = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 767,
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        
        // Test with ID containing special characters
        $malicious_id = 'test"id<script>';
        $css = crf_generate_css_rules($responsive_focal, $malicious_id);
        
        // Verify that HTML escaping is applied
        $this->assertStringNotContainsString('<script>', $css);
        $this->assertStringNotContainsString('"id<', $css);
    }
}