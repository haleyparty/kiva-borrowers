var backoff = require('backoff');
// var server = require('./server.js');
var request = require('request');

var fibonacciBackoff = backoff.fibonacci({
  randomisationFactor: 0,
  initialDelay: 10,
  maxDelay: 300
});

fibonacciBackoff.failAfter(10);

fibonacciBackoff.on('backoff', function(number, delay) {
    // Do something when backoff starts, e.g. show to the
    // user the delay before next reconnection attempt.
    console.log(number + ' ' + delay + 'ms');
});

fibonacciBackoff.on('ready', function(number, delay) {
    // Do something when backoff ends, e.g. retry a failed
    // operation (DNS lookup, API call, etc.). If it fails
    // again then backoff, otherwise reset the backoff
    // instance.
    request('http://api.kivaws.org/v1/loans/search.json?sort_by=loan_amount', function(err, res, body) {
      if (!err && res.statusCode === 200) {
        console.log(body);
      }
    });
    fibonacciBackoff.backoff();
});

fibonacciBackoff.on('fail', function() {
    // Do something when the maximum number of backoffs is
    // reached, e.g. ask the user to check its connection.
    console.log('fail');
});

fibonacciBackoff.backoff();
