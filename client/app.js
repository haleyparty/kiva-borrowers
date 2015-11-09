// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerOption = function(loans) {
  var items = [];
  $.each(loans, function(index, loan) {
    items.push('<h3>' + loan.name + '</h3> \
                <p><b>Location:</b> ' + loan.location.town + ', ' + loan.location.country + '</p> \
                <p><b>Activity:</b> ' + loan.activity + '</p> \
                <p><b>Use:</b> ' + loan.use + '</p> \
                <p><b>Amount Requested:</b> $' + loan.loan_amount + '</p> \
                <p><b>Amount Funded:</b> $' + loan.funded_amount + '</p> \
                <p><b>Amount Left:</b> $' + (loan.loan_amount - loan.funded_amount) + '</p> \
                <p><a href="http://www.kiva.org/lend/' + loan.id + '?app_id=' + loan.id + '" target="_blank">Lend</a></p>'
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
    // build list
    items.push('<ul>');
    items.push(makeBorrowerOption(data.loans));
    items.push('</ul>');
    $('#content').html(items.join(''));

    // get borrower countries
    var borrowerCountries = grabCountries(data.loans);

    // get 3-char country codes to use in datamap
    var countryCodes = {};
    for (country in borrowerCountries) {
      var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;    

      for (var i = 0, j = datamapCountries.length; i < j; i++) {
        if (datamapCountries[i].properties.name === country) {
          countryCodes[country] = datamapCountries[i].id;
        }
      }
    }
    
    var choropleth = {};
    for (country in countryCodes) {
      var countryCode = countryCodes[country];
      choropleth[countryCode] = {fillKey: 'borrowerLivesIn'};
    }
    console.log(JSON.stringify(choropleth));

    map.updateChoropleth(choropleth);
  });
};
