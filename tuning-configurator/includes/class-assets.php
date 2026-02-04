<?php

if (!defined('ABSPATH')) {
    exit;
}

class TC_Assets
{
    public function __construct()
    {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_assets'));
    }

    public function enqueue_assets()
    {
        if (!is_singular()) {
            return;
        }
        global $post;
        if (!$post || strpos($post->post_content, '[tuning_configurator]') === false) {
            return;
        }

        wp_enqueue_style(
            'tc-configurator',
            TC_PLUGIN_URL . 'assets/css/app.css',
            array(),
            '1.0.0'
        );

        wp_enqueue_script(
            'tc-configurator',
            TC_PLUGIN_URL . 'assets/js/app.js',
            array(),
            '1.0.0',
            true
        );

        wp_localize_script('tc-configurator', 'tcConfigurator', array(
            'proxyUrl' => esc_url_raw(rest_url('tc/v1')),
        ));
    }
}
