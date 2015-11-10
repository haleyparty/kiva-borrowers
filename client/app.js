// create URL for getJSON request
var urlChoice = function(sectorValue, regionValue, genderValue, pageNum) {
  var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sort_by=loan_amount';
  if (sectorValue !== '') {
    url += '&sector=' + sectorValue;
  }
  if (regionValue !== '') {
    url += '&region=' + regionValue;
  }
  if (genderValue) {
    url += '&gender=female';
  }
  url += '&page=' + pageNum;
  return url;
};

var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;

var JSONcall = function(url, amountToLend, pageNum) {
  $.getJSON(url, function(data) {
    createBorrowerInfo(data.loans, amountToLend, pageNum);
    contentHTML = $('#content').html();

    if (contentHTML === '') {
      createChoropleth({}, {}, datamapCountries, true);
      return;
    }

    var callThis = pageNum > 1 ? false : true;

    // get borrower country names and count for the query
    var borrowerCountries = getBorrowerCountryNamesAndCount(data.loans, callThis);

    // get 3-digit country codes for each country name in the query
      // mapsdata api uses 3-digit codes, kiva uses 2-digit
    var countryCodes = getCountryCodes(borrowerCountries, datamapCountries);

    // add choropleth to the map based on country codes
    createChoropleth(countryCodes, borrowerCountries, datamapCountries, callThis);

    // generate up to 4 page requests (80 borrowers)
    if (pageNum <= 3) {
      pageNum++;
      JSONcall(url + '&page=' + pageNum, amountToLend, pageNum);      
    }

  });
}

// grabs sector & region to generate get request for JSON data
var getData = function() {
  if ($('#incorrectInput').text()) {
    $('#incorrectInput').text('');
  }

  // take commas that were inserted into user input out, convert to float
  var amountToLend = parseFloat($('#userInputToLend').val().replace(/,/g, ''));

  if (checkAmountToLend(amountToLend)) {
    var regionValue = $('#filterRegion').val();
    var sectorValue = $('#filterSector').val();
    var genderValue = $('#checkBox').is(':checked');

    var contentHTML = '';
    var pageNum = 1;
    var url = urlChoice(sectorValue, regionValue, genderValue, pageNum);

    JSONcall(url, amountToLend, pageNum);
  } else {
    // if user input for amount to lend is invalid
    $('#incorrectInput').text('Please enter a positive number');
    $('#content').html('');
    createChoropleth({}, {}, datamapCountries, true);
  }
};
