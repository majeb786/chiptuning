<?php

if (!defined('ABSPATH')) {
    exit;
}

class TC_Shortcode
{
    public function __construct()
    {
        add_shortcode('tuning_configurator', array($this, 'render'));
    }

    public function render()
    {
        $backend_url = esc_url(get_option(TC_OPTION_KEY, 'http://localhost:8080'));
        $html = '<div id="tuning-configurator" data-backend="' . esc_attr($backend_url) . '"></div>';
        return $html;
    }
}
