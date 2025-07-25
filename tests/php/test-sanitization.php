<?php
/**
 * サニタイゼーション関数の単体テスト（TDD）
 */

// WordPress関数のモック
require_once __DIR__ . '/wp-functions-mock.php';

// プラグインファイルを読み込み
require_once dirname( dirname( __DIR__ ) ) . '/cover-responsive-focal.php';

use PHPUnit\Framework\TestCase;

class CRF_Sanitization_Test extends TestCase {
    
    /**
     * RED: 失敗するテストから開始
     * フォーカルポイントデータのサニタイゼーション
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
     * 不正な値をデフォルト値に変換
     */
    public function test_sanitize_focal_point_invalid_values() {
        $input = [
            'mediaType' => 'invalid-type',
            'breakpoint' => 'invalid',
            'x' => 'invalid',
            'y' => 'invalid'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        $this->assertEquals('max-width', $sanitized['mediaType']); // デフォルト値
        $this->assertEquals(768, $sanitized['breakpoint']); // デフォルト値
        $this->assertEquals(0.5, $sanitized['x']); // デフォルト値
        $this->assertEquals(0.5, $sanitized['y']); // デフォルト値
    }
    
    /**
     * XSS攻撃の防止
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
     * 境界値のサニタイゼーション
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
     * 範囲外の値の正規化
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
        $this->assertEquals(768, $sanitized['breakpoint']); // デフォルト値
        $this->assertEquals(0.0, $sanitized['x']); // 最小値に正規化
        $this->assertEquals(1.0, $sanitized['y']); // 最大値に正規化
    }
    
    /**
     * 配列全体のサニタイゼーション
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
        
        // 最初の要素（有効）
        $this->assertEquals('max-width', $sanitized[0]['mediaType']);
        $this->assertEquals(767, $sanitized[0]['breakpoint']);
        $this->assertEquals(0.6, $sanitized[0]['x']);
        $this->assertEquals(0.4, $sanitized[0]['y']);
        
        // 2番目の要素（修正される）
        $this->assertEquals('max-width', $sanitized[1]['mediaType']); // デフォルト値
        $this->assertEquals(768, $sanitized[1]['breakpoint']); // デフォルト値
        $this->assertEquals(0.0, $sanitized[1]['x']); // 正規化
        $this->assertEquals(1.0, $sanitized[1]['y']); // 正規化
    }
    
    /**
     * 空の入力値の処理
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
     * CSS Injection防止
     */
    public function test_sanitize_css_injection_prevention() {
        $input = [
            'mediaType' => 'max-width; } body { background: red; } @media screen',
            'breakpoint' => '767; } body { color: blue; } .test',
            'x' => '0.5',
            'y' => '0.5'
        ];
        
        $sanitized = crf_sanitize_focal_point($input);
        
        // CSS Injectionが除去されることを確認
        $this->assertStringNotContainsString('body', (string)$sanitized['mediaType']);
        $this->assertStringNotContainsString('background:', (string)$sanitized['mediaType']);
        $this->assertStringNotContainsString('}', (string)$sanitized['mediaType']);
    }
}