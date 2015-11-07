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
    $.each(borrowers, function(index, borrower) {
      // get lat/long pairs
      var pairs = borrower.location.geo.pairs;
      pairs = pairs.split(' ');
      lat = Number(pairs[0]);
      lng = Number(pairs[1]);

      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map,
        title: borrower.name
      });
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



//   // var infoWindow = new google.maps.InfoWindow();

//   // var marker, i;

//   // for (var i = 0; i < borrowers.length; i++) {
//   //   marker = new google.maps.Marker({
//   //     position: new google.maps.LatLng(locations[i][/*borrower lat*/], locations[i][/*borrower long*/]),
//   //     map: map
//   //     title: locations[i][/*borrower name*/]
//   //   });

//   //   google.maps.event.addListener(marker, 'click', function(marker, i) {
//   //     return function() {
//   //       infoWindow.setContent(locations[i][/*html*/]);
//   //       infoWindow.open(map, marker);
//   //     }
//   //   });
//   // }

//   // loop through to add markers of each borrower
//   // var marker = new google.maps.Marker({
//   //   position: borrowerLatLong,
//   //   map: map,
//   //   title: 'Hello, world!' // borrower name goes here
//   // });

//   // var infoWindow = new google.maps.InfoWindow({
//   //   content: '<h3>Testing</h3><p>Hi</p>' // borrower info goes here
//   // });

//   // marker.addListener('click', function() {
//   //   infoWindow.open(map, marker);
//   // });
// }
