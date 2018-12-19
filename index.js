
'use strict';

let map;
let directionsService;
let directionsDisplay;
let zIndex = 0;
let markers = [];


const googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleDirectionsUrl = 'https://maps.googleapis.com/maps/api/directions/json?'
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
      <p>Observation date: ${eBirdData[label - 1].obsDt}</li>
      `;

  marker.addListener('click', function () {
    new google.maps.InfoWindow({ content: infoWindowContent })
      .open(map, marker);

  });



  markers.push(marker);
}

function generateTextDirections(stepsArr) {
  console.log(stepsArr);
}


function getDirections(origin, destination) {

  directionsDisplay.setMap(map);

  directionsService.route({
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING',
  }, function (response, status) {
    if (status === 'OK') {
      // Pass data to the map
      directionsDisplay.setDirections(response);

      // See the data in the console
      console.log(response); // directions in response obj --> routes/legs/steps
      const steps = response.routes[0].legs[0].steps;
      generateTextDirections(steps)
    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });
}

function handleDirectionsButtonClick() {
  $('#js-results-list').on('click', '.directions-button', function (event) {

    const lat = parseFloat(this.getAttribute("lat"));
    const lng = parseFloat(this.getAttribute("lng"));

    const destination = { lat: lat, lng: lng };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        var origin = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        getDirections(origin, destination);
      });
    } else {
      console.log('geolocation not supported')
    }
  });
}



function handleMapButtonClick(eBirdData) {
  $('#js-results-list').on('click', '.map-button', function (event) {
    console.log('map button click');
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
      `<li>${counter} ${obs.comName} | <button class="map-button" lat=${obs.lat} lng=${obs.lng}>Map</button><button class="directions-button" lat=${obs.lat} lng=${obs.lng}>Directions</button></li>`
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
      handleDirectionsButtonClick(jsonResponse);
    });
}

function geocodeAddress(location) {

  const queryParams = `address=${encodeURIComponent(location)}`;

  const searchString = googleGeocodeUrl + queryParams + `&key=${googleApiKey}`;

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

    // clear routes on map
    directionsDisplay.setMap(null);

    //clear markers on map (remove to compare different locations!)

    event.preventDefault();

    const location = $('.user-input').val();

    geocodeAddress(location);

  });
}

function initMap() {

  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

  map = new google.maps.Map(document.querySelector('.map'), {
    center: { lat: 40.7828647, lng: -73.9653551 },
    zoom: 10,
    scaleControl: true
  });

}

console.log(markers)

$(initMap);
$(handleLocationSubmit);
