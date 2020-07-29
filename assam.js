let mymap = L.map('mapid', {
    zoomControl: true
})
let geocoder = L.Control.Geocoder.mapbox('pk.eyJ1IjoicHJrczE4IiwiYSI6ImNrYWhyMTM0ZTAxYm0zMG1mdTBxZncyaWIifQ.vlicc7a_Nod5KQS9CKmOng');
//     'Bing': L.Control.Geocoder.bing('AlsFLEm5UIoF-8kfQdB-XlTCGU_pLLNliREprSZFOZfEr08UCqD0OCzhL5jWAwQn'),
//     'Mapbox': L.Control.Geocoder.mapbox(LCG.apiToken),
//     'Photon': L.Control.Geocoder.photon(),

mymap.setView([28.7041, 77.1025], 4)
let myIcon = new L.Icon({
    iconUrl: 'map-marker-alt-solid.svg',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12.5, 20.5],
    popupAnchor: [1, -54],
    shadowSize: [41, 41]
});

mymap.on('load', function() {
    mymap.resize();
})
let marker = L.marker([26.1433, 91.7898], { icon: myIcon }).addTo(mymap).bindPopup(`<div class="popup"><p>Dispur,Capital Of Assam</p></div>`);
mymap.on('click', function(e) {


    geocoder.reverse(e.latlng, mymap.options.crs.scale(mymap.getZoom()), function(results) {
        let r = results[0];
        if (r) {

            if (marker) {
                marker
                    .setLatLng(r.center)
                    .setPopupContent(r.html || r.name)
                    .openPopup()
                setTimeout(() => { marker.closePopup() }, 2000)
            } else {
                marker = L.marker(r.center)
                    .bindPopup(r.name)
                    .addTo(mymap)
                setTimeout(() => { marker.closePopup() }, 2000)
            }
        }
    });
});

function locateMe() {
    mymap.locate({ setView: true, maxZoom: 10 });
    mymap.on('locationfound', locationFound)
    mymap.on('locationerror', locationError)
}

function locationFound(e) {
    if (marker) {
        marker.setLatLng(e.latlng).bindPopup("You are within 2m radius of this location");
        let markerLayer = L.featureGroup([marker]).addTo(mymap)
        mymap.fitBounds(markerLayer.getBounds())

    } else {
        marker = L.marker(e.latlng).bindPopup("You are withing 2m radius of this location").addTo(mymap);
    }
}

function locationError(e) {
    console.error(e);
    alert("Location tracing is blocked!")
}

L.tileLayer('https://api.mapbox.com/styles/v1/{affected}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoicHJrczE4IiwiYSI6ImNrYWhyMTM0ZTAxYm0zMG1mdTBxZncyaWIifQ.vlicc7a_Nod5KQS9CKmOng', {
    maxZoom: 18,
    affected: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw',
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
        '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>'

}).addTo(mymap);

function styleFeature(feature) {

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
    let assamdata = geoJson.data;

    axios.get('https://api.covid19india.org/v2/state_district_wise.json').then((covidData) => {

        assamdata.features.forEach((geoJsonres) => {
            covidData.data.forEach((element) => {

                if (element.state == "Assam")
                    element.districtData.forEach((district) => {
                        if (district.district.toLowerCase() === geoJsonres.properties.NAME_2.toLowerCase()) {
                            geoJsonres.properties.coronaCases = district.confirmed;
                            geoJsonres.properties.deaths = district.deceased;
                        }
                    })

            })
        });
        let statesData = assamdata;
        let geojson = L.geoJson(statesData, { style: styleFeature, onEachFeature: onEachFeature }).addTo(mymap);
        mymap.fitBounds(geojson.getBounds());

        //Interactivity
        function onEachFeature(feature, layer) {
            layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomToFeature
            });

            layer.bindTooltip(`<div class="tooltipdiv">${layer.feature.properties.NAME_2}<br>Positive cases:<span class="positive">${feature.properties.coronaCases}</span><br><span class="death">Deaths:${feature.properties.deaths}</span></div></div>`, { className: "tooltip", direction: 'top', interactive: true, offset: L.point({ x: -10, y: -5 }) })
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
            marker.setLatLng(e.latlng)
            if (e.target.feature.properties.coronaCases >= 1) {
                if (alertify)
                    alertify.alert('We want you to know..', 'You are in a covid-19 - prone zone!');
                else
                    setTimeout(() => { alert('You are in a covid19-prone zone!') }, 500);
            } else {
                if (alertify)
                    alertify.alert('We want you to know..', 'You are in a covid-19 - free zone!');
                else
                    setTimeout(() => { alert('You are in a covid19-free zone!') }, 500);
            }
        }

        function resetHighlight(e) {
            geojson.resetStyle(e.target);

        }
    })
});