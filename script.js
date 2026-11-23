const apiUrl = "https://api.open-meteo.com/v1/forecast?latitude=43.6532&longitude=-79.3832&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,wind_speed_10m&timezone=America%2FToronto";

const temperatureText = document.querySelector("#temperature");
const feelsLikeText = document.querySelector("#feels-like");
const conditionText = document.querySelector("#condition");
const weatherIcon = document.querySelector("#weather-icon");
const unitButton = document.querySelector("#unit-button");
const refreshButton = document.querySelector("#refresh-button");
const statusMessage = document.querySelector("#status-message");

let currentTemperature = 0;
let currentFeelsLike = 0;
let usingCelsius = true;

function getWeatherInfo(code) {
    if (code === 0) {
        return { name: "Clear sky", icon: "☀" };
    }
    if (code <= 3) {
        return { name: "Partly cloudy", icon: "◒" };
    }
    if (code === 45 || code === 48) {
        return { name: "Foggy", icon: "≋" };
    }
    if (code <= 67 || (code >= 80 && code <= 82)) {
        return { name: "Rainy", icon: "☂" };
    }
    if (code <= 77 || code === 85 || code === 86) {
        return { name: "Snowy", icon: "✣" };
    }
    if (code >= 95) {
        return { name: "Thunderstorm", icon: "ϟ" };
    }
    return { name: "Changing weather", icon: "○" };
}

function toFahrenheit(celsius) {
    return celsius * 9 / 5 + 32;
}

function showTemperatures() {
    if (usingCelsius) {
        temperatureText.textContent = Math.round(currentTemperature) + "°";
        feelsLikeText.textContent = Math.round(currentFeelsLike) + "°C";
        unitButton.textContent = "°C";
    } else {
        temperatureText.textContent = Math.round(toFahrenheit(currentTemperature)) + "°";
        feelsLikeText.textContent = Math.round(toFahrenheit(currentFeelsLike)) + "°F";
        unitButton.textContent = "°F";
    }
}

function updatePage(data) {
    const weather = data.current;
    const weatherInfo = getWeatherInfo(weather.weather_code);

    currentTemperature = weather.temperature_2m;
    currentFeelsLike = weather.apparent_temperature;

    showTemperatures();
    conditionText.textContent = weatherInfo.name;
    weatherIcon.textContent = weatherInfo.icon;
    document.querySelector("#humidity").textContent = weather.relative_humidity_2m + "%";
    document.querySelector("#wind").textContent = Math.round(weather.wind_speed_10m) + " km/h";
    document.querySelector("#cloud-cover").textContent = weather.cloud_cover + "%";

    const updateTime = new Date(weather.time);
    document.querySelector("#updated-time").textContent = "Updated " + updateTime.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit"
    });

    if (weather.is_day === 1) {
        document.body.classList.remove("night");
        document.querySelector("#day-note").textContent = "It is currently daytime in Toronto.";
    } else {
        document.body.classList.add("night");
        document.querySelector("#day-note").textContent = "It is currently nighttime in Toronto.";
    }

    statusMessage.textContent = "";
}

async function loadWeather() {
    refreshButton.disabled = true;
    refreshButton.textContent = "Loading...";
    statusMessage.textContent = "";

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error("The weather service did not respond.");
        }

        const data = await response.json();
        updatePage(data);
    } catch (error) {
        statusMessage.textContent = "Weather data could not be loaded. Please try again.";
        document.querySelector("#updated-time").textContent = "No live data";
    }

    refreshButton.disabled = false;
    refreshButton.textContent = "Refresh weather";
}

unitButton.addEventListener("click", function () {
    usingCelsius = !usingCelsius;
    showTemperatures();
});

refreshButton.addEventListener("click", loadWeather);

loadWeather();
