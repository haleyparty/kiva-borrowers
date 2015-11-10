// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerOption = function(loans) {
  var items = [];
  $.each(loans, function(index, loan) {
    var loanAmount = loan.loan_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var fundedAmount = loan.funded_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var leftToFund = (loan.loan_amount - loan.funded_amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    items.push('<img src="http://www.kiva.org/img/w200h200/' + loan.image.id + '.jpg"> \
                <h3>' + loan.name + '</h3> \
                <p><a href="http://www.kiva.org/lend/' + loan.id + '?app_id=' + loan.id + '" target="_blank">Lend</a></p> \
                <p><b>Location:</b> ' + loan.location.town + ', ' + loan.location.country + '</p> \
                <p><b>Activity:</b> ' + loan.activity + '</p> \
                <p><b>Use:</b> ' + loan.use + '</p> \
                <p><b>Amount Requested:</b> $' + loanAmount + '</p> \
                <p><b>Amount Funded So Far:</b> $' + fundedAmount + '</p> \
                <p><b>Amount Left to Fund:</b> $' + leftToFund + '</p>'
                );
  });
  return items.join('');
};

// get countries
var grabCountries = function(loans) {
  var countries = {};
  $.each(loans, function(index, loan) {
    if (!countries[loan.location.country]) {
      countries[loan.location.country] = true;
    }
  });
  return countries;
};

// grabs sector & region to generate get request for JSON data
var getData = function() {
  var selectedRegion = document.getElementById('filterRegion');
  var regionValue = selectedRegion.options[selectedRegion.selectedIndex].value;

  var selectedSector = document.getElementById('filterSector');
  var sectorValue = selectedSector.options[selectedSector.selectedIndex].value;

  if (sectorValue !== '' && regionValue !== '') {
    var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + sectorValue + '&region=' + regionValue + '&sort_by=loan_amount';
  } else if (regionValue === '' && sectorValue !== '') {
    var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + sectorValue + '&sort_by=loan_amount';
  } else if (sectorValue === '' && regionValue !== '') {
    var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&region=' + regionValue + '&sort_by=loan_amount';
  } else {
    var url = 'http://api.kivaws.org/v1/loans/search.json?sort_by=loan_amount';
  }

  $.getJSON(url, function(data) {
    var items = [];
    // build borrower information
    items.push('<ul>');
    items.push(makeBorrowerOption(data.loans));
    items.push('</ul>');
    $('#content').html(items.join(''));


    // get borrower countries
    var borrowerCountries = grabCountries(data.loans);

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
      choropleth[countryCode] = {fillKey: 'borrowerLivesIn'};
    }

    // make countries not in countryCodes object the default color
    for (var i = 0, j = datamapCountries.length; i < j; i++) {
      if (!(datamapCountries[i].id in choropleth) && datamapCountries[i].id !== '-99') {
        var countryCode = datamapCountries[i].id;
        choropleth[countryCode] = {fillKey: 'defaultFill', countryCount: 0};
      }
    }
    console.log(choropleth)

    map.updateChoropleth(choropleth);
  });
};
