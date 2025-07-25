<?php
/**
 * CSS生成機能のテスト（TDD）
 */

class CRF_CSS_Generation_Test extends WP_UnitTestCase {
    
    /**
     * RED: 失敗するテストから開始
     * 単一フォーカルポイントでのCSS生成テスト
     */
    public function test_generate_css_rules_single_focal_point() {
        // まだ実装されていない関数をテスト
        $responsive_focal = [
            [
                'mediaType' => 'max-width',
                'breakpoint' => 767,
                'x' => 0.6,
                'y' => 0.4
            ]
        ];
        
        $css = crf_generate_css_rules($responsive_focal, 'test-id');
        
        // 期待する出力を明確に定義
        $expected_css = '@media (max-width: 767px) { [data-fp-id="test-id"] .wp-block-cover__image-background, [data-fp-id="test-id"] .wp-block-cover__video-background { object-position: 60% 40% !important; } }';
        
        $this->assertEquals($expected_css, $css);
    }
    
    /**
     * 複数フォーカルポイントのCSS生成テスト
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
     * 空配列でのCSS生成テスト
     */
    public function test_generate_css_rules_empty_array() {
        $css = crf_generate_css_rules([], 'empty-test');
        $this->assertEquals('', $css);
    }
    
    /**
     * 境界値テスト：0.0と1.0のフォーカルポイント
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
     * 無効な値の処理テスト
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
        
        // 無効な値は処理されずスキップされる
        $this->assertEquals('', $css);
    }
    
    /**
     * メディアクエリ検証関数のテスト
     */
    public function test_validate_media_type() {
        $this->assertTrue(crf_validate_media_type('min-width'));
        $this->assertTrue(crf_validate_media_type('max-width'));
        $this->assertFalse(crf_validate_media_type('invalid-type'));
        $this->assertFalse(crf_validate_media_type(''));
        $this->assertFalse(crf_validate_media_type(null));
    }
    
    /**
     * ブレークポイント検証関数のテスト
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
     * フォーカルポイント値検証のテスト
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
     * CSS エスケープ処理のテスト
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
        
        // 特殊文字を含むIDでテスト
        $malicious_id = 'test"id<script>';
        $css = crf_generate_css_rules($responsive_focal, $malicious_id);
        
        // HTMLエスケープが適用されることを確認
        $this->assertStringNotContainsString('<script>', $css);
        $this->assertStringNotContainsString('"id<', $css);
    }
}