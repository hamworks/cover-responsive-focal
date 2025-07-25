<?php
/**
 * 全PHPテストの実行
 */

echo "=== 全PHPテスト実行 ===\n\n";

// CSS生成関数のテスト
echo "1. CSS生成関数のテスト\n";
require_once 'test-runner.php';
echo "\n";

// サニタイゼーション関数のテスト
echo "2. サニタイゼーション関数のテスト\n";
require_once 'test-sanitization-runner.php';
echo "\n";

// render_blockフィルターのテスト
echo "3. render_blockフィルターのテスト\n";
require_once 'test-render-block-runner.php';
echo "\n";

echo "=== 全テスト完了 ===\n";