// Store our API endpoint as queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var link2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";

// Perform a GET request to the query URL
const earthquake = d3.json(queryUrl, function(earthquakeData) {
	 d3.json(link2, function(tectonicData){
	createFeatures(earthquakeData.features, tectonicData.features);
	})
})



function createFeatures(earthquakeDataFeatures, tectonicDataFeatures){
	function eqLabels(feature, layer) {
		layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + Date(feature.properties.time) + "</p><hr><p>" + "Magnitude: " + feature.properties.mag + "</p>");
	}
	function tecLables(feature, layer ){ 
		layer.bindPopup("<h3>" + feature.properties.Name + "</h3><h4> PlateA: " + feature.properties.PlateA + "<br>PlateB:" + feature.properties.PlateB +"</h4> <hr><p>" + feature.properties.Source + "</p>"); 
	}
	var color="";
	var earthquakes = L.geoJSON(earthquakeDataFeatures, {
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
				radius = feature.properties.mag *20000;
			
			return L.circle(latlng, {radius: radius, color: color, fillOpacity: 0.75, fillcolor: color })
		}, onEachFeature: eqLabels
	});
	var tectonics = L.geoJSON(tectonicDataFeatures, {
		style: function(feature){
		 return {color: "orange",
				 weight: 2};
		},
		onEachFeature: tecLables
	});
	createMap(earthquakes, tectonics);
}



function createMap(earthquakes, tectonics) {
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
		Earthquakes: earthquakes,
		Tectonics: tectonics
	};
	// Create a new map
	var myMap = L.map("map", {
	  center: [
	    30, 0
	  ],
	  zoom: 3,
	  layers: [satmap, earthquakes, tectonics]
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

	
}
