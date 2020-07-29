let display = document.getElementById("display");
let map = L.map('mapid', {
    center: [12.9709931, 80.1938839],
    zoom: 13
});
const route = document.getElementById("route");
L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?access_token=pk.eyJ1IjoicHJrczE4IiwiYSI6ImNrYWhyMTM0ZTAxYm0zMG1mdTBxZncyaWIifQ.vlicc7a_Nod5KQS9CKmOng', {

    attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',

}).addTo(map)


axios.get('./hotspots.geojson').then((res) => {
    let raw = res.data;
    let geojson = L.geoJSON(raw).addTo(map)
    map.fitBounds(geojson.getBounds())
})


let myIcon = new L.Icon({
    iconUrl: 'map-marker-alt-solid.svg',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12.5, 20.5],
    popupAnchor: [1, -54],
    shadowSize: [41, 41]
});
// const provider = new GeoSearch.OpenStreetMapProvider();
// const searchControl = new GeoSearchControl({
//     provider: provider,
//     style: 'bar',
//     autoComplete: true,
//     autoCompleteDelay: 250
// })

let options1 = {
    url: 'https://api.geocode.earth/v1',
    focus: true,
    expanded: true,
    position: 'topright',
    focus: true,
    placeholder: "From..",
    polygonIcon: true
}
let options2 = {
    url: 'https://api.geocode.earth/v1',
    focus: true,
    expanded: true,
    position: 'topright',
    placeholder: "To..",

}
let from = L.control.geocoder('ge-6071d21825e9421c', options1).addTo(map)
let to = L.control.geocoder('ge-6071d21825e9421c', options2).addTo(map)
let from_lat;
let from_lng;
let to_lat;
let to_lng;
from.on('select', (e) => {
    from_lat = e.latlng.lat;
    from_lng = e.latlng.lng;

    let center = e.latlng;
    console.log(e)


    let circle = L.circle(center, { radius: 200, interactive: false }).addTo(map)

    // let from_place = L.geoJSON(geoJsonFrom, { style: () => { color: "#fff" } }).addTo(map);


})
to.on('select', (e) => {
    to_lat = e.latlng.lat;
    to_lng = e.latlng.lng;
    let center = e.latlng;
    let circle = L.circle(center, { radius: 200, interactive: false }).addTo(map)

})

function styleLine(feature) {
    feature.properties.color = "#fff"
    return {
        color: "#29c3c3",
        weight: 7
    }
}

route.addEventListener("click", () => {

    axios.get(`https://api.mapbox.com/directions/v5/mapbox/cycling/${from_lng},${from_lat};${to_lng},${to_lat}?overview=full&geometries=geojson&steps=true&voice_instructions=true&banner_instructions=true&voice_units=imperial&waypoint_names=Home;Work&access_token=pk.eyJ1IjoicHJrczE4IiwiYSI6ImNrYTllZW05ejBtNWMzMG10emV4OXh1dTEifQ.14HrBLb2BQ-TewaYCEfGoA`, {
        responseType: 'json'
    }).then((res) => {
        let rawjson = res.data;
        let route = rawjson.routes[0]
        let track = route.geometry.coordinates;
        console.log(res)
        let geoJsonRaw = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: track
            }
        };

        // let layer = L.layerGroup({
        //     "id": "route",
        //     "type": "line",
        //     "source": {
        //         "type": "geojson",
        //         "data": {
        //             "type": "Feature",
        //             "properties": {},
        //             "geometry": track
        //         }
        //     },
        //     "layout": {
        //         "line-join": "round",
        //         "line-cap": "round"
        //     },
        //     "paint": {
        //         "line-color": "#1db7dd",
        //         "line-width": 8,
        //         "line-opacity": 0.8
        //     }
        // });


        let geojson = L.geoJSON(geoJsonRaw, { style: styleLine }).addTo(map)
        map.fitBounds(geojson.getBounds(), { padding: 20 })
    })
})


// map.on('click', function(e) {
//     console.table('Hello')
//     if (featureGroup.getLayers().length < 2) {
//         let marker = L.marker(e.latlng).bindPopup("I am a point").addTo(map);
//         featureGroup.addLayer(marker);
//         layer1 == undefined ? layer1 = featureGroup.getLayerId(marker) : layer2 = featureGroup.getLayerId(marker);
//     } else {
//         map.off('click');
//         let point1 = featureGroup.getLayer(layer1);
//         let point2 = featureGroup.getLayer(layer2);

//         let from = turf.point([point1.getLatLng().lat, point1.getLatLng().lng]);
//         let to = turf.point([point2.getLatLng().lat, point2.getLatLng().lng]);
//         let options = { units: 'kilometers' };
//         let distance1 = turf.distance(from, to, options);

//     }
// })