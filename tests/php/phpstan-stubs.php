<?php
/**
 * PHPStan/Intelephense stubs for WordPress unit test classes
 * This file helps IDEs recognize WordPress testing framework classes
 */

// phpcs:disable Generic.CodeAnalysis.UnusedFunctionParameter.Found

/**
 * WordPress Unit Test Case base class
 */
abstract class WP_UnitTestCase extends PHPUnit\Framework\TestCase {
    /**
     * Assert that two variables are equal.
     *
     * @param mixed $expected
     * @param mixed $actual
     * @param string $message
     */
    public static function assertEquals($expected, $actual, string $message = ''): void {}

    /**
     * Assert that a string contains another string.
     *
     * @param string $needle
     * @param string $haystack
     * @param string $message
     */
    public static function assertStringContainsString(string $needle, string $haystack, string $message = ''): void {}

    /**
     * Assert that a string does not contain another string.
     *
     * @param string $needle
     * @param string $haystack
     * @param string $message
     */
    public static function assertStringNotContainsString(string $needle, string $haystack, string $message = ''): void {}

    /**
     * Assert that a condition is true.
     *
     * @param bool $condition
     * @param string $message
     */
    public static function assertTrue($condition, string $message = ''): void {}

    /**
     * Assert that a condition is false.
     *
     * @param bool $condition
     * @param string $message
     */
    public static function assertFalse($condition, string $message = ''): void {}
}