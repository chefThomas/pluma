let searchRadius;
let markers = [];
let directionsDisplayArr = [];
const googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';


function handleResetButton() {
  $('form').on('click', '#reset-button', clearPreviousResults)
}

function getDirections(origin, destination) {
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionsService = new google.maps.DirectionsService;
  console.log('get direx run');
  directionsDisplay.setMap(map);

  directionsService.route({
    origin: origin,
    destination: destination,
    travelMode: 'DRIVING',
  }, function (response, status) {
    if (status === 'OK') {
      // Pass data to the map
      directionsDisplay.setDirections(response);

    } else {
      window.alert('Directions request failed due to ' + status);
    }
  });

  directionsDisplayArr.push(directionsDisplay);
}


function handleDirectionsButtonClick() {
  $('#js-results-list').on('click', '.directions-button', function (event) {

    console.log('handle dir button run')
    if (directionsDisplayArr[0]) {
      directionsDisplayArr[0].setMap(null);
      directionsDisplayArr = [];
    } else {
      const lat = parseFloat(this.getAttribute("data-lat"));
      const lng = parseFloat(this.getAttribute("data-lng"));

      const destination = { lat: lat, lng: lng };

      console.log('destinatoin in hand dir button ', destination)

      if (navigator.geolocation) {
        console.log('in nav.geo')
        navigator.geolocation.getCurrentPosition(function (position) {
          var origin = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log('about to call getDir')
          getDirections(origin, destination);
        });
      } else {
        alert('geolocation not supported')
      }
    }
  });
}

function getWikiImage(commonName) {

  console.log('get wiki image ', commonName);

  const wikipediaApiUri = `https://en.wikipedia.org/w/api.php?action=query&titles=${commonName}&prop=pageimages&format=json&pithumbsize=100&origin=*`;

  console.log(wikipediaApiUri);

  fetch(wikipediaApiUri)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log('wiki response ', jsonResponse);
    });
}

function handleMapButtonClick(eBirdData) {
  console.log('handle map button click')
  $('#js-results-list').unbind('click').on('click', '.map-button', function (event) {

    const observationId = $(this).parent()[0].childNodes[0].data.split(' ')[0];
    const searchForMarkerIndex = markers.findIndex(marker => marker.label == observationId);

    if (searchForMarkerIndex === -1) {
      const lat = parseFloat(this.getAttribute("data-lat"));
      const lng = parseFloat(this.getAttribute("data-lng"));
      const latLng = { lat: lat, lng: lng };

      let marker = new google.maps.Marker({
        position: latLng,
        label: observationId
      });

      getWikiImage(eBirdData[observationId - 1].sciName)


      const infoWindowContent = `
      <img>https://en.wikipedia.org/w/api.php?action=query&titles=american%20robin&prop=pageimages&format=json&pithumbsize=100
      <h3><u>${eBirdData[observationId - 1].comName}</u><h3>
      <p>Location: ${eBirdData[observationId - 1].locName}</p>
      <p>Date: ${eBirdData[observationId - 1].obsDt}</li>
      `;

      marker.addListener('click', function () {
        new google.maps.InfoWindow({ content: infoWindowContent })
          .open(map, marker);
      });

      markers.push(marker);
      console.log(markers);

    } else {
      // removes marker from map and marker array if already on map
      markers[searchForMarkerIndex].setMap(null);
      markers.splice(searchForMarkerIndex, 1);
    }
    markers.forEach(marker => marker.setMap(map));
  });
}

function renderObservationsList(responseJson) {
  // remove previous results
  $('#js-results-list').empty();

  // counter is used as l
  let id = 1;
  for (let obs of responseJson) {
    $('#js-results-list').append(
      `<li>${id} ${obs.comName} | <button class="map-button" data-lat=${obs.lat} data-lng=${obs.lng}>location</button><button class="directions-button" data-lat=${obs.lat} data-lng=${obs.lng}> route</button></li>`
    );
    id++;
  }
}

function generateUrl(latitude, longitude) {

  const maxResults = $('#max-results').val();
  const userRadiusInput = $('#search-radius').val();

  let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;

  // return limit optional 
  if (maxResults) {
    ebirdNearbyUrl += `&maxResults=${maxResults}`;
  }

  // default to 25km, but can be specified by user
  if (userRadiusInput) {
    ebirdNearbyUrl += `&dist=${userRadiusInput}`;
  }

  return ebirdNearbyUrl;
}

function getEbirdData(latitude, longitude) {

  const eBirdRequestUrl = generateUrl(latitude, longitude);

  fetch(eBirdRequestUrl)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log('ebird fetch', jsonResponse);
      // generate results list
      renderObservationsList(jsonResponse);
      // create/remove markers from map
      handleMapButtonClick(jsonResponse);
      // 
      handleDirectionsButtonClick(jsonResponse);

    });
}

function calculateZoom(userRadius) {
  // calculates zoom from search radius
  return -0.15385 * userRadius + 13;
}


function initMap(center) {
  // define search radius circle drawn on map and determine initial zoom setting
  let userRadiusInput = $('#search-radius').val();

  // ebird default search radius is 25km
  if (!userRadiusInput) { userRadiusInput = 25; }

  let zoom = calculateZoom(userRadiusInput);

  console.log('calc zoom', zoom);

  map = new google.maps.Map(document.querySelector('.map'), {
    zoom: zoom,
    center: center,
  });

  searchRadius = new google.maps.Circle({
    strokeColor: '#FF0000',
    strokeOpacity: 0.6,
    strokeWeight: 1,
    fillColor: '#FF0000',
    fillOpacity: 0.05,
    map: map,
    center: center,
    radius: userRadiusInput * 1000
  });
}


function getCoordinatesFromLocation(location) {
  // generate API-friendly url
  const queryParams = `address=${encodeURIComponent(location)}`;
  const searchString = googleGeocodeUrl + queryParams + `&key=${googleApiKey}`;

  // google geoclocation api call
  fetch(searchString)
    .then(response => response.json())
    .then(json => {
      // pull coordinates from response object
      const { lat, lng } = json.results[0].geometry.location;
      // center map on location
      const mapCenter = { lat: lat, lng: lng };
      // create map
      initMap(mapCenter);
      // get bird observation data from eBird API using coordinates from Google as parameter
      getEbirdData(lat, lng);
    });
}


function clearPreviousResults() {
  // remove markers
  markers.forEach(marker => marker.setMap(null));
  // clear marker array
  markers = [];
  //clear search radius
  searchRadius.setMap(null);
}


function handleLocationSubmit() {
  $('form').on('submit', event => {
    // submit reloads window by default
    event.preventDefault();
    // clear markers from previous searches
    if (markers[0]) { clearPreviousResults() };
    // get location text from UI
    const location = $('.js-user-input').val();
    // convert text location lat, lng using Google Geolocation API 
    getCoordinatesFromLocation(location);
  });
}

$(handleLocationSubmit);
$(handleResetButton);



