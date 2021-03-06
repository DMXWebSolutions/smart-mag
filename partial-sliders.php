<?php

/**
 * Partial Template - Display the featured slider and the blocks
 */

$data_vars = array(
	'data-animation-speed="'. intval(Bunyad::options()->slider_animation_speed) . '"',
	'data-animation="' . esc_attr(Bunyad::options()->slider_animation) . '"',
	'data-slide-delay="' . esc_attr(Bunyad::options()->slider_slide_delay) . '"',
);

$data_vars = implode(' ', $data_vars);

// get latest featured posts
$args = apply_filters(
	'bunyad_block_query_args',
	array('meta_key' => '_bunyad_featured_post', 'meta_value' => 1, 'order' => 'date', 'posts_per_page' => 8, 'ignore_sticky_posts' => 1),
	'slider'
);

/*
 * Posts grid generated from a category or a tag?
 */
$limit_cat = Bunyad::options()->featured_right_cat;
$limit_tag = Bunyad::options()->featured_right_tag;

if (!empty($limit_cat)) {

	$args['posts_per_page'] = 8;
	$grid_query = new WP_Query(apply_filters('bunyad_block_query_args', array('cat' => $limit_cat, 'posts_per_page' => 3), 'slider_grid'));
}
else if (!empty($limit_tag)) {

	$args['posts_per_page'] = 8;
	$grid_query = new WP_Query(apply_filters('bunyad_block_query_args', array('tag' => $limit_tag, 'posts_per_page' => 3), 'slider_grid'));
}

/*
 * Category slider?
 */
if (is_category()) {
	$cat = get_query_var('cat');
	$meta = Bunyad::options()->get('cat_meta_' . $cat);

	// slider not enabled? quit!
	if (empty($meta['slider'])) {
		return;
	}

	$args['cat'] = $cat;

	// latest posts?
	if ($meta['slider'] == 'latest') {
		unset($args['meta_key'], $args['meta_value']);
	}
}

/*
 * Main slider posts query
 */

// use latest posts?
if (Bunyad::posts()->meta('featured_slider') == 'default-latest') {
	unset($args['meta_key'], $args['meta_value']);
}

$query = new WP_Query($args);

if (!$query->have_posts()) {
	return;
}

// Use rest of the 3 posts for grid if not post grid is not using
// any category or tag. Create reference for to main query.
if (empty($grid_query) && $query->found_posts > 8) {
	$grid_query = &$query;
}


$i = $z = 0; // loop counters

?>

	<div class="main-featured">
		<div class="wrap cf">

		<div class="row">
			<div class="slider frame flexslider col-8" <?php echo $data_vars; ?>>
				<ul class="slides">

				<?php while ($query->have_posts()): $query->the_post(); ?>

					<li>
						<a href="<?php the_permalink(); ?>" class="image-link"><?php the_post_thumbnail('main-slider', array('alt' => esc_attr(get_the_title()), 'title' => '')); ?></a>

						<?php
						// custom label selected?
						if (($cat_label = Bunyad::posts()->meta('cat_label'))) {
							$cat = get_category($cat_label);
						}
						else {
							$cat = current(get_the_category());
						}

						$cat_classes = [
							'cat',  'cat-title', 'cat-' . $cat->cat_ID
						];

						if (function_exists('get_field')) {
							if (get_field('destacar_rotulo', get_the_ID())) {
								$cat_classes[] = 'cat-featured';
							}
						}

						?>
						<a href="<?php echo get_category_link($cat->term_id); ?>" class="<?php echo join(' ', $cat_classes) ?>"><?php echo esc_html($cat->cat_name); ?></a>

						<div class="caption">

							<time class="the-date" datetime="<?php echo esc_attr(get_the_time('c')); ?>"><?php echo esc_html(get_the_date()); ?></time>

							<h3><a href="<?php the_permalink(); ?>" title="<?php the_title_attribute(); ?>"><?php the_title(); ?></a></h3>

						</div>

					</li>

				<?php
						if ($i++ == 4) {
							break;
						}

					endwhile; //rewind_posts();
				?>

				</ul>

				<div class="pages">
					<a href="#"></a>
					<a href="#"></a>
					<a href="#"></a>
					<a href="#"></a>
					<a href="#"></a>
				</div>



			</div> <!-- .flexslider -->

			<div class="blocks col-4">

				<?php for ($z = 1; $z < 4; ++$z): ?>


				<article class="<?php echo ($z == 1 ? 'large' : ($z == 2 ? 'small' : 'small last')); ?>">

				<?php if ($z == 1): ?>
					<div class="image-link">
						<?php 
							dynamic_sidebar('mini-slider-right');
						?>
					</div>
				<?php endif; ?>
					
				<?php if ($z == 3): ?>
					<a target="_blank" href="https://br.jooble.org/vagas-de-emprego-tecnico-seguran%C3%A7a" class="image-link">
						<img src="https://br.jooble.org/css/images/logos/jooble_80x60.png" alt="Emprego no Brasil" class="slider-small"/>
					</a>
				<?php elseif ($z == 2): ?>
					<a href="http://defesaeseguranca.com.br/embraer-boeing/" class="image-link">
						<img src="http://defesaeseguranca.com.br/wp-content/uploads/2017.png" alt="Embraer Boeing" class="slider-small"/>
					</a>
				<?php endif; ?>

				</article>


				<?php endfor; ?>
			</div>

		</div> <!-- .row -->

		<?php wp_reset_query(); ?>

		</div> <!--  .wrap  -->
	</div>
