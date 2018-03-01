<?php
/**
 * Partial: Search used in header
 */
?>

				<div class="search">
					<form role="search" action="<?php echo esc_url(home_url('/')); ?>" method="get">
						<input type="text" name="s" class="query" value="<?php the_search_query(); ?>" placeholder="<?php _e('Search...', 'bunyad'); ?>" />
						<button class="search-button" type="submit"><i class="fa fa-search"></i></button>
					</form>
				</div> <!-- .search -->