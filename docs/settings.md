#Settings

All available settings :

1. distance        = Int      | distance of the image to the viewable browser screen before it gets loaded</li>
2. token           = string   | The token replaced by the current display pattern.</li>
3. force           = Bool     | Force loading without distance.</li>
4. mediaQueries    = Object   | The mediaquery used by the lazy loader.</li>
5. displays        = Object   | The display properties, match the grid class and the mediaqueries</li>
6. onImageShow     = function | Callback when an image has been lazy loaded.</li>
7. onImageError    = function | Callback when an image could not be lazy loaded.</li>
8. onAllImagesLoad = function | Callback when all the images of the set are loaded.</li>

Custom events :

1. responsiveImageLoaded -> Trigger on each image load. Custom var :
        - image : The currently loaded image.
2. onMediaqueryChange -> Trigger when mediaquery has change. Custom var :
        - CurrentMediaQuery : the current mediaquery key according to Settings.mediaQueries.
        - PreviousMediaQuery : The previous mediaquery key according to Settings.mediaQueries.