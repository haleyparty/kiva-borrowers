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
