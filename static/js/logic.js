// Store our API endpoint as queryUrl (using past 30 days and 2.5+).
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function (data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

// Function to determine the color of the marker based on depth
function getColor(depth) {
  // Define the main and max depth values for scaling (you can adjust these)
  const minDepth = 0;
  const maxDepth = 42;

  // Use d3's interpolateYlOrRd to get a color between yellow and red
  const scale = d3.scaleLinear()
                  .domain([minDepth, maxDepth])
                  .range([0, 1]);
  
  return d3.interpolateYlOrRd(scale(depth));
}

function createFeatures(earthquakeData) {
    // Function to determine the size of the marker based on magnitude
    function getSize(magnitude) {
        return magnitude * magnitude; // Scale size as required
    }
  
    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Location: (${feature.geometry.coordinates[0]}, ${feature.geometry.coordinates[1]})<br>Depth: ${feature.geometry.coordinates[2]} km<br>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getSize(feature.properties.mag), // Size of the marker
                fillColor: getColor(feature.geometry.coordinates[2]), // Color based on depth
                color: "#000", // Border color
                weight: 1, // Border weight
                opacity: 1,
                fillOpacity: 0.7 // Fill opacity
            });
        },
        onEachFeature: onEachFeature
    });

    // Send our earthquakes layer to the createMap function.
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });