
'use strict';

const googleGeocode = 'https://maps.googleapis.com/maps/api/geocode/json?';
const googleApiKey = '';
const ebirdApiKey = '';


function getEbird(latitude, longitude) {
  const ebirdNearbyUrl = `https://ebird.org/ws2.0/data/obs/geo/recent?key=3k3ndtikp21v&lat=${latitude}&lng=${longitude}&sort=date&maxResults=20`;

  fetch(ebirdNearbyUrl)
    .then(response => response.json())
    .then(jsonResponse => {
      console.log(jsonResponse);
    });
}

function geocodeAddress(address) {
  // GET latitude and longitude from location

  const queryParams = `address=${encodeURIComponent(address)}`;

  const searchString = googleGeocode + queryParams + `&key=${googleApiKey}`;

  fetch(searchString)
    .then(response => response.json())
    .then(json => {
      const lat = json.results[0].geometry.location.lat;
      const lng = json.results[0].geometry.location.lng;
      console.log(lat, lng); // 

      getEbird(lat, lng);
    });
}


function handleSubmit() {
  $('form').on('click', 'input#submit-button', event => {
    event.preventDefault();

    const address = $('.user-input').val();

    geocodeAddress(address);
  });
};



$(handleSubmit)