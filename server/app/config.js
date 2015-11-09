var mongoose = require('mongoose');

mongoURI = 'mongodb://localhost/kiva';
mongoose.connect(mongoURI);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function() {
  console.log('Mongodb connection open');
});

module.exports = db;
