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

// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerTemplate = function(loans, amountToLend) {
  var items = [];
  $.each(loans, function(index, loan) {
    var loanAmount = loan.loan_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var fundedAmount = loan.funded_amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    var leftToFund = (loan.loan_amount - loan.funded_amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    var leftoverAfterFunding = (amountToLend > leftToFund) ? (amountToLend - leftToFund) : 0;
    leftoverAfterFunding = leftoverAfterFunding.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    var contributionPercentage = Math.round((amountToLend / loan.loan_amount) * 100);

    if (contributionPercentage > 100) {
      contributionPercentage = 100;
    }

    items.push('<img src="http://www.kiva.org/img/w200h200/' + loan.image.id + '.jpg"> \
                <h2>' + loan.name + '</h2>: <a href="http://www.kiva.org/lend/' + loan.id + '?app_id=' + loan.id + '" target="_blank">Lend</a> \
                <p><table style="width:50%"> \
                <tr><td><b>Total Requested:</b></td> <td>$' + loanAmount + '</td></tr> \
                <tr><td><i>Less: Amount Funded By Others:</i></td> <td><i>$' + fundedAmount + '</i></td></tr> \
                <tr><td><div class="divider"></div></td><td><div class="divider"></div></td></tr> \
                <tr><td><b>Amount Remaining to be Funded:</b></td> <td>$' + leftToFund + '</td></tr> \
                </table></p> \
                <p><table style="width:50%"> \
                <tr><td><b>Amount to Lend:</b></td> <td>' + amountToLend + '</td></tr> \
                <tr class="highlighted"><td><b>Percentage of Total Requested: </b></td> <td>' + contributionPercentage + '%</td></tr> \
                <tr><td><i>Amount Left Over After Funding:</i> </td> <td><i>$' + leftoverAfterFunding + '</i></td></tr> \
                </table></p> \
                <p><b>Location:</b> ' + loan.location.town + ', ' + loan.location.country + '<br> \
                <b>Activity:</b> ' + loan.activity + '<br> \
                <b>Use:</b> ' + loan.use + '</p> \
                <div class="divider"></div>'
                );
    });
    return items.join('');
};

var countries = {};
// get borrower country names and count for the query
var getBorrowerCountryNamesAndCount = function(loans, callThis) {
  if (callThis) {
    countries = {};
  }
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

var createBorrowerInfo = function(loans, amountToLend, pageNum) {
  var items = [];
  // build borrower information
  items.push(makeBorrowerTemplate(loans, amountToLend));
  pageNum > 1 ? $('#content').append(items.join('')) : $('#content').html(items.join(''));
  return;
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

  // all datamap countries listed
  var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;
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
