const http = require('http');
const auth = require('./auth');

const port = process.env.PORT || 3005;

const handleRequest = (req, resp) => {
    console.log('Incoming request',req.method, req.url, req.body);
    if (!auth.verifyRequest(req)) {
        console.log('401 Request was not authorized');
        resp.statusCode = 401;
    } else {
        console.log('200 Request is authorized');
    }
    resp.end();
}

http.createServer(function (req, resp) {
    if (req.method === 'POST' || req.method === 'PUT') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            req.body = body;
            handleRequest(req, resp);
        });
    }

    if (req.method === 'GET') {
        handleRequest(req, resp);
    }
}).listen(port);
console.log('Listening on', port);