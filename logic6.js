// Store our API endpoint inside queryUrl
var queryUrl2016 = "http://localhost:5000/2016";
var queryUrl2008 = "http://localhost:5000/2008";
var queryUrl2012 = "http://localhost:5000/2012";



var districts2008 = new L.LayerGroup();


d3.json(queryUrl2008, function (err,data) {
    if(err) console.log("error fetching data")
    L.geoJSON(data.Feature, {

        style: function (feature) {
            return {
                fillColor: Color(feature.properties.Result),
                fillOpacity: 0.8,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3>" + feature.properties.District +
                "</h3> <hr> <h4>" + feature.properties.Result + 
                "</h4>");
        }
    }).addTo(districts2008);
    createMap(districts2008);
});

var districts2012 = new L.LayerGroup();


d3.json(queryUrl2012, function (err,data) {
    if(err) console.log("error fetching data")
    L.geoJSON(data.Feature, {

        style: function (feature) {
            return {
                fillColor: Color(feature.properties.Result),
                fillOpacity: 0.8,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3>" + feature.properties.District +
                "</h3> <hr> <h4>" + feature.properties.Result + 
                "</h4>");
        }
    }).addTo(districts2012);
});

var districts2016 = new L.LayerGroup();


d3.json(queryUrl2016, function (err,data) {
    if(err) console.log("error fetching data")
    L.geoJSON(data.Feature, {

        style: function (feature) {
            return {
                fillColor: Color(feature.properties.Result),
                fillOpacity: 0.8,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            layer.bindPopup(
                "<h3>" + feature.properties.District +
                "</h3> <hr> <h4>" + feature.properties.Result + 
                "</h4>");
        }
    }).addTo(districts2016);  
});    
var overlays = {
    "2008": districts2008,
    "2012": districts2012,
    "2016": districts2016,
}    

function Color(Result) {
  if (Result > 90) {
      return '#a50f15'
  } else if (Result > 80) {
      return '#de2d26'
  } else if (Result > 70) {
      return '#fb6a4a'
  } else if (Result > 60) {
      return '#fc9272'
  } else if (Result > 50) {
      return '#fcbba1'
  } else if (Result > 40) {
    return '#9ecae1'
  } else if (Result > 30) {
    return '#6baed6'  
  } else if (Result > 20) {
    return '#3182bd'   
  }  else {
      return '#08519c'
  }
};


function createMap() {

  // Define lightmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openlightmap.org/\">Openlightmap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });

//   var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openlightmap.org/\">Openlightmap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "mapbox.dark",
//     accessToken: API_KEY
//   });

  // Define a baseMaps object to hold our base layers
//   var baseMaps = {
//     "Light Map": lightmap,
//     "Dark Map": darkmap
//   };


  // Create our map, giving it the lightmap and districts layers to display on load
  var myMap = L.map("map", {
    center: [
      34.325417181527584,-100.79244631426445
    ],
    zoom: 4,
    layers: [lightmap, districts2008]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(overlays).addTo(myMap);

}