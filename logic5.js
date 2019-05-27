// Store our API endpoint inside queryUrl
var queryUrl = "http://localhost:5000/2016";



var districts = new L.LayerGroup();


d3.json(queryUrl, function (err,data) {
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
    }).addTo(districts);
    createMap(districts);
});


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

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openlightmap.org/\">Openlightmap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    "Dark Map": darkmap
  };


  // Create our map, giving it the lightmap and districts layers to display on load
  var myMap = L.map("map", {
    center: [
      34.325417181527584,-100.79244631426445
    ],
    zoom: 4,
    layers: [lightmap, districts]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps).addTo(myMap);

// Create Legend
// var legend = L.control({position: 'bottomright'});

// legend.onAdd = function (map) {

//     var div = L.DomUtil.create('div', 'info legend'),
//         magnitude = [0, 1, 2, 3, 4, 5],
//         labels = [];

//         div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"

//     // loop through our density intervals and generate a label with a colored square for each interval
//     for (var i = 0; i < magnitude.length; i++) {
//         div.innerHTML +=
//             '<i style="background:' + Color(magnitude[i] + 1) + '"></i> ' +
//             magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
//     }

//     return div;
// };

// legend.addTo(myMap);
}