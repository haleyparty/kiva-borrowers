// put borrowers onto page (20 max, sorted by loan amount)
var makeBorrowerTemplate = function(loans, amountToLend, pageNum) {
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

    pageNum > 1 ? $('#content').append(items.join('')) : $('#content').html(items.join(''));
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

// get 3-digit country codes for d3
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
