let mymap = L.map('mapid', {
    zoomControl: true
})

mymap.setView([28.7041, 77.1025], 4)
let myIcon = new L.Icon({
    iconUrl: 'map-marker-alt-solid.svg',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [50, 82],
    iconAnchor: [25, 71],
    popupAnchor: [1, -54],
    shadowSize: [41, 41]
});

// navigator.geolocation.getCurrentPosition((pos) => {
//     mymap.setView([pos.coords.latitude, pos.coords.longitude], 9);
//     let marker = L.marker([pos.coords.latitude, pos.coords.longitude], { icon: myIcon }).addTo(mymap).bindPopup(`<div class="popup"><p>This is location<br>Latitude&nbsp;${pos.coords.latitude}&nbsp;Longitude:${pos.coords.longitude}</div>`);
//     L.circle([pos.coords.latitude, pos.coords.longitude], 500, {
//         color: 'blue',
//         fillOpacity: 1
//     }).addTo(mymap).bindPopup()

// })

function locateMe() {
    located = mymap.locate({ setView: true, maxZoom: 2 });
}

L.tileLayer('https://api.mapbox.com/styles/v1/{affected}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    affected: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

}).addTo(mymap);

function styleIndia(feature) {

    return {
        fillColor: getColor(feature.properties.coronaCases),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    }
}

function getColor(affected) {
    console.log(affected)
    return affected >= 12000 ? '#ff1414' :

        affected >= 10000 ? '#e30b0b' :
        affected >= 8000 ? '#e3240b' :
        affected >= 6000 ? '#e3360b' :
        affected >= 4000 ? '#e3450b' :
        affected >= 2000 ? '#e35e0b' :
        affected >= 1000 ? '#e3a60b' :
        affected >= 900 ? '#e3b80b' :
        affected >= 500 ? '#e3d80b' :
        affected >= 200 ? '#d3e01b' :
        affected >= 100 ? '#adc447' :
        affected >= 50 ? '#a5c922' :
        affected >= 10 ? '#9dc922' :
        affected >= 1 ? '#699d00' : '#00b300';
}
axios.get('assamgeo.json').then((geoJson) => {
    let data = geoJson.data;


    // axios.get('https://www.mohfw.gov.in/data/data.json').then((covidData) => {

    //     geoJson.data.features.forEach((geoJsonres) => {
    //         covidData.data.forEach((element) => {
    //             if (element.state_name.toLowerCase() === geoJsonres.properties.STATE.toLowerCase()) {
    //                 geoJsonres.properties.coronaCases = element.positive;
    //                 geoJsonres.properties.deaths = element.death
    //             }
    //         })

    //     })
    let statesData = data;
    let geojson = L.geoJson(statesData, { style: styleIndia, onEachFeature: onEachFeature }).addTo(mymap);


    //Interactivity
    function onEachFeature(feature, layer) {
        layer.on({
            mouseover: highlightFeature,
            mouseout: resetHighlight,
            click: zoomToFeature
        });

        layer.bindTooltip(`<div class="tooltipdiv">${layer.feature.properties.STATE}<br>Positive cases:<span class="positive">${feature.properties.coronaCases}</span><br><span class="death">Deaths:${feature.properties.deaths}</span></div></div>`, { className: "tooltip", direction: 'top', interactive: true, offset: L.point({ x: -10, y: -5 }) })
    }

    function highlightFeature(e) {
        let state = e.target;


        state.setStyle({
            weight: 5,
            color: '#fff',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            state.bringToFront();
        }


    }

    function zoomToFeature(e) {
        mymap.fitBounds(e.target.getBounds());

    }

    function resetHighlight(e) {
        geojson.resetStyle(e.target);

    }
})

// Custom Control

let info = L.control();
info.onAdd = function(mymap) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {

    // this._div = L.DomUtil.create('div', 'info');
    this._div.innerHTML = '<h4>Indian Corona Details</h4>' + (props ?
        '<b>' + props.name + '</b><br />' + props.density + ' people / mi<sup>2</sup>' :
        'Hover over a state');
};

info.addTo(mymap);

// });



// let geojson = {
//     "type": "FeatureCollection",
//     "features": [{
//         "type": "Feature",
//         "properties": { "corona": "red" },
//         "geometry": {
//             "type": "Polygon",
//             "coordinates": [
//                 [
//                     [79.3927001953125, 12.942998943409737],
//                     [79.43115234375, 12.843937692841445],
//                     [79.5465087890625, 12.669816747262848],
//                     [79.82391357421875, 12.656417878339736],
//                     [79.87060546875, 12.747516274952726],
//                     [79.87335205078125, 12.88142493762357],
//                     [79.749755859375, 13.03131768257082],
//                     [79.60693359375, 13.058074727480722],
//                     [79.47784423828125, 13.023290004843894],
//                     [79.3927001953125, 12.942998943409737]
//                 ]
//             ]
//         }
//     }]
// }

// L.geoJSON(geojson, {
//     style: function(feature) {
//         if (feature.properties.corona == "red") {
//             feature.setStyle({ color: "red" })
//         }

//     }
// }).addTo(mymap)