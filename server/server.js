var express = require('express');
var app = express();

var port = process.env.PORT || 4568;

app.listen(port);

console.log('Server now listening on port ' + port);
