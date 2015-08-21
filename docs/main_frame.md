#Understading the Responsive lazy loader

Responsive lazy loader allows you lo load the most appropriate image renditions according to the current breakpoint and to the current display into the CSS grid-system.

It can be used as a simple lazy loader, simply as a responsive lazy loader (taking care of the breakpoint) or as an advanced lazy loader taking care of breakpoint and display.

##How it works

The lazy loader recognizes the current display (size in a grid system for example) and breakpoint (mediaquery) and replaces a token in the image URL.

It works with any HTML/CSS structure/framework as bootstrap or foundation and any image provider as Flickr or CMS using image preset (rendition, styles, ...) as Adobe CQ or Drupal.