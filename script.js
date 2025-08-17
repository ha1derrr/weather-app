document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "https://api.weatherapi.com/v1";
  const WEATHER_API_KEY = "1561b5da9dcd4ffe9ce91111251708";

  // DOM Elements
  const searchBox = document.getElementById("search-box");
  const searchBtn = document.getElementById("search-btn");
  const weatherContainer = document.getElementById("weather-container");
  const weatherDisplay = document.getElementById("weather-display");
  const loader = document.getElementById("loader");

  // --- EVENT LISTENERS ---
  searchBtn.addEventListener("click", () => handleSearch());
  searchBox.addEventListener("keyup", (e) => {
    if (e.key === "Enter") handleSearch();
  });

  // --- INITIALIZATION ---
  // Try to get user's location on page load
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude},${longitude}`);
        },
        () => {
          // If user denies location, default to a major city
          fetchWeather("London");
        }
      );
    } else {
      fetchWeather("London");
    }
  };

  // --- API CALLS ---
  const fetchWeather = async (query) => {
    showLoader();
    const url = `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=5&aqi=yes&alerts=no`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`City not found (${response.status})`);
      }
      const data = await response.json();
      updateUI(data);
    } catch (error) {
      alert(error.message);
      hideLoader(false); // Hide loader without showing content
    }
  };

  // --- UI UPDATES ---
  const updateUI = (data) => {
    const { current, location, forecast } = data;
    const theme = getElementalTheme(current.condition.code);

    // 1. Apply Theme
    weatherContainer.className = "weather-container"; // Reset classes
    weatherContainer.classList.add(theme);

    // 2. Update Location & Time
    document.getElementById(
      "location-name"
    ).textContent = `${location.name}, ${location.country}`;
    document.getElementById("local-time").textContent = formatDateTime(
      location.localtime_epoch
    );

    // 3. Update Elemental Icon
    updateElementalIcon(theme);

    // 4. Update Current Weather and Story
    document.getElementById("temp-c").textContent = Math.round(current.temp_c);
    document.getElementById("weather-story").textContent =
      generateWeatherStory(data);

    // 5. Update Details Grid
    document.getElementById("feels-like").textContent = Math.round(
      current.feelslike_c
    );
    document.getElementById("wind-kph").textContent = current.wind_kph;
    document.getElementById("humidity").textContent = current.humidity;
    document.getElementById("aqi").textContent = getAqiDescription(
      current.air_quality["us-epa-index"]
    );

    // 6. Update Astro Info
    document.getElementById("sunrise").textContent =
      forecast.forecastday[0].astro.sunrise;
    document.getElementById("sunset").textContent =
      forecast.forecastday[0].astro.sunset;

    // 7. Update Forecast
    const forecastContainer = document.getElementById("forecast-container");
    forecastContainer.innerHTML = ""; // Clear previous forecast
    forecast.forecastday.slice(1, 5).forEach((day) => {
      // Show next 4 days
      const forecastCard = document.createElement("div");
      forecastCard.className = "forecast-card";
      forecastCard.innerHTML = `
                <h4>${formatDay(day.date_epoch)}</h4>
                <img src="${day.day.condition.icon}" alt="${
        day.day.condition.text
      }">
                <p class="temp-range">${Math.round(
                  day.day.maxtemp_c
                )}° / ${Math.round(day.day.mintemp_c)}°</p>
            `;
      forecastContainer.appendChild(forecastCard);
    });

    hideLoader(true);
  };

  const getElementalTheme = (code) => {
    // Weather condition codes from WeatherAPI documentation
    if ([1000].includes(code)) return "theme-fire"; // Sunny
    if (
      [
        1063, 1072, 1150, 1153, 1180, 1183, 1186, 1189, 1192, 1195, 1240, 1243,
        1246, 1273, 1276,
      ].includes(code)
    )
      return "theme-water"; // Rain/Thunder
    if (
      [
        1066, 1069, 1168, 1171, 1198, 1201, 1204, 1207, 1210, 1213, 1216, 1219,
        1222, 1225, 1237, 1249, 1252, 1255, 1258, 1261, 1264, 1279, 1282,
      ].includes(code)
    )
      return "theme-water"; // Snow/Sleet
    if ([1030, 1135, 1147].includes(code)) return "theme-air"; // Mist/Fog
    return "theme-earth"; // Default to cloudy/overcast
  };

  const updateElementalIcon = (theme) => {
    const container = document.querySelector(".elemental-icon-container");
    container.innerHTML = ""; // Clear previous icon
    let iconHTML = "";

    switch (theme) {
      case "theme-fire":
        iconHTML = '<div class="sun"></div>';
        break;
      case "theme-water":
        iconHTML = `
                    <div class="cloud"></div>
                    <div class="rain">
                        <div class="drop"></div><div class="drop"></div>
                        <div class="drop"></div><div class="drop"></div>
                    </div>`;
        break;
      case "theme-air":
        iconHTML = `
                    <div class="fog-layer layer-1"></div>
                    <div class="fog-layer layer-2"></div>`;
        break;
      case "theme-earth":
        iconHTML = '<div class="earthy-cloud"></div>';
        break;
    }
    container.innerHTML = iconHTML;
  };

  const generateWeatherStory = (data) => {
    const { current, forecast, location } = data;
    const condition = current.condition.text.toLowerCase();
    let story = `In ${
      location.name
    }, the elements are shaping a day of ${condition}. The air, holding a temperature of ${Math.round(
      current.temp_c
    )}°C, actually feels closer to ${Math.round(current.feelslike_c)}°C. `;
    story += `A ${
      current.wind_kph > 15 ? "brisk" : "gentle"
    } wind whispers from the ${current.wind_dir}. `;
    story += `As twilight approaches, the sun will set at ${forecast.forecastday[0].astro.sunset}, painting the sky.`;
    return story;
  };

  const getAqiDescription = (index) => {
    switch (index) {
      case 1:
        return "Good";
      case 2:
        return "Moderate";
      case 3:
        return "Unhealthy for sensitive";
      case 4:
        return "Unhealthy";
      case 5:
        return "Very Unhealthy";
      case 6:
        return "Hazardous";
      default:
        return "N/A";
    }
  };

  // --- HELPERS ---
  const handleSearch = () => {
    const query = searchBox.value.trim();
    if (query) {
      fetchWeather(query);
      searchBox.value = "";
    } else {
      alert("Please enter a city name.");
    }
  };

  const formatDateTime = (epoch) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });
  };

  const formatDay = (epoch) => {
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString(undefined, { weekday: "short" });
  };

  const showLoader = () => {
    loader.classList.remove("hidden");
    weatherDisplay.classList.add("hidden");
  };

  const hideLoader = (showContent) => {
    loader.classList.add("hidden");
    if (showContent) {
      weatherDisplay.classList.remove("hidden");
    }
  };

  // --- START THE APP ---
  getUserLocation();
});
