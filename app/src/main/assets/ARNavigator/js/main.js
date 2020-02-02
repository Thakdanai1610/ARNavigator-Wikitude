/* Implementation of AR-Experience (aka "World"). */
var World = {
    /* True once data was fetched. */
    initiallyLoadedData: false,

    /* POI-Marker asset. */

    selectPlace: false,

    marker: null,

    lat_in: null,
    long_in: null,
    acc_in: null,

    lat_target: null,
    long_target: null,
    loc_name: null,
    waitGPS: false,

    /* Called to inject new POI data. */
    loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

        /*
            The example Image Recognition already explained how images are loaded and displayed in the augmented
            reality view. This sample loads an AR.ImageResource when the World variable was defined. It will be
            reused for each marker that we will create afterwards.
        */
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
        //World.updateStatusMessage('1 place loaded');
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

        if(World.waitGPS){
            World.waitGPS = false;
            AR.platform.sendJSONObject({action: "waitGPS"});
        }
    },

    onError: function onErrorFn(error) {
        alert(error)
    }
};

var dropdown =  false;

function showHide(that) {
            if(that.value == "0") {
                dropdown = false;
                document.getElementById("menu").style.height = "50px"
                document.getElementById("startNavBT").style.display = "none";
                document.getElementById("floor_select").style.display = "none";
            } else {

                dropdown = true;
                document.getElementById("menu").style.height = "100px"
                document.getElementById("startNavBT").style.display = "block";
                document.getElementById("floor_select").style.display = "block";
            }
}


function selectFloorPopup(){
    $("#popupSelectFloor").popup("open");
    $("#popupSelectFloor").popup('reposition', 'positionTo: window');
    AR.platform.sendJSONObject({action: "sendState", state: "selectFloor"});
}

var startFloor = 0;
function selectFloor(){
    startFloor = Number(document.getElementById("floor").value);
    $("#popupSelectFloor").popup("close");
    document.getElementById("startNavBT").style.display = "block";
}

function closeFloorPopup(){
    $("#popupSelectFloor").popup("close");
    resetDropdown();

    AR.platform.sendJSONObject({action: "sendState", state: "home"});

}


var path;
function startNav() {
    startFloor = Number(document.getElementById("floor").value);
    if(World.lat_in == null || World.long_in == null){
        $("#popupWaitGPS").popup("open");
        $("#popupWaitGPS").popup('reposition', 'positionTo: window');
        World.waitGPS = true;


    }else{
        $("#popupWaitGPS").popup("close")
        document.getElementById("startNavBT").style.display = "none";
        document.getElementById("menu").style.display = "none";
        document.getElementById("infoBox").style.display = "block";
        var location_query = getLocationByName(document.getElementById("category").value)[0];    

        var graph = new Graph(map);

        nowPosition();

        path = graph.findShortestPath('now', location_query.id);
    
        var location_query = getLocationByName(path[1])[0];
    
        World.lat_target = location_query.lat;
        World.long_target = location_query.long;
        World.loc_name = location_query.name;
        World.selectPlace = true;

        AR.platform.sendJSONObject({action: "setTarget", lat: World.lat_target, lon: World.long_target});

        AR.platform.sendJSONObject({action: "sendState", state: "navigate"});

    }
}

function stopNav() {
    World.selectPlace = false;
    destroyObject();

    index_path = 1;
    document.getElementById("infoBox").style.display = "none";
    document.getElementById("finishBox").style.display = "none";
    document.getElementById("floor_select").style.display = "none";
    document.getElementById("menu").style.height = "50px"
    finishNav = false;
    resetDropdown();
    document.getElementById("menu").style.display = "block";
    AR.platform.sendJSONObject({action: "sendState", state: "home"});
}


function getLocationByName(id) {
  return json_file.filter(
      function(json_file){ return json_file.id == id }
  );
}

function getAccuracy(acc){
    World.acc_in = acc;
}

var startLat = 0;
var startLon = 0;
function nowPosition(){
    close_path = {head:null, head_d:null, tail:null, tail_d:null}
    d_temp = 100000000;
    less5m = false;
    for(let i of child_node[startFloor - 1].data){
        for(let j of i.child){
            let distance = find_distance(World.lat_in, World.long_in, j.lat, j.long);
            if(distance < d_temp){
                d_temp = distance;
                close_path.head = i.head;
                close_path.tail = i.tail;
                if(distance < 5){
                    less5m = true;
                    break;
                }
            }
        }

        if(less5m){
            break;
        }
    }

    hd = find_distance(World.lat_in, World.long_in, getLocationByName(close_path.head)[0].lat, getLocationByName(close_path.head)[0].long);
    td = find_distance(World.lat_in, World.long_in, getLocationByName(close_path.tail)[0].lat, getLocationByName(close_path.tail)[0].long);
    map["now"] = {[close_path.head]:hd,[close_path.tail]:td};

    console.log(close_path.head);
    console.log(close_path.tail);


    startLat = World.lat_in;
    startLon = World.long_in;

}

var json_file;
$.getJSON("json/position_point.json", function(json) {
    json_file = json;
});

var child_node;
$.getJSON("json/temp.json", function(json2) {
    child_node = json2;
});


var arriveCount = 0;
/******** Create Object Function *********/
setInterval(function() {
    if (World.selectPlace && !World.initiallyLoadedData) {
        /* Creates a poi object with a random location near the user's location. */
        var poiData = {
            "id": 1,
            "longitude": World.long_target,
            "latitude":  World.lat_target,
            "description":  find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m",
            "title": World.loc_name 
        };
        document.getElementById("location_name").textContent = World.loc_name;
        document.getElementById("MyText").textContent = find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in).toFixed() + " m ( \xB1 " + World.acc_in + " )";
        World.loadPoisFromJsonData(poiData);
        World.initiallyLoadedData = true;

    }else if(World.initiallyLoadedData && !finishNav){
        let distance = find_distance(World.lat_target, World.long_target, World.lat_in, World.long_in);
        World.marker.descriptionLabel.text = distance.toFixed() + " m";
        document.getElementById("MyText").textContent = distance.toFixed() + " m ( \xB1 " + World.acc_in + " )";

        if(distance > 30){
            arriveCount = 0;
            document.getElementById("direction").src="assets/go_straight.png";
        }
        else if(distance <= 30 && distance >= 10 && index_path != (path.length - 1)){
            arriveCount = 0;
            checkDirection();
        }
        else if(distance <= 10){
            if(arriveCount >= 6){
                arriveCount = 0;
                nextModel();
            }else if(stairStatus){
                arriveCount = 0;
            }else{
                arriveCount++;
            }

        }
    }else if(finishNav){
        document.getElementById("infoBox").style.display = "none";
        document.getElementById("finishBox").style.display = "block";
        document.getElementById("Destination").textContent = World.loc_name;
    }
}, 500);

function changeNavStatus(status){
    document.getElementById("NavStatus").textContent = status;
}

function checkDirection(){
    if(World.loc_name.startsWith("บันได") && index_path + 1 < path.length && path[index_path + 1].startsWith("stair")){

        var i = index_path;
            while(true){
                if(!(path[i+1].startsWith("stair"))){
                    var lq = getLocationByName(path[i])[0];
                    if(startFloor < lq.floor){
                        document.getElementById("direction").src="assets/go_up.png"
                    }else{
                        document.getElementById("direction").src="assets/go_down.png"
                    }
                    break;

                }
                i++;
            }

    }else{

    var previous_lat = 0;
    var previous_lon = 0;

    if(index_path == 1){
        previous_lat = startLat;
        previous_lon = startLon;
    }else{
        var location_query = getLocationByName(path[index_path - 1])[0];
        previous_lat = location_query.lat;
        previous_lon = location_query.long;
    }

    var now_lat = World.lat_target;
    var now_lon = World.long_target;

    var location_query = getLocationByName(path[index_path + 1])[0];
    var next_lat = location_query.lat;
    var next_lon = location_query.long;


    var pn_lat = previous_lat - now_lat;
    var pn_lon = previous_lon - now_lon;

    var nn_lat = now_lat - next_lat;
    var nn_lon = now_lon - next_lon;

    if(pn_lat <= 0 && (Math.abs(pn_lat) >= (Math.abs(pn_lon)))){
        if(Math.abs(nn_lat) <= (Math.abs(nn_lon))){
            if(nn_lon <= 0){
                document.getElementById("direction").src="assets/turn_right.png";
            }else{
                document.getElementById("direction").src="assets/turn_left.png";
            }
        }else{
            document.getElementById("direction").src="assets/go_straight.png";
        }
    }else if(pn_lat > 0 && (Math.abs(pn_lat) >= (Math.abs(pn_lon)))){
        if(Math.abs(nn_lat) <= (Math.abs(nn_lon))){
            if(nn_lon <= 0){
                document.getElementById("direction").src="assets/turn_left.png";
            }else{
                document.getElementById("direction").src="assets/turn_right.png";
            }
        }else{
            document.getElementById("direction").src="assets/go_straight.png";
        }
    }else if(pn_lon <= 0 && (Math.abs(pn_lon) >= (Math.abs(pn_lat)))){
        if(Math.abs(nn_lon) <= (Math.abs(nn_lat))){
            if(nn_lat <= 0){
                document.getElementById("direction").src="assets/turn_left.png";
            }else{
                document.getElementById("direction").src="assets/turn_right.png";
            }
        }else{
            document.getElementById("direction").src="assets/go_straight.png";
        }
    }else if(pn_lon > 0 && (Math.abs(pn_lon) >= (Math.abs(pn_lat)))){
        if(Math.abs(nn_lon) <= (Math.abs(nn_lat))){
            if(nn_lat <= 0){
                document.getElementById("direction").src="assets/turn_right.png";
            }else{
                document.getElementById("direction").src="assets/turn_left.png";
            }
        }else{
            document.getElementById("direction").src="assets/go_straight.png";
        }
        }
    }
}

function destinationLevel(){
    var i = index_path;
    while(true){
        if(!(path[i+1].startsWith("stair"))){
            index_path = i;

            var location_query = getLocationByName(path[index_path])[0];

            if(startFloor < location_query.floor){
                document.getElementById("levelText").textContent = "กรุณาขึ้นไปที่ชั้น " + location_query.floor;
                document.getElementById("stairIMG").src="assets/go_up.png"
            }else{
                document.getElementById("levelText").textContent = "กรุณาลงไปที่ชั้น " + location_query.floor;
                document.getElementById("stairIMG").src="assets/go_down.png"
            }
            break;

        }
        i++;
    }
}

function finishStair(){
    $("#popupStair").popup("close");
    startFloor = getLocationByName(path[index_path])[0].floor
    //index_path++;
    stairStatus = false;
    nextModel();
}

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
    var categorySelect = $("select#category");
    categorySelect[0].selectedIndex = 0;
    categorySelect.selectmenu("refresh");
    var floorSelect = $("select#floor");
    floorSelect[0].selectedIndex = 0;
    floorSelect.selectmenu("refresh");
    //AR.platform.sendJSONObject({action: "sendState", state: "home"});

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

var placeIMG_index = 1;
function seePlace(){
    placeIMG_index = 1;
    $.ajax({
            url:"assets/place/" +path[index_path]+ "_" + placeIMG_index +".jpg",
            type:'HEAD',
            error: function()
            {
                document.getElementById("next_imgDiv").style.display = "none";
                document.getElementById("previous_imgDiv").style.display = "none";
                document.getElementById("placeIMG").src="assets/place/No_Image.jpg";
            },
            success: function()
            {
                document.getElementById("next_imgDiv").style.display = "block";
                document.getElementById("previous_imgDiv").style.display = "block";
                document.getElementById("placeIMG").src="assets/place/" +path[index_path]+ "_" + placeIMG_index +".jpg";
            }
    });


    $("#popupPlace").popup("open");
    $("#popupPlace").popup('reposition', 'positionTo: window');
    AR.platform.sendJSONObject({action: "sendState", state: "seePlace"});
}

function closePlace(){
    $("#popupPlace").popup("close");
    AR.platform.sendJSONObject({action: "sendState", state: "navigate"});
}

function checkSeePlaceButton(){
    if(imageExists("assets/place/" +path[index_path]+ "_" + (placeIMG_index - 1) +".jpg")){
        document.getElementById("previous_img").disabled = false;
    }else{
        document.getElementById("previous_img").disabled = true;
    }

    if(imageExists("assets/place/" +path[index_path]+ "_" + (placeIMG_index + 1) +".jpg")){
        document.getElementById("next_img").disabled = false;
    }else{
        document.getElementById("next_img").disabled = true;
    }
}

function nextIMG(){

    $.ajax({
        url:"assets/place/" +path[index_path]+ "_" + (placeIMG_index + 1) +".jpg",
        type:'HEAD',
        error: function()
        {
            placeIMG_index = 1;
            document.getElementById("placeIMG").src="assets/place/" +path[index_path]+ "_" + placeIMG_index +".jpg";
        },
        success: function()
        {
            placeIMG_index++;
            document.getElementById("placeIMG").src="assets/place/" +path[index_path]+ "_" + placeIMG_index +".jpg";
        }
    });


    //checkSeePlaceButton();
}

function previousIMG(){
    $.ajax({
        url: "assets/place/" +path[index_path]+ "_" + (placeIMG_index - 1) +".jpg",
        type:'HEAD',
        error: function()
        {
            $.ajax({
                url:"assets/place/" +path[index_path]+ "_4.jpg",
                type:'HEAD',
                error: function()
                {
                    $.ajax({
                        url:"assets/place/" +path[index_path]+ "_3.jpg",
                        type:'HEAD',
                        error: function()
                        {
                            $.ajax({
                                url:"assets/place/" +path[index_path]+ "_2.jpg",
                                type:'HEAD',
                                error: function()
                                {
                                    placeIMG_index = 1;
                                    document.getElementById("placeIMG").src="assets/place/" +path[index_path] + "_1.jpg";
                                },
                                success: function()
                                {
                                    placeIMG_index = 2;
                                    document.getElementById("placeIMG").src="assets/place/" +path[index_path] + "_2.jpg";
                                }
                        });
                        },

                        success: function()
                        {
                            placeIMG_index = 3;
                            document.getElementById("placeIMG").src="assets/place/" +path[index_path] + "_3.jpg";
                        }
                        });

                },
                    success: function()
                    {
                        placeIMG_index = 4;
                        document.getElementById("placeIMG").src="assets/place/" +path[index_path] + "_4.jpg";
                    }
                });

        },
        success: function()
        {
            placeIMG_index--;
            document.getElementById("placeIMG").src="assets/place/" +path[index_path] + "_" + placeIMG_index +".jpg";
        }
    });

    //checkSeePlaceButton();
}

function imageExists(image_url){
    $.ajax({
        url:image_url,
        type:'HEAD',
        error: function()
        {
            return false;
        },
        success: function()
        {
            return true;
        }
    });
}

function openMap(){
    window.open("maps://maps.google.com/maps?daddr=13.821619,100.513588&amp;ll=");
}

var index_path = 1;
var finishNav = false;
var stairStatus = false;
function nextModel(){
    //checkDirection();
    index_path++;
    if(index_path >= path.length){
        index_path = path.length - 1;
        finishNav = true;
    }else{

        if(World.loc_name.startsWith("บันได") && path[index_path].startsWith("stair")){

            destinationLevel();

            $("#popupStair").popup("open");
            $("#popupStair").popup('reposition', 'positionTo: window');
            stairStatus = true;



        }else{
            var location_query = getLocationByName(path[index_path])[0];
            console.log(location_query);
            World.lat_target = location_query.lat;
            World.long_target = location_query.long;
            World.loc_name = location_query.name;
            AR.platform.sendJSONObject({action: "setTarget", lat: World.lat_target, lon: World.long_target});
            destroyObject();
        }
    }

}

function previousModel(){
    index_path--;
    if(index_path < 1){
        index_path = 1;
    }
        var location_query = getLocationByName(path[index_path])[0];
        World.lat_target = location_query.lat;
        World.long_target = location_query.long;
        World.loc_name = location_query.name;
        destroyObject();
}

function inside_area(){
    $("#popupOutsideArea").popup("close")
}

function outside_area(){
    $("#popupOutsideArea").popup("open")
    $("#popupOutsideArea").popup('reposition', 'positionTo: window');
}



/*
    Set a custom function where location changes are forwarded to. There is also a possibility to set
    AR.context.onLocationChanged to null. In this case the function will not be called anymore and no further
    location updates will be received.
*/
AR.context.onLocationChanged = World.locationChanged;