// Store our API endpoint as queryUrl
var queryUrl = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2020-08-24&endtime=" +
"2020-09-01";

var link1 ="static/data/earthquakes.json";
var link2 = "static/data/PB2002_plates.json";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
	createFeatures(data.features);
	//console.log(data.features);
});

function createFeatures(earthquakeData){
	function eqLabels(feature, layer) {
		layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + Date(feature.properties.time) + "</p><hr><p>" + "Magnitude: " + feature.properties.mag + "</p>");
		
	}

	var earthquakes = L.geoJSON(earthquakeData, {
		pointToLayer: function (feature, latlng) {
		
				if (feature.properties.mag > 5){
					color = "#cc0000";
				}else if (feature.properties.mag > 4){
					color = "#cc6600";
				}else if (feature.properties.mag > 3){
					color = "#ff8000";
				}else if (feature.properties.mag > 2){
					color = "#ffff33";
				}else if (feature.properties.mag > 1){
					color = "#ffff66";
				}else if(feature.properties.mag < 1) { 
					color = "#b2ff66";
				}
				radius = feature.properties.mag;
			
			return L.circleMarker(latlng, {radius: radius, color: color, fillOpacity: 0.75, fillcolor: color })
		}, onEachFeature: eqLabels
	});
	createMap(earthquakes);
}	

function createMap(earthquakes) {
	// Define streetmap and darkmap layers
	var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
	  tileSize: 512,
	  maxZoom: 18,
	  zoomOffset: -1,
	  id: "mapbox/streets-v11",
	  accessToken: API_KEY
	});
	var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
	  maxZoom: 18,
	  id: "dark-v10",
	  accessToken: API_KEY
	});

	var satmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "satellite-v9",
		accessToken: API_KEY
	  });
	var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
		attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
		maxZoom: 18,
		id: "outdoors-v9",
		accessToken: API_KEY
	});

	// Define a baseMaps object to hold our base layers
	var baseMaps = {
	  "Street Map": streetmap,
	  "Dark Map": darkmap,
	  "Satellite Map": satmap,
	  "Outdoors Map": outdoors
	};
	var overlayMaps = {
		Earthquakes: earthquakes
	};
	// Create a new map
	var myMap = L.map("map", {
	  center: [
	    30, 0
	  ],
	  zoom: 3,
	  layers: [satmap, earthquakes]
	});
	// Create a layer control containing our baseMaps
	// Be sure to add an overlay Layer containing the earthquake GeoJSON
	L.control.layers(baseMaps, overlayMaps, {
	  collapsed: false
	}).addTo(myMap);
	
	


	function getColor(d) {
		return d > 5 ? '#CC0000' :
			   d > 4  ? '#CC6600' :
			   d > 3  ? '#FF8000' :
			   d > 2  ? '#FFFF33' :
			   d > 1   ? '#FFFF66' :
			   d > 0   ? '#B2FF66' :
						 '#FFEDA0';
	}

	var legend = L.control({ position: 'bottomright' })
	legend.onAdd = function (map) {
	  var div = L.DomUtil.create('div', 'info legend')
	  var grades = [0,1, 2, 3, 4, 5];
  
	  // Add min & max
	for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
		return div;
	
	}
	legend.addTo(myMap);


	var tectonics = d3.json(link2, function(data){
		L.geoJson(data,{
			style: function(feature){
				return {
					color: "red",
					weight: 0.5,
					fillOpacity: 0
				}
			}
		}).addTo(myMap)
	});
	
}