<?php
/**
 * render_blockフィルター関数の単体テスト（TDD）
 */

// WordPress関数のモック
require_once __DIR__ . '/wp-functions-mock.php';

// プラグインファイルを読み込み
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

use PHPUnit\Framework\TestCase;

class CRF_Render_Block_Test extends TestCase {
    
    /**
     * RED: 失敗するテストから開始
     * カバーブロックのコンテンツ処理
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
        
        // data-fp-id属性が追加されることを確認
        $this->assertStringContainsString('data-fp-id="test-123"', $filtered_content);
        
        // インラインスタイルが追加されることを確認
        $this->assertStringContainsString('<style id="test-123">', $filtered_content);
        $this->assertStringContainsString('@media (max-width: 767px)', $filtered_content);
        $this->assertStringContainsString('object-position: 60% 40%', $filtered_content);
    }
    
    /**
     * 非カバーブロックはそのまま返す
     */
    public function test_render_block_non_cover_block() {
        $block = [
            'blockName' => 'core/paragraph',
            'attrs' => []
        ];
        
        $content = '<p>Test paragraph</p>';
        $filtered_content = crf_render_block($content, $block);
        
        // 変更されないことを確認
        $this->assertEquals($content, $filtered_content);
    }
    
    /**
     * responsiveFocalが空の場合はそのまま返す
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
        
        // 変更されないことを確認
        $this->assertEquals($content, $filtered_content);
    }
    
    /**
     * dataFpIdが未設定の場合は自動生成
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
        
        // data-fp-id属性が追加されることを確認（自動生成ID）
        $this->assertMatchesRegularExpression('/data-fp-id="crf-[^"]*"/', $filtered_content);
        
        // インラインスタイルが追加されることを確認
        $this->assertStringContainsString('<style id="crf-', $filtered_content);
    }
    
    /**
     * 複数のレスポンシブフォーカルポイント
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
     * data-fp-id属性の追加処理テスト
     */
    public function test_add_fp_id_to_content() {
        $content = '<div class="wp-block-cover has-background-dim">Test</div>';
        $fp_id = 'test-id-123';
        
        $modified_content = crf_add_fp_id_to_content($content, $fp_id);
        
        $this->assertStringContainsString('data-fp-id="test-id-123"', $modified_content);
        $this->assertStringContainsString('wp-block-cover', $modified_content);
    }
    
    /**
     * 複雑なクラス構造でのdata-fp-id追加
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
        // 最初のwp-block-coverクラス要素のみに追加される
        $this->assertEquals(1, substr_count($modified_content, 'data-fp-id='));
    }
    
    /**
     * 一意ID生成のテスト
     */
    public function test_generate_unique_fp_id() {
        $id1 = crf_generate_unique_fp_id();
        $id2 = crf_generate_unique_fp_id();
        
        $this->assertStringStartsWith('crf-', $id1);
        $this->assertStringStartsWith('crf-', $id2);
        $this->assertNotEquals($id1, $id2); // 異なるIDが生成される
    }
}