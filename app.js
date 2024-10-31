const fs = require("fs");
const http = require("http");
const https = require("https");
const url = require("url");
const path = require("path");

const apiKey = '6b88192808d749428af205633231005';
const pexelsApiKey = 'h8abMbuIS3kvgG5cOOJniO5vGlg4ST3vP1pBH0SotRL5bRfy6Mx82qHO';

function fetchWeatherImage(weather, response) {
    const condition = weather.current.condition.text + " day";
    console.log(`Weather condition: ${condition}`);

    const apiUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(condition)}&per_page=1`;
    const options = {
        headers: {
            Authorization: pexelsApiKey
        }
    };

    https.get(apiUrl, options, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
            displayWeatherImage(body, response, condition);
        });
    }).on("error", (e) => {
        console.error(`Error fetching image: ${e.message}`);
    });
}

function displayWeatherImage(imageData, response, weatherState) {
    const imageInfo = JSON.parse(imageData);
    const imageUrl = imageInfo.photos[0]?.src.large2x || "";
    console.log(`Image URL: ${imageUrl}`);

    const resultDiv = `<img src="${imageUrl}" alt="${weatherState}" 
                        style="
                                width: 60%; 
                                height: 64%;">
                        <p>${weatherState}</p>`;

    //response.writeHead(200, { 'Content-Type': 'text/html'});
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(resultDiv);
}

function handleRequest(request, response) {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === "/") {
        const form = fs.createReadStream("index2.html");
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        form.pipe(response);
    
    } else if (pathname.startsWith("/assets/")) {
        const filePath = path.join(__dirname, pathname);
        fs.readFile(filePath, (err, data) => {
            if (err) {
                response.writeHead(404, { 'Content-Type': 'text/plain' });
                response.end('Asset not found');
            } else {
                response.writeHead(200, { 'Content-Type': getContentType(filePath) });
                response.end(data);
            }
        });
    }
     else if (pathname === '/weather') {
        const city = parsedUrl.query.city;
        console.log(`City selected: ${city}`);

        if (city) {
            const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(city)}`;

            https.get(apiUrl, (weatherRes) => {
                let body = "";
                weatherRes.on("data", chunk => body += chunk);
                weatherRes.on("end", () => {
                    const weatherData = JSON.parse(body);
                    fetchWeatherImage(weatherData, response);
                });
            }).on("error", (e) => {
                console.error(`Error fetching weather: ${e.message}`);
            });
        } else {
            response.writeHead(400, { 'Content-Type': 'text/plain' });
            response.end("City not specified");
        }
    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Page not found');
    }
}

    function getContentType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        switch (ext) {
            case '.png': return 'image/png';
            case '.jpg': return 'image/jpeg';
            case '.jpeg': return 'image/jpeg';
            case '.svg': return 'image/svg+xml';
            case '.css': return 'text/css';
            case '.js': return 'text/javascript';
            default: return 'application/octet-stream';
        }
    }

const server = http.createServer(handleRequest);
const port = 5501;
server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
