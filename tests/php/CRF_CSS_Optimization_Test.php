<?php
/**
 * CSS Optimization feature tests (TDD)
 * 
 * Test-driven development for CSS optimization functionality:
 * - CSS minification
 * - Duplicate media query merging 
 * - Caching functionality
 * - Performance optimization
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

/**
 * Test class for CSS optimization functionality
 *
 * Following t-wada's TDD approach with Red-Green-Refactor cycle
 * 
 * @covers CRF_CSS_Optimizer::minify_css
 * @covers CRF_CSS_Optimizer::merge_duplicate_media_queries
 * @covers CRF_CSS_Optimizer::generate_optimized_css_rules
 * @covers CRF_CSS_Optimizer::get_cached_css
 * @covers CRF_CSS_Optimizer::cache_css
 */
class CRF_CSS_Optimization_Test extends TestCase {
    
    /**
     * Validator instance
     */
    private $validator;
    
    /**
     * CSS Optimizer instance
     */
    private $css_optimizer;
    
    /**
     * Set up test environment
     */
    public function setUp(): void {
        parent::setUp();
        $this->validator = new CRF_Validator();
        $this->css_optimizer = new CRF_CSS_Optimizer($this->validator);
        
        // Clear any existing cache
        $this->clear_all_css_cache();
    }
    
    /**
     * Clean up after each test
     */
    public function tearDown(): void {
        parent::tearDown();
        $this->clear_all_css_cache();
    }
    
    /**
     * Clear all CSS cache entries
     */
    private function clear_all_css_cache() {
        global $wp_transients;
        if (isset($wp_transients)) {
            foreach (array_keys($wp_transients) as $key) {
                if (strpos($key, 'crf_css_') === 0) {
                    unset($wp_transients[$key]);
                }
            }
        }
    }

    // ========================================
    // RED → GREEN → REFACTOR: CSS Minification Tests
    // ========================================
    
    /**
     * RED: Test CSS minification with whitespace removal
     * Start with failing test to ensure function works correctly
     */
    public function test_minify_css_removes_unnecessary_whitespace() {
        $unminified_css = '@media (max-width: 600px) { 
            [data-fp-id="test"] .wp-block-cover__image-background { 
                object-position: 60% 40% !important; 
            } 
        }';
        
        $minified = $this->css_optimizer->minify_css($unminified_css);
        
        // Expected minified output
        $expected = '@media (max-width:600px){[data-fp-id="test"] .wp-block-cover__image-background{object-position:60% 40% !important}}';
        
        $this->assertEquals($expected, $minified);
    }
    
    /**
     * Test minification of multiple media queries
     */
    public function test_minify_css_multiple_media_queries() {
        $unminified_css = '@media (max-width: 600px) { 
            [data-fp-id="test"] .wp-block-cover__image-background { 
                object-position: 60% 40% !important; 
            } 
        }
        @media (min-width: 601px) and (max-width: 782px) { 
            [data-fp-id="test"] .wp-block-cover__video-background { 
                object-position: 30% 70% !important; 
            } 
        }';
        
        $minified = $this->css_optimizer->minify_css($unminified_css);
        
        // Should remove all unnecessary whitespace
        $this->assertStringNotContainsString('  ', $minified); // No double spaces
        $this->assertStringNotContainsString("\n", $minified); // No newlines
        $this->assertStringNotContainsString("\t", $minified); // No tabs
        $this->assertStringContainsString('object-position:60% 40% !important', $minified);
        $this->assertStringContainsString('object-position:30% 70% !important', $minified);
    }
    
    /**
     * Test minification with trailing semicolons removal
     */
    public function test_minify_css_removes_trailing_semicolons() {
        $unminified_css = '@media (max-width: 600px) { 
            [data-fp-id="test"] .wp-block-cover__image-background { 
                object-position: 60% 40% !important;; 
            } 
        }';
        
        $minified = $this->css_optimizer->minify_css($unminified_css);
        
        // Should remove duplicate semicolons and trailing semicolons before }
        $this->assertStringNotContainsString(';;', $minified);
        $this->assertStringNotContainsString(';}', $minified);
        $this->assertStringContainsString('}', $minified);
    }
    
    /**
     * Boundary test: Empty CSS input
     */
    public function test_minify_css_empty_input() {
        $empty_css = '';
        $minified = $this->css_optimizer->minify_css($empty_css);
        
        $this->assertEquals('', $minified);
    }
    
    /**
     * Boundary test: CSS with only whitespace
     */
    public function test_minify_css_whitespace_only() {
        $whitespace_css = '   \n\t  \n  ';
        $minified = $this->css_optimizer->minify_css($whitespace_css);
        
        $this->assertEquals('', $minified);
    }

    // ========================================
    // RED → GREEN → REFACTOR: Duplicate Media Query Merging Tests
    // ========================================
    
    /**
     * RED: Test duplicate media query merging
     * Start with failing test to ensure proper merging logic
     */
    public function test_merge_duplicate_media_queries_basic_case() {
        $css_with_duplicates = '@media (max-width: 600px){[data-fp-id="test1"] .wp-block-cover__image-background{object-position:60% 40% !important}}@media (max-width: 600px){[data-fp-id="test2"] .wp-block-cover__image-background{object-position:30% 70% !important}}';
        
        $merged = $this->css_optimizer->merge_duplicate_media_queries($css_with_duplicates);
        
        // Should only have one occurrence of the media query
        $media_query_count = substr_count($merged, '@media (max-width: 600px)');
        $this->assertEquals(1, $media_query_count, 'Should merge duplicate media queries');
        
        // Should still contain the first rule content
        $this->assertStringContainsString('[data-fp-id="test1"]', $merged);
    }
    
    /**
     * Test merging with different media queries (should not merge)
     */
    public function test_merge_duplicate_media_queries_different_queries() {
        $css_different_queries = '@media (max-width: 600px){[data-fp-id="test1"] .wp-block-cover__image-background{object-position:60% 40% !important}}@media (min-width: 601px) and (max-width: 782px){[data-fp-id="test2"] .wp-block-cover__image-background{object-position:30% 70% !important}}';
        
        $merged = $this->css_optimizer->merge_duplicate_media_queries($css_different_queries);
        
        // Should keep both different media queries
        $this->assertStringContainsString('@media (max-width: 600px)', $merged);
        $this->assertStringContainsString('@media (min-width: 601px) and (max-width: 782px)', $merged);
        $this->assertStringContainsString('[data-fp-id="test1"]', $merged);
        $this->assertStringContainsString('[data-fp-id="test2"]', $merged);
    }
    
    /**
     * Test merging with complex nested CSS
     */
    public function test_merge_duplicate_media_queries_complex_css() {
        $complex_css = '@media (max-width: 600px){[data-fp-id="test1"] .wp-block-cover__image-background,[data-fp-id="test1"] .wp-block-cover__video-background{object-position:60% 40% !important}}@media (max-width: 600px){[data-fp-id="test2"] .wp-block-cover__image-background{object-position:30% 70% !important}}';
        
        $merged = $this->css_optimizer->merge_duplicate_media_queries($complex_css);
        
        // Should only have one media query block
        $media_query_count = substr_count($merged, '@media (max-width: 600px)');
        $this->assertEquals(1, $media_query_count);
        
        // Should preserve complex selectors
        $this->assertStringContainsString('.wp-block-cover__image-background', $merged);
        $this->assertStringContainsString('.wp-block-cover__video-background', $merged);
    }
    
    /**
     * Boundary test: No media queries to merge
     */
    public function test_merge_duplicate_media_queries_no_media_queries() {
        $no_media_css = '.regular-css { color: red; }';
        $merged = $this->css_optimizer->merge_duplicate_media_queries($no_media_css);
        
        // Should return empty string as no media queries found
        $this->assertEquals('', $merged);
    }

    // ========================================
    // RED → GREEN → REFACTOR: Cache Functionality Tests
    // ========================================
    
    /**
     * RED: Test cache storage and retrieval
     * Start with failing test to ensure caching works
     */
    public function test_css_caching_stores_and_retrieves() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.6,
                'y' => 0.4
            ]
        ];
        $fp_id = 'cache-test-123';
        
        // First call should generate CSS and cache it
        $first_result = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, $fp_id);
        
        // Second call should retrieve from cache (faster)
        $second_result = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, $fp_id);
        
        // Results should be identical
        $this->assertEquals($first_result, $second_result);
        $this->assertNotEmpty($first_result);
        $this->assertStringContainsString('@media (max-width: 600px)', $first_result);
    }
    
    /**
     * Test cache key generation uniqueness
     */
    public function test_css_cache_key_uniqueness() {
        $responsive_focal_1 = [
            [
                'device' => 'mobile',
                'x' => 0.6,
                'y' => 0.4
            ]
        ];
        
        $responsive_focal_2 = [
            [
                'device' => 'mobile',
                'x' => 0.3,
                'y' => 0.7
            ]
        ];
        
        $fp_id = 'unique-test';
        
        // Generate CSS for different focal points
        $result1 = $this->css_optimizer->generate_optimized_css_rules($responsive_focal_1, $fp_id);
        $result2 = $this->css_optimizer->generate_optimized_css_rules($responsive_focal_2, $fp_id);
        
        // Results should be different (different cache keys)
        $this->assertNotEquals($result1, $result2);
        $this->assertStringContainsString('object-position:60% 40%', $result1);
        $this->assertStringContainsString('object-position:30% 70%', $result2);
    }
    
    /**
     * Test cache with different fp_id values
     */
    public function test_css_cache_different_fp_ids() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        
        // Same focal points, different IDs should generate different CSS
        $result1 = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, 'id-1');
        $result2 = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, 'id-2');
        
        // CSS content should be similar but with different data-fp-id attributes
        $this->assertStringContainsString('[data-fp-id="id-1"]', $result1);
        $this->assertStringContainsString('[data-fp-id="id-2"]', $result2);
        $this->assertNotEquals($result1, $result2);
    }
    
    /**
     * Boundary test: Empty responsive focal array caching
     */
    public function test_css_cache_empty_responsive_focal() {
        $empty_responsive_focal = [];
        $fp_id = 'empty-test';
        
        $result = $this->css_optimizer->generate_optimized_css_rules($empty_responsive_focal, $fp_id);
        
        // Should return empty string and not cause caching errors
        $this->assertEquals('', $result);
    }

    // ========================================
    // RED → GREEN → REFACTOR: Integration Tests
    // ========================================
    
    /**
     * RED: Test complete optimization pipeline
     * Integration test covering all optimization features
     */
    public function test_complete_optimization_pipeline() {
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
        $fp_id = 'pipeline-test';
        
        $optimized_css = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, $fp_id);
        
        // Should be minified (no unnecessary whitespace)
        $this->assertStringNotContainsString('  ', $optimized_css); // No double spaces
        $this->assertStringNotContainsString("\n", $optimized_css); // No newlines
        
        // Should contain both media queries
        $this->assertStringContainsString('@media (max-width: 600px)', $optimized_css);
        $this->assertStringContainsString('@media (min-width: 601px) and (max-width: 782px)', $optimized_css);
        
        // Should contain correct focal point values
        $this->assertStringContainsString('object-position:60% 40%', $optimized_css);
        $this->assertStringContainsString('object-position:30% 70%', $optimized_css);
        
        // Should contain !important declarations
        $this->assertStringContainsString('!important', $optimized_css);
        
        // Should be cached (second call should return same result)
        $cached_result = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, $fp_id);
        $this->assertEquals($optimized_css, $cached_result);
    }
    
    /**
     * Test optimization with validation failures
     */
    public function test_optimization_with_invalid_data() {
        $invalid_responsive_focal = [
            [
                'device' => 'invalid-device',
                'x' => 1.5,
                'y' => -0.1
            ],
            [
                'device' => 'mobile',
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        $fp_id = 'validation-test';
        
        $optimized_css = $this->css_optimizer->generate_optimized_css_rules($invalid_responsive_focal, $fp_id);
        
        // Should only include valid focal point
        $this->assertStringContainsString('@media (max-width: 600px)', $optimized_css);
        $this->assertStringContainsString('object-position:50% 50%', $optimized_css);
        
        // Should not include invalid device rules
        $this->assertStringNotContainsString('invalid-device', $optimized_css);
        $this->assertStringNotContainsString('150%', $optimized_css); // 1.5 * 100%
    }

    // ========================================
    // Performance and Edge Case Tests
    // ========================================
    
    /**
     * Test CSS generation performance with large datasets
     */
    public function test_css_optimization_performance() {
        // Generate large responsive focal array
        $large_responsive_focal = [];
        for ($i = 0; $i < 50; $i++) {
            $large_responsive_focal[] = [
                'device' => ($i % 2 === 0) ? 'mobile' : 'tablet',
                'x' => 0.5,
                'y' => 0.5
            ];
        }
        
        $start_time = microtime(true);
        $result = $this->css_optimizer->generate_optimized_css_rules($large_responsive_focal, 'performance-test');
        $end_time = microtime(true);
        
        $execution_time = $end_time - $start_time;
        
        // Should complete within reasonable time (100ms)
        $this->assertLessThan(0.1, $execution_time, 'CSS optimization should complete within 100ms');
        $this->assertNotEmpty($result);
    }
    
    /**
     * Test XSS prevention in optimized CSS output
     */
    public function test_optimization_xss_prevention() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        
        // Test with malicious fp_id
        $malicious_fp_id = 'test"id<script>alert("xss")</script>';
        $optimized_css = $this->css_optimizer->generate_optimized_css_rules($responsive_focal, $malicious_fp_id);
        
        // Should escape malicious content
        $this->assertStringNotContainsString('<script>', $optimized_css);
        $this->assertStringNotContainsString('alert(', $optimized_css);
        $this->assertStringNotContainsString('"id<', $optimized_css);
    }
    
    /**
     * Test memory usage with caching
     */
    public function test_css_cache_memory_usage() {
        $responsive_focal = [
            [
                'device' => 'mobile',
                'x' => 0.5,
                'y' => 0.5
            ]
        ];
        
        $memory_before = memory_get_usage();
        
        // Generate multiple cached entries
        for ($i = 0; $i < 10; $i++) {
            $this->css_optimizer->generate_optimized_css_rules($responsive_focal, "memory-test-{$i}");
        }
        
        $memory_after = memory_get_usage();
        $memory_increase = $memory_after - $memory_before;
        
        // Memory increase should be reasonable (less than 1MB)
        $this->assertLessThan(1024 * 1024, $memory_increase, 'Memory usage should remain reasonable');
    }
}