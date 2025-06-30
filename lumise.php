<?php

/**
 * Plugin Name: Lumise - Product Designer Tool
 * Plugin URI: https://www.lumise.com/
 * Description: The professional solution for designing & printing online
 * Version: 2.0.6.1
 * Author: King-Theme
 * Author URI: https://www.lumise.com/
 * Text Domain: lumise
 * Domain Path: /languages/
 */


defined('ABSPATH') || exit;
if (!defined('DS')) {
	if (DIRECTORY_SEPARATOR == '\\') {
		// window type.
		define('DS', '/');
	} else {
		// linux type.
		define('DS', DIRECTORY_SEPARATOR);
	}
}

if (!defined('LUMISE_FILE')) {
	define('LUMISE_FILE', __FILE__);
}
if (!defined('LUMISE_PLUGIN_BASENAME')) {
	define('LUMISE_PLUGIN_BASENAME', plugin_basename(LUMISE_FILE));
}

// Include the main LumiseWoo class.
if (!class_exists('LumiseWoo', false)) {
	include_once dirname(__FILE__) . '/includes/class-lumise.php';
}

/**
 * Returns the main instance of LumiseWoo.
 */
function LW()
{
	return LumiseWoo::instance();
}

// Global for backwards compatibility.
$GLOBALS['lumise_woo'] = LW();

if (class_exists('WOOCS')) {
	global $WOOCS;
	if ($WOOCS->is_multiple_allowed) {
		$currrent = $WOOCS->current_currency;
		if ($currrent != $WOOCS->default_currency) {
			$currencies = $WOOCS->get_currencies();
			$rate = $currencies[$currrent]['rate'];
			$price = $price / $rate;
		}
	}
}





// add_filter('woocommerce_locate_template', 'woo_adon_plugin_template', 1, 3);
// function woo_adon_plugin_template($template, $template_name, $template_path)
// {
// 	global $woocommerce;
// 	$_template = $template;
// 	if (!$template_path)
// 		$template_path = $woocommerce->template_url;

// 	$plugin_path = untrailingslashit(plugin_dir_path(__FILE__)) . '/template/woocommerce/';

// 	// Look within passed path within the theme - this is priority
// 	$template = locate_template(
// 		array(
// 			$template_path . $template_name,
// 			$template_name
// 		)
// 	);

// 	if (!$template && file_exists($plugin_path . $template_name))
// 		$template = $plugin_path . $template_name;

// 	if (!$template)
// 		$template = $_template;

// 	return $template;
// }
/**
 * Override default WooCommerce templates and template parts from plugin.
 * 
 * E.g.
 * Override template 'woocommerce/loop/result-count.php' with 'my-plugin/woocommerce/loop/result-count.php'.
 * Override template part 'woocommerce/content-product.php' with 'my-plugin/woocommerce/content-product.php'.
 *
 * Note: We used folder name 'woocommerce' in plugin to override all woocommerce templates and template parts.
 * You can change it as per your requirement.
 */
// Override Template Part's.
add_filter( 'wc_get_template_part',             'override_woocommerce_template_part', 10, 3 );
// Override Template's.
add_filter( 'woocommerce_locate_template',      'override_woocommerce_template', 10, 3 );
/**
 * Template Part's
 *
 * @param  string $template Default template file path.
 * @param  string $slug     Template file slug.
 * @param  string $name     Template file name.
 * @return string           Return the template part from plugin.
 */
function override_woocommerce_template_part( $template, $slug, $name ) {
    // UNCOMMENT FOR @DEBUGGING
    // echo '<pre>';
    // echo 'template: ' . $template . '<br/>';
    // echo 'slug: ' . $slug . '<br/>';
    // echo 'name: ' . $name . '<br/>';
    // echo '</pre>';
    // Template directory.
    // E.g. /wp-content/plugins/my-plugin/woocommerce/
		$template_directory = untrailingslashit(plugin_dir_path(__FILE__)) . '/template/woocommerce/';

    if ( $name ) {
        $path = $template_directory . "{$slug}-{$name}.php";
    } else {
        $path = $template_directory . "{$slug}.php";
    }
    return file_exists( $path ) ? $path : $template;
}
/**
 * Template File
 *
 * @param  string $template      Default template file  path.
 * @param  string $template_name Template file name.
 * @param  string $template_path Template file directory file path.
 * @return string                Return the template file from plugin.
 */
function override_woocommerce_template( $template, $template_name, $template_path ) {
    // UNCOMMENT FOR @DEBUGGING
    // echo '<pre>';
    // echo 'template: ' . $template . '<br/>';
    // echo 'template_name: ' . $template_name . '<br/>';
    // echo 'template_path: ' . $template_path . '<br/>';
    // echo '</pre>';
    // Template directory.
    // E.g. /wp-content/plugins/my-plugin/woocommerce/
    $template_directory = untrailingslashit( plugin_dir_path( __FILE__ ) ) . '/template/woocommerce/';
    $path = $template_directory . $template_name;
    return file_exists( $path ) ? $path : $template;
}