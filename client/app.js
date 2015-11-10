// create URL for getJSON request
var urlChoice = function(sectorValue, regionValue, pageNum) {
  var url;
  if (sectorValue !== '' && regionValue !== '') {
    url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + sectorValue + '&region=' + regionValue + '&sort_by=loan_amount';
  } else if (regionValue === '' && sectorValue !== '') {
    url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + sectorValue + '&sort_by=loan_amount';
  } else if (sectorValue === '' && regionValue !== '') {
    url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&region=' + regionValue + '&sort_by=loan_amount';
  } else {
    url = 'http://api.kivaws.org/v1/loans/search.json?sort_by=loan_amount';
  }
  url = url + '&page=' + pageNum;
  return url;
};

// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerOption = function(loans, amountToLend) {
  var items = [];
  $.each(loans, function(index, loan) {
    if (loan.loan_amount - loan.funded_amount > 0) {
      var loanAmount = loan.loan_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var fundedAmount = loan.funded_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var leftToFund = (loan.loan_amount - loan.funded_amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      var contributionPercentage = Math.round((amountToLend / loan.loan_amount) * 100);
      if (contributionPercentage > 100) {
        contributionPercentage = 100;
      }

      items.push('<img src="http://www.kiva.org/img/w200h200/' + loan.image.id + '.jpg"> \
                  <h2>' + loan.name + '</h2> \
                  <p><a href="http://www.kiva.org/lend/' + loan.id + '?app_id=' + loan.id + '" target="_blank">Lend</a></p> \
                  <b>Location:</b> ' + loan.location.town + ', ' + loan.location.country + '<br> \
                  <b>Activity:</b> ' + loan.activity + '<br> \
                  <b>Use:</b> ' + loan.use + '</p> \
                  <p><b>Amount Requested:</b> $' + loanAmount + '<br> \
                  <b>Amount Funded So Far:</b> $' + fundedAmount + '<br> \
                  <b>Amount Left to Fund:</b> $' + leftToFund + '<br> \
                  <b>Contribution Percentage: </b>' + contributionPercentage + '%<br> \
                  <div class="divider"></div>'
                  );
      }
    });
    return items.join('');
};

// get borrower country names and count for the query
var getBorrowerCountryNamesAndCount = function(loans) {
  var countries = {};
  $.each(loans, function(index, loan) {
    if (!countries[loan.location.country]) {
      countries[loan.location.country] = 1;
    } else {
      countries[loan.location.country]++;
    }
  });
  return countries;
};

var getCountryCodes = function(borrowerCountries, datamapCountries) {
  var countryCodes = {};
  for (country in borrowerCountries) {
    for (var i = 0, j = datamapCountries.length; i < j; i++) {
      if (datamapCountries[i].properties.name === country) {
        countryCodes[country] = datamapCountries[i].id;
      }
    }
  }
  return countryCodes;
};

var createChoropleth = function(countryCodes, borrowerCountries, datamapCountries) {
  // create choropleth object to inject into map
  var choropleth = {};
  for (country in countryCodes) {
    var countryCode = countryCodes[country];
    choropleth[countryCode] = {fillKey: 'borrowerLivesIn', countryCount: borrowerCountries[country]};
  }

  // make countries not in countryCodes object the default color
  for (var i = 0, j = datamapCountries.length; i < j; i++) {
    if (!(datamapCountries[i].id in choropleth) && datamapCountries[i].id !== '-99') {
      var countryCode = datamapCountries[i].id;
      choropleth[countryCode] = {fillKey: 'defaultFill', countryCount: 0};
    }
  }
  map.updateChoropleth(choropleth);
};

var createBorrowerInfo = function(loans, amountToLend) {
  var items = [];
  // build borrower information
  items.push(makeBorrowerOption(loans, amountToLend));
  $('#content').html(items.join(''));
  return;
};

// grabs sector & region to generate get request for JSON data
var getData = function() {
  var regionValue = $('#filterRegion').val();
  var sectorValue = $('#filterSector').val();

  var amountToLend = Number($('#amountToDonate').val());

  var contentHTML = '';
  var pageNum = 1;
  var url = urlChoice(sectorValue, regionValue, pageNum);

  var JSONrequest = function(url) {
    $.getJSON(url, function(data) {
      
      createBorrowerInfo(data.loans, amountToLend);
      contentHTML = $('#content').html();
      // if contentHTML = '', increment pageNum and continue to next iteration
      // if (contentHTML === '') {
      //   break;
      //   pageNum++;
      //   url = urlChoice(sectorValue, regionValue, pageNum);
      // } else {
        // borrower countries
        var borrowerCountries = getBorrowerCountryNamesAndCount(data.loans);
        // all datamap countries listed
        var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;

        // get 3-char country codes to use in datamap
        var countryCodes = getCountryCodes(borrowerCountries, datamapCountries);
        
        createChoropleth(countryCodes, borrowerCountries, datamapCountries);
      // }
    });
  };

  JSONrequest(url);

};
