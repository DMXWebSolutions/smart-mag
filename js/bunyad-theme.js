
var Bunyad_Theme = (function($) {
	"use strict";
	
	var hasTouch = false,
		responsive_menu = false;
	
	// module
	return {
		
		init: function() 
		{
			// posts grid 
			var grid = $('.posts-grid').data('grid-count');
			if (parseInt(grid) > 0) {
				$('.posts-grid .column:nth-child(' + grid + 'n)').addClass('last');
			}
			
			// fit videos to container
			$('.featured-vid, .post-content').fitVids();

			// ratings
			$('.rate-number').each(function() {
				var raw = $(this).find('span:not(.progress)').html(),
					progress = parseFloat(raw);
				
				$(this).find('.progress').css('width', (raw.search('%') === -1 ? (Math.round(progress / 10 * 100)) + '%' : progress)) 	;
			});
						
			// social icons widget
			$('.lower-foot .social-icons a, .share-links a').tooltip({placement: 'top'});
			$('.social-icons a').tooltip({placement: 'bottom'});
			
			// news focus block
			$('.news-focus .subcats a').click(function() {
				
				if ($(this).hasClass('active')) {
					return false;
				}
				
				var active = $(this).parents('.subcats').find('a.active'),
					parent = $(this).parents('.news-focus');

				// show the news and hide the other block
				parent.find('.news-' + active.data('id')).hide();
				parent.find('.news-' + $(this).data('id')).fadeIn('slow');
				
				$(this).addClass('active');
				active.removeClass('active');
				
				return false;
			});
			
			$('.modal').on('shown.bs.modal', function() {
				$(this).css({
					'margin-top': function () {
						return -($(this).height() / 2);
					}
				});
			});
			
			// login
			$(document).on('click', '.user-login', function() {
				
				$('.login-modal .modal-content').hide();
				$('.login-modal .main-screen').show();
				
				$('#login-modal').modal('show');
				
				return false;
			});
			
			var change_modal = function(name) {
				
				if (!$('.login-modal').is(':visible')) {
					$('#login-modal').modal('show');
				}
				
				$('.login-modal .modal-content').hide();
				$('.login-modal ' + name).show();
				
				return false;
				
			};
			
			$('a.register-modal').click(function() {
				return change_modal('.register-now');
			});
			
			$('a.lost-pass-modal').click(function() {
				return change_modal('.lost-pass');
			});
			
			// setup all sliders
			this.sliders();
			
			// handle shortcodes
			this.shortcodes();
			
			// setup mobile navigation
			this.responsive_nav();
			this.touch_nav();
			
			// start the news ticker
			this.news_ticker();
			
			// setup the lightbox
			this.lightbox();
			
			// use sticky navigation if enabled
			this.sticky_nav();
			
			// user ratings
			this.user_ratings();
			
			
			/**
			 * Image scroll animations
			 */
			$('.main img, .main-footer img').addClass('no-display');
			
			$('.main img, .main-footer img, .main-featured .row').one('inview', function() {
				$(this).addClass('appear');
			});
			
			$('.review-box ul li .bar').each(function() {
				$(this).data('width', $(this)[0].style.width).css('width', 0);
			});
			
			$('.review-box ul li').one('inview', function() {
				var bar = $(this).find('.bar');
				bar.addClass('appear').css('width', bar.data('width'));
			});
			
			
			/**
			 * IE fixes
			 */
			if ($.browser.msie && 8 == parseInt($.browser.version)) {
				
				$('.main img, .main-footer img').addClass('no-display');
				$('.main img, .main-footer img, .main-featured .row').unbind('inview');
				
				// fontawesome4 fails to draw sometimes on IE8
			    $(function() {
			        var $ss = $('#smartmag-font-awesome-css');
			        $ss[0].href = $ss[0].href;
			    });
			    
			    // flickr widget fix - ie8 only
				$('.flickr-widget .flickr_badge_image:nth-of-type(4n)').css('margin-right', 0);

				// background image fix for IE8
				var bg = $('body').css('background-attachment'),
					bg_url = $('body').css('background-image').replace(/^url\((['"]?)(.*)\1\)$/, '$2');
			
				if (bg == 'fixed' && bg_url) {
			 							
					$('body').append('<style type="text/css">.bg-overlay { filter: progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + bg_url + '\', sizingMethod=\'scale\'); \
						-ms-filter: "progid:DXImageTransform.Microsoft.AlphaImageLoader(src=\'' + bg_url + '\', sizingMethod=\'scale\')"; }</style>');
					
					$('<div class="bg-overlay"></div>').appendTo('body');
				}
				
				// more lackluster ie8 
				$('.listing > .column:nth-child(odd)').css('clear', 'both');
			}
			
			// add support for placeholder in IE8/IE9
			$('input, textarea').placeholder();
			
			/**
			 * Mobile devices "background-attachment: fixed" support
			 */
			if ($(window).width() < 1128) {
				
				var bg = $('body').css('background-attachment'),
					bg_image = $('body').css('background-image');
				
				if (bg == 'fixed' && bg_image) {
					$('body').css('background-image', 'none').append(
							$('<div class="background-cover">' + '</div>').css('background-image', bg_image)
					);
				}
			}
			
			/**
			 * Woocommerce
			 */ 
			$('.woocommerce-ordering .drop li a').click(function(e) {
				var form = $(this).closest('form');
				
				form.find('[name=orderby]').val($(this).parent().data('value'));
				form.submit();
				
				e.preventDefault();
			});	
			
			$('body').on('added_to_cart', function() {
				$('.menu .widget_shopping_cart').css('opacity', '');
			});
			
			if ($('.menu .cart_list .empty').length) {
				$('.menu .cart_list').remove();
			}
			

			// safari 5.x fix
			if (!!navigator.userAgent.match('Safari/') && !!navigator.userAgent.match('Version/5.')) {
				$('.navigation .menu ul, .navigation .mega-menu').css('-webkit-transition', 'none');
			}
		},
		
		news_ticker: function()
		{
			$('.trending-ticker ul').each(function() {
				
				if (!$(this).find('li.active').length) {
					$(this).find('li:first').addClass('active');
				}
				
				var ticker = $(this);
				
				window.setInterval(function() {
					
					var active = ticker.find('li.active');
					active.fadeOut(function() {
						
						var next = active.next();
						if (!next.length) {
							next = ticker.find('li:first');
						}
						
						next.addClass('active').fadeIn();
						active.removeClass('active');
					});
					
					
					
				}, 8000);
			});
		},

		responsive_nav: function()
		{
			// detect touch capability dynamically
			$(window).on('touchstart', function() {
				hasTouch = true;
				$('body').addClass('touch');
			});
			
			this.init_responsive_nav();
			var that = this;

			$(window).on('resize', function() {
				that.init_responsive_nav();
			});		
		},
		
		/**
		 * Setup the responsive nav events and markup
		 */
		init_responsive_nav: function() {
			
			if ($(window).width() > 799 || responsive_menu) {
				return;
			}
			
			// set responsive initialized
			responsive_menu = true;
			
			// clone navigation for mobile
			var clone = $('.navigation > div[class$="-container"]').clone().addClass('mobile-menu-container'),
				mobile_search = false,
				off_canvas = ($('.navigation .mobile').data('type') == 'off-canvas');
			
			// off-canvas setup?
			if (off_canvas) {
				clone.addClass('off-canvas');
				clone.find('.menu').prepend($('<li class="close"><a href="#"><span>' + $('.navigation .selected .text').text()  + '</span> <i class="fa fa-times"></i></a></li>'));
				$('body').addClass('nav-off-canvas');
			}
			
			clone.find('.menu').addClass('mobile-menu');
			clone.appendTo('.navigation');
			
			
			// mobile search?
			if ($('.navigation .mobile').data('search')) {
				mobile_search = true;
			}
			
			// register click handlers for mobile menu
			$('.navigation .mobile .selected').click(function(e) {
				
				// search active?
				if ($(e.target).hasClass('hamburger') || !mobile_search  || !$(this).find('.search .query').is(':visible')) {
                   
                    if (off_canvas) {
                        $('.navigation .mobile-menu').addClass('active');
                    	$('body').toggleClass('off-canvas-active');
                    }
                    else {
                        $('.navigation .mobile-menu').toggleClass('active');
                    }
                    
                    return false;
				}
			});
			
			// off-canvas close
			$('.off-canvas .close').click(function() {
				$('body').toggleClass('off-canvas-active');
			});
			
			
			// add mobile search
			if (mobile_search && $('.top-bar .search').length) {
				
				$('.navigation .mobile .selected').append($('.top-bar .search')[0].outerHTML);
				$('.mobile .search .search-button').click(function() {
	
					if (!$('.mobile .search .query').is(':visible')) {
							$('.navigation .mobile .selected .current, .navigation .mobile .selected .text').toggle();              
							$('.mobile .search').toggleClass('active');
	
							return false;
					}
				});
			}
			
			// setup mobile menu click handlers
			$('.navigation .mobile-menu li > a').each(function() {
				
				if ($(this).parent().children('ul').length) {
					$('<a href="#" class="chevron"><i class="fa fa-angle-down"></i></a>').appendTo($(this));
				}
			});
			
			$('.navigation .mobile-menu li .chevron').click(function() {
					$(this).closest('li').find('ul').first().toggle().parent().toggleClass('active item-active');
					return false;
			});
			
			// add active item
			var last = $('.mobile-menu .current-menu-item').last().find('> a');
			if (last.length) {
				
				var selected = $('.navigation .mobile .selected'),
					current  = selected.find('.current'),
					cur_text = selected.find('.text').text();
				
				if (cur_text.slice(-1) !== ':') {
					selected.find('.text').text(cur_text + ':');
				}
				
				current.text(last.text());
			}
		},
		
		touch_nav: function() {
			
			var targets = $('.menu:not(.mobile-menu) a'),
				open_class = 'item-active',
				child_tag = 'ul, .mega-menu';
			
			targets.each(function() {
				
				var $this = $(this),
					$parent = $this.parent('li'),
					$siblings = $parent.siblings().find('a');
				
				$this.click(function(e) {
					
					if (!hasTouch) {
						return;
					}
					
					var $this = $(this);
					e.stopPropagation();
					
					$siblings.parent('li').removeClass(open_class);
					
					// has a child? open the menu on tap
					if (!$this.parent().hasClass(open_class) && $this.next(child_tag).length > 0 && !$this.parents('.mega-menu.links').length) {
						e.preventDefault();
						$this.parent().addClass(open_class);
					}
				});
			});
			
			// close all menus
			$(document).click(function(e) {
				if (!$(e.target).is('.menu') && !$(e.target).parents('.menu').length) {
					targets.parent('li').removeClass(open_class);
				}
			});
		},
		
		sticky_nav: function()
		{
			var nav = $('.navigation'),
				nav_top = nav.offset().top;
			
			// not enabled?
			if (!nav.data('sticky-nav')) {
				return;
			}
			
			if (nav.find('.sticky-logo').length) {
				nav.addClass('has-logo');
			}
			
			var sticky = function() {

				if (!nav.data('sticky-nav') || $(window).width() < 800) {
					return;
				}
				
				// make it sticky when viewport is scrolled beyond the navigation
				if ($(window).scrollTop() > nav_top) {
					nav.addClass('sticky no-transition');
					setTimeout(function() { nav.removeClass('no-transition'); }, 100);
				} else {
					nav.removeClass('sticky'); 
				}
			};

			sticky();

			$(window).scroll(function() {
				sticky();
			});
			
		},
		
		/**
		 * Setup all the sliders available
		 */
		sliders: function()
		{
			if (!$.fn.flexslider) {
				return;
			}
			
			var is_rtl = ($('html').attr('dir') == 'rtl' ? true : false);
			
			// main slider
			var slider = $('.main-featured .slider');
			
			$('.main-featured .flexslider').flexslider({
				controlNav: true,
				animationSpeed: slider.data('animation-speed'),
				animation: slider.data('animation'),
				slideshowSpeed: slider.data('slide-delay'),
				manualControls: '.main-featured .flexslider .pages a',
				pauseOnHover: true,
				start: function() {
					$('.main-featured .slider').css('opacity', 1);
				},
				rtl: is_rtl
			});
			
			// carousels / galleries
			$('.carousel').flexslider({
				animation: 'slide',
				animationLoop: false,
				itemWidth: 214,
				itemMargin: 30,
				minItems: 3,
				maxItems: 4,
				controlNav: false,
				slideshow: false,
				rtl: is_rtl
				
			});
			
			$('.gallery-block .flexslider').flexslider({
				controlNav: false,
				pauseOnHover: true,
				rtl: is_rtl
			});
			
			// for post-galleries
			$('.gallery-slider .flexslider').flexslider({
				controlNav: false,
				pauseOnHover: true,
				rtl: is_rtl
			});
			
			/**
			 * Post Content Slideshow: AJAX
			 */
			var slideshow_cache = {},
				slideshow_wrap  = '.post-slideshow .post-pagination-next';
			
			if ($(slideshow_wrap).length && $(slideshow_wrap).data('type') == 'ajax') {
			
				$('.main-content').on('click', '.post-slideshow .post-pagination-next .links a', function() {
					
						// showing on home-page?
						if ($('body').hasClass('page')) {
							return;
						}
					
						var parent = $(this).closest('.post-slideshow'),
							url    = $(this).attr('href');
						
						parent.find('.content-page').removeClass('active').addClass('hidden previous');
					
						var show_slide = function(data) {
							
							// change browser url
							if (history.pushState) {
								history.pushState({}, '', url);
							}
							
							var page = $(data).find('.post-slideshow');
							
							if (page.length) {
								parent.find('.post-pagination-next').html(page.find('.post-pagination-next').html());
								parent.append(page.find('.content-page').addClass('hidden loading'));
								
								setTimeout(function() {
									parent.find('.content-page.previous').remove();
									parent.find('.content-page.loading').removeClass('previous hidden loading');
								}, 1);
							}
							
						};
						
						// in cache?
						if (slideshow_cache[url]) {
							show_slide(slideshow_cache[url]);
						}
						else {
							
							// get via ajax
							$.get(url, function(data) {
								slideshow_cache[url] = data;
								show_slide(data);
								
							});
						}
						
						return false;
				});
				
				// keyboard nav
				$(document).on('keyup', function(e) {				
						if (e.which == 37) {
							$(slideshow_wrap).find('.prev').parent().click();
						}
						else if (e.which == 39) {
							$(slideshow_wrap).find('.next').parent().click();
						}
				});
				
			} // end slideshow wrap
			
		},
		
		/**
		 * Register shortcode related events
		 */
		shortcodes: function()
		{
			// normal tabs
			$('.tabs-list a').click(function() {
				
				var tab = $(this).data('tab'),
					tabs_data = $(this).closest('.tabs-list').siblings('.tabs-data'),
					parent = $(this).parent().parent(),
					active = parent.find('.active');
				
				if (!active.length) {
					active = parent.find('li:first-child');
				}

				active.removeClass('active').addClass('inactive');
				$(this).parent().addClass('active').removeClass('inactive');
				
				// hide current and show the clicked one
				var active_data = tabs_data.find('.tab-posts.active');
				if (!active_data.length) {
					active_data = tabs_data.find('.tab-posts:first-child');
				}
				
				active_data.hide();
				
				tabs_data.find('#recent-tab-' + tab).fadeIn().addClass('active').removeClass('inactive');

				return false;
				
			});
			
			/**
			 * Shortcode: Tabs
			 */
			$('.sc-tabs a').click(function() {
	
				// tabs first
				var tabs = $(this).parents('ul');
				tabs.find('.active').removeClass('active');
				$(this).parent().addClass('active');
				
				// panes second
				var panes = tabs.siblings('.sc-tabs-panes');
				
				panes.find('.active').hide().removeClass('active');
				panes.find('#sc-pane-' + $(this).data('id')).addClass('active').fadeIn();
				
				return false;
			});
			
			/**
			 * Shortcode: Accordions & Toggles
			 */
			$('.sc-accordion-title > a').click(function() {
				
				var container = $(this).parents('.sc-accordions');
				container.find('.sc-accordion-title').removeClass('active');
				container.find('.sc-accordion-pane').slideUp().removeClass('active');
				
				var pane = $(this).parent().next();
				if (!pane.is(':visible')) {
					$(this).parent().addClass('active');
					pane.slideDown();
				}
				
				return false;
			});
			
			$('.sc-toggle-title > a').click(function() {
				$(this).parent().toggleClass('active');
				$(this).parent().next().slideToggle().toggleClass('active');
				
				return false;
			});
	
		},
		
		/**
		 * User Ratings handling
		 */
		user_ratings: function() 
		{
			
			var compute_percent = function(e) {
				var offset = $(this).offset(),
					percent = Math.round((e.pageX - Math.max(0, offset.left)) / $(this).width() * 100);
				
				return percent;
			};

			// percent or points?
			var is_points = true,
				scale = parseInt($('.review-box .value-title').text()) || 10;
			
			if ($('.review-box .overall .percent').length) {
				is_points = false;
			}
			
			// update the bar and percent/points on hover
			$('.user-ratings .main-stars, .user-ratings .rating-bar').on('mousemove mouseenter mouseleave', 
				function(e) {
				
					// set main variables
					var bar = $(this).find('span'),
						user_ratings = $(this).closest('.user-ratings');
				
					bar.css('transition', 'none');
					
					if (user_ratings.hasClass('voted')) {
						return;
					}
				
					// hover over?
					if (e.type == 'mouseleave') {
						bar.css('width', bar.data('orig-width'));
						user_ratings.find('.hover-number').hide();
						user_ratings.find('.rating').show();
						return;
					}
					
					var percent = compute_percent.call(this, e);
					
					if (!bar.data('orig-width')) {
						bar.data('orig-width', bar[0].style.width);
					}
					
					bar.css('width', percent + '%');
					user_ratings.find('.rating').hide();
					user_ratings.find('.hover-number').show().text((is_points ? +parseFloat(percent / 100 * scale).toFixed(1) : percent + '%'));
				}
			);
			
			// add the rating
			$('.user-ratings .main-stars, .user-ratings .rating-bar').on('click', function(e) {
				
				// set main variables
				var bar = $(this).find('span'),
					user_ratings = $(this).closest('.user-ratings');
				
				if (user_ratings.hasClass('voted')) {
					return;
				}
				
				// setup ajax post data
				var post_data = {
						'action': 'bunyad_rate', 
						'id': user_ratings.data('post-id'), 
						'rating': compute_percent.call(this, e)
				};
				
				// get current votes
				var votes = user_ratings.find('.number'),
					cur_votes = parseInt(votes.text()) || 0;
				
				user_ratings.css('opacity', '0.3');
				bar.data('orig-width', bar[0].style.width);
				
				// add to votes and disable further voting 
				votes.text((cur_votes + 1).toString());
				
				$(this).trigger('mouseleave');
				user_ratings.addClass('voted');
				
				$.post(Bunyad.ajaxurl, post_data, function(data) {
					
					// update data
					if (data === Object(data)) {

						// change rating
						var cur_rating = user_ratings.find('.rating').text();
						user_ratings.find('.rating').text( cur_rating.search('%') !== -1 ? data.percent + ' %' : data.decimal );
						
						bar.css('width', data.percent + '%');
						bar.data('orig-width', data.percent);
					}
					
					user_ratings.hide().css('opacity', 1).fadeIn('slow');			
				}, 'json');
			});
		},
		
		/**
		 * Setup prettyPhoto
		 */
		lightbox: function() {
			
			// disabled on mobile screens
			if (!$.fn.prettyPhoto || $(window).width() < 700) {
				return;
			}
			
			var filter_images = function() {
				
				if (!$(this).attr('href')) {
					return false;
				}
				
				return $(this).attr('href').match(/\.(jp?g|png|bmp|gif)$/); 
			};
			
			(function() {
				var gal_id = 1;
				
				$('.post-content a, .main .featured a').has('img').filter(filter_images).attr('rel', 'prettyPhoto');
				
				$('.gallery-slider, .post-content .gallery, .post-content .tiled-gallery').each(function() {
					gal_id++; // increment gallery group id
					
					$(this).find('a').has('img').filter(filter_images)
						.attr('rel', 'prettyPhoto[gal_'+ gal_id +']');
				});
				
				$("a[rel^='prettyPhoto']").prettyPhoto({social_tools: false});
				
			})();
			
			// WooCommerce lightbox
			$('a[data-rel^="prettyPhoto"], a.zoom').prettyPhoto({hook: 'data-rel', social_tools: false});
			
		}
	}; // end return
	
})(jQuery);

// load when ready
jQuery(function($) {
	Bunyad_Theme.init();
});


/**
 * Plugins and 3rd Party Libraries
 */

/**
 * Author Christopher Blum
 * Based on the idea of Remy Sharp, http://remysharp.com/2009/01/26/element-in-view-event-plugin/
 * 
 * License: WTFPL
 */
(function(b){function t(){var e,a={height:k.innerHeight,width:k.innerWidth};a.height||!(e=l.compatMode)&&b.support.boxModel||(e="CSS1Compat"===e?f:l.body,a={height:e.clientHeight,width:e.clientWidth});return a}function u(){var e=b(),g,q=0;b.each(m,function(a,b){var c=b.data.selector,d=b.$element;e=e.add(c?d.find(c):d)});if(g=e.length)for(d=d||t(),a=a||{top:k.pageYOffset||f.scrollTop||l.body.scrollTop,left:k.pageXOffset||f.scrollLeft||l.body.scrollLeft};q<g;q++)if(b.contains(f,e[q])){var h=b(e[q]),n=h.height(),p=h.width(),c=h.offset(),r=h.data("inview");if(!a||!d)break;c.top+n>a.top&&c.top<a.top+d.height&&c.left+p>a.left&&c.left<a.left+d.width?(p=a.left>c.left?"right":a.left+d.width<c.left+p?"left":"both",n=a.top>c.top?"bottom":a.top+d.height<c.top+n?"top":"both",c=p+"-"+n,r&&r===c||h.data("inview",c).trigger("inview",[!0,p,n])):r&&h.data("inview",!1).trigger("inview",[!1])}}var m={},d,a,l=document,k=window,f=l.documentElement,s=b.expando,g;b.event.special.inview={add:function(a){m[a.guid+"-"+this[s]]={data:a,$element:b(this)};g||b.isEmptyObject(m)||(g=setInterval(u,250))},remove:function(a){try{delete m[a.guid+"-"+this[s]]}catch(d){}b.isEmptyObject(m)&&(clearInterval(g),g=null)}};b(k).bind("scroll resize",function(){d=a=null});!f.addEventListener&&f.attachEvent&&f.attachEvent("onfocusin",function(){a=null})})(jQuery);

/**
* Bootstrap.js by @fat & @mdo
* plugins: bootstrap-tooltip.js
* Copyright 2012 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(a){var b=function(a,b){this.init("tooltip",a,b)};b.prototype={constructor:b,init:function(b,c,d){var e,f;this.type=b,this.$element=a(c),this.options=this.getOptions(d),this.enabled=!0,this.options.trigger=="click"?this.$element.on("click."+this.type,this.options.selector,a.proxy(this.toggle,this)):this.options.trigger!="manual"&&(e=this.options.trigger=="hover"?"mouseenter":"focus",f=this.options.trigger=="hover"?"mouseleave":"blur",this.$element.on(e+"."+this.type,this.options.selector,a.proxy(this.enter,this)),this.$element.on(f+"."+this.type,this.options.selector,a.proxy(this.leave,this))),this.options.selector?this._options=a.extend({},this.options,{trigger:"manual",selector:""}):this.fixTitle()},getOptions:function(b){return b=a.extend({},a.fn[this.type].defaults,b,this.$element.data()),b.delay&&typeof b.delay=="number"&&(b.delay={show:b.delay,hide:b.delay}),b},enter:function(b){var c=a(b.currentTarget)[this.type](this._options).data(this.type);if(!c.options.delay||!c.options.delay.show)return c.show();clearTimeout(this.timeout),c.hoverState="in",this.timeout=setTimeout(function(){c.hoverState=="in"&&c.show()},c.options.delay.show)},leave:function(b){var c=a(b.currentTarget)[this.type](this._options).data(this.type);this.timeout&&clearTimeout(this.timeout);if(!c.options.delay||!c.options.delay.hide)return c.hide();c.hoverState="out",this.timeout=setTimeout(function(){c.hoverState=="out"&&c.hide()},c.options.delay.hide)},show:function(){var a,b,c,d,e,f,g;if(this.hasContent()&&this.enabled){a=this.tip(),this.setContent(),this.options.animation&&a.addClass("fade"),f=typeof this.options.placement=="function"?this.options.placement.call(this,a[0],this.$element[0]):this.options.placement,b=/in/.test(f),a.detach().css({top:0,left:0,display:"block"}).insertAfter(this.$element),c=this.getPosition(b),d=a[0].offsetWidth,e=a[0].offsetHeight;switch(b?f.split(" ")[1]:f){case"bottom":g={top:c.top+c.height,left:c.left+c.width/2-d/2};break;case"top":g={top:c.top-e,left:c.left+c.width/2-d/2};break;case"left":g={top:c.top+c.height/2-e/2,left:c.left-d};break;case"right":g={top:c.top+c.height/2-e/2,left:c.left+c.width}}a.offset(g).addClass(f).addClass("in")}},setContent:function(){var a=this.tip(),b=this.getTitle();a.find(".tooltip-inner")[this.options.html?"html":"text"](b),a.removeClass("fade in top bottom left right")},hide:function(){function d(){var b=setTimeout(function(){c.off(a.support.transition.end).detach()},500);c.one(a.support.transition.end,function(){clearTimeout(b),c.detach()})}var b=this,c=this.tip();return c.removeClass("in"),a.support.transition&&this.$tip.hasClass("fade")?d():c.detach(),this},fixTitle:function(){var a=this.$element;(a.attr("title")||typeof a.attr("data-original-title")!="string")&&a.attr("data-original-title",a.attr("title")||"").removeAttr("title")},hasContent:function(){return this.getTitle()},getPosition:function(b){return a.extend({},b?{top:0,left:0}:this.$element.offset(),{width:this.$element[0].offsetWidth,height:this.$element[0].offsetHeight})},getTitle:function(){var a,b=this.$element,c=this.options;return a=b.attr("data-original-title")||(typeof c.title=="function"?c.title.call(b[0]):c.title),a},tip:function(){return this.$tip=this.$tip||a(this.options.template)},validate:function(){this.$element[0].parentNode||(this.hide(),this.$element=null,this.options=null)},enable:function(){this.enabled=!0},disable:function(){this.enabled=!1},toggleEnabled:function(){this.enabled=!this.enabled},toggle:function(b){var c=a(b.currentTarget)[this.type](this._options).data(this.type);c[c.tip().hasClass("in")?"hide":"show"]()},destroy:function(){this.hide().$element.off("."+this.type).removeData(this.type)}};var c=a.fn.tooltip;a.fn.tooltip=function(c){return this.each(function(){var d=a(this),e=d.data("tooltip"),f=typeof c=="object"&&c;e||d.data("tooltip",e=new b(this,f)),typeof c=="string"&&e[c]()})},a.fn.tooltip.Constructor=b,a.fn.tooltip.defaults={animation:!0,placement:"top",selector:!1,template:'<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',trigger:"hover",title:"",delay:0,html:!1},a.fn.tooltip.noConflict=function(){return a.fn.tooltip=c,this}}(window.jQuery);

/**
* Bootstrap.js by @fat & @mdo
* plugins: bootstrap-modal.js
* Copyright 2013 Twitter, Inc.
* http://www.apache.org/licenses/LICENSE-2.0.txt
*/
!function(a){var b=function(b,c){this.options=c,this.$element=a(b).delegate('[data-dismiss="modal"]',"click.dismiss.modal",a.proxy(this.hide,this)),this.options.remote&&this.$element.find(".modal-body").load(this.options.remote)};b.prototype={constructor:b,toggle:function(){return this[this.isShown?"hide":"show"]()},show:function(){var b=this,c=a.Event("show");this.$element.trigger(c);if(this.isShown||c.isDefaultPrevented())return;this.isShown=!0,this.escape(),this.backdrop(function(){var c=a.support.transition&&b.$element.hasClass("fade");b.$element.parent().length||b.$element.appendTo(document.body),b.$element.show(),c&&b.$element[0].offsetWidth,b.$element.addClass("in").attr("aria-hidden",!1),b.enforceFocus(),c?b.$element.one(a.support.transition.end,function(){b.$element.focus().trigger("shown")}):b.$element.focus().trigger("shown")})},hide:function(b){b&&b.preventDefault();var c=this;b=a.Event("hide"),this.$element.trigger(b);if(!this.isShown||b.isDefaultPrevented())return;this.isShown=!1,this.escape(),a(document).off("focusin.modal"),this.$element.removeClass("in").attr("aria-hidden",!0),a.support.transition&&this.$element.hasClass("fade")?this.hideWithTransition():this.hideModal()},enforceFocus:function(){var b=this;a(document).on("focusin.modal",function(a){b.$element[0]!==a.target&&!b.$element.has(a.target).length&&b.$element.focus()})},escape:function(){var a=this;this.isShown&&this.options.keyboard?this.$element.on("keyup.dismiss.modal",function(b){b.which==27&&a.hide()}):this.isShown||this.$element.off("keyup.dismiss.modal")},hideWithTransition:function(){var b=this,c=setTimeout(function(){b.$element.off(a.support.transition.end),b.hideModal()},500);this.$element.one(a.support.transition.end,function(){clearTimeout(c),b.hideModal()})},hideModal:function(){var a=this;this.$element.hide(),this.backdrop(function(){a.removeBackdrop(),a.$element.trigger("hidden")})},removeBackdrop:function(){this.$backdrop&&this.$backdrop.remove(),this.$backdrop=null},backdrop:function(b){var c=this,d=this.$element.hasClass("fade")?"fade":"";if(this.isShown&&this.options.backdrop){var e=a.support.transition&&d;this.$backdrop=a('<div class="modal-backdrop '+d+'" />').appendTo(document.body),this.$backdrop.click(this.options.backdrop=="static"?a.proxy(this.$element[0].focus,this.$element[0]):a.proxy(this.hide,this)),e&&this.$backdrop[0].offsetWidth,this.$backdrop.addClass("in");if(!b)return;e?this.$backdrop.one(a.support.transition.end,b):b()}else!this.isShown&&this.$backdrop?(this.$backdrop.removeClass("in"),a.support.transition&&this.$element.hasClass("fade")?this.$backdrop.one(a.support.transition.end,b):b()):b&&b()}};var c=a.fn.modal;a.fn.modal=function(c){return this.each(function(){var d=a(this),e=d.data("modal"),f=a.extend({},a.fn.modal.defaults,d.data(),typeof c=="object"&&c);e||d.data("modal",e=new b(this,f)),typeof c=="string"?e[c]():f.show&&e.show()})},a.fn.modal.defaults={backdrop:!0,keyboard:!0,show:!0},a.fn.modal.Constructor=b,a.fn.modal.noConflict=function(){return a.fn.modal=c,this},a(document).on("click.modal.data-api",'[data-toggle="modal"]',function(b){var c=a(this),d=c.attr("href"),e=a(c.attr("data-target")||d&&d.replace(/.*(?=#[^\s]+$)/,"")),f=e.data("modal")?"toggle":a.extend({remote:!/#/.test(d)&&d},e.data(),c.data());b.preventDefault(),e.modal(f).one("hide",function(){c.focus()})})}(window.jQuery);

/*
 * FitVids 1.0.3 - Modified - https://github.com/davatron5000/FitVids.js
 */
(function(e){"use strict";e.fn.fitVids=function(t){var n={customSelector:null};if(!document.getElementById("fit-vids-style")){var r=document.head||document.getElementsByTagName("head")[0];var i=".fluid-width-video-wrapper{width:100%;position:relative;padding:0;}.fluid-width-video-wrapper iframe,.fluid-width-video-wrapper object,.fluid-width-video-wrapper embed {position:absolute;top:0;left:0;width:100%;height:100%;}";var s=document.createElement("div");s.innerHTML='<p>x</p><style id="fit-vids-style">'+i+"</style>";r.appendChild(s.childNodes[1])}if(t){e.extend(n,t)}return this.each(function(){var t=["iframe[src*='player.vimeo.com']","iframe[src*='youtube.com']","iframe[src*='youtube-nocookie.com']","iframe[src*='kickstarter.com'][src*='video.html']","object","embed"];if(n.customSelector){t.push(n.customSelector)}var r=e(this).find(t.join(","));r=r.not("object object");r.each(function(){var t=e(this);if(this.tagName.toLowerCase()==="embed"&&t.parent("object").length||t.parent(".fluid-width-video-wrapper").length){return}var n=this.tagName.toLowerCase()==="object"||t.attr("height")&&!isNaN(parseInt(t.attr("height"),10))?parseInt(t.attr("height"),10):t.height(),r=!isNaN(parseInt(t.attr("width"),10))?parseInt(t.attr("width"),10):t.width(),i=n/r;if(!t.attr("id")){var s="fitvid"+Math.floor(Math.random()*999999);t.attr("id",s)}t.wrap('<div class="fluid-width-video-wrapper"></div>').parent(".fluid-width-video-wrapper").css("padding-top",i*100+"%");t.removeAttr("height").removeAttr("width")})})}})(window.jQuery||window.Zepto);


/*! http://mths.be/placeholder v2.0.7 by @mathias */
(function(q,f,d){function r(b){var a={},c=/^jQuery\d+$/;d.each(b.attributes,function(b,d){d.specified&&!c.test(d.name)&&(a[d.name]=d.value)});return a}function g(b,a){var c=d(this);if(this.value==c.attr("placeholder")&&c.hasClass("placeholder"))if(c.data("placeholder-password")){c=c.hide().next().show().attr("id",c.removeAttr("id").data("placeholder-id"));if(!0===b)return c[0].value=a;c.focus()}else this.value="",c.removeClass("placeholder"),this==m()&&this.select()}function k(){var b,a=d(this),c=this.id;if(""==this.value){if("password"==this.type){if(!a.data("placeholder-textinput")){try{b=a.clone().attr({type:"text"})}catch(e){b=d("<input>").attr(d.extend(r(this),{type:"text"}))}b.removeAttr("name").data({"placeholder-password":a,"placeholder-id":c}).bind("focus.placeholder",g);a.data({"placeholder-textinput":b,"placeholder-id":c}).before(b)}a=a.removeAttr("id").hide().prev().attr("id",c).show()}a.addClass("placeholder");a[0].value=a.attr("placeholder")}else a.removeClass("placeholder")}function m(){try{return f.activeElement}catch(b){}}var h="placeholder"in f.createElement("input"),l="placeholder"in f.createElement("textarea"),e=d.fn,n=d.valHooks,p=d.propHooks;h&&l?(e=e.placeholder=function(){return this},e.input=e.textarea=!0):(e=e.placeholder=function(){this.filter((h?"textarea":":input")+"[placeholder]").not(".placeholder").bind({"focus.placeholder":g,"blur.placeholder":k}).data("placeholder-enabled",!0).trigger("blur.placeholder");return this},e.input=h,e.textarea=l,e={get:function(b){var a=d(b),c=a.data("placeholder-password");return c?c[0].value:a.data("placeholder-enabled")&&a.hasClass("placeholder")?"":b.value},set:function(b,a){var c=d(b),e=c.data("placeholder-password");if(e)return e[0].value=a;if(!c.data("placeholder-enabled"))return b.value=a;""==a?(b.value=a,b!=m()&&k.call(b)):c.hasClass("placeholder")?g.call(b,!0,a)||(b.value=a):b.value=a;return c}},h||(n.input=e,p.value=e),l||(n.textarea=e,p.value=e),d(function(){d(f).delegate("form","submit.placeholder",function(){var b=d(".placeholder",this).each(g);setTimeout(function(){b.each(k)},10)})}),d(q).bind("beforeunload.placeholder",function(){d(".placeholder").each(function(){this.value=""})}))})(this,document,jQuery);
