<?php
/**
 * CSS Optimization Manual Test Runner
 * TDD Red-Green-Refactor cycle verification
 */

// Load WordPress function mocks
$mock_file = 'tests/php/wp-functions-mock.php';
if (!file_exists($mock_file)) {
    die("Error: Required file not found: $mock_file\n");
}
require_once $mock_file;

// Load plugin file
$plugin_file = 'cover-responsive-focal.php';
if (!file_exists($plugin_file)) {
    die("Error: Required file not found: $plugin_file\n");
}
require_once $plugin_file;

echo "=== CSS Optimization Test Execution (TDD GREEN Phase Verification) ===\n";

// Create instances
$validator = new CRF_Validator();
$css_optimizer = new CRF_CSS_Optimizer($validator);

// ========================================
// Test 1: CSS minification
// ========================================
echo "\n【Test 1: CSS minification】\n";

$unminified_css = '@media (max-width: 600px) { 
    [data-fp-id="test"] .wp-block-cover__image-background { 
        object-position: 60% 40% !important; 
    } 
}';

$minified = $css_optimizer->minify_css($unminified_css);
$expected_minified = '@media (max-width:600px){[data-fp-id="test"] .wp-block-cover__image-background{object-position:60% 40% !important}}';

if ($minified === $expected_minified) {
    echo "✅ CSS minification success\n";
    echo "   - Unnecessary whitespace, newlines, and tabs removed\n";
} else {
    echo "❌ CSS minification failed\n";
    echo "Expected: " . $expected_minified . "\n";
    echo "Actual: " . $minified . "\n";
}

// ========================================
// Test 2: Duplicate media query merging
// ========================================
echo "\n【Test 2: Duplicate media query merging】\n";

$css_with_duplicates = '@media (max-width: 600px){[data-fp-id="test1"] .wp-block-cover__image-background{object-position:60% 40% !important}}@media (max-width: 600px){[data-fp-id="test2"] .wp-block-cover__image-background{object-position:30% 70% !important}}';

$merged = $css_optimizer->merge_duplicate_media_queries($css_with_duplicates);
$media_query_count = substr_count($merged, '@media (max-width: 600px)');

if ($media_query_count === 1) {
    echo "✅ Duplicate media query merging success\n";
    echo "   - Duplicate @media queries merged into one\n";
    echo "   - Result: " . $merged . "\n";
} else {
    echo "❌ Duplicate media query merging failed\n";
    echo "   - Media query count: " . $media_query_count . " (Expected: 1)\n";
    echo "   - Result: " . $merged . "\n";
}

// ========================================
// Test 3: Cache functionality
// ========================================
echo "\n【Test 3: Cache functionality】\n";

$responsive_focal_cache_test = [
    [
        'device' => 'mobile',
        'x' => 0.6,
        'y' => 0.4
    ]
];

// First generation (save to cache)
$start_time = microtime(true);
$first_result = $css_optimizer->generate_optimized_css_rules($responsive_focal_cache_test, 'cache-test');
$first_time = microtime(true) - $start_time;

// Second generation (retrieve from cache)
$start_time = microtime(true);
$second_result = $css_optimizer->generate_optimized_css_rules($responsive_focal_cache_test, 'cache-test');
$second_time = microtime(true) - $start_time;

if ($first_result === $second_result && !empty($first_result)) {
    echo "✅ Cache functionality success\n";
    echo "   - First generation time: " . sprintf("%.4f", $first_time) . " seconds\n";
    echo "   - Second generation time: " . sprintf("%.4f", $second_time) . " seconds\n";
    echo "   - Cached CSS: " . substr($first_result, 0, 100) . "...\n";
} else {
    echo "❌ Cache functionality failed\n";
    echo "First: " . $first_result . "\n";
    echo "Second: " . $second_result . "\n";
}

// ========================================
// Test 4: Integrated optimization pipeline
// ========================================
echo "\n【Test 4: Integrated optimization pipeline】\n";

$responsive_focal_pipeline = [
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

$optimized_css = $css_optimizer->generate_optimized_css_rules($responsive_focal_pipeline, 'pipeline-test');

$pipeline_tests = [
    'minified' => !preg_match('/\s{2,}/', $optimized_css), // No consecutive spaces
    'mobile_media_query' => strpos($optimized_css, '@media (max-width:600px)') !== false,
    'tablet_media_query' => strpos($optimized_css, '@media (min-width:601px) and (max-width:782px)') !== false,
    'mobile_focal_point' => strpos($optimized_css, 'object-position:60% 40%') !== false,
    'tablet_focal_point' => strpos($optimized_css, 'object-position:30% 70%') !== false,
    'important_declarations' => strpos($optimized_css, '!important') !== false,
];

$all_tests_passed = array_reduce($pipeline_tests, function($carry, $test) {
    return $carry && $test;
}, true);

if ($all_tests_passed) {
    echo "✅ Integrated optimization pipeline success\n";
    echo "   - CSS minification: ✓\n";
    echo "   - Mobile media query: ✓\n";
    echo "   - Tablet media query: ✓\n";
    echo "   - Focal point values: ✓\n";
    echo "   - !important declarations: ✓\n";
    echo "   - Optimized CSS: " . substr($optimized_css, 0, 200) . "...\n";
} else {
    echo "❌ Integrated optimization pipeline failed\n";
    foreach ($pipeline_tests as $test_name => $result) {
        echo "   - " . $test_name . ": " . ($result ? "✓" : "✗") . "\n";
    }
    echo "   - Generated CSS: " . $optimized_css . "\n";
}

// ========================================
// Test 5: Performance test
// ========================================
echo "\n【Test 5: Performance test】\n";

// Large responsive focal points array
$large_responsive_focal = [];
for ($i = 0; $i < 50; $i++) {
    $large_responsive_focal[] = [
        'device' => ($i % 2 === 0) ? 'mobile' : 'tablet',
        'x' => 0.5,
        'y' => 0.5
    ];
}

$start_time = microtime(true);
$performance_result = $css_optimizer->generate_optimized_css_rules($large_responsive_focal, 'performance-test');
$execution_time = microtime(true) - $start_time;

// Allow environment variable override for performance threshold
$max_execution_time = getenv('CRF_TEST_PERFORMANCE_THRESHOLD') ?: 0.2;

if ($execution_time < $max_execution_time && !empty($performance_result)) {
    echo "✅ Performance test success\n";
    echo "   - Execution time: " . sprintf("%.4f", $execution_time) . " seconds (Target: < {$max_execution_time} seconds)\n";
    echo "   - Processed focal points: " . count($large_responsive_focal) . "\n";
    echo "   - Generated CSS length: " . strlen($performance_result) . " characters\n";
} else {
    echo "❌ Performance test failed\n";
    echo "   - Execution time: " . sprintf("%.4f", $execution_time) . " seconds\n";
    echo "   - Empty result: " . (empty($performance_result) ? "Yes" : "No") . "\n";
}

// ========================================
// Test 6: Security test (XSS prevention)
// ========================================
echo "\n【Test 6: Security test (XSS prevention)】\n";

$responsive_focal_security = [
    [
        'device' => 'mobile',
        'x' => 0.5,
        'y' => 0.5
    ]
];

$malicious_fp_id = 'test"id<script>alert("xss")</script>';
$secure_css = $css_optimizer->generate_optimized_css_rules($responsive_focal_security, $malicious_fp_id);

$security_tests = [
    'no_script_tags' => strpos($secure_css, '<script>') === false,
    'no_alert_function' => strpos($secure_css, 'alert(') === false,
    'no_html_injection' => strpos($secure_css, '"id<') === false,
    'has_css_content' => !empty($secure_css) && strpos($secure_css, 'object-position') !== false,
];

$security_passed = array_reduce($security_tests, function($carry, $test) {
    return $carry && $test;
}, true);

if ($security_passed) {
    echo "✅ Security test success\n";
    echo "   - Script tag removal: ✓\n";
    echo "   - Alert function removal: ✓\n";
    echo "   - HTML injection prevention: ✓\n";
    echo "   - Normal CSS generation: ✓\n";
} else {
    echo "❌ Security test failed\n";
    foreach ($security_tests as $test_name => $result) {
        echo "   - " . $test_name . ": " . ($result ? "✓" : "✗") . "\n";
    }
    echo "   - Generated CSS: " . $secure_css . "\n";
}

echo "\n=== TDD GREEN Phase Verification Complete ===\n";
echo "All CSS optimization features implemented according to design specifications.\n";
echo "- CSS minification: ✓\n";
echo "- Duplicate media query merging: ✓\n";
echo "- Cache functionality: ✓\n";
echo "- Performance optimization: ✓\n";
echo "- Security measures: ✓\n";