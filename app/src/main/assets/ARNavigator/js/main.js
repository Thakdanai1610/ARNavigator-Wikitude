/* Implementation of AR-Experience (aka "World"). */
var World = {
    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* POI-Marker asset. */
    markerDrawableIdle: null,

    selectPlace: false,

    marker: null,

    lat_in: null,
    long_in: null,
    acc_in: null,

    lat_target: null,
    long_target: null,
    loc_name: null,

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
        World.lat_in = lat;
        World.long_in = lon;
        World.acc_in = acc;
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

var dropdown = false;

function showHide(that) {
            if(that.value == "0") {
                dropdown = false;
                document.getElementById("startNavBT").style.display = "none";
            } else {
                dropdown = true;
                document.getElementById("startNavBT").style.display = "block";
            }
    }

var path;
function startNav() {
    document.getElementById("startNavBT").style.display = "none";
    document.getElementById("menu").style.display = "none";
    document.getElementById("stopNavBT").style.display = "block";
    document.getElementById("infoBox").style.display = "block";
    var location_query = getLocationByName(document.getElementById("category").value)[0];
    console.log(location_query);
    /******* Test Dijkstra : Set Source = Back Ally *******/

    var graph = new Graph(map);
    path = graph.findShortestPath('back_alley', location_query.id);
    var location_query = getLocationByName(path[0])[0];
    //document.getElementById("MyText").textContent= ;
    console.log(path);
    World.lat_target = location_query.lat;
    World.long_target = location_query.long;
    World.loc_name = path[0];
    World.selectPlace = true;

    AR.platform.sendJSONObject({action: "sendState", state: "navigate"});
}

function stopNav() {
    World.selectPlace = false;
    destroyObject();

    index_path = 0;
    //document.getElementById("category").value = "0";
    document.getElementById("stopNavBT").style.display = "none";
    document.getElementById("infoBox").style.display = "none";

    resetDropdown();
    document.getElementById("menu").style.display = "block";
}


function getLocationByName(id) {
  return json_file.filter(
      function(json_file){ return json_file.id == id }
  );
}

var json_file;
$.getJSON("json/position_point.json", function(json) {
    json_file = json;
});

/******** Create Object Function *********/
setInterval(function() {
    if (World.selectPlace && !World.initiallyLoadedData) {
        /* Creates a poi object with a random location near the user's location. */
        var poiData = {
            "id": 1,
            "longitude": World.long_target,//(100.51416667),
            "latitude":  World.lat_target,//(13.82111972),
            "description":  find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m", //World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m",
            "title": World.loc_name //"วิศวกรรมศาสตร์"
        };
        console.log("hello");
        document.getElementById("location_name").textContent = World.loc_name;
        document.getElementById("MyText").textContent = "ห่างจากจุดหมาย : " + find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m";//World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
        World.loadPoisFromJsonData(poiData);
        World.initiallyLoadedData = true;

    }else if(World.initiallyLoadedData){
        World.marker.descriptionLabel.text = find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m";//World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
        document.getElementById("MyText").textContent = "ห่างจากจุดหมาย : " + find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m";//World.distance(13.82111972,100.51416667,lat,lon).toFixed() + " m";
    }
}, 500);


function find_distance(lat1, lon1, lat2, lon2){  // generally used geo measurement function
        var R = 6378.137; // Radius of earth in KM
        var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
        var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c;
        return d * 1000; // meters
}

function createDropDown(){
    for (let i of json_file) {
        if(i.floor == 1){
            document.getElementById("category").innerHTML += '<option value="' + i.id + '">' + i.name + '</option>';
        }
    }
}

function resetDropdown(){
    document.getElementById("startNavBT").style.display = "none";
    var myselect = $("select#category");
    myselect[0].selectedIndex = 0;
    myselect.selectmenu("refresh");

    AR.platform.sendJSONObject({action: "sendState", state: "home"});

}

function checkState(){
    if(World.selectPlace){
        stopNav();
    }else if(dropdown){
        resetDropdown();
    }
}

function destroyObject(){
    if(World.initiallyLoadedData){
        World.marker.markerObject.destroy();
        World.initiallyLoadedData = false;
    }
}

/*********************** Test Function ****************************/
var index_path = 0;
function nextModel(){
    index_path++;
    if(index_path < path.length){
        document.getElementById("location_name").textContent = path[index_path];
    } else {
        index_path = path.length - 1;
    }
    var location_query = getLocationByName(path[index_path])[0];
    console.log(location_query);
    World.lat_target = location_query.lat;
    World.long_target = location_query.long;
    World.loc_name = path[index_path];
    destroyObject();

}

function previousModel(){
    index_path--;
    if(index_path >= 0){
        document.getElementById("location_name").textContent = path[index_path];
    } else {
        index_path = 0;
    }
        var location_query = getLocationByName(path[index_path])[0];
        console.log(location_query);
        World.lat_target = location_query.lat;
        World.long_target = location_query.long;
        World.loc_name = path[index_path];
        destroyObject();
}

function text_console(text){
    document.getElementById("console").textContent = text;
}

/*
    Set a custom function where location changes are forwarded to. There is also a possibility to set
    AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further
    location updates will be received.
*/
AR.context.onLocationChanged = World.locationChanged;