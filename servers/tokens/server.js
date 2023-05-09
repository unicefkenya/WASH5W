// See: https://www.stackhawk.com/blog/angular-cors-guide-examples-and-how-to-enable-it/#fix-cors-on-the-server-side

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require('body-parser');
const cors = require('cors');

const secret = "secret";

const server = express();

const port = process.env.PORT || 3002;
const hostname = '0.0.0.0';

const router = express.Router();

server.use(express.json());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cors());
server.use('/api/v1/tokens', router);


router.post("/encoding", (req, res) => {

	console.log("")
	console.log("Entering /api/v1/tokens/encoding");

	// Read in the passed in claim
	console.log("")
	console.log("Reading in the passed in claim");
	const { sub, uid, name, email, confirmed, enabled, rights } = req.body;

	// Update the claims and sign the token with 1 hr of expiration
	console.log("")
	console.log("Updating the claims and signing the token with 1 hr of expiration");
	const token = jwt.sign(
		{
			iss: "Reporting Tool",
			iat: Math.floor(Date.now()),
			exp: Math.floor(Date.now() / 1000) + (60 * 60),
			sub: sub,
			uid: uid,
			name: name,
			email: email,
			confirmed: confirmed,
			enabled: enabled,
			rights: rights
		}, secret);
	console.log("Token = " + token)

	// Return
	console.log("")
	console.log("Returning a success response");

	res.status(200).json({ token: token });

});


router.get("/verification", (req, res) => {

	console.log("")
	console.log("Entering /api/v1/tokens/verification");

	// Reading-in the token from the request headers
	console.log("")
	console.log("Reading-in the token from the request headers");
	const authHeader = req.headers.authorization;
	const token = authHeader.split(' ')[1];

	// Check if the token was successfully read in
	console.log("")
	console.log("Checking if the token was successfully read in");
	if (token) {

		// The token was successfully read in
		console.log("")
		console.log("The token was successfully read in");
		console.log("Token = " + token);

		// Verify the token
		console.log("")
		console.log("Verifying the token");
		jwt.verify(token, secret, function (err, decoded) {

			// Check if the token verification raised an error
			console.log("")
			console.log("Checking if the token verification raised an error");
			if (err) {

				// The token verification raised an error
				console.log("")
				console.log("The token verification raised an error");

				// Mark the token as invalid
				console.log("")
				console.log("Marking the token as invalid");

				res.status(200).json({ valid: false });

			} else {

				// The token verification did not raise an error
				console.log("")
				console.log("The token verification did not raise an error");

				// Mark the token as valid
				console.log("")
				console.log("Marking the token as valid");

				res.status(200).json({ valid: true });


			}
		});


	} else {


		// The token was not successfully read in
		console.log("")
		console.log("The token was not successfully read in");

		// Return error response
		console.log("")
		console.log("Return error response");

		res.status(500).send('The jwt token was not found in the request headers');
	}
});




router.get("/decoding", (req, res) => {

	console.log("")
	console.log("Entering /api/v1/tokens/decoding");

	// Reading-in the token from the request headers
	console.log("")
	console.log("Reading-in the token from the request headers");
	const authHeader = req.headers.authorization;
	const token = authHeader.split(' ')[1];

	// Check if the token was successfully read in
	console.log("")
	console.log("Checking if the token was successfully read in");
	if (token) {

		// The token was successfully read in
		console.log("")
		console.log("The token was successfully read in");
		console.log("Token = " + token);

		// Decode & return the decoded token
		console.log("")
		console.log("Decoding & returning the token");
		res.status(200).json(jwt.decode(token));


	} else {


		// The token was not successfully read in
		console.log("")
		console.log("The token was not successfully read in");

		// Return error response
		console.log("")
		console.log("Return error response");

		res.status(500).send('The jwt token was not found in the request headers');
	}
});



// Listen the server
server.listen(port, hostname, () => {
	console.log(`Token server is running on host ${hostname} and port ${port}`);
});
