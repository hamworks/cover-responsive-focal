<?php
/**
 * render_block filter function unit tests (TDD)
 */

// WordPress function mocks
require_once __DIR__ . '/wp-functions-mock.php';

// Load plugin file
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

// Load required classes
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-validator.php';
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-css-optimizer.php';
require_once dirname( dirname( __DIR__ ) ) . '/includes/class-block-renderer.php';

use PHPUnit\Framework\TestCase;

class CRF_Render_Block_Test extends TestCase {
    
    /**
     * Block renderer instance
     */
    private $block_renderer;
    
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
        $this->block_renderer = new CRF_Block_Renderer($this->validator, $this->css_optimizer);
    }
    
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
                        'device' => 'mobile',
                        'x' => 0.6,
                        'y' => 0.4
                    ]
                ],
                'dataFpId' => 'test-123'
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Content</div>';
        $filtered_content = $this->block_renderer->render_block($content, $block);
        
        // Verify that data-fp-id attribute is added
        $this->assertStringContainsString('data-fp-id="test-123"', $filtered_content);
        
        // Verify that inline style is added
        $this->assertStringContainsString('<style id="test-123">', $filtered_content);
        $this->assertStringContainsString('@media (max-width:600px)', $filtered_content);
        $this->assertStringContainsString('object-position:60% 40%', $filtered_content);
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
        $filtered_content = $this->block_renderer->render_block($content, $block);
        
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
        $filtered_content = $this->block_renderer->render_block($content, $block);
        
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
                        'device' => 'mobile',
                        'x' => 0.5,
                        'y' => 0.5
                    ]
                ]
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Content</div>';
        $filtered_content = $this->block_renderer->render_block($content, $block);
        
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
                        'device' => 'mobile',
                        'x' => 0.6,
                        'y' => 0.4
                    ],
                    [
                        'device' => 'tablet',
                        'x' => 0.3,
                        'y' => 0.7
                    ]
                ],
                'dataFpId' => 'multi-test'
            ]
        ];
        
        $content = '<div class="wp-block-cover">Test Multi</div>';
        $filtered_content = $this->block_renderer->render_block($content, $block);
        
        $this->assertStringContainsString('data-fp-id="multi-test"', $filtered_content);
        $this->assertStringContainsString('@media (max-width:600px)', $filtered_content);
        $this->assertStringContainsString('@media (min-width:601px) and (max-width:782px)', $filtered_content);
        $this->assertStringContainsString('object-position:60% 40%', $filtered_content);
        $this->assertStringContainsString('object-position:30% 70%', $filtered_content);
    }
}