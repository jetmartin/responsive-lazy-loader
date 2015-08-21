#How to use

##HTML

Replace your img tags by the following :

```html
<img class="img-responsive" data-src="http://www.domain.tld/img-[[display]].jpg" src="js/pixel.gif" alt="image">
<noscript><img class="image-asset" src="http://www.domain.tld/img-defaults.jpg" alt="image"></noscript>
```

##CSS

The image size must be at 100% for the image to be "responsive", it means that the image will be adjusted to the parent element. You must set up your breakpoint to never upscale an image and to load the image closest to the maximum display width.

For example, if your site is 1200px on desktop you have to load an image as close as possible to 1200px but on a phone, if your max-width is 320 pixels, you have to load an image as close as possible to 320 but not too small.</p>

For a nice display, you need to use a "loader" background for the images and/or outline.
It could be something like :

```css
.img-responsive{
    width:100%;
    outline:#aaa;
    background:#ccc url(../img/loader.gif) center center no-repeat;
}
```

Add the noscript fallback :

```html
<noscript><style type="text/css" media="all">img[data-src] { display: none; }</style></noscript>
```

Always use the "desktop" as default value because almost all modern device browsers support mediaqueries detections. This is not the case for old desktop browsers, such as old IE, so the current mediaquery will always be the "defaults" one. Even in an old browser, the display will be recognized and the appropriate image will load anyway.

##Tip

The height auto is not displayed the same way on all the browsers.
To prevent the image height to change on an image load (text moving effect in some browsers), the image height has to be managed in CSS according to the site layout.

If all the images do not necessary have the same ratio (as 16/9 or 4/3), you can use the onImageShow callback function for custom actions.

##How to configure

You can add arguments on the function call or override the defaults.

```javascript
$("img[data-src]").responsivelazyloader({
    mediaQueries : {  // The mediaqueries used by the lazyloder.
      'phone'   : "(max-width: 767px)",
      'tablet'  : "(min-width: 768px) and (max-width: 991px)",
      'desktop' : "(min-width: 992px)"
    },
    displays : {  // The displays to combine grid system & mediaqueries
        'defaults' : {
            'display' : {
                'desktop'  : 'b',   //1024
                'tablet'   : 'z',   //640
                'phone'    : 'm',   //320
                'defaults' : 'b'    //1024
            }
        }
    }
});
```

Or

```javascript
// Owerrde defaults
$.fn.responsivelazyloader.defaults.mediaQueries = {  // The mediaqueries used by the lazyloder.
        'phone'    : "(max-width: 767px)",
        'tablet'   : "(min-width: 768px) and (max-width: 991px)",
        'desktop'  : "(min-width: 992px)"
    };
$.fn.responsivelazyloader.defaults.displays = { // The displays to combine grid system & mediaqueries
        'defaults' : {
            'display' : {
                'desktop'  : 'b',   //1024
                'tablet'   : 'z',   //640
                'phone'    : 'm',   //320
                'defaults' : 'b'    //1024
            }
        }
    };
$("img[data-src]").responsivelazyloader();
```

##How to use Breakpoints (mediaQueries)

In order to be consistant with CSS declaration, the latest valid mediquery will be used.
You can use simple mediaqueries or more complex ones using orientation or pixel-ratio.
To start in a simple way with the plugin, copy/past the mediaqueries in the same order from your steelsheets.

##Use Multiple displays

Do not use multiple instances of the plugin, use the displays.
You can declare diffrent configuration for some images in the same page using the displays config element.
The first valid display will be used for each image.
You can specify multiples "displays" using a "gridClass" (on the image itself or a parent element).
The "parent" parameter is now optional. If you ecalre a "parent" element, it must have the "gridClass".
"parent" is a jQuery element declaration as ".myParentClass" or "section.myParentClass".
"gridClass" is a class name as "myDisplayClass".
Always use a "defaults" display and a "defaults" on each display to prevent issues and to make display detection usable with old browsers.

```html
<section>
  <article class="sidebar">{...}</article>
  <aside class="sidebar">{...}</aside>
</section>
```

```javascript
$.fn.responsivelazyloader.defaults.displays = { // The displays to combine grid system &amp; mediaqueries
        'articleWithSidebar' : {
            'parent' : 'article.sidebar',
            'gridClass' : 'sidebar',
            'display' : {
                'phone'    : 'm',   //320
                'defaults' : 'z'    //640
            }
        },
        'sidebar' : {
            'gridClass' : 'sidebar',
            'display' : {
                'defaults' : 'm'    //320
            }
        },
        'defaults' : {
            'display' : {
                'desktop'  : 'b',   //1024
                'tablet'   : 'z',   //640
                'phone'    : 'm',   //320
                'defaults' : 'b'    //1024
            }
        }
    };
```

###Override image url for display and/or breakpoint

The image url can be overriden for a specific display and/or breakpoint using some additionals attributs.

1. "data-src-{display}-{mediaquerie}" will override image url for a combinaison of display & breakpoint.
2. "data-src-{display}" will override image url for a display.
2. "data-src-{mediaquerie}" will override image url for a breakpoint (mediaquerie).

Where "{display}" and "{mediaquerie}" are teh display and mediaquerie names in settings array.

Important notice about the "Token" on the image urls.

1. If you use it, the images will be loaded according to the configuration of the lazyloader.
2. If you do not use it, the same image will be loaded for each displays/breakpoints.

If your CMS/Framwork do not allows you to use non valid images urls (using token), you can use this way to use the lazyloader. In this case, to prevent bugs, set a "data-src-defaults" attribut.

The following exemple is for a breakpoint name "phone" and a display name "sidebar". The image loaded on display "sidebar" will be a specif one using the responsive token. The images loaded for the breakpoint "phone" do not use the responsie token.

```html
<img
  class="img-responsive"
  data-src-sidebar-phone="http://www.domain.tld/an-image.jpg"
  data-src-sidebar="http://www.domain.tld/another-image-[[display]].jpg"
  data-src-phone="http://www.domain.tld/a-third-image.jpg"
  data-src="http://www.domain.tld/image-[[display]].jpg"
  src="js/pixel.gif"
  alt="image">
<noscript><img class="image-asset" src="http://www.domain.tld/image-defaults.jpg" alt="image"></noscript>
```

##AJAX

The lazyloader can be used with AJAX.

```javascript
// Init lazyloader
$("img[data-src]").responsivelazyloader();
// Init lazyloder after ajax events.
$(document).ajaxStop(function(){ $("img[data-src]").responsivelazyloader(); });
```