<?php

if (!defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

delete_option('tc_backend_base_url');

global $wpdb;
$cache_group = 'tc_configurator';
$like = $wpdb->esc_like('_transient_' . $cache_group) . '%';
$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like));
$like_timeout = $wpdb->esc_like('_transient_timeout_' . $cache_group) . '%';
$wpdb->query($wpdb->prepare("DELETE FROM {$wpdb->options} WHERE option_name LIKE %s", $like_timeout));
