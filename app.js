const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");

const apiKey = '6b88192808d749428af205633231005';
const pexelsApiKey = 'h8abMbuIS3kvgG5cOOJniO5vGlg4ST3vP1pBH0SotRL5bRfy6Mx82qHO';

function fetchWeatherImage(weather, response) {
    const lookup = weather;
    let firstDefinition = lookup.current.condition.text;
    firstDefinition = firstDefinition + " day"; // Modify the weather condition
    console.log(firstDefinition);
    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(firstDefinition + " weather")}&per_page=1`;
    const options = {
        headers: {
        Authorization: pexelsApiKey
        }
    };

    https.get(apiUrl, options, (weatherImage) => {
        let body = "";
        weatherImage.on("data", chunk => body += chunk);
        weatherImage.on("end", () => {
            displayWeatherImage(body, response, firstDefinition);
        });
    });
}

function displayWeatherImage(imageData, response, weatherState) {
    const imageInfo = JSON.parse(imageData);
    const imageUrl = imageInfo.photos[0].src.large2x;

    const resultDiv = `<img src="${imageUrl}" alt="${weatherState}" style="width: 60%; height: 64%;"><p>${weatherState}</p>`;

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.end(resultDiv);
}

function handleRequest(request, response) {
    const { pathname } = url.parse(request.url);
    if (request.url === "/") {
        const form = fs.createReadStream("index.html");
        response.writeHead(200, {"Content-Type": "text/html"});
        form.pipe(response);
    } else if  (pathname === '/weather') {
        const user_input = new URL(request.url, `https://${request.headers.host}`).searchParams;
        city = user_input.get('city');
        console.log(city);

        const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;
        const call1 = https.request(apiUrl);

        call1.on("response", weather => {
            let body = "";
            weather.on("data", chunk => body += chunk);
            weather.on("end", () => {
                fetchWeatherImage(JSON.parse(body), response);
            });
        });
        call1.end();
    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Page not found');
    }
}

const server = http.createServer(handleRequest);
const port = 3000;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
