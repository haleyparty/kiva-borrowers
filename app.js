function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.search);

  if (results === null) {
    return "";
  } else {
    return decodeURIComponent(results[1].replace(/\+/g, " "));
  }
}

function makeListItems(key, val) {
  var items = [];

  items.push('<li><b>' + key + '</b><ul>');

  $.each(val, function(key, val) {
    if (typeof(val) === 'object') {
      if (key !== 'image' && key !== 'description') {
        items.push(makeListItems(key, val));
      }
    } else {
      if (key !== 'country_code') {
        items.push('<li class="' + key + '"><b>' + key + ':</b> ' + val + '</li>');
      }
    }
  });

  items.push('</ul></li>');

  return items.join('');
}

$(document).ready(function() {
  var page = '';
  var loan_id = '';

  // get page parameter from URL
  if (page = getParameterByName('page')) {
    page = '&page='+page;
  }

  // is request for individual loan or loans
  if (loan_id = getParameterByName('loan_id')) {
    url = 'http://api.kivaws.org/v1/loans/'+loan_id+'.json';
    title = 'Loan';
  } else {
    url ='http://api.kivaws.org/v1/loans/newest.json';
    title = 'Loans';
  }

  // requests loan data
  $.getJSON(url+page, function(data) {
    var items = [];

    // Build the list
    items.push('<ul>');
    items.push(makeListItems(title, data.loans));
    items.push('</ul>');

    $('#content').html(items.join(''));

    // creates pages
    var prev_page = '';
    if (data.paging.page > 1) {
      prev_page = '<a href="index.html?page='+(data.paging.page-1)+'">Previous</a>';
    }

    var next_page = '';
    if (data.paging.page < data.paging.pages) {
      next_page = '<a href="index.html?page='+(data.paging.page+1)+'">Next</a>';
    }

    $('<div/>').html(prev_page+' '+data.paging.page+' of '+data.paging.pages+' '+next_page)
      .appendTo('#content');

    // Create links to loan pages
    $('.id').each(function () {
      $(this).wrapInner('<a href="index.html?loan_id='+$(this).text().substring(4,$(this).text().length)+'" />');
    });
  });
});
