  var myMap = L.map("map", {
    center: [
      34.325417181527584,-100.79244631426445
    ],
    zoom: 4,
  });

  // Define lightmap and darkmap layers
  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openlightmap.org/\">Openlightmap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY
  });


  lightmap.addTo(myMap)

// var elections = new L.LayerGroup();
test = 'http://localhost:5000/2016'

d3.json(test,function(data){
    buildDistricts(data)
  })
  function getColor(result){
    var step = 100 / 19
    colorScale = {
        0: '#00008b',
        1: '#392098',
        2: '#583aa5',
        3: '#7255b2',
        4: '#8b6fc0',
        5: '#a38acc',
        6: '#baa7d9',
        7: '#d1c4e6',
        8: '#e8e1f3',
        9: '#ffffff',
        10: '#f7e4e0',
        11: '#eec9c1',
        12: '#e3afa3',
        13: '#d89686',
        14: '#cb7c6a',
        15: '#bc634f',
        16: '#ad4835',
        17: '#9d2d1c',
        18: '#8b0000'
    }
    var valScale = round(result / step)
    return colorScale[valScale]
  }

  var districts = L.geoJSON(data,{
      "style":{
          "color":getColor(data['properties']['Result']),
          "fillColor":getColor(data['properties']['Result']),
          "opacity":0.75
      }
  })

  districts.addTo(myMap);

L.geoJSON(test, {
  style: function (feature) {
    return {
        fillColor: Color(feature.properties.Result),
        fillOpacity: 0.7,
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
}).addTo(elections)
  .addTo(myMap);
