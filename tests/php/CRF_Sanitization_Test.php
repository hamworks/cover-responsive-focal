<?php
/**
 * Sanitization function unit tests (TDD)
 */

// WordPress function mocks
require_once __DIR__ . '/wp-functions-mock.php';

// Load plugin file
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

// Load validator class
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-validator.php';

use PHPUnit\Framework\TestCase;

class CRF_Sanitization_Test extends TestCase {
    
    /**
     * Validator instance
     */
    private $validator;
    
    /**
     * Set up test
     */
    public function setUp(): void {
        parent::setUp();
        $this->validator = new CRF_Validator();
    }
    
    /**
     * RED: Start with failing tests
     * Focal point data sanitization
     */
    public function test_sanitize_focal_point_valid_data() {
        $input = [
            'device' => 'mobile',
            'x' => '0.6',
            'y' => '0.4'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertEquals('mobile', $sanitized['device']);
        $this->assertEquals(0.6, $sanitized['x']);
        $this->assertEquals(0.4, $sanitized['y']);
    }
    
    /**
     * Convert invalid values to default values
     */
    public function test_sanitize_focal_point_invalid_values() {
        $input = [
            'device' => 'invalid-device',
            'x' => 'invalid',
            'y' => 'invalid'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertEquals('mobile', $sanitized['device']); // Default value
        $this->assertEquals(0.5, $sanitized['x']); // Default value
        $this->assertEquals(0.5, $sanitized['y']); // Default value
    }
    
    /**
     * XSS attack prevention
     */
    public function test_sanitize_focal_point_xss_prevention() {
        $input = [
            'device' => '<script>alert("xss")</script>mobile',
            'x' => '<script>0.6</script>',
            'y' => '<script>0.4</script>'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertStringNotContainsString('<script>', (string)$sanitized['device']);
        $this->assertStringNotContainsString('<script>', (string)$sanitized['x']);
        $this->assertStringNotContainsString('<script>', (string)$sanitized['y']);
    }
    
    /**
     * Boundary value sanitization
     */
    public function test_sanitize_focal_point_boundary_values() {
        $input = [
            'device' => 'tablet',
            'x' => '0.0',
            'y' => '1.0'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertEquals('tablet', $sanitized['device']);
        $this->assertEquals(0.0, $sanitized['x']);
        $this->assertEquals(1.0, $sanitized['y']);
    }
    
    /**
     * Normalization of out-of-range values
     */
    public function test_sanitize_focal_point_out_of_range() {
        $input = [
            'device' => 'invalid',
            'x' => '-0.5',
            'y' => '1.5'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertEquals('mobile', $sanitized['device']); // Default value
        $this->assertEquals(0.0, $sanitized['x']); // Normalized to minimum value
        $this->assertEquals(1.0, $sanitized['y']); // Normalized to maximum value
    }
    
    /**
     * Sanitization of entire array
     */
    public function test_sanitize_responsive_focal_array() {
        $input = [
            [
                'device' => 'mobile',
                'x' => '0.6',
                'y' => '0.4'
            ],
            [
                'device' => 'invalid-device',
                'x' => '-0.1',
                'y' => '1.1'
            ]
        ];
        
        $sanitized = $this->validator->sanitize_responsive_focal_array($input);
        
        $this->assertCount(2, $sanitized);
        
        // First element (valid)
        $this->assertEquals('mobile', $sanitized[0]['device']);
        $this->assertEquals(0.6, $sanitized[0]['x']);
        $this->assertEquals(0.4, $sanitized[0]['y']);
        
        // Second element (corrected)
        $this->assertEquals('mobile', $sanitized[1]['device']); // Default value
        $this->assertEquals(0.0, $sanitized[1]['x']); // Normalized
        $this->assertEquals(1.0, $sanitized[1]['y']); // Normalized
    }
    
    /**
     * Empty input value handling
     */
    public function test_sanitize_focal_point_empty_input() {
        $input = [];
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        $this->assertEquals('mobile', $sanitized['device']);
        $this->assertEquals(0.5, $sanitized['x']);
        $this->assertEquals(0.5, $sanitized['y']);
    }
    
    /**
     * CSS Injection prevention
     */
    public function test_sanitize_css_injection_prevention() {
        $input = [
            'device' => 'mobile; } body { background: red; } .test',
            'x' => '0.5; } body { color: blue; } .hack',
            'y' => '0.5'
        ];
        
        $sanitized = $this->validator->sanitize_focal_point($input);
        
        // Verify that CSS Injection is removed and device is normalized
        $this->assertEquals('mobile', $sanitized['device']); // Should fallback to valid device
        $this->assertEquals(0.5, $sanitized['x']); // Should be normalized number
        $this->assertEquals(0.5, $sanitized['y']); // Should be normalized number
    }
}