<?php
/**
 * Plugin Name: Tuning Configurator
 * Description: Frontend configurator for tuning data backed by a Node.js API.
 * Version: 1.0.0
 * Author: Codex
 * Text Domain: tuning-configurator
 */

if (!defined('ABSPATH')) {
    exit;
}

define('TC_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('TC_PLUGIN_URL', plugin_dir_url(__FILE__));
define('TC_OPTION_KEY', 'tc_backend_base_url');
define('TC_CACHE_GROUP', 'tc_configurator');

require_once TC_PLUGIN_PATH . 'includes/class-admin.php';
require_once TC_PLUGIN_PATH . 'includes/class-shortcode.php';
require_once TC_PLUGIN_PATH . 'includes/class-assets.php';
require_once TC_PLUGIN_PATH . 'includes/class-rest-proxy.php';

function tc_activate_plugin()
{
    if (get_option(TC_OPTION_KEY) === false) {
        add_option(TC_OPTION_KEY, 'http://localhost:8080');
    }
}
register_activation_hook(__FILE__, 'tc_activate_plugin');

function tc_init_plugin()
{
    new TC_Admin();
    new TC_Shortcode();
    new TC_Assets();
    new TC_Rest_Proxy();
}
add_action('plugins_loaded', 'tc_init_plugin');

function tc_clear_cache()
{
    global $wpdb;
    $like = $wpdb->esc_like('_transient_' . TC_CACHE_GROUP) . '%';
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like));
    $like_timeout = $wpdb->esc_like('_transient_timeout_' . TC_CACHE_GROUP) . '%';
    $wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like_timeout));
}
