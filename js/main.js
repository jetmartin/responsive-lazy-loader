/**
 * Exemple of uses.
 */

/**
 * Override defaults
 */ 
//exemple of different kind of breakpoint. Not necessary the one to use...
$.fn.responsivelazyloader.defaults.mediaQueries = {  // The mediaqueries used by the lazyloder.
		  'phone'						: "(max-width: 380px)",
		  'tablet'						: "(min-width: 381px) and (max-width: 991px)",
		  'phone-retina'				: "(max-width: 380px) and (-webkit-min-device-pixel-ratio: 2), (max-width: 380px) and (min-resolution: 192dpi), (max-width: 380px) and (min-resolution: 2dppx)",
		  'tablet-retina'				: "(min-width: 381px) and (max-width: 991px) and (-webkit-min-device-pixel-ratio: 2), (min-width: 381px) and (max-width: 991px) and (min-resolution: 192dpi), (min-width: 381px) and (max-width: 991px) and (min-resolution: 2dppx)",
		  'desktop' 					: "(min-width: 992px) and (max-width: 1200px)"
		  // in this demo the "defaults" will be larger than desktop > 1200px.
	};
// The displays to combine grid system (bootstrap), mediaqueries and flickr images.
// This is just an exemple (not using the retina stuff, loading the defaults on retina).
$.fn.responsivelazyloader.defaults.displays = {	
			'col-md-8' : {
				//'parent' : '.col-md-8',   // optional if == gridClass
				'gridClass' : 'col-md-8',
				'display' : {
					'phone' : 'n',		//500
					'defaults' : 'z'	//640
				}
			},
			'col-md-4' : {
				//'parent' : '.col-md-4',   // optional if == gridClass
				'gridClass' : 'col-md-4',
				'display' : {
					'desktop' : 'n',		//500
					'tablet' : 'z',		//640
					'phone' : 'n',		//500
					'defaults' : ''	//640
				}
			},
			'defaults' : {
				'display' : {
					'desktop' : 'b',	//1024
					'tablet' : 'z',		//640
					'phone' : 'n',		//500
					'defaults' : 'b'	//1024
				}
			}
	};

/**
 *  Default implementation
 */
//$("img[data-src]").responsivelazyloader();
// Init lazyloder after ajax events.
//$("body").on({ ajaxStop : function(){ $("img[data-src]").responsivelazyloader(); }});


/**
 *  chain functions exemple
 */
//$("img[data-src]").responsivelazyloader().attr('data-test', 'TEST');


/**
 *  Use callbacks & chain functions exemple
 */
$("img[data-src]").responsivelazyloader({
	onImageShow:function () {
		console.log('onImageShow callback');
		//Debug using callback function.
		$(this).next().remove();
		$(this).after(
			"<p>Current mediaquerry : " + $(this).attr("data-current-mediaq") 
			+ "<br />Current display : " + $(this).attr("data-display") + "</p>"
		);
	},
	onAllImagesLoad:function () {
		console.log('onImagesLoad callback');
	},
	onImageError:function () {
		console.log('onImageError callback');
	}
}).attr('data-test', 'TEST');
// Init lazyloder after ajax events.
$(document).ajaxStop(function(){ $("img[data-src]").responsivelazyloader(); });


/**
 * Use The custom events exemple
 */
$(window).on('responsiveImageLoaded', function(event){
	console.log('Image loaded', event);
	//Debug using custom event.
	$image = $(event.image[0]);
	$image.next().remove();
	$image.after(
			"<p>Current mediaquerry : " + $image.attr("data-current-mediaq") 
			+ "<br />Current display : " + $image.attr("data-display") + "</p>"
		);
});
$(window).on('onMediaqueryChange', function(event){
	console.log('mediaq change', event);
});
