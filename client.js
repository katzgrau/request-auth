const request = require('request');
const auth = require('./auth');
const port = process.env.PORT || 3005;

const clientId = 'globally-unique-access-key-id';
const clientSecret = 'some-preferrably-long-secret';

const postData = JSON.stringify({
    email: 'katzgrau@gmail.com'
});

const baseUrl = `http://127.0.0.1:${port}`;
const apiEndpoint = '/users';

const authHeader = auth.getSignedHeader(clientId, clientSecret, apiEndpoint, postData);

request.post(`${baseUrl}${apiEndpoint}`, {
    body: postData,
    headers: {
        'content-type': 'application/json',
        'authorization': authHeader,
    },
}, (error, res, body) => {
    if (error) {
        console.error(error)
        return
    }
    console.log(`statusCode: ${res.statusCode}`);
});
