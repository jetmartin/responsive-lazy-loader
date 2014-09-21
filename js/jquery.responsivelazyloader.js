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

;(function ($) {
    /**
     * Process responsivelazyloader
     */
    $.fn.responsivelazyloader = function (options) {
        // Global settings
        var settings = $.extend($.fn.responsivelazyloader.defaults, options);
        // Ensure the passed elements are images. 
        var images = $(this).filter('img');
        // Counter for custom event when all the images are loaded.
        var imagesCount = images.length;
        if (imagesCount > 0) {
            // Load on page load.
            var CurrentMediaQuery = $.fn.responsivelazyloader.getCurrentMediaQuery();
            // Wait for document ready to load images to prevent issues with other JS (as AD scripts using document.write).
            $(document).ready(function () {
                loadActualImages(images, settings, 'load');
            });
            // Load on scroll
            $(window).bind('scroll', function (e) {
                loadActualImages(images, settings, 'scroll');
            });
            // Load on resize
            $(window).resize(function (e) {
                var MediaQuery = $.fn.responsivelazyloader.getCurrentMediaQuery();
                if (CurrentMediaQuery !== MediaQuery) {
                    // Triger custom event on mediaquery change
                    $.event.trigger({
                        type: "onMediaqueryChange",
                        CurrentMediaQuery: MediaQuery,
                        PreviousMediaQuery: CurrentMediaQuery
                    });
                    CurrentMediaQuery = MediaQuery;
                    loadActualImages(images, settings, 'resize');
                }
            });
        }

        /**
         * Set an attribute "data-display" to the image.
         * 
         * The first valid display will be set.
         * The image or a parent element can have the gridClass
         * For advance config, You can specify a "parent" element.
         * In this case, the parent must have the gridClass.
         * @param image {Object}
         */
        function imagesSetDisplay(image) {
            var currentDisplay = 'defaults'; // Default display (fallback)
            for (var display in settings.displays)
            {
                if ($(image).hasClass(settings.displays[display].gridClass)
                    || $(image).closest((settings.displays[display].parent != undefined) ? settings.displays[display].parent : '.' + settings.displays[display].gridClass).hasClass(settings.displays[display].gridClass)) {
                    currentDisplay = display;
                    break;
                }
            }
            $(image).attr('data-display', currentDisplay);
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
         * @return image {string} 
         *     The apropriate src value.
         */
        function imagesGetDisplay(image) {
            if (!$(image).attr('data-display')) {
                imagesSetDisplay(image);
            }
            var activeDisplay = $(image).attr('data-display');
            var currentDisplay = null;
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
            //Default displays
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
            if ($(image).attr('data-src-' + activeDisplay + '-' + CurrentMediaQuery)) {
                return $(image).attr('data-src-' + activeDisplay + '-' + CurrentMediaQuery).replace(settings.token, currentDisplay);
            }
            // Override the token By Display.
            else if ($(image).attr('data-src-' + activeDisplay)) {
                return $(image).attr('data-src-' + activeDisplay).replace(settings.token, currentDisplay);
            }
            // Override the token By Breakpoint.
            else if ($(image).attr('data-src-' + CurrentMediaQuery)) {
                return $(image).attr('data-src-' + CurrentMediaQuery).replace(settings.token, currentDisplay);
            }
            // Use the token.
            else if ($(image).attr("data-src")) {
                return $(image).attr("data-src").replace(settings.token, currentDisplay);
            }
            // Global fallback, return current src
            else {
                return $(image).attr("src");
            }
            return null;
        }
    
        /** 
         * Load images who are "visible".
         * 
         * Visible is defined by the windowView function according to the settings.
         * If the "force" parameter is set to TRUE, all the images will be consider as visible.
         * 
         * @see $.fn.responsivelazyloader.windowView()
         *
         * @param images {jQuery<Image>}
         *     A jQuery set of images
         * @param settings {Object}
         *     the settings
         * @param [callOrigin] {String}
         *     Determines the origin of the call. Can be either 'load'|'scroll'|'resize'
         */
        function loadActualImages(images, settings, callOrigin) {
            images.each(function () {
                if ($.fn.responsivelazyloader.windowView(this, settings) || settings.force === true) {
                    // Check if this is the first load or if the mediaquery has changed.
                    if ($(this).attr('data-current-mediaq') !== CurrentMediaQuery) {
                        $(this).attr('data-current-mediaq', CurrentMediaQuery);
                        loadImage(this, callOrigin);
                        $(this).fadeIn(400);
                    }
                }
            });
        }

        /**
         * Load the image and trigger appropriate events.
         * 
         * @param image {Image}
         * @param [callOrigin] {String}
         *     Determines the origin of the call. Can be either 'load'|'scroll'|'resize'
         */
        function loadImage(image, callOrigin) {
            $(image).hide().one('load', function () {
                // IE8 compatibility, issue on imageload event :
                // Only show the image when the width & height are not empty (image really loaded).
                if ('naturalWidth' in this !== true || 'naturalHeight' in this !== true)
                {
                    $(this).hide().css('width', 'auto');
                    this.naturalWidth = $(this).width();
                    this.naturalHeight = $(this).height();
                    $(this).show();
                }
                // Trigger the responsiveImageLoaded custom event on image load.
                $.event.trigger({
                    type: "responsiveImageLoaded",
                    image: $(this)
                });
                // If first load, decrement the image counter for onAllImagesLoad callback.
                if ($(this).attr('data-loaded') === undefined) {
                    imagesCount -= 1;
                    $(this).attr('data-loaded', true);
                }
                /*
                 * fire success callback only if callOrigin param undefined (default) or
                 * if callOrigin value matches settings use cases 
                 */
                if (callOrigin === undefined || callOrigin === 'load' ||
                    (callOrigin === 'scroll' && settings.useScroll) ||
                    (callOrigin === 'resize' && settings.useResize))
                {
                    // Call the callback here because we are certain the image is loaded here
                    settings.onImageShow.call($(this));
                }
                // All images have been loaded.
                if (imagesCount === 0)
                {
                    settings.onAllImagesLoad.call(images, {
                        query: CurrentMediaQuery
                    });
                    imagesCount = images.length;
                }
                if(typeof $(this).off !== "undefined") { // Prevent issues with jQurey < 1.7
                    $(this).off('error');
                }
            }).each(function () {
                // if image has width and height, it means that it is already loaded
                // let's trigger load event so the .one('load', ...) above is then executed
                if (this.width > 0 && this.height > 0)
                {
                    $(this).trigger('load');
                }
                /*
                 * ELSE, if width === 0 and height === 0, we have to wait that the image is fully loaded
                 * and the .one('load', ...) above will be executed when the image will
                 * be asynchronously fully loaded
                 */
            }).one('error', function () {
                /*
                 * a load error might be fired when src is set to null
                 * in that case we don't want to register it as a 'real' image load    
                 */
                if ($(this).attr('src') !== '')
                {
                    // If first load, decrement the image counter for onAllImagesLoad callback.
                    if ($(this).attr('data-loaded') === undefined) {
                        imagesCount -= 1;
                        $(this).attr('data-loaded', true);
                    }
                    settings.onImageError();
                }
            })
        .attr('src', null) // Prevent bad image refresh on desktop window resize.
        .attr('src', imagesGetDisplay(image)); // Get the appropriate rendition URL and display it.
        }
        return $(this);
    };

    /**
     * Return TRUE if the mediaquery passed is valid.
     * 
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
            if (window.matchMedia(media).matches) {
                return true;
            } else {
                return false;
            }
        }
        // Fallback using Modernizr MatchMedia support detection.
        else if (typeof Modernizr !== "undefined") { // Prevent error if Modernizr isn't availabe.
            if (Modernizr.mq(media)) {
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
        var current = 'defaults';    //default fallback value
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
    $.fn.responsivelazyloader.windowView = function  (image, settings) {
        // window variables
        var windowHeight = $(window).height(),
        windowWidth      = $(window).width(),

        windowTop        = $(window).scrollTop() - settings.distance,
        windowBottom     = windowTop + windowHeight + (settings.distance * 2),
        windowLeft       = $(window).scrollLeft() - settings.distance,
        windowRight      = windowLeft + windowWidth + (settings.distance * 2),
    
        // image variables
        imageHeight      = $(image).height(),
        imageWidth       = $(image).width(),
    
        imageTop         = $(image).offset().top - settings.distance,
        imageBottom      = imageTop + imageHeight + settings.distance,
        imageLeft        = $(image).offset().left - settings.distance,
        imageRight       = imageLeft + imageWidth + settings.distance;
    
        // This will return true if any corner of the image is within the "active" screen including the distance parameter. 
        return (((windowBottom >= imageTop) && (windowTop <= imageTop)) || ((windowBottom >= imageBottom) && (windowTop <= imageBottom))) &&
             (((windowRight >= imageLeft) && (windowLeft <= imageLeft)) || ((windowRight >= imageRight) && (windowLeft <= imageRight)));
    };
 
    /**
     * Setup plugin defaults
     */
    $.fn.responsivelazyloader.defaults = {
        distance: 0,                         // the distance (in pixels) between the image and active window for loading the actual image
        force: false,                        // Force images loading without distance.
        useScroll: true,                     // (Dis)Allow settings.onImageShow() to be called on scroll. 
        useResize: true,                     // (Dis)Allow settings.onImageShow() to be called after window resizes.
        token : '[[display]]',               // The token replaced by the current display.
        mediaQueries : {                     // The mediaqueries used by the lazyloder.
            'phone'   : "(max-width: 460px)",                         // Phone default mediaQuery
            'tablet'  : "(min-width: 461px) and (max-width: 991px)",  // Tablet default mediaQuery
            'desktop' : "(min-width: 992px)"                          // Desktop default mediaQuery, not used on display but useful for external use of getCurrentMediaQuery function.
        },
        displays : {                         // The displays to combine grid system & mediaqueries
            'defaults' : {
                'display' : {
                    'tablet'   : 'tablet',
                    'phone'    : 'phone',
                    'defaults' : 'desktop'
                }
            }
        },
        onImageShow     : function () {},    // Callback when an image has been lazy loaded.
        onImageError    : function () {},    // Callback when an image could not be lazy loaded.
        onAllImagesLoad : function () {}     // Callback when all the images of the set are loaded.
    };

})(jQuery);