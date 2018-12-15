
'use strict';

let zIndex = 0;
const googleGeocode = 'https://maps.googleapis.com/maps/api/geocode/json?';
const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';

const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
const ebirdApiKey = '3k3ndtikp21v';

let eBirdReturnObj = {};


function handleMapButtonClick(map, eBirdData) {
  // listen for map button click
  $('#js-results-list').on('click', '.map-button', function (event) {

    console.log('map button clicked', eBirdData);

    const lat = parseFloat(event.target.getAttribute("lat"));
    const lng = parseFloat(event.target.getAttribute("lng"));

    const label = $(event.target).parent()[0].childNodes[0].data.split(' ')[0];

    const latLng = { lat: lat, lng: lng };

    map.setCenter(latLng);
    const marker = new google.maps.Marker({
      position: latLng,
      map: map,
      label: label
    });

    marker.setZIndex(parseInt(zIndex));

    zIndex++;

    // info window 
    //const contentString = // from ebird data. comName, howMany, locName, locationPrivate

    // generateInfoWindowHtml(parseInt(label + 1));


    marker.addListener('click', function () {
      new google.maps.InfoWindow({
        content: 'here it is'
      }).open(map, marker);
    });
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
  console.log('getEbirdData run')
  let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;

  if (maxResults) { ebirdNearbyUrl += `&maxResults=${maxResults}`; }

  fetch(ebirdNearbyUrl)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log('ebird fetch', jsonResponse);

      // generate info window
      eBirdReturnObj = jsonResponse;
      renderObservations(jsonResponse);
      // generateInfoWindowContent(jsonResponse);
      const map = initMap();

      map.setCenter(new google.maps.LatLng(latitude, longitude));

      new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.05,
        map: map,
        center: { lat: latitude, lng: longitude },
        radius: 25000
      })

      handleMapButtonClick(map, jsonResponse);
    });
}

function geocodeAddress(location) {
  console.log('geocodeAddress run')
  const queryParams = `address=${encodeURIComponent(location)}`;

  const searchString = googleGeocode + queryParams + `&key=${googleApiKey}`;

  fetch(searchString)
    .then(response => response.json())
    .then(json => {
      const lat = json.results[0].geometry.location.lat;
      const lng = json.results[0].geometry.location.lng;
      const maxResults = $('#max-results').val();
      console.log('max results: ', maxResults)
      getEbirdData(lat, lng, maxResults);
    });
}


function handleSubmit() {
  $('form').on('click', 'input#submit-button', event => {
    event.preventDefault();

    console.log('handle submit');

    const location = $('.user-input').val();

    geocodeAddress(location);
  });
};


function initMap() {
  console.log('init map run')
  const map = new google.maps.Map(document.querySelector('.map'), {
    center: { lat: 40.7828647, lng: -73.9653551 },
    zoom: 10
  });

  return map;
}

$(initMap);
$(handleSubmit);


// Github test. This comment should only exist in branch feature/info-window