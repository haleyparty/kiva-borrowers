var checkAmountToLend = function(amountToLend) {
  return amountToLend > 0;
};

// create URL for getJSON request
var urlChoice = function(sectorValue, regionValue, genderValue, pageNum) {
  var url = 'http://api.kivaws.org/v1/loans/search.json?status=fundraising&sort_by=loan_amount';
  if (sectorValue !== '') {
    url = url + '&sector=' + sectorValue;
  }
  if (regionValue !== '') {
    url = url + '&region=' + regionValue;
  }
  if (genderValue) {
    url = url + '&gender=female';
  }
  url = url + '&page=' + pageNum;
  return url;
};

// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerOption = function(loans, amountToLend) {
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
                <tr><td><i>Less: Amount Funded So Far:</i></td> <td><i>$' + fundedAmount + '</i></td></tr> \
                <tr><td><b>Amount Remaining to Fund:</b></td> <td>$' + leftToFund + '</td></tr> \
                <tr><td><b>Contribution Percentage: </b></td> <td>' + contributionPercentage + '%</td></tr> \
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

var createBorrowerInfo = function(loans, amountToLend, pageNum) {
  var items = [];
  // build borrower information
  items.push(makeBorrowerOption(loans, amountToLend));
  pageNum > 1 ? $('#content').append(items.join('')) : $('#content').html(items.join(''));
  return;
};

// grabs sector & region to generate get request for JSON data
var getData = function() {
  if ($('#incorrectInput').text()) {
    $('#incorrectInput').text('');
  }
  var amountToLend = Number($('#amountToDonate').val());
  // all datamap countries listed
  var datamapCountries = Datamap.prototype.worldTopo.objects.world.geometries;
  if (checkAmountToLend(amountToLend)) {
    var regionValue = $('#filterRegion').val();
    var sectorValue = $('#filterSector').val();
    var genderValue = $('#checkBox').is(':checked');

    var contentHTML = '';
    var pageNum = 1;
    var url = urlChoice(sectorValue, regionValue, genderValue, pageNum);


    // for now limit is set at 3 page queries
    var JSONrequest = function(url) {
      $.getJSON(url, function(data) {
        createBorrowerInfo(data.loans, amountToLend, pageNum);
        contentHTML = $('#content').html();
        // if contentHTML = '', increment pageNum and continue to next iteration
        if (contentHTML === '' && pageNum <= 2) {
          pageNum++;
          JSONrequest(url + '&page=' + pageNum);
        } else if (contentHTML === '') {
          createChoropleth({}, {}, datamapCountries, true);
          return;
        } else if (pageNum <= 3) {
          var callThis = pageNum > 1 ? false : true;
          // borrower countries
          var borrowerCountries = getBorrowerCountryNamesAndCount(data.loans, callThis);

          // get 3-char country codes to use in datamap
          var countryCodes = getCountryCodes(borrowerCountries, datamapCountries);
          
          createChoropleth(countryCodes, borrowerCountries, datamapCountries, callThis);

          // call for more pages (up to limit allowed by Kiva API)
          pageNum++;
          JSONrequest(url + '&page=' + pageNum);
        }

      });
    };

    JSONrequest(url);
  } else {
    $('#incorrectInput').text('Please enter a positive number');
    $('#content').html('');
    createChoropleth({}, {}, datamapCountries, true);
  }
};
