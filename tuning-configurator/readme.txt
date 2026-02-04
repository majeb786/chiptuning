=== Tuning Configurator ===
Contributors: codex
Tags: tuning, configurator, cars
Requires at least: 6.0
Tested up to: 6.5
Stable tag: 1.0.0
License: GPLv2 or later

A frontend configurator plugin for tuning data with a Node.js backend.

== Description ==

Tuning Configurator provides a shortcode [tuning_configurator] to render a dropdown chain (Hersteller -> Model -> Build -> Engine) and display tuning results. It connects to a separate backend and supports caching plus a WP REST proxy.

== Installation ==

1. Upload the `tuning-configurator` folder to `/wp-content/plugins/`.
2. Activate the plugin.
3. Open Settings > Tuning Configurator and set the backend base URL.
4. Add shortcode [tuning_configurator] to any page.

== Frequently Asked Questions ==

= Where is the backend? =

Run the Node.js backend with Docker (see `/backend/README.md`).

== Changelog ==

= 1.0.0 =
* Initial release.
