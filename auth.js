/**
 * A simple auth module with two published methods to:
 *  1. Generate an auth header and signature for an eventual request
 *  2. Take a request, parse its auth header and verify it
 *
 * Those methods use a clientId and secret to sign/verify
 *
 * This is a proof of concept, so it's intentionally simple. Notes:
 *  1. This assumes the use of hmac-sha256 as a hashing scheme. A more robust
 *     auth library would likely read the request, parse out the hashing
 *     scheme and use that one if possible. Or at least verify that sha256 is
 *     indeed the hashing scheme in use.
 *  2. The client ids and secrets are stored in a "database" which in this case
 *     is just an object. IRL, it'd be a real DB and the secret would ideally
 *     be encrypted
 *  3. There isn't really much in the way of checks/error handling
 */
const crypto = require('crypto');

function getSignedHeader (clientId, clientSecret, url, body) {
    const timestamp = (new Date().toISOString());
    const sig = getSignature(clientSecret, timestamp, url, body);
    return `HMAC-SHA256 clientId=${clientId};timestamp=${timestamp};signature=${sig}`
}

function getSignature (clientSecret, timestamp, url, body) {
    // hash the request url, body, and date using the secret
    const data = url + body + timestamp;
    const sig = crypto
        .createHmac('sha256', clientSecret)
        .update(data)
        .digest("base64");

    return sig;
}

function verifyRequest (req) {
    // Fake database holding our client ids and secrets
    const database = [
        { 'client_id': 'globally-unique-access-key-id', 'client_secret': 'some-preferrably-long-secret' }
    ];

    const authHeader = {};
    const auth = req.headers.authorization;
    let valid = false;

    if (auth) {
        // parse the auth header, which looks like:
        // HMAC-SHA256 clientId=globally-unique-access-key-id;timestamp=2018-12-09T14:32:33.899Z;signature=ufI+3czX3NfZZrKMKx5infFp2j9LH+AtyngxJdEfSFc=
        auth.split(' ')[1].split(';').forEach((a) => {
            const [ name, val ] = a.split(/=(.*)/);
            authHeader[name] = val;
        });

        // 'database' lookup for current user
        const creds = database.filter((row) => row.client_id === authHeader.clientId)[0];

        // calculate request signature based on the secret we have stored for the client id in the request
        const ourReqestSignature = getSignature(creds.client_secret, authHeader.timestamp, req.url, req.body);

        // determine whether the timestamp on the request is recent to prevent
        // potential replay attacks
        const expiry = 60 * 1000; // request must be withn the last 60 seconds
        const expired = Date.parse(authHeader.timestamp) + expiry < new Date().getTime();

        // do signatures match, and is the request unexpired?
        if (authHeader.signature === ourReqestSignature && !expired) {
            valid = true;
        }

        console.log(authHeader.signature, ourReqestSignature, authHeader.signature === ourReqestSignature)
    }

    return valid;
}

module.exports.getSignedHeader = getSignedHeader;
module.exports.verifyRequest = verifyRequest;