/* Load the HTTP library */
  var http = require("http");

  /* Create an HTTP server to handle responses */

  http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("Hello World");
    response.end();
  }).listen(8888);

http.createServer(function(req, res) { 

    res.writeHead(200, {"Content-Type": "text/plain"});
    res.write("Hello World");
    res.end();

}).listen(3000, '0.0.0.0');
console.log('Server running at http://0.0.0.0:3000');