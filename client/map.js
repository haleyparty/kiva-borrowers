var map = new Datamap({
  element: document.getElementById('map'),
  fills: {
    defaultFill: '#ABDDA4',
    borrowerLivesIn: '#306596'
  },
  data: {
    // this will be filled upon each submit click (which will call createChoropleth)
  },
  geographyConfig: {
    popupTemplate: function(geo, data) {
      if (data) {
        return ['<div class="hoverinfo"><strong>',
                'Total borrowers in ' + geo.properties.name,
                ': ' + data.countryCount,
                '</strong></div>'].join('');
      } else {
        return ['<div class="hoverinfo"><strong>',
                geo.properties.name,
                '</strong></div>'].join('');
      }
    }
  }
});

var createChoropleth = function(countryCodes, borrowerCountries, datamapCountries, callThis) {
  // create choropleth object to inject into map
  var choropleth = {};
  for (country in countryCodes) {
    var countryCode = countryCodes[country];
    choropleth[countryCode] = {fillKey: 'borrowerLivesIn', countryCount: borrowerCountries[country]};
  }

  // make countries not in countryCodes object the default color
  if (callThis) {
    for (var i = 0, j = datamapCountries.length; i < j; i++) {
      if (!(datamapCountries[i].id in choropleth) && datamapCountries[i].id !== '-99') {
        var countryCode = datamapCountries[i].id;
        choropleth[countryCode] = {fillKey: 'defaultFill', countryCount: 0};
      }
    }
  }
  map.updateChoropleth(choropleth);
};
