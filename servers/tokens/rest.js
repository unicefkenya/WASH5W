const http = require("http");
const https = require("https");

/**
* getJSON:  REST get request returning JSON object(s)
* @param options: http options object
*/
exports.getJSON = function (options) {

	console.log("");
	console.log("host = " + options.host);
	console.log("port = " + options.port);
	console.log("path = " + options.path);
	console.log("method = " + options.method);
	console.log("");

	let reqHandler = +options.port === 443 ? https : http;

	return new Promise((resolve, reject) => {

		let req = reqHandler.request(options, (res) => {

			let output = '';

			res.setEncoding('utf8');

			res.on('data', function (chunk) {
				output += chunk;
			});

			res.on('end', () => {

				try {

					let obj = JSON.parse(output);

					console.log("");
					console.log("response = " + res.statusCode);
					console.log("data = " + obj);
					console.log("");

					resolve({
						statusCode: res.statusCode,
						data: obj
					});
					
				}
				catch (err) {
					console.error('rest::end', err);
					reject(err);
				}
			});
		});

		req.on('error', (err) => {
			console.error('rest::request', err);
			reject(err);
		});

		req.end();
	});
};
