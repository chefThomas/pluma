// let map;
let searchRadius;
let markerZindex = 0;
let markers = [];
let directionsDisplayArr = [];
const googleGeocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleApiKey = 'AIzaSyDVx0Obu2xJ6E8SCGESOFbetaVXMKDQwMA';
const ebirdNearbyUrlBase = 'https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&sort=date&';


function resetMarkerZindex() {
  markerZindex = 0;
}

function clearRoutes() {
  if (directionsDisplayArr[0]) {
    directionsDisplayArr[0].setMap(null);
    directionsDisplayArr = [];
  }
}

function handleClearMapClick() {
  $('form').on('reset', () => {
    resetMarkerZindex();
    clearRoutes();
    clearMarkers();
  });
}

function getDirections(origin, destination) {
  directionsDisplay = new google.maps.DirectionsRenderer({ suppressMarkers: true });
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
  $('.results-container').on('click', '.directions-button', function (event) {
    console.log('dir icon clicked')
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
          getDirections(origin, destination);
        });
      } else {
        alert('geolocation not supported')
      }
    }
  });
}


// function getWikipediaImageUrl(speciesName) {
//   speciesName = 'American Crow';

//   const encodeSpeciesName = speciesName.toLowerCase();
//   const wikiRequestUri = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeSpeciesName}&prop=pageimages&format=json&pithumbsize=100&origin=*`;

//   const jsonResponse = fetch(wikiRequestUri)
//     .then(response => response.json())
//     .then(jsonResponse => {
//       console.log('wiki image fetch', jsonResponse);
//     });
// }


function handleMapButtonClick(eBirdData) {
  console.log('handle map button click')
  $('#js-results-list').unbind('click').on('click', '.map-button', function (event) {


    // data for marker from ebird
    const observationId = this.getAttribute("data-id");

    const markerIndex = markers.findIndex(marker => marker.label == observationId);

    if (markerIndex === -1) {
      const lat = parseFloat(this.getAttribute("data-lat"));
      const lng = parseFloat(this.getAttribute("data-lng"));
      const latLng = { lat: lat, lng: lng };

      // center map on marker
      map.panTo(latLng);

      //create marker
      let marker = new google.maps.Marker({
        position: latLng,
        label: observationId,
        zIndex: markerZindex
      });

      markerZindex++;

      // getWikipediaImage(eBirdData[observationId - 1].comName);

      // info window 
      const infoWindowContent = `
      <h3><u>${eBirdData[observationId - 1].comName}</u><h3>
      <p>Location: ${eBirdData[observationId - 1].locName}</p>
      <p>Date: ${eBirdData[observationId - 1].obsDt}</p>
    
      <input type="image" class="directions-button" src="./images/infowindow-route.png"  data-lat=${lat} data-lng=${lng} alt="map route">
      `;

      marker.addListener('click', function () {
        new google.maps.InfoWindow({ content: infoWindowContent })
          .open(map, marker);
      });


      markers.push(marker);
      console.log(markers);

    } else {
      // removes marker from map and marker array
      markers[markerIndex].setMap(null);
      markers.splice(markerIndex, 1);
      console.log(markers);
    }
    markers.forEach(marker => marker.setMap(map));
  });
}

function renderObservationsList(responseJson) {
  console.log("renderObs run and ebird resp check, ", responseJson);
  // remove previous results
  // $('#js-results-list').empty();

  // id links marker to item in return list
  let id = 1;
  for (let obs of responseJson) {
    $('.js-results-list').append(
      `<li class="sighting">

          <span class="sighting__id">${id}</span>
          <span class="sighting__comName">${obs.comName}</span>
          
          <input type="image" class="map-button" src="./images/marker-icon.png"  data-lat=${obs.lat} data-lng=${obs.lng} data-id=${id} alt="marker icon">

      </li>`
    );
    id++;
  }
}

function generateEbirdRequestUrl(latitude, longitude) {

  const maxResults = $('#max-results').val();
  const userRadiusInput = $('#search-radius').val();

  console.log('max results', maxResults);

  let ebirdNearbyUrl = ebirdNearbyUrlBase + `lat=${latitude}&lng=${longitude}`;



  // if ((maxResults <= 0) || (userRadiusInput <= 0)) {
  //   alert('max results/search radius must be positive integers');
  //   return;
  // }
  // return limit optional. defaults to all 
  if (maxResults > 0) {
    ebirdNearbyUrl += `&maxResults=${maxResults}`;
  }

  // defaults to 25km, but can be specified by user
  if (userRadiusInput > 0) {
    ebirdNearbyUrl += `&dist=${userRadiusInput}`;
  }

  return ebirdNearbyUrl;
}

function getEbirdData(latitude, longitude) {
  console.log('get ebird run');
  const eBirdRequestUrl = generateEbirdRequestUrl(latitude, longitude);

  console.log("ebird request url is: ", eBirdRequestUrl);

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
  userRadiusInput = $('#search-radius').val();

  // ebird default search radius is 25km
  if (!userRadiusInput) { userRadiusInput = 25; }

  let zoom = calculateZoom(userRadiusInput);

  console.log('calc zoom', zoom);

  map = new google.maps.Map(document.querySelector('.map'), {
    zoom: zoom,
    center: center,
    streetViewControl: false,
    mapTypeControl: false
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
  console.log('get coords run');
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

function scrollToDirections() {
  $('html').animate({
    scrollTop: $(".directions").offset().top
  },
    'slow')
}

function scrollToBirdSearch() {
  $('html').animate({
    scrollTop: $(".heading-secondary--search").offset().top
  },
    'slow')
}

function handleFeatherNav() {
  // scrolls window to directions from top
  $('.js-feather-nav').click(function (event) {

    console.log('feather clicked');

    const targetClassArr = event.target.classList;

    const scrollSwitch = Array.from(targetClassArr).find(elem => {
      return elem === 'logo--white'
    });

    scrollSwitch ? scrollToDirections() : scrollToBirdSearch();
  });


}


function clearMarkers() {

  console.log('clear results run');
  // remove markers
  markers.forEach(marker => marker.setMap(null));
  // clear marker array
  markers = [];

  // if (directionsDisplayArr[0]) {
  //   directionsDisplayArr[0].setMap(null);
  //   directionsDisplayArr = [];

}

function loadDefault() {
  getCoordinatesFromLocation('Seattle');
}


function handleLocationSubmit() {

  $('form').on('submit', event => {

    event.preventDefault();
    $('#js-results-list').empty();

    // clear markers from previous searches
    if (markers[0]) { clearMarkers() };
    // get location text from UI

    const location = $('.js-user-input').val();

    getCoordinatesFromLocation(location);

    $('.js-user-input').val().empty();

  });
}

$(loadDefault);
$(handleLocationSubmit);
$(handleClearMapClick);
$(handleFeatherNav);
