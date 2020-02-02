function Marker(poiData) {

    /*
        For creating the marker a new object AR.GeoObject will be created at the specified geolocation. An
        AR.GeoObject connects one or more AR.GeoLocations with multiple AR.Drawables. The AR.Drawables can be
        defined for multiple targets. A target can be the camera, the radar or a direction indicator. Both the
        radar and direction indicators will be covered in more detail in later examples.
    */

    this.poiData = poiData;

    var markerLocation = new AR.GeoLocation(poiData.latitude, poiData.longitude);

    /*
        There are two major points that need to be considered while drawing multiple AR.Drawables at the same
        location. It has to be defined which one is before or behind another drawable (rendering order) and if they
        need a location offset. For both scenarios, ARchitect has some functionality to adjust the drawable behavior.

        To position the AR.Label in front of the background, the background drawable(AR.ImageDrawable) receives a
        zOrder of 0. Both labels have a zOrder of 1. This way it is guaranteed that the labels will be drawn in
        front of the background drawable.

        Assuming both labels will be drawn on the same geolocation connected with the same AR.GeoObject they will
        overlap. To adjust their position change the offsetX and offsetY property of an AR.Drawable object. The
        unit for offsets are SDUs. For more information about SDUs look up the code reference or the online
        documentation.


        In the following both AR.Labels are initialized and positioned. Note that they are added to the cam
        property of the AR.GeoObject the same way as an AR.ImageDrawable.
    */
    this.markerDrawableIdle = new AR.Model("assets/logo.wt3",  { scale: {x:0.025, y:0.025, z:0.025},rotate: {roll: 90, heading: 90.0} });

    this.directionIndicatorDrawable = new AR.ImageDrawable(World.markerDrawableDirectionIndicator, 0.1, {
            enabled: true,
            verticalAnchor: AR.CONST.VERTICAL_ANCHOR.TOP
    });

    this.titleLabel = new AR.Label(poiData.title, 1, {
        zOrder: 1,
        translate: {
            y: 1.75
        },
        style: {
            textColor: '#FFFFFF',
            fontStyle: AR.CONST.FONT_STYLE.BOLD
        }
    });

    this.descriptionLabel = new AR.Label(poiData.description, 0.8, {
        zOrder: 1,
        translate: {
            y: -0.55
        },
        style: {
            textColor: '#FFFFFF'
        }
    });

    /* Changed: */
    this.markerObject = new AR.GeoObject(markerLocation, {
        drawables: {
            cam: [this.markerDrawableIdle, this.descriptionLabel],
            indicator: this.directionIndicatorDrawable
        }
    });

    return this;
}

/* Will truncate all strings longer than given max-length "n". e.g. "foobar".trunc(3) -> "foo...". */
String.prototype.trunc = function(n) {
    return this.substr(0, n - 1) + (this.length > n ? '...' : '');
};