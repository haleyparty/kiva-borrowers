$(document).ready(function() {
  var borrowers = [];
  var map;
  var initMap = function(borrowers) {
    // **********************
    // map creation
    // **********************
    map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 13, lng: 122},
      zoom: 8
    });

    var lat, lng;
    var infoWindow = new google.maps.InfoWindow();
    // **********************
    // loop through borrowers
    // **********************
    $.each(borrowers, function(index, borrower) {

      // **********************
      // get lat / lng points
      // **********************
      var pairs = borrower.location.geo.pairs;
      pairs = pairs.split(' ');
      lat = Number(pairs[0]);
      lng = Number(pairs[1]);

      // **********************
      // create info window template
      // **********************
      var infoWindow = new google.maps.InfoWindow({
        content: '<h3>' + borrower.name + '</h3> \
                  <p><a href="http://www.kiva.org/lend/' + borrower.id + '?app_id=' + borrower.id + '" target="_blank">Lend Now</a> \
                  <p><b>Amount:</b> $' + borrower.loan_amount + '</p> \
                  <p><b>Sector:</b> ' + borrower.sector + '</p> \
                  <p><b>Activity:</b> ' + borrower.activity + '</p> \
                  <p><b>Use:</b> ' + borrower.use + '</p>'
      });

      // **********************
      // create marker with listener for info window
      // **********************
      var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, lng),
        map: map
      });

      marker.addListener('click', function() {
        infoWindow.open(map, marker);
      });
    });
  }

  // **********************
  // loop through borrowers
  // **********************
  $.getJSON('http://api.kivaws.org/v1/loans/search.json?status=fundraising', function(data) {
    var pages = data.paging.pages;
    var pageNumbers = [];
    for (var i = 1; i <= 3; i++) {
      pageNumbers.push(i);
    }
    $.each(pageNumbers, function(_, pageNumber) {
      $.getJSON('http://api.kivaws.org/v1/loans/search.json?status=fundraising&page=' + pageNumber, function(data) {
        var loans = data.loans;
        for (var i = 0; i < loans.length; i++) {
          borrowers.push(loans[i]);
        }
        initMap(borrowers);
      });
    });
  });

});
