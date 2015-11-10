var map = new Datamap({
  element: document.getElementById('map'),
  fills: {
    defaultFill: '#ABDDA4',
    borrowerLivesIn: '#306596'
  },
  data: {
    // this will be filled upon each submit click
  },
  geographyConfig: {
    popupTemplate: function(geo, data) {
      return ['<div class="hoverinfo"><strong>',
              'Number of borrowers in ' + geo.properties.name,
              ': ' + data.countryCount,
              '</strong></div>'].join('');
    }
  }
});
