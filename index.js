
'use strict';

let map;
let zIndex = 0;
let markers = [];

const googleGeocode = 'https://maps.googleapis.com/maps/api/geocode/json?';
const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';

const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
const ebirdApiKey = '3k3ndtikp21v';

function addMarkerToArr(location, label, eBirdData) {

  map.panTo(location);

  const marker = new google.maps.Marker({
    position: location,
    map: map,
    label: label,
    zIndex: zIndex
  });

  zIndex++;

  const infoWindowContent = `
      <h3><a href="https://www.allaboutbirds.org/search/?q=${eBirdData[label - 1].comName}" target="_blank">${eBirdData[label - 1].comName}</a><h3>
      <p>Location: ${eBirdData[label - 1].locName}</p>
      <p>Date: ${eBirdData[label - 1].obsDt}</li>
      `;

  marker.addListener('click', function () {
    new google.maps.InfoWindow({ content: infoWindowContent })
      .open(map, marker);
  });

  markers.push(marker);
}

function handleMapButtonClick(eBirdData) {
  $('#js-results-list').on('click', '.map-button', function (event) {

    const label = $(this).parent()[0].childNodes[0].data.split(' ')[0];

    let controlFlow = true;

    markers.forEach(function (marker, index) {
      if (marker.label === label) {
        markers[index].setMap(null);
        markers.splice(index, 1);
        controlFlow = false;
      }
    });

    if (controlFlow) {
      const lat = parseFloat(this.getAttribute("lat"));
      const lng = parseFloat(this.getAttribute("lng"));

      const latLng = { lat: lat, lng: lng };

      addMarkerToArr(latLng, label, eBirdData);
    }

  });
}

function renderObservations(responseJson) {
  // remove previous results
  $('#js-results-list').empty();
  let counter = 1;
  for (let obs of responseJson) {

    $('#js-results-list').append(
      `<li>${counter} ${obs.comName} | <button class="map-button" lat=${obs.lat} lng=${obs.lng}>Map</button></li>`
    );
    counter++;
  }
};

function getEbirdData(latitude, longitude, maxResults) {

  let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;

  if (maxResults) { ebirdNearbyUrl += `&maxResults=${maxResults}`; }

  fetch(ebirdNearbyUrl)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log('ebird fetch', jsonResponse);

      renderObservations(jsonResponse);

      // centers map
      map.panTo(new google.maps.LatLng(latitude, longitude));

      // draw search radius
      new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.05,
        map: map,
        center: { lat: latitude, lng: longitude },
        radius: 25000
      });

      handleMapButtonClick(jsonResponse);
    });
}

function geocodeAddress(location) {

  const queryParams = `address=${encodeURIComponent(location)}`;

  const searchString = googleGeocode + queryParams + `&key=${googleApiKey}`;

  fetch(searchString)
    .then(response => response.json())
    .then(json => {
      const lat = json.results[0].geometry.location.lat;
      const lng = json.results[0].geometry.location.lng;
      const maxResults = $('#max-results').val();

      getEbirdData(lat, lng, maxResults);
    });
}


function handleLocationSubmit() {
  $('form').on('click', 'input#submit-button', event => {
    markers = [];
    event.preventDefault();

    const location = $('.user-input').val();

    geocodeAddress(location);

  });
}

function initMap() {
  map = new google.maps.Map(document.querySelector('.map'), {

    center: { lat: 40.7828647, lng: -73.9653551 },
    zoom: 10
  });

  console.log(map);
}

$(initMap);
$(handleLocationSubmit);
