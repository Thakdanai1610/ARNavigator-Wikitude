/* Implementation of AR-Experience (aka "World"). */
var World = {
    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* POI-Marker asset. */
    markerDrawableIdle: null,

    marker: null,
    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

        /*
            The example Image Recognition already explained how images are loaded and displayed in the augmented
            reality view. This sample loads an AR.ImageResource when the World variable was defined. It will be
            reused for each marker that we will create afterwards.
        */
        World.markerDrawableIdle = new AR.ImageResource("assets/marker.png", {
            onError: World.onError
        });
        World.markerDrawableDirectionIndicator = new AR.ImageResource("assets/indi.png", {
            onError: World.onError
        });
        /*
            Since there are additional changes concerning the marker it makes sense to extract the code to a
            separate Marker class (see marker.js). Parts of the code are moved from loadPoisFromJsonData to the
            Marker-class: the creation of the AR.GeoLocation, the creation of the AR.ImageDrawable and the
            creation of the AR.GeoObject. Then instantiate the Marker in the function loadPoisFromJsonData:
        */
        World.marker = new Marker(poiData);

        /* Updates status message as a user feedback that everything was loaded properly. */
        World.updateStatusMessage('1 place loaded');
    },

    /* Updates status message shown in small "i"-button aligned bottom center. */
    updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

        var themeToUse = isWarning ? "e" : "c";
        var iconToUse = isWarning ? "alert" : "info";

        $("#status-message").html(message);
        $("#popupInfoButton").buttonMarkup({
            theme: themeToUse,
            icon: iconToUse
        });
    },

    /* Location updates, fired every time you call architectView.setLocation() in native environment. */
    locationChanged: function locationChangedFn(lat, lon, alt, acc) {

        /*
            The custom function World.onLocationChanged checks with the flag World.initiallyLoadedData if the
            function was already called. With the first call of World.onLocationChanged an object that contains geo
            information will be created which will be later used to create a marker using the
            World.loadPoisFromJsonData function.
        */
        if (!World.initiallyLoadedData) {
            /* Creates a poi object with a random location near the user's location. */
            var poiData = {
                "id": 1,
                "longitude": (100.51416667),
                "latitude":  (13.82111972),
                "description": World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m",
                "title": "วิศวกรรมศาสตร์"
            };
            document.getElementById("MyText").textContent= "ห่างจากจุดหมาย : " + World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
            World.loadPoisFromJsonData(poiData);
            World.initiallyLoadedData = true;
        }else{
            World.marker.descriptionLabel.text = World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
            document.getElementById("MyText").textContent= "ห่างจากจุดหมาย : " + World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
        }
    },

    distance: function find_distance(lat1, lon1, lat2, lon2){  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
    },

    onError: function onErrorFn(error) {
        alert(error)
    }
};

function test(in_put){
        if (World.initiallyLoadedData) {
            World.marker.titleLabel.text = in_put;
        }
    }
/* 
    Set a custom function where location changes are forwarded to. There is also a possibility to set
    AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further
    location updates will be received.
*/
AR.context.onLocationChanged = World.locationChanged;