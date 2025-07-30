<?php
/**
 * CSS generation function unit tests (TDD)
 *
 * @package CoverResponsiveFocal
 * @subpackage Tests
 */

// Load WordPress function mocks
require_once __DIR__ . '/wp-functions-mock.php';

// Load plugin file
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

// Load required classes
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-validator.php';
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-css-optimizer.php';

use PHPUnit\Framework\TestCase;

class CRF_CSS_Functions_Test extends TestCase {
    
    /**
     * Validator instance
     */
    private $validator;
    
    /**
     * CSS Optimizer instance
     */
    private $css_optimizer;
    
    /**
     * Set up test
     */
    public function setUp(): void {
        parent::setUp();
        $this->validator = new CRF_Validator();
        $this->css_optimizer = new CRF_CSS_Optimizer($this->validator);
    }
    
    /**
     * CSS generation test with single focal point
     */
    public function test_generate_css_rules_single_focal_point() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.6,
                'y' => 0.4
            ]
        ];
        
        $css = $this->css_optimizer->generate_css_rules($responsive_focal, 'test-id');
        
        $expected_css = '@media (max-width: 600px) { [data-fp-id="test-id"] .wp-block-cover__image-background, [data-fp-id="test-id"] .wp-block-cover__video-background { object-position: 60% 40% !important; } }';
        
        $this->assertEquals($expected_css, $css);
    }
    
    /**
     * CSS generation test with multiple focal points
     */
    public function test_generate_css_rules_multiple_focal_points() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.6,
                'y' => 0.4
            ],
            [
                'device' => 'tablet',
                'x' => 0.3,
                'y' => 0.7
            ]
        ];
        
        $css = $this->css_optimizer->generate_css_rules($responsive_focal, 'multi-test');
        
        $this->assertStringContainsString('@media (max-width: 600px)', $css);
        $this->assertStringContainsString('@media (min-width: 601px) and (max-width: 782px)', $css);
        $this->assertStringContainsString('object-position: 60% 40%', $css);
        $this->assertStringContainsString('object-position: 30% 70%', $css);
        $this->assertStringContainsString('[data-fp-id="multi-test"]', $css);
    }
    
    /**
     * CSS generation test with empty array
     */
    public function test_generate_css_rules_empty_array() {
        $css = $this->css_optimizer->generate_css_rules([], 'empty-test');
        $this->assertEquals('', $css);
    }
    
    /**
     * Boundary value test: 0.0 and 1.0 focal points
     */
    public function test_generate_css_rules_boundary_values() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.0,
                'y' => 1.0
            ]
        ];
        
        $css = $this->css_optimizer->generate_css_rules($responsive_focal, 'boundary-test');
        
        $this->assertStringContainsString('object-position: 0% 100%', $css);
    }
    
    /**
     * Invalid value handling test
     */
    public function test_generate_css_rules_invalid_values() {
        $responsive_focal = [
            [
                'device' => 'invalid-device',
                'x' => 1.5,
                'y' => -0.1
            ]
        ];
        
        $css = $this->css_optimizer->generate_css_rules($responsive_focal, 'invalid-test');
        
        // Invalid values are skipped without processing
        $this->assertEquals('', $css);
    }
    
    /**
     * Device type validation function test
     */
    public function test_validate_device_type() {
        $this->assertTrue($this->validator->validate_device_type('mobile'));
        $this->assertTrue($this->validator->validate_device_type('tablet'));
        $this->assertFalse($this->validator->validate_device_type('desktop'));
        $this->assertFalse($this->validator->validate_device_type('invalid-device'));
        $this->assertFalse($this->validator->validate_device_type(''));
        $this->assertFalse($this->validator->validate_device_type(null));
    }
    
    /**
     * Focal point value validation test
     */
    public function test_validate_focal_point_values() {
        $this->assertTrue($this->validator->validate_focal_point_value(0.5));
        $this->assertTrue($this->validator->validate_focal_point_value(0.0));
        $this->assertTrue($this->validator->validate_focal_point_value(1.0));
        $this->assertFalse($this->validator->validate_focal_point_value(-0.1));
        $this->assertFalse($this->validator->validate_focal_point_value(1.1));
        $this->assertFalse($this->validator->validate_focal_point_value('invalid'));
        $this->assertFalse($this->validator->validate_focal_point_value(null));
    }
    
    /**
     * CSS escaping process test
     */
    public function test_css_escaping() {
        
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        
        // Test with ID containing special characters
        $malicious_id = 'test"id<script>';
        $css = $this->css_optimizer->generate_css_rules($responsive_focal, $malicious_id);
        
        // Verify that HTML escaping is applied
        $this->assertStringNotContainsString('<script>', $css);
        $this->assertStringNotContainsString('"id<', $css);
    }
}