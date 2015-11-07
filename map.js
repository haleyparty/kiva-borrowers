var map;
// populate borrowers with relevant borrower information
  // borrower name
  // lat/long
  // sector
  // activity
  // use
  // loan amount
$(document).ready(function() {
  var borrowers = [];
  var initMap = function(borrowers) {
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 13, lng: 122},
      zoom: 8
    });

    var lat, lng;
    var infoWindow = new google.maps.InfoWindow();
    $.each(borrowers, function(index, borrower) {
      // get lat/long pairs
      var pairs = borrower.location.geo.pairs;
      pairs = pairs.split(' ');
      lat = Number(pairs[0]);
      lng = Number(pairs[1]);

      var infoWindow = new google.maps.InfoWindow({
        content: '<p>Testing</p>'
      })

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        title: borrower.name
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      })
    });
  }

  // get all loans currently raising funds
  $.getJSON('http://api.kivaws.org/v1/loans/search.json?status=fundraising', function(data) {
    var loans = data.loans;
    for (var i = 0; i < loans.length; i++) {
      borrowers.push(loans[i]);
    }
    initMap(borrowers);
  });

});

// function initMap(borrowers) {
//   map = new google.maps.Map(document.getElementById('map'), {
//     center: {lat: 13, lng: 122},
//     zoom: 7
//   });

//   // loop through to add markers of each borrower
//   // var marker = new google.maps.Marker({
//   //   position: borrowerLatLong,
//   //   map: map,
//   //   title: 'Hello, world!' // borrower name goes here
//   // });

//   // marker.addListener('click', function() {
//   //   infoWindow.open(map, marker);
//   // });
// }
