# Sample Request Authorization

Proof of concept for API request authorization via a client ID and secret.
The request signing and verification is in auth.js - some shortcuts were taken
as to not cloud the example with code not core to the concept.

`auth.verifyRequest()` checks for the correct signature on the message,
verifying idendity and authenticty of the message, while also checking that
the timestamp on the request is at most 60 seconds in the past, preventing
replay attacks.

This project only uses core node modules

## Running Locally

    $ node server.js # runs on port 3005
    $ # in another tab
    # issues a POST to the server and logs the http response code (200).
    # change the secret in client.js to see a 403
    $ node client.js