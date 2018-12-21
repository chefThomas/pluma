
// 'use strict';

// let map;
// let directionsService;
// let directionsDisplay;
// let zIndex = 0;
// let markers = [];


// const googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
// const googleDirectionsUrl = 'https://maps.googleapis.com/maps/api/directions/json?'
// const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';

// const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
// const ebirdApiKey = '3k3ndtikp21v';


// function addMarkerToArr(location, label, eBirdData) {

//   map.panTo(location);

//   const marker = new google.maps.Marker({
//     position: location,
//     map: map,
//     label: label,
//     zIndex: zIndex
//   });

//   zIndex++;

//   const infoWindowContent = `
//       <h3><a href="https://www.allaboutbirds.org/search/?q=${eBirdData[label - 1].comName}" target="_blank">${eBirdData[label - 1].comName}</a><h3>
//       <p>Location: ${eBirdData[label - 1].locName}</p>
//       <p>Observation date: ${eBirdData[label - 1].obsDt}</li>
//       `;

//   marker.addListener('click', function () {
//     new google.maps.InfoWindow({ content: infoWindowContent })
//       .open(map, marker);

//   });

//   markers.push(marker);
// }

// function generateTextDirections(stepsArr) {
//   console.log(stepsArr);
// }


// function getDirections(origin, destination) {

//   directionsDisplay.setMap(map);

//   directionsService.route({
//     origin: origin,
//     destination: destination,
//     travelMode: 'DRIVING',
//   }, function (response, status) {
//     if (status === 'OK') {
//       // Pass data to the map
//       directionsDisplay.setDirections(response);

//       // See the data in the console
//       console.log(response); // directions in response obj --> routes/legs/steps
//       const steps = response.routes[0].legs[0].steps;
//       generateTextDirections(steps)
//     } else {
//       window.alert('Directions request failed due to ' + status);
//     }
//   });
// }

// function handleDirectionsButtonClick() {
//   $('#js-results-list').on('click', '.directions-button', function (event) {

//     const lat = parseFloat(this.getAttribute("lat"));
//     const lng = parseFloat(this.getAttribute("lng"));

//     const destination = { lat: lat, lng: lng };

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(function (position) {
//         var origin = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude
//         };
//         getDirections(origin, destination);
//       });
//     } else {
//       console.log('geolocation not supported')
//     }
//   });
// }

// function handleMapButtonClick(eBirdData) {
//   $('#js-results-list').on('click', '.map-button', function (event) {

//     console.log('map button click. Markers: ', markers);

//     const lat = parseFloat(this.getAttribute("lat"));
//     const lng = parseFloat(this.getAttribute("lng"));

//     const latLng = { lat: lat, lng: lng };

//     // get label from observation list
//     const label = $(this).parent()[0].childNodes[0].data.split(' ')[0];

//     // checks markers array for marker with same label
//     const markerIndex = markers.findIndex(function (marker) {
//       return marker.label === label;
//     });

//     console.log('markerIndex using findIndex: ', markerIndex);

//     if (markerIndex > -1) {
//       // remove from map
//       markers[markerIndex].setMap(null);
//       // splice out of markers array
//       markers.splice(markerIndex, 1);

//       console.log('check markers after splice', markers);

//     } else {
//       addMarkerToArr(latLng, label, eBirdData);
//     }
//   });
// }


// function renderObservationsList(responseJson) {
//   // remove previous results
//   $('#js-results-list').empty();
//   let counter = 1;
//   for (let obs of responseJson) {

//     $('#js-results-list').append(
//       `<li>${counter} ${obs.comName} | <button class="map-button" lat=${obs.lat} lng=${obs.lng}>Map</button><button class="directions-button" lat=${obs.lat} lng=${obs.lng}>Directions</button></li>`
//     );
//     counter++;
//   }
// }

// function getEbirdData(latitude, longitude, maxResults) {

//   let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;

//   if (maxResults) {
//     ebirdNearbyUrl += `&maxResults=${maxResults}`;
//   }

//   fetch(ebirdNearbyUrl)
//     .then(response => response.json())
//     .then(jsonResponse => {
//       console.log('ebird fetch', jsonResponse);

//       renderObservationsList(jsonResponse);
//       handleMapButtonClick(jsonResponse);
//       handleDirectionsButtonClick(jsonResponse);
//     });
// }

// function initMap(center) {

//   directionsService = new google.maps.DirectionsService;
//   directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });

//   map = new google.maps.Map(document.querySelector('.map'), {
//     center: center,
//     zoom: 10,
//     scaleControl: true
//   });

//   new google.maps.Circle({
//     strokeColor: '#FF0000',
//     strokeOpacity: 0.6,
//     strokeWeight: 1,
//     fillColor: '#FF0000',
//     fillOpacity: 0.05,
//     map: map,
//     center: center,
//     radius: 25000
//   });

// }

// function geocodeAddress(location) {

//   console.log('geocode markers', markers)

//   const queryParams = `address=${encodeURIComponent(location)}`;

//   const searchString = googleGeocodeUrl + queryParams + `&key=${googleApiKey}`;

//   // get coords from location 
//   fetch(searchString)
//     .then(response => response.json())
//     .then(json => {
//       const lat = json.results[0].geometry.location.lat;
//       const lng = json.results[0].geometry.location.lng;

//       const maxResults = $('#max-results').val();

//       // center map on location
//       const mapCenter = { lat: lat, lng: lng };
//       console.log(mapCenter)

//       // create map
//       initMap(mapCenter);

//       getEbirdData(lat, lng, maxResults);
//     });
// }

// function handleResetButtonClick() {
//   $('form').on('click', '#reset-button', event => {
//     setMapOnAll(null);
//     markers = [];
//   });
// }

// function handleLocationSubmit() {
//   $('form').on('submit', event => {

//     resetMap();
//     console.log('new location. Check markers arr', markers);

//     event.preventDefault();

//     const location = $('.user-input').val();

//     geocodeAddress(location);

//   });
// }



// $(handleLocationSubmit);
// $(handleResetButtonClick);


// // ===================================================================
// // ===================================================================
// // ===================================================================

let markers = [];
const googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';

function handleMapButtonClick(eBirdData) {
  $('#js-results-list').on('click', '.map-button', function (event) {

    const observationId = $(this).parent()[0].childNodes[0].data.split(' ')[0];

    // check markers array for marker with label = observationId if exists, then remove from array and call marker.setMap(null), otherwise, create marker and push to marker array
    const searchForMarker = markers.findIndex(marker => marker.label == observationId)

    if searchForMarker === -1 {
      const lat = parseFloat(this.getAttribute("data-lat"));
      const lng = parseFloat(this.getAttribute("data-lng"));
      const latLng = { lat: lat, lng: lng };

      let marker = new google.maps.Marker({
        position: latLng,
        label: observationId
      });
      markers.push(marker);
      console.log(markers);
    }



    // unset from map and delete from arr


    // create new marker and push to marker array
    // get coordinates from button 


    // get label from observation list



    // // checks markers array for marker with same label
    // const markerIndex = markers.findIndex(function (marker) {
    //   return marker.label === label;
    // });

    // console.log('markerIndex using findIndex: ', markerIndex);

    // if (markerIndex > -1) {
    //   // remove from map
    //   markers[markerIndex].setMap(null);
    //   // splice out of markers array
    //   markers.splice(markerIndex, 1);

    //   console.log('check markers after splice', markers);

    // } else {
    // addObservationMarker(latLng, label, eBirdData);
    // }
  });
}

function renderObservationsList(responseJson) {
  // remove previous results
  $('#js-results-list').empty();
  let counter = 1;
  for (let obs of responseJson) {

    $('#js-results-list').append(
      `<li>${counter} ${obs.comName} | <button class="map-button" data-lat=${obs.lat} data-lng=${obs.lng}>Map</button><button class="directions-button" data-lat=${obs.lat} data-lng=${obs.lng}>Directions</button></li>`
    );
    counter++;
  }


}

function getEbirdData(latitude, longitude, maxResults) {

  let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;

  if (maxResults) {
    ebirdNearbyUrl += `&maxResults=${maxResults}`;
  }

  fetch(ebirdNearbyUrl)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log('ebird fetch', jsonResponse);

      // generate results list
      renderObservationsList(jsonResponse);
      generateMarkerArray(jsonResponse);
      handleMapButtonClick(jsonResponse);
      // handleDirectionsButtonClick(jsonResponse);
    });
}

function initMap(center) {
  map = new google.maps.Map(document.querySelector('.map'), {
    zoom: 12,
    center: center,
  });
}

function geocodeAddress(location) {

  const queryParams = `address=${encodeURIComponent(location)}`;

  const searchString = googleGeocodeUrl + queryParams + `&key=${googleApiKey}`;

  // get coords from location 
  fetch(searchString)
    .then(response => response.json())
    .then(json => {

      const { lat, lng } = json.results[0].geometry.location;

      const maxResults = $('#max-results').val();
      // center map on location
      const mapCenter = { lat: lat, lng: lng };
      console.log('map center', mapCenter);
      // create map
      initMap(mapCenter);
      // bird observation data from eBird
      getEbirdData(lat, lng, maxResults);
    });
}

function handleLocationSubmit() {
  $('form').on('submit', event => {
    event.preventDefault();
    const location = $('.user-input').val();

    geocodeAddress(location);
  });
}

$(handleLocationSubmit);



// // add marker when button pressed
// function addMarker(location) {
//   const marker = new google.maps.Marker({
//     position: location,
//     map: map
//   });
//   markers.push(marker);
// }

// function setMarkers(map) {
//   for (marker of markers) {
//     marker.setMap(map);
//   }
// }
