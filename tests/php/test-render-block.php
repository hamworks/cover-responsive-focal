<?php
/**
 * render_block filter function unit tests (TDD)
 */

// WordPress function mocks
require_once __DIR__ . '/wp-functions-mock.php';

// Load plugin file
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

use PHPUnit\Framework\TestCase;

class CRF_Render_Block_Test extends TestCase {
    
    /**
     * RED: Start with failing tests
     * Cover block content processing
     */
    public function test_render_block_cover_with_responsive_focal() {
        $block = [
            'blockName' => 'core/cover',
            'attrs' => [
                'responsiveFocal' => [
                    [
                        'mediaType' => 'max-width',
                        'breakpoint' => 767,
                        'x' => 0.6,
                        'y' => 0.4
                    ]
                ],
                'dataFpId' => 'test-123'
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Content</div>';
        $filtered_content = crf_render_block($content, $block);
        
        // Verify that data-fp-id attribute is added
        $this->assertStringContainsString('data-fp-id="test-123"', $filtered_content);
        
        // Verify that inline style is added
        $this->assertStringContainsString('<style id="test-123">', $filtered_content);
        $this->assertStringContainsString('@media (max-width: 767px)', $filtered_content);
        $this->assertStringContainsString('object-position: 60% 40%', $filtered_content);
    }
    
    /**
     * Return non-cover blocks as is
     */
    public function test_render_block_non_cover_block() {
        $block = [
            'blockName' => 'core/paragraph',
            'attrs' => []
        ];
        
        $content = '<p>Test paragraph</p>';
        $filtered_content = crf_render_block($content, $block);
        
        // Verify that it remains unchanged
        $this->assertEquals($content, $filtered_content);
    }
    
    /**
     * Return as is when responsiveFocal is empty
     */
    public function test_render_block_empty_responsive_focal() {
        $block = [
            'blockName' => 'core/cover',
            'attrs' => [
                'responsiveFocal' => []
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Content</div>';
        $filtered_content = crf_render_block($content, $block);
        
        // Verify that it remains unchanged
        $this->assertEquals($content, $filtered_content);
    }
    
    /**
     * Auto-generate when dataFpId is not set
     */
    public function test_render_block_auto_generate_fp_id() {
        $block = [
            'blockName' => 'core/cover',
            'attrs' => [
                'responsiveFocal' => [
                    [
                        'mediaType' => 'max-width',
                        'breakpoint' => 767,
                        'x' => 0.5,
                        'y' => 0.5
                    ]
                ]
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Content</div>';
        $filtered_content = crf_render_block($content, $block);
        
        // Verify that data-fp-id attribute is added (auto-generated ID)
        $this->assertMatchesRegularExpression('/data-fp-id="crf-[^"]*"/', $filtered_content);
        
        // Verify that inline style is added
        $this->assertStringContainsString('<style id="crf-', $filtered_content);
    }
    
    /**
     * Multiple responsive focal points
     */
    public function test_render_block_multiple_focal_points() {
        $block = [
            'blockName' => 'core/cover',
            'attrs' => [
                'responsiveFocal' => [
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
                ],
                'dataFpId' => 'multi-test'
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Multi</div>';
        $filtered_content = crf_render_block($content, $block);
        
        $this->assertStringContainsString('data-fp-id="multi-test"', $filtered_content);
        $this->assertStringContainsString('@media (max-width: 767px)', $filtered_content);
        $this->assertStringContainsString('@media (min-width: 768px)', $filtered_content);
        $this->assertStringContainsString('object-position: 60% 40%', $filtered_content);
        $this->assertStringContainsString('object-position: 30% 70%', $filtered_content);
    }
    
    /**
     * data-fp-id attribute addition process test
     */
    public function test_add_fp_id_to_content() {
        $content = '<div class="wp-block-cover has-background-dim">Test</div>';
        $fp_id = 'test-id-123';
        
        $modified_content = crf_add_fp_id_to_content($content, $fp_id);
        
        $this->assertStringContainsString('data-fp-id="test-id-123"', $modified_content);
        $this->assertStringContainsString('wp-block-cover', $modified_content);
    }
    
    /**
     * data-fp-id addition with complex class structure
     */
    public function test_add_fp_id_complex_classes() {
        $content = '<div class="wp-block-cover has-background-dim alignfull">
                        <div class="wp-block-cover__inner-container">
                            <p>Content</p>
                        </div>
                    </div>';
        $fp_id = 'complex-test';
        
        $modified_content = crf_add_fp_id_to_content($content, $fp_id);
        
        $this->assertStringContainsString('data-fp-id="complex-test"', $modified_content);
        // Added only to the first wp-block-cover class element
        $this->assertEquals(1, substr_count($modified_content, 'data-fp-id='));
    }
    
    /**
     * Unique ID generation test
     */
    public function test_generate_unique_fp_id() {
        $id1 = crf_generate_unique_fp_id();
        $id2 = crf_generate_unique_fp_id();
        
        $this->assertStringStartsWith('crf-', $id1);
        $this->assertStringStartsWith('crf-', $id2);
        $this->assertNotEquals($id1, $id2); // Different IDs are generated
    }
}