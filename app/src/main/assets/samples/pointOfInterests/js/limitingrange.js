// implementation of AR-Experience (aka "World")
var World = {

	//  user's latest known location, accessible via userLocation.latitude, userLocation.longitude, userLocation.altitude
	userLocation: null,

	// you may request new data from server periodically, however: in this sample data is only requested once
	isRequestingData: false,

	// true once data was fetched
	initiallyLoadedData: false,

	// different POI-Marker assets
	markerDrawable_idle: null,
	markerDrawable_selected: null,
	markerDrawable_directionIndicator: null,

	// list of AR.GeoObjects that are currently shown in the scene / World
	markerList: [],

	//global checker for filter functionality
	fliterEnable: false,
	cuisineType: [],

	// The last selected marker
	currentMarker: null,

	locationUpdateCounter: 0,
	updatePlacemarkDistancesEveryXLocationUpdates: 10,

	// called to inject new POI data
	loadPoisFromJsonData: function loadPoisFromJsonDataFn(poiData) {

		// show radar & set click-listener
		PoiRadar.show();
		$('#radarContainer').unbind('click');
		$("#radarContainer").click(PoiRadar.clickedRadar);

		// empty list of visible markers

		World.markerList = [];

		// start loading marker assets
		World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
		World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
		World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");

		// loop through POI-information and create an AR.GeoObject (=Marker) per POI
		var count = 0;
		if(World.filterEnable) {
			AR.context.destroyAll();
			PoiRadar.show();
			World.markerDrawable_idle = new AR.ImageResource("assets/marker_idle.png");
            World.markerDrawable_selected = new AR.ImageResource("assets/marker_selected.png");
            World.markerDrawable_directionIndicator = new AR.ImageResource("assets/indi.png");
			count = poiData.length;
		}else {
			count = 10;
		}
		for (var currentPlaceNr = 0; currentPlaceNr < count; currentPlaceNr++) {
			//console.log("Printing for loop number : " + currentPlaceNr);

			var singlePoi = {
				"latitude": parseFloat(poiData[currentPlaceNr].latitude),
				"longitude": parseFloat(poiData[currentPlaceNr].longitude),
				"altitude": parseFloat(poiData[currentPlaceNr].altitude),
				"title": poiData[currentPlaceNr].name,
				"description": poiData[currentPlaceNr].description,
				"cuisine": poiData[currentPlaceNr].cuisine,
				"accessible_wheelchair": (poiData[currentPlaceNr].accessible_wheelchair),
                "alcohol_bar": (poiData[currentPlaceNr].alcohol_bar),
                "rating": (poiData[currentPlaceNr].rating),
                "price": (poiData[currentPlaceNr].price),
                "tel": (poiData[currentPlaceNr].tel),
                "distance": parseInt(poiData[currentPlaceNr].distance)
			};

			World.markerList.push(new Marker(singlePoi));
		}

		// updates distance information of all placemarks
		//World.updateDistanceToUserValues();

		World.updateStatusMessage(currentPlaceNr + ' places loaded');

		// set distance slider to 100%
		$("#panel-distance-range").val(100);
		$("#panel-distance-range").slider("refresh");

	},

	// sets/updates distances of all makers so they are available way faster than calling (time-consuming) distanceToUser() method all the time
	updateDistanceToUserValues: function updateDistanceToUserValuesFn() {
		for (var i = 0; i < World.markerList.length; i++) {
			World.markerList[i].distanceToUser = World.markerList[i].markerObject.locations[0].distanceToUser();
		}
	},

	// updates status message shon in small "i"-button aligned bottom center
	updateStatusMessage: function updateStatusMessageFn(message, isWarning) {

		var themeToUse = isWarning ? "e" : "c";
		var iconToUse = isWarning ? "alert" : "info";

		$("#status-message").html(message);
		$("#popupInfoButton").buttonMarkup({
			theme: themeToUse
		});
		$("#popupInfoButton").buttonMarkup({
			icon: iconToUse
		});
	},

	// location updates, fired every time you call architectView.setLocation() in native environment
	locationChanged: function locationChangedFn(lat, lon, alt, acc) {

		console.log("Inside limiting range: loncationChanged function");
		// store user's current location in World.userLocation, so you always know where user is
		World.userLocation = {
			'latitude': lat,
			'longitude': lon,
			'altitude': alt,
			'accuracy': acc
		};

		// request data if not already present
		if (!World.initiallyLoadedData) {
			console.log("Calling requestDataFromServer function");
			World.requestDataFromServer(lat, lon);
			World.initiallyLoadedData = true;
		} else if (World.locationUpdateCounter === 0) {
			// update placemark distance information frequently, you max also update distances only every 10m with some more effort
			//World.updateDistanceToUserValues();
		}

		// helper used to update placemark information every now and then (e.g. every 10 location upadtes fired)
		World.locationUpdateCounter = (++World.locationUpdateCounter % World.updatePlacemarkDistancesEveryXLocationUpdates);
	},

	onPoiDirectionsClicked: function onPoiDirectionsClickedFn() {
    	var currentMarker = World.currentMarker;
    	var architectSdkUrl = "architectsdk://poidirection?latitude=" + encodeURIComponent(currentMarker.poiData.latitude) + "&longitude=" + encodeURIComponent(currentMarker.poiData.longitude);
    		/*The urlListener of the native project intercepts this call and parses the arguments.
    			This is the only way to pass information from JavaSCript to your native code.
    			Ensure to properly encode and decode arguments.
    			Note: you must use 'document.location = "architectsdk://...' to pass information from JavaScript to native.
    			! This will cause an HTTP error if you didn't register a urlListener in native architectView !
    	*/
    	document.location = architectSdkUrl;
    },

	onPoiContactPhoneClicked: function onPoiContactPhoneClickedFn() {
        var currentMarker = World.currentMarker;
        var telephoneString = currentMarker.poiData.tel;
        console.log("Phone : " + telephoneString);
        var architectSdkUrl = "architectsdk://poitelephone?telephone=" + encodeURIComponent(telephoneString);

        document.location = architectSdkUrl;
    },

	// fired when user pressed maker in cam
	onMarkerSelected: function onMarkerSelectedFn(marker) {
		World.currentMarker = marker;
		// update panel values
		$("#poi-detail-title").html(marker.poiData.title);
		$("#poi-detail-description").html(marker.poiData.description);
		if(marker.poiData.cuisine) {
			var cuisineString = "";
			for(var i=0; i<marker.poiData.cuisine.length; i++) {
				cuisineString = cuisineString + marker.poiData.cuisine[i] + "<br> &#09";
			}
			$("#poi-cuisine-details").html(cuisineString);
		}else {
			$("#poi-cuisine-details").html("NA");
		}
		if(marker.poiData.rating) {
			$("#poi-rating-details").html(marker.poiData.rating);
		}else {
			$("#poi-rating-details").html("NA");
		}
		if(marker.poiData.price) {
			var dollarString = "";
			for(var i=0; i< marker.poiData.price; i++) {
				dollarString = dollarString + "$";
			}
			$("#poi-price-details").html("<b color='red'>" + dollarString + "</b>");
		}else {
			$("#poi-price-details").html("NA");
		}
		if(marker.poiData.tel){
			$("#poi-telephone-details").html(marker.poiData.tel);
		}else {
			$("#poi-telephone-details").html("NA");
		}
		if(marker.poiData.tel){
			$("#poi-telephone-details").html(marker.poiData.tel);
		}else {
			$("#poi-telephone-details").html("NA");
		}
		if(marker.poiData.accessible_wheelchair){
			$('#wheelchair-image').show();
		}else {
			$('#wheelchair-image').hide();
		}
		if(marker.poiData.alcohol_bar) {
			/*var barString = "<img src='assets/bar.png'/>";
			$('#directions-button').before(barString);*/
			$('#bar-image').show();
		}else {
			$('#bar-image').hide();
		}
		//$('#directions-button').before(imgString + "<br>");
		if(marker.poiData.distance){
			$("#poi-detail-distance").html(marker.poiData.distance + " meters");
			//$("#poi-details").append("<img src='assets/wheelchair.png'/>");
		}else {
			$("#poi-detail-distance").html("NA");
		}

		// show panel
		$("#panel-poidetail").panel("open", 123);

		$( ".ui-panel-dismiss" ).unbind("mousedown");

		$("#panel-poidetail").on("panelbeforeclose", function(event, ui) {
			World.currentMarker.setDeselected(World.currentMarker);
		});
	},

	// screen was clicked but no geo-object was hit
	onScreenClick: function onScreenClickFn() {
		// you may handle clicks on empty AR space too
	},

	handlePanelMovements: function handlePanelMovementsFn() {

		$("#panel-distance").on("panelclose", function(event, ui) {
			$("#radarContainer").addClass("radarContainer_left");
			$("#radarContainer").removeClass("radarContainer_right");
			PoiRadar.updatePosition();
		});

		$("#panel-distance").on("panelopen", function(event, ui) {
			$("#radarContainer").removeClass("radarContainer_left");
			$("#radarContainer").addClass("radarContainer_right");
			PoiRadar.updatePosition();
		});
	},

	// display range slider
	showRange: function showRangeFn() {
		if (World.markerList.length > 0) {
			$('#cuisine_type_value').html("All");

			$('#cuisine_type').change(function() {

            	var myCuisineList = $('#cuisine_type').val();
            	World.cuisineType = myCuisineList;

            	var cuisinesStr = "";

            	for(var i = 0 ; i < myCuisineList.length ; i ++){

            		cuisinesStr += myCuisineList[i] + " ";
            	}
            	$("#cuisine_type_value").html(cuisinesStr);
            	World.filterEnable = true;
            	World.initiallyLoadedData = false;
            	World.locationChanged(World.userLocation.latitude, World.userLocation.longitude, World.userLocation.altitude, World.userLocation.accuracy);

            });


			//World.updateRangeValues();
			World.handlePanelMovements();

			// open panel
			$("#panel-distance").trigger("updatelayout");
			$("#panel-distance").panel("open", 1234);
		} else {

			// no places are visible, because the are not loaded yet
			World.updateStatusMessage('No places available yet', true);
		}
	},

	getPlacesFromJSON: function getPlacesFromJSONFn(placesJson) {
        	var poiData = [];

        	for(var i=0;i<placesJson.response.data.length; i++) {
        		poiData.push({
        			"latitude": (placesJson.response.data[i].latitude),
        			"longitude": (placesJson.response.data[i].longitude),
        			"description": (placesJson.response.data[i].address),
        			"altitude": (100.0),
        			"name": (placesJson.response.data[i].name),
        			"cuisine": (placesJson.response.data[i].cuisine),
        			"accessible_wheelchair": (placesJson.response.data[i].accessible_wheelchair),
        			"alcohol_bar": (placesJson.response.data[i].alcohol_bar),
					"rating": (placesJson.response.data[i].rating),
					"price": (placesJson.response.data[i].price),
					"tel": (placesJson.response.data[i].tel),
					"distance": (placesJson.response.data[i].$distance)

        		});

        	}
        	//World.globalPoiData = poiData;
        	World.loadPoisFromJsonData(poiData);

        },

	// request POI data
	requestDataFromServer: function requestDataFromServerFn(lat, lon) {

		// set helper var to avoid requesting places while loading
		World.isRequestingData = true;
		World.updateStatusMessage('Requesting places from web-service');

		var serverURL = "";
		var filterString = "";
		var finalFilterString = "";

		if(World.filterEnable) {
			console.log("Inside filter Enable");
			//var cuisineName = $.("#cusine_type").val();
			var cuisineName = World.cuisineType;
			console.log("Printing Cusine Name : " + World.cuisineType[0]);
			console.log("Type of cuisineName : " + typeof cuisineName);
			console.log("Type of normalString : " + typeof "All");
			if(World.cuisineType[0].localeCompare("All") == 0) {
				filterString = "filters={}";
			}else {
				// ["Chinese","American","Mexican"]
				var finalString = "\"";
				for(var i=0; i<cuisineName.length; i++) {
					finalString = finalString + cuisineName[i]  + "\",\"";
				}
				finalFilterString = finalString.substring(0,finalString.length-2);
			}
			filterString = "filters={\"cuisine\":{\"$includes_any\":[" + finalFilterString  + "]}}";
		}else {
			filterString = "filters={}";
		}
		serverURL = "http://api.v3.factual.com/t/restaurants-us?" + filterString + "&sort=$distance&geo={\"$circle\":{\"$center\":[" + lat + "," + lon + "],\"$meters\":1000}}&KEY=8vN9Nis4h0kmqr29o6dtn1JrGd8bvTeyWzIxbBYx";

        console.log("Printing my server url : " + serverURL);
        var outputValue = $.getJSON(serverURL, function(data) {
        	World.getPlacesFromJSON(data);
        })
			.error(function(err) {
				World.updateStatusMessage("Invalid web-service response.", true);
				World.isRequestingData = false;
			})
			.complete(function() {
				World.isRequestingData = false;
			});
	},

};


/* forward locationChanges to custom function */
AR.context.onLocationChanged = World.locationChanged;

/* forward clicks in empty area to World */
AR.context.onScreenClick = World.onScreenClick;
