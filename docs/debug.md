#Debug

To help you setup the lazyloader, you can use the following code :

```javascript
$(window).on('responsiveImageLoaded', function(event){
	$image = $(event.image[0]);
	$image.next().remove();
	$image.after(
		"<p>Current mediaquerry : " + $image.attr("data-current-mediaq")
		+ "<br />Current display : " + $image.attr("data-display") + "</p>"
	);
});
```

##Images do not load

If you are using parallax or single page design, anyway fixe positionning, you will may have some troubles on image visibility detection.
In this case you can override the windovWiew function to be able to manage the "visibility" of images according to your specific layout/library.