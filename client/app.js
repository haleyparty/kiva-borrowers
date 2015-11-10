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

// get borrower countries
var getBorrowerCountries = function(loans) {
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

// create URL for getJSON request
var urlChoice = function(sectorValue, regionValue) {
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
  return url;
};

// grabs sector & region to generate get request for JSON data
var getData = function() {
  var regionValue = $('#filterRegion').val();
  var sectorValue = $('#filterSector').val();

  var amountToLend = Number($('#amountToDonate').val());

  var url = urlChoice(sectorValue, regionValue);

  $.getJSON(url, function(data) {
    var items = [];
    // build borrower information
    items.push('<ul>');
    items.push(makeBorrowerOption(data.loans, amountToLend));
    items.push('</ul>');
    $('#content').html(items.join(''));
    var contentHTML = $('#content').html();
    if (contentHTML !== '<ul></ul>') {
      // get borrower countries
      var borrowerCountries = getBorrowerCountries(data.loans);

      // get 3-char country codes to use in datamap
      var countryCodes = {};
      var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;    
      for (country in borrowerCountries) {
        for (var i = 0, j = datamapCountries.length; i < j; i++) {
          if (datamapCountries[i].properties.name === country) {
            countryCodes[country] = datamapCountries[i].id;
          }
        }
      }
      
      // create choropleth object to inject into map
      var choropleth = {};

      // highlight the countries in countryCodes object
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
    } else {
      // while (contentHTML === '<ul></ul>') {
      //   //
      // }
      var page = '&page=' + 2;
      $.getJSON(url + page, function(data) {
        console.log(data);
      });
    }

  });
};
