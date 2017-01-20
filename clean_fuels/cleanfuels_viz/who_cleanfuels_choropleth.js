var mapboxAccessToken = "pk.eyJ1IjoiY3N6YyIsImEiOiJjaXkyNjR0eDQwMDFsMnFwZ3Q4OTA2eXBxIn0.3bV0_VPLKW8vxM2Ttxxv3Q";
var map = L.map('map').setView([20, 0], 1.5);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
    id: 'mapbox.light',
}).addTo(map);

//styles
function getColor(d) {
    return d >= 95 ? '#08589e' :
           d > 80 ? '#2b8cbe' :
           d > 60 ? '#4eb3d3' :
           d > 40 ? '#7bccc4' :
           d > 20 ? '#a8ddb5' :
           d > 5  ? '#ccebc5' :
                    '#f0f9e8' ;
}


function style(feature) {
    return {
        fillColor: getColor(feature.properties.value),
        weight: 1.5,
        opacity: 1,
        color: '#D3D3D3',
        dashArray: '',
        fillOpacity: 0.7
    };
}
//end styles

var geojson;

//start listeners
function highlightFeature(e) {
    var layer = e.target;

    info.update(layer.feature.properties);

    layer.setStyle({
        weight: 2,
        color: '#666',
        fillOpacity: 0.85
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
}

function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
//end listeners

//add listeners to state layers
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}


geojson = L.geoJson(cleanFuelsData, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

//adding custom hover-over info control
var info = L.control();

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    if (typeof(props) == 'undefined' ||
        (props && typeof(props.value) == 'undefined')) {
        var value = 'unknown ';
    } else if (props.value == '95') {
        var value = '>95';
    } else if (props.value =='5') {
        var value = '<5';
    } else {
        value = props.value;
    }

    this._div.innerHTML = '<h4>Population with Primary Reliance on Clean Fuels (%)</h4>' +  (props ?
        '<b>' + props.name + '</b><br />' + value + '% of population</sup>'
        : 'Hover over a country');
};

info.addTo(map);

//adding legend
var legend = L.control({position: 'bottomleft'});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [-1, 5, 20, 40, 60, 80, 95],
        labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            (grades[i] + 1) + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+ <br><br> <b>% population</b>');
    }

    return div;
};

legend.addTo(map);
