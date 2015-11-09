// put top 20 borrowers onto page
var makeBorrowerOption = function(loans) {
  var items = [];
  $.each(loans, function(index, loan) {
    console.log(loan);
    items.push('<p><b>' + loan.name + '</b></p>');
    items.push('<p>' + loan.activity + '</p>');
    items.push('<p>' + loan.use + '</p>');
    items.push('<p>$' + loan.loan_amount + '</p>');
    items.push('<p>$' + loan.funded_amount + '</p>');
  });
  return items.join('');
};

// grabs sector to generate get request for JSON data
var changeFunc = function() {
  var selectedOption = document.getElementById('filterSector');
  var selectedValue = selectedOption.options[selectedOption.selectedIndex].value;
  var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sector=' + selectedValue + '&sort_by=loan_amount';
  $.getJSON(url, function(data) {
    var items = [];
    // build list
    items.push('<ul>');
    items.push(makeBorrowerOption(data.loans));
    items.push('</ul>');
    $('#content').html(items.join(''));
  });
};
