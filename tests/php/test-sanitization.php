<?php
/**
 * Sanitization function unit tests (TDD)
 */

// WordPress function mocks
require_once __DIR__ . '/wp-functions-mock.php';

// Load plugin file
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

use PHPUnit\Framework\TestCase;

class CRF_Sanitization_Test extends TestCase {
    
    /**
     * RED: Start with failing tests
     * Focal point data sanitization
     */
    public function test_sanitize_focal_point_valid_data() {
        $input = [
            'mediaType' => 'max-width',
            'breakpoint' => '767',
            'x' => '0.6',
            'y' => '0.4'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('max-width', $sanitized['mediaType']);
        $this->assertEquals(767, $sanitized['breakpoint']);
        $this->assertEquals(0.6, $sanitized['x']);
        $this->assertEquals(0.4, $sanitized['y']);
    }
    
    /**
     * Convert invalid values to default values
     */
    public function test_sanitize_focal_point_invalid_values() {
        $input = [
            'mediaType' => 'invalid-type',
            'breakpoint' => 'invalid',
            'x' => 'invalid',
            'y' => 'invalid'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('max-width', $sanitized['mediaType']); // Default value
        $this->assertEquals(768, $sanitized['breakpoint']); // Default value
        $this->assertEquals(0.5, $sanitized['x']); // Default value
        $this->assertEquals(0.5, $sanitized['y']); // Default value
    }
    
    /**
     * XSS attack prevention
     */
    public function test_sanitize_focal_point_xss_prevention() {
        $input = [
            'mediaType' => '<script>alert("xss")</script>max-width',
            'breakpoint' => '<script>767</script>',
            'x' => '<script>0.6</script>',
            'y' => '<script>0.4</script>'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertStringNotContainsString('<script>', (string)$sanitized['mediaType']);
        $this->assertStringNotContainsString('<script>', (string)$sanitized['breakpoint']);
        $this->assertStringNotContainsString('<script>', (string)$sanitized['x']);
        $this->assertStringNotContainsString('<script>', (string)$sanitized['y']);
    }
    
    /**
     * Boundary value sanitization
     */
    public function test_sanitize_focal_point_boundary_values() {
        $input = [
            'mediaType' => 'min-width',
            'breakpoint' => '1',
            'x' => '0.0',
            'y' => '1.0'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('min-width', $sanitized['mediaType']);
        $this->assertEquals(1, $sanitized['breakpoint']);
        $this->assertEquals(0.0, $sanitized['x']);
        $this->assertEquals(1.0, $sanitized['y']);
    }
    
    /**
     * Normalization of out-of-range values
     */
    public function test_sanitize_focal_point_out_of_range() {
        $input = [
            'mediaType' => 'max-width',
            'breakpoint' => '-100',
            'x' => '-0.5',
            'y' => '1.5'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('max-width', $sanitized['mediaType']);
        $this->assertEquals(768, $sanitized['breakpoint']); // Default value
        $this->assertEquals(0.0, $sanitized['x']); // Normalized to minimum value
        $this->assertEquals(1.0, $sanitized['y']); // Normalized to maximum value
    }
    
    /**
     * Sanitization of entire array
     */
    public function test_sanitize_responsive_focal_array() {
        $input = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => '767',
                'x' => '0.6',
                'y' => '0.4'
            ],
            [
                'mediaType' => 'invalid-type',
                'breakpoint' => 'invalid',
                'x' => '-0.1',
                'y' => '1.1'
            ]
        ];
        
        $sanitized = crf_sanitize_responsive_focal_array($input);
        
        $this->assertCount(2, $sanitized);
        
        // First element (valid)
        $this->assertEquals('max-width', $sanitized[0]['mediaType']);
        $this->assertEquals(767, $sanitized[0]['breakpoint']);
        $this->assertEquals(0.6, $sanitized[0]['x']);
        $this->assertEquals(0.4, $sanitized[0]['y']);
        
        // Second element (corrected)
        $this->assertEquals('max-width', $sanitized[1]['mediaType']); // Default value
        $this->assertEquals(768, $sanitized[1]['breakpoint']); // Default value
        $this->assertEquals(0.0, $sanitized[1]['x']); // Normalized
        $this->assertEquals(1.0, $sanitized[1]['y']); // Normalized
    }
    
    /**
     * Empty input value handling
     */
    public function test_sanitize_focal_point_empty_input() {
        $input = [];
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('max-width', $sanitized['mediaType']);
        $this->assertEquals(768, $sanitized['breakpoint']);
        $this->assertEquals(0.5, $sanitized['x']);
        $this->assertEquals(0.5, $sanitized['y']);
    }
    
    /**
     * CSS Injection prevention
     */
    public function test_sanitize_css_injection_prevention() {
        $input = [
            'mediaType' => 'max-width; } body { background: red; } @media screen',
            'breakpoint' => '767; } body { color: blue; } .test',
            'x' => '0.5',
            'y' => '0.5'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        // Verify that CSS Injection is removed
        $this->assertStringNotContainsString('body', (string)$sanitized['mediaType']);
        $this->assertStringNotContainsString('background:', (string)$sanitized['mediaType']);
        $this->assertStringNotContainsString('}', (string)$sanitized['mediaType']);
    }
}