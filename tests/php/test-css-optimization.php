<?php
/**
 * CSS optimization feature tests (TDD)
 * 
 * @package CoverResponsiveFocal
 */

require_once __DIR__ . '/wp-functions-mock.php';
require_once __DIR__ . '/../../cover-responsive-focal.php';

use PHPUnit\Framework\TestCase;

class CSSOptimizationTest extends TestCase {

	public function setUp(): void {
		parent::setUp();
		// Setup test data
	}

	/**
	 * RED: CSS minification processing test
	 * 
	 * @group css-optimization
	 */
	public function test_crf_minify_css_should_remove_whitespace() {
		// Test of function not yet implemented (RED)
		$css = '@media (min-width: 768px) { 
			[data-fp-id="test"] .wp-block-cover__image-background { 
				object-position: 50% 50% !important; 
			} 
		}';
		
		$expected = '@media (min-width: 768px){[data-fp-id="test"] .wp-block-cover__image-background{object-position: 50% 50% !important;}}';
		
		$this->assertEquals( $expected, crf_minify_css( $css ) );
	}

	/**
	 * RED: CSS minification removes unnecessary semicolons
	 * 
	 * @group css-optimization
	 */
	public function test_crf_minify_css_should_remove_unnecessary_semicolons() {
		$css = '@media (max-width: 767px) { [data-fp-id="test"] .wp-block-cover__image-background { object-position: 25% 75% !important; ; } }';
		$expected = '@media (max-width: 767px){[data-fp-id="test"] .wp-block-cover__image-background{object-position: 25% 75% !important;}}';
		
		$this->assertEquals( $expected, crf_minify_css( $css ) );
	}

	/**
	 * RED: Duplicate media query merge test
	 * 
	 * @group css-optimization
	 */
	public function test_crf_merge_duplicate_media_queries_should_combine_same_queries() {
		$responsive_focal = [
			[
				'mediaType' => 'min-width',
				'breakpoint' => 768,
				'x' => 0.2,
				'y' => 0.3
			],
			[
				'mediaType' => 'min-width', // Same media query
				'breakpoint' => 768,
				'x' => 0.8,
				'y' => 0.7
			]
		];

		// Generate CSS before optimization
		$unoptimized_css = crf_generate_css_rules( $responsive_focal, 'test-id' );
		
		// CSS after optimization
		$optimized_css = crf_merge_duplicate_media_queries( $unoptimized_css );
		
		// Verify same media queries are combined into one
		$media_query_count = substr_count( $optimized_css, '@media (min-width: 768px)' );
		$this->assertEquals( 1, $media_query_count );
		
		// Verify both object-positions are included
		$this->assertStringContainsString( '20% 30%', $optimized_css );
		$this->assertStringContainsString( '80% 70%', $optimized_css );
	}

	/**
	 * RED: Cache functionality test
	 * 
	 * @group css-optimization
	 */
	public function test_crf_get_cached_css_should_return_cached_result() {
		$responsive_focal = [
			[
				'mediaType' => 'min-width',
				'breakpoint' => 768,
				'x' => 0.5,
				'y' => 0.5
			]
		];
		$fp_id = 'cache-test';

		// No cache on first time
		$this->assertFalse( crf_get_cached_css( $responsive_focal, $fp_id ) );
		
		// Generate CSS and save to cache
		$css = crf_generate_optimized_css_rules( $responsive_focal, $fp_id );
		crf_cache_css( $responsive_focal, $fp_id, $css );
		
		// Second time get from cache
		$cached_css = crf_get_cached_css( $responsive_focal, $fp_id );
		$this->assertEquals( $css, $cached_css );
	}

	/**
	 * RED: Cache hash generation test
	 * 
	 * @group css-optimization
	 */
	public function test_crf_generate_cache_hash_should_create_unique_hash() {
		$responsive_focal_1 = [
			[ 'mediaType' => 'min-width', 'breakpoint' => 768, 'x' => 0.5, 'y' => 0.5 ]
		];
		$responsive_focal_2 = [
			[ 'mediaType' => 'max-width', 'breakpoint' => 767, 'x' => 0.3, 'y' => 0.7 ]
		];

		$hash1 = crf_generate_cache_hash( $responsive_focal_1, 'test-1' );
		$hash2 = crf_generate_cache_hash( $responsive_focal_2, 'test-2' );
		
		// Different data generates different hashes
		$this->assertNotEquals( $hash1, $hash2 );
		
		// Hash is 32-character md5
		$this->assertEquals( 32, strlen( $hash1 ) );
		$this->assertMatchesRegularExpression( '/^[a-f0-9]{32}$/', $hash1 );
	}

	/**
	 * RED: Avoid unnecessary CSS output test
	 * 
	 * @group css-optimization
	 */
	public function test_crf_generate_optimized_css_rules_should_skip_empty_rules() {
		// Array containing invalid data
		$responsive_focal = [
			[
				'mediaType' => 'invalid-type', // Invalid
				'breakpoint' => 768,
				'x' => 0.5,
				'y' => 0.5
			],
			[
				'mediaType' => 'min-width', // Valid
				'breakpoint' => 1024,
				'x' => 0.3,
				'y' => 0.7
			]
		];

		$css = crf_generate_optimized_css_rules( $responsive_focal, 'test-id' );
		
		// Invalid rules are not output, only valid rules are output
		$this->assertStringNotContainsString( 'invalid-type', $css );
		$this->assertStringContainsString( 'min-width: 1024px', $css );
		$this->assertStringContainsString( '30% 70%', $css );
	}

	/**
	 * RED: Compatibility check with existing implementation
	 * 
	 * @group css-optimization
	 */
	public function test_crf_generate_optimized_css_rules_should_maintain_compatibility() {
		$responsive_focal = [
			[
				'mediaType' => 'min-width',
				'breakpoint' => 768,
				'x' => 0.25,
				'y' => 0.75
			]
		];
		$fp_id = 'compat-test';

		// Same CSS structure is generated by existing and optimized functions
		$original_css = crf_generate_css_rules( $responsive_focal, $fp_id );
		$optimized_css = crf_generate_optimized_css_rules( $responsive_focal, $fp_id );
		
		// Optimized version is minified but contains all necessary elements
		$this->assertStringNotContainsString( "\n", $optimized_css ); // No newlines
		$this->assertStringContainsString( '@media (min-width: 768px)', $optimized_css );
		$this->assertStringContainsString( '[data-fp-id="' . $fp_id . '"]', $optimized_css );
		$this->assertStringContainsString( 'object-position: 25% 75%', $optimized_css );
		$this->assertStringContainsString( '!important', $optimized_css );
	}

	/**
	 * RED: Performance improvement verification
	 * 
	 * @group css-optimization
	 */
	public function test_crf_generate_optimized_css_rules_should_be_smaller() {
		$responsive_focal = [
			[
				'mediaType' => 'min-width',
				'breakpoint' => 768,
				'x' => 0.5,
				'y' => 0.5
			],
			[
				'mediaType' => 'max-width',
				'breakpoint' => 767,
				'x' => 0.2,
				'y' => 0.8
			]
		];
		$fp_id = 'perf-test';

		$original_css = crf_generate_css_rules( $responsive_focal, $fp_id );
		$optimized_css = crf_generate_optimized_css_rules( $responsive_focal, $fp_id );
		
		// Optimized version is smaller than original CSS
		$this->assertLessThan( strlen( $original_css ), strlen( $optimized_css ) );
	}
}