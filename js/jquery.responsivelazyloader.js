	/*global window, document, jQuery, Modernizr*/

	/**
	 * @file
	 * responsivelazyloader JQuery plugin
	 *
	 * @maintainers : Jean-etienne MARTIN http://www.jet-martin.com
	 * @author : Jean-etienne MARTIN http://www.jet-martin.com
	 *
	 * The image size must be 100% for the image to be "responsive" it means
	 * that the image will be adjusted to the parent element.
	 *
	 * For a nice display, you need to use a "loader" background for the images.
	 * It could be something like : background:url(loader.gif) no-repeat center center #ccc;
	 *
	 * Always use the "desktop" as default values because almost all the modern devices
	 * browser support mediaqueries detections. This is not the case of old desktop browsers
	 * as old IE so the current mediaquery will always be the "defaults" one. Even on old browser
	 * the display will be recognized and the appropriate image will be loaded anyway.
	 *
	 * The height auto is not displayed the same way on all the browsers.
	 * To prevent the image height to update on image load (ugly text moving effect),
	 * the image heights must be managed in CSS according to the site layout.
	 * All the images do not necessary have a 16/9 ratio.
	 *
	 * You can use the onImageShow callback function for custom actions (on height for example).
	 *
	 * Settings:
	 * - distance            = Int      | distance of the image to the viewable browser screen before it gets loaded
	 * - token               = string   | The token replaced by the current display pattern.
	 * - force               = Bool     | Force loading without distance.
	 * - mediaQueries        = Object   | The mediaquery used by the lazy loader.
	 * - displays            = Object   | The display properties, match the grid class and the mediaqueries
	 * - onImageShow         = function | Callback when an image has been lazy loaded.
	 * - onImageError        = function | Callback when an image could not be lazy loaded.
	 * - onAllImagesLoad     = function | Callback when all the images of the set are loaded.
	 *
	 * Custom events :
	 * - responsiveImageLoaded -> Trigger on each image load. Custom var :
	 *         - image              : The currently loaded image.
	 * - onMediaqueryChange    -> Trigger when mediaquery has change. Custom var :
	 *         - CurrentMediaQuery  : the current mediaquery key according to Settings.mediaQueries.
	 *         - PreviousMediaQuery : The previous mediaquery key according to Settings.mediaQueries.
	 *
	 * Version 0.1.8
	 *
	 * dependancie : jquery 1.3.1
	 * optional : modernizr compiled with mq() function.
	 */

	;
	(function ($) {
		/**
		 * Process responsivelazyloader
		 */
		$.fn.responsivelazyloader = function (options) {
			var settings = $.extend($.fn.responsivelazyloader.defaults, options), // Global settings
				nodes = $(this), // Usually images, but can also contain divs and other container elements
				nodesCount = nodes.length; // Counter for custom event when all the images are loaded.
			if (nodesCount > 0) {
				// Load on page load.
				var CurrentMediaQuery = $.fn.responsivelazyloader.getCurrentMediaQuery();
				// Wait for document ready to load images to prevent issues with other JS (as AD scripts using document.write).
				$(document).ready(function () {
					loadActualImages(nodes, settings, 'load');
				});
				// Load on scroll
				$(window).bind('scroll', function () {
					loadActualImages(nodes, settings, 'scroll');
				});
				// Load on resize
				$(window).resize(function () {
					var MediaQuery = $.fn.responsivelazyloader.getCurrentMediaQuery();
					if (CurrentMediaQuery != MediaQuery) {
						// Triger custom event on mediaquery change
						$.event.trigger({
							type: "onMediaqueryChange",
							CurrentMediaQuery: MediaQuery,
							PreviousMediaQuery: CurrentMediaQuery
						});
						CurrentMediaQuery = MediaQuery;
						loadActualImages(nodes, settings, 'resize');
					}
				});
			}

			/**
			 * Set an attribute "data-display" to the image
			 *
			 * The first valid display will be set.
			 * The image or a parent element can have the gridClass
			 * For advance config, You can specify a "parent" element.
			 * In this case, the parent must have the gridClass.
			 * @param node {Object}
			 */
			function imagesSetDisplay(node) {
				var currentDisplay = 'defaults', // Default display (fallback)
					element = $(node);
				for (display in settings.displays) {
					if (element.hasClass(settings.displays[display].gridClass)
						|| element.closest((settings.displays[display].parent != undefined)
						? settings.displays[display].parent : '.' + settings.displays[display].gridClass).hasClass(settings.displays[display].gridClass)) {
						currentDisplay = display;
						break;
					}
				}
				element.attr('data-display', currentDisplay);
			}

			/**
			 * Get the image SRC value using the proper rendition name
			 * depending of the mediaquery & the image display.
			 *
			 * To override the default "data-src" attribute you can use :
			 * data-src-{display}-{MediaQuery}
			 * data-src-{display}
			 * data-src-{MediaQuery}
			 *
			 * @param node {string} The node object
			 *     The apropriate src value.
			 */
			function imagesGetDisplay(node) {
				var element = $(node);
				if (!element.attr('data-display')) {
					imagesSetDisplay(element);
				}
				var activeDisplay = element.attr('data-display'),
				currentDisplay = null;
				// If explicit display
				if (activeDisplay) {
					// Set the current display according to the current display and active mediaquery
					if (settings.displays[activeDisplay]) {
						if (settings.displays[activeDisplay].display[CurrentMediaQuery]) {
							currentDisplay = settings.displays[activeDisplay].display[CurrentMediaQuery];
						}
						else if (settings.displays[activeDisplay].display.defaults) {
							currentDisplay = settings.displays[activeDisplay].display.defaults;
						}
					}
				}
				// Default displays
				if (!currentDisplay) {
					// Fallback on current media Query
					if (settings.displays.defaults.display[CurrentMediaQuery]) {
						currentDisplay = settings.displays.defaults.display[CurrentMediaQuery];
					}
					// Global Fallback
					else {
						currentDisplay = settings.displays.defaults.display.defaults;
					}
				}
				/*
				 * Edit the image SRC attribute.
				 */
				// Override the token By Display-Breakpoint.
				if (element.attr('data-src-' + activeDisplay + '-' + CurrentMediaQuery)) {
					return element.attr('data-src-' + activeDisplay + '-' + CurrentMediaQuery).replace(settings.token, currentDisplay);
				}
				// Override the token By Display.
				else if (element.attr('data-src-' + activeDisplay)) {
					return element.attr('data-src-' + activeDisplay).replace(settings.token, currentDisplay);
				}
				// Override the token By Breakpoint.
				else if (element.attr('data-src-' + CurrentMediaQuery)) {
					return element.attr('data-src-' + CurrentMediaQuery).replace(settings.token, currentDisplay);
				}
				// Use the token.
				else if (element.attr("data-src")) {
					return element.attr("data-src").replace(settings.token, currentDisplay);
				}
				// Global fallback, return current src
				else {
					return element.attr("src");
				}
			}

			/**
			 * Load images who are "visible".
			 * 
			 * Visible is defined by the windowView function according to the settings.
			 * If the "force" parameter is set to TRUE, all the images will be consider as visible.
			 * 
			 * @see $.fn.responsivelazyloader.windowView()
			 *
			 * @param node {jQuery<Image>}
			 *     A jQuery set of images
			 * @param settings {Object}
			 *     the settings
			 * @param [callOrigin] {String}
			 *     Determines the origin of the call. Can be either 'load'|'scroll'|'resize'
			 */
			function loadActualImages(nodes, settings, callOrigin) {
				$(nodes).each(function () {
					var element = $(this);
					if ($.fn.responsivelazyloader.windowView(element, settings) || settings.force === true) {
						// Check if this is the first load or if the mediaquery has changed.
						if (element.attr('data-current-mediaq') != CurrentMediaQuery) {
							element.attr('data-current-mediaq', CurrentMediaQuery);
							loadImage(element, callOrigin);
							element.fadeIn(settings.fade);
						}
					}
				});
			}

			/**
			 * Load the image and trigger appropriate events.
			 *
			 * @param node
			 * @param [callOrigin] {String}
			 *     Determines the origin of the call. Can be either 'load'|'scroll'|'resize'
			 */
			function loadImage(node, callOrigin) {
				var element = $(node),
					isImage = element.is('img');
				element.hide()
					.one('load',function () {
						var that = $(this);
						// IE8 compatibility, issue on imageload event :
						// Only show the image when the width & height are not empty (image really loaded).
						if ('naturalWidth' in this !== true || 'naturalHeight' in this !== true) {
							that.hide().css('width', 'auto');
							this.naturalWidth = that.width();
							this.naturalHeight = that.height();
							that.show();
						}
						// Trigger the responsiveImageLoaded custom event on image load.
						$.event.trigger({
							type: "responsiveImageLoaded",
							image: that
						});
						// If first load, decrement the image counter for onAllImagesLoad callback.
						if (that.attr('data-loaded') == undefined) {
							nodesCount -= 1;
							that.attr('data-loaded', true);
						}
						/*
						 * fire success callback only if callOrigin param undefined (default) or
						 * if callOrigin value matches settings use cases
						 */
						if (callOrigin === undefined || callOrigin === 'load' ||
							(callOrigin === 'scroll' && settings.useScroll) ||
							(callOrigin === 'resize' && settings.useResize)) {
							// Call the callback here because we are certain the image is loaded here
							settings.onImageShow.call(that);
						}
						// All images have been loaded.
						if (nodesCount === 0) {
							settings.onAllImagesLoad.call(images, {
								query: CurrentMediaQuery
							});
							nodesCount = images.length;
						}
						if(typeof $(this).off !== "undefined") { // Prevent issues with jQurey < 1.7
							$(this).off('error');
	                	}
					}).each(function () {
						var that = $(this);
						// if image has width and height, it means that it is already loaded
						// let's trigger load event so the .one('load', ...) above is then executed
						if (that.width > 0 && that.height > 0) {
							that.trigger('load');
						}
						/*
						 * ELSE, if width === 0 and height === 0, we have to wait that the image is fully loaded
						 * and the .one('load', ...) above will be executed when the image will
						 * be asynchronously fully loaded
						 */
					}).one('error',function () {
						var that = $(this);
						/*
						 * a load error might be fired when src is set to null
						 * in that case we don't want to register it as a 'real' image load
						 */
						if ((that.attr('src') !== '' && isImage) || (that.css('background-image') && !isImage)) {
							// If first load, decrement the image counter for onAllImagesLoad callback.
							if (that.attr('data-loaded') == undefined) {
								nodesCount -= 1;
								that.attr('data-loaded', true);
							}
							settings.onImageError();
						}
					}).each(function () {
						var that = $(this);
						if (isImage) {
							that.attr('src', null) // Prevent bad image refresh on desktop window resize.
								.attr('src', imagesGetDisplay(element)); // Get the appropriate rendition URL and display it.
						} else {
							that.css('background-image', 'url(' + imagesGetDisplay(element) + ')');
						}
					});
			}
			return $(this);
		};

		/**
		 * Return TRUE if the mediaquery passed is valid.
		 * Use modernizr.mq as fallback for old browsers (if available).
		 * Return false if mediaquery detection is unavailable.
		 * 
		 * @param media {string}
		 *     A mediaquery string as a CCS @media
		 * @return {bool}
		 */
		$.fn.responsivelazyloader.is_valid_mediaQuery = function (media) {
			// MatchMedia support detection.
			if ("matchMedia" in window) {
				return window.matchMedia(media).matches;
			}
			// Fallback using Modernizr MatchMedia support detection.
			else if (typeof Modernizr !== "undefined") { // Prevent error if Modernizr isn't availabe.
				if(Modernizr.mq(media)){
					return true;
				} else {
					return false;
				}
			}
			// Return false if mediaquery detection is unavailable.
			return false;
		};
		/**
		 * Return the current mediaquery.
		 *
		 * In order to be consistent with the CSS, return the last valid mediaquery.
		 * This function is "public" so you can use it for other modules having
		 * responsivelazyloader as a dependency.
		 *  
		 * @return {string}
		 *     The ID of the current "mediaQueries"
		 */
		$.fn.responsivelazyloader.getCurrentMediaQuery = function () {
			var current = 'defaults';	//default fallback value
			var settings = $.fn.responsivelazyloader.defaults;
			for (var m in settings.mediaQueries) {
				if ($.fn.responsivelazyloader.is_valid_mediaQuery(settings.mediaQueries[m])) {
					current = m;
				}
			}
			return current;
		};

		/**
		 * Check if the images are within the window view (top, bottom, left and right)
		 * 
		 * If you had some troubles with images "visibility" you probably use fixed or
		 * absolute positionning (single page design or prallax) you can override the 
		 * default windovWiew function to use your paralax library API to define images
		 * as within the window view. (checking if praents elements have "active" class
		 * as an exemple).
		 * 
		 * @param image {Object}
		 *     The image object
		 * @param settings {Object}
		 *     The responsive lazyloading settings
		 * @return {bool}
		 */
		$.fn.responsivelazyloader.windowView = function  (node, settings) {
			var element = $(node),
				// window variables
				windowHeight = $(window).height(),
				windowWidth = $(window).width(),
				windowTop = $(window).scrollTop() - settings['distance'],
				windowBottom = windowTop + windowHeight + (settings['distance'] * 2),
				windowLeft = $(window).scrollLeft() - settings['distance'],
				windowRight = windowLeft + windowWidth + (settings['distance'] * 2),
				// image variables
				imageHeight = element.height(),
				imageWidth = element.width(),
				imageTop = element.offset().top - settings['distance'],
				imageBottom = imageTop + imageHeight + settings['distance'],
				imageLeft = element.offset().left - settings['distance'],
				imageRight = imageLeft + imageWidth + settings['distance'];
				
			// This will return true if any corner of the image is within the "active" screen including the distance parameter. 
			return (((windowBottom >= imageTop) && (windowTop <= imageTop)) || ((windowBottom >= imageBottom) && (windowTop <= imageBottom))) &&
				(((windowRight >= imageLeft) && (windowLeft <= imageLeft)) || ((windowRight >= imageRight) && (windowLeft <= imageRight)));
		};
		
		/**
		 * Setup plugin defaults
		 */
		$.fn.responsivelazyloader.defaults = {
			distance: 0, 							// the distance (in pixels) between the image and active window for loading the actual image
			fade: 400,								// the speed of the fading effect. Set 0 to disable.
			force: false, 							// Force images loading without distance.
			useScroll: true, 						// (Dis)Allow settings.onImageShow() to be called on scroll. 
			useResize: true, 						// (Dis)Allow settings.onImageShow() to be called after window resizes.
			token: '[[display]]',					// The token replaced by the current display.
			mediaQueries: {						// The mediaqueries used by the lazyloder.
				'phone': "(max-width: 460px)", 							// Phone default mediaQuery
				'tablet': "(min-width: 461px) and (max-width: 991px)",	// Tablet default mediaQuery
				'desktop': "(min-width: 992px)" 							// Desktop default mediaQuery, not used on display but useful for external use of getCurrentMediaQuery function.
			},
			displays: {							// The displays to combine grid system & mediaqueries
				'defaults': {
					'display': {
						'tablet': 'tablet',
						'phone': 'phone',
						'defaults': 'desktop'
					}
				}
			},
			onImageShow: function () {
			}, 		// Callback when an image has been lazy loaded.
			onImageError: function () {
			},	// Callback when an image could not be lazy loaded.
			onAllImagesLoad: function () {
			}			// Callback when all the images of the set are loaded.
		};

	})(jQuery);