var express = require('express');
var config = require("../../config/riak.js");
var riak = require('riak-js').getClient(config);

var app = express.createServer();

var json = function(object) {
  return JSON.stringify(object);
}

var buildQuery = function(params) {
  var operator = (params.operator == 'and' ? '+' : '-');
  var terms = params.query.split(" ").map(function(term) {
    return operator + 'message:' + term.replace(/'"\\/ig, '');
  }).join(" ");
  var query = terms + '';
  return query;
}
app.use(express.bodyDecoder());
app.use(express.staticProvider(__dirname + '/public'));
app.set('views', __dirname + '/views');

app.get('/', function(request, response) {
  response.render('index.ejs', {locals: {hello: 'world'}});
});

app.post('/search', function(request, response) {
  riak.search('syslog', buildQuery(request.body.search), {sort: 'time', rows: 200}, function(err, data) {
    response.contentType('.json');
    var docs = [];
    if (data) {
      docs = data.docs
    }
    response.send(json({results: docs}));
  });
});

app.listen(3000);