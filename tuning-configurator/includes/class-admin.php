<?php

if (!defined('ABSPATH')) {
    exit;
}

class TC_Admin
{
    public function __construct()
    {
        add_action('admin_menu', array($this, 'register_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_post_tc_test_connection', array($this, 'handle_test_connection'));
        add_action('admin_post_tc_clear_cache', array($this, 'handle_clear_cache'));
    }

    public function register_menu()
    {
        add_options_page(
            __('Tuning Configurator', 'tuning-configurator'),
            __('Tuning Configurator', 'tuning-configurator'),
            'manage_options',
            'tuning-configurator',
            array($this, 'render_page')
        );
    }

    public function register_settings()
    {
        register_setting('tc_settings', TC_OPTION_KEY, array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
            'default' => 'http://localhost:8080',
        ));
    }

    public function render_page()
    {
        if (!current_user_can('manage_options')) {
            return;
        }
        $backend_url = esc_url(get_option(TC_OPTION_KEY, 'http://localhost:8080'));
        $status = isset($_GET['tc_status']) ? sanitize_text_field(wp_unslash($_GET['tc_status'])) : '';
        ?>
        <div class="wrap">
            <h1><?php esc_html_e('Tuning Configurator', 'tuning-configurator'); ?></h1>
            <?php if ($status === 'success') : ?>
                <div class="notice notice-success"><p><?php esc_html_e('Backend connection successful.', 'tuning-configurator'); ?></p></div>
            <?php elseif ($status === 'failed') : ?>
                <div class="notice notice-error"><p><?php esc_html_e('Backend connection failed.', 'tuning-configurator'); ?></p></div>
            <?php elseif ($status === 'cache_cleared') : ?>
                <div class="notice notice-info"><p><?php esc_html_e('Cache cleared.', 'tuning-configurator'); ?></p></div>
            <?php endif; ?>
            <form method="post" action="options.php">
                <?php settings_fields('tc_settings'); ?>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row">
                            <label for="tc_backend_base_url"><?php esc_html_e('Backend Base URL', 'tuning-configurator'); ?></label>
                        </th>
                        <td>
                            <input type="url" class="regular-text" id="tc_backend_base_url" name="tc_backend_base_url" value="<?php echo $backend_url; ?>" required>
                            <p class="description"><?php esc_html_e('Example: http://localhost:8080', 'tuning-configurator'); ?></p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
            <hr>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('tc_test_connection'); ?>
                <input type="hidden" name="action" value="tc_test_connection">
                <?php submit_button(__('Test Connection', 'tuning-configurator'), 'secondary'); ?>
            </form>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>">
                <?php wp_nonce_field('tc_clear_cache'); ?>
                <input type="hidden" name="action" value="tc_clear_cache">
                <?php submit_button(__('Clear Cache', 'tuning-configurator'), 'secondary'); ?>
            </form>
        </div>
        <?php
    }

    public function handle_test_connection()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tuning-configurator'));
        }
        check_admin_referer('tc_test_connection');
        $backend_url = esc_url_raw(get_option(TC_OPTION_KEY, 'http://localhost:8080'));
        $response = wp_remote_get($backend_url . '/v1/health', array('timeout' => 5));
        $status = 'failed';
        if (!is_wp_error($response)) {
            $code = wp_remote_retrieve_response_code($response);
            if ($code === 200) {
                $status = 'success';
            }
        }
        wp_safe_redirect(add_query_arg('tc_status', $status, admin_url('options-general.php?page=tuning-configurator')));
        exit;
    }

    public function handle_clear_cache()
    {
        if (!current_user_can('manage_options')) {
            wp_die(__('Unauthorized', 'tuning-configurator'));
        }
        check_admin_referer('tc_clear_cache');
        tc_clear_cache();
        wp_safe_redirect(add_query_arg('tc_status', 'cache_cleared', admin_url('options-general.php?page=tuning-configurator')));
        exit;
    }
}
