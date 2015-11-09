// put top 20 borrowers onto page
var makeBorrowerOption = function(loans) {
  var items = [];
  $.each(loans, function(index, loan) {
    items.push('<h3>' + loan.name + '</h3> \
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

// grabs sector & region to generate get request for JSON data
var getData = function() {
  var selectedRegion = document.getElementById('filterRegion');
  var regionValue = selectedRegion.options[selectedRegion.selectedIndex].value;

  var selectedSector = document.getElementById('filterSector');
  var sectorValue = selectedSector.options[selectedSector.selectedIndex].value;

  var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + sectorValue + '&region=' + regionValue + '&sort_by=loan_amount';
  $.getJSON(url, function(data) {
    var items = [];
    // build list
    items.push('<ul>');
    items.push(makeBorrowerOption(data.loans));
    items.push('</ul>');
    $('#content').html(items.join(''));
  });
};
