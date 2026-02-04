<?php

if (!defined('ABSPATH')) {
    exit;
}

class TC_Rest_Proxy
{
    public function __construct()
    {
        add_action('rest_api_init', array($this, 'register_routes'));
    }

    public function register_routes()
    {
        register_rest_route('tc/v1', '/proxy', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'handle_proxy'),
            'permission_callback' => '__return_true',
        ));
    }

    public function handle_proxy(WP_REST_Request $request)
    {
        $backend = esc_url_raw(get_option(TC_OPTION_KEY, 'http://localhost:8080'));
        $endpoint = $request->get_param('endpoint');
        $method = strtoupper($request->get_method());

        if (!$endpoint || strpos($endpoint, '/v1/') !== 0) {
            return new WP_REST_Response(array('error' => 'Invalid endpoint'), 400);
        }

        $url = $backend . $endpoint;
        $args = array(
            'method' => $method,
            'timeout' => 10,
        );

        if ($method === 'POST') {
            $args['headers'] = array('Content-Type' => 'application/json');
            $args['body'] = wp_json_encode($request->get_json_params());
        }

        $response = wp_remote_request($url, $args);
        if (is_wp_error($response)) {
            return new WP_REST_Response(array('error' => $response->get_error_message()), 500);
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $decoded = json_decode($body, true);
        if ($decoded === null && json_last_error() !== JSON_ERROR_NONE) {
            $decoded = $body;
        }

        return new WP_REST_Response($decoded, $code);
    }
}
