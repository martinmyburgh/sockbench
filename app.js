/* jshint node: true */

var http = require("http"),
	fs = require("fs"),
	sockjs = require("sockjs"),
	engine = require("engine.io"),
	server, engineServer, sockjsServer;


server = http.createServer(function (req, res) {
	var path = __dirname + (req.url === '/'? '/index.html': req.url),
		stat;
	
	try {
		stat = fs.statSync(path);
	} catch (e) {
		res.writeHead(404);
		res.end("Not found.");
		return;
	}
	
	res.writeHead(200);	
	fs.createReadStream(path).pipe(res);
});

engineServer = engine.attach(server, {path: "/engine.io"});
engineServer.on('connection', function (socket) {
	console.log("eio connected");
	socket.on('message', function (data) {
		socket.send(data);
	});
});

sockjsServer = sockjs.createServer({ sockjs_url: 'http://localhost:7625/sockjs.min.js' });
sockjsServer.on('connection', function (socket) {
	console.log("sjs connected");
	socket.on('data', function (data) {
		socket.write(data);
	});
});
sockjsServer.installHandlers(server, {prefix: "/sockjs"});

server.listen(7625);
console.log('http://localhost:7625');
