var http = require('http');  
var mysql = require('mysql');
var formidable = require('formidable');
var fs = require('graceful-fs');
var qs = require('querystring');
var path = require('path');


function findTypePage(filePath) { 
    	var extname = path.extname(filePath);
    	contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    		} console.log("Using Content for: " + filePath + ", Type: " + contentType);
}

function maintainServer(req, res) { 
	var filePath = '.' + req.url; 
 if (req.url == '/') { 
	filePath = './main_or.html';
	if(req.method == "POST") 
	{
	} 
 }
 else if (req.url == '/host') { 
	filePath = './host_view.html';
	if(req.method == "POST") 
	{
	} 
 }
 else if (req.url == '/group') { 
	filePath = './group_view.html';
 }
else {

}
	//section below prints out page without error//
	fs.readFile(filePath, function(error, content) {
	findTypePage(filePath);
	if(contentType != null)
	{res.writeHead(200, { 'Content-Type': contentType });
	res.end(content, 'utf-8'); } //content //
   						 });
}

http.createServer(function(req, res) { 
maintainServer(req, res);
}).listen(8888);

http.createServer(function(req, res) { 
maintainServer(req, res);
}).listen(3000, '0.0.0.0');
console.log('Server running at http://0.0.0.0:3000');