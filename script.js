document.addEventListener("DOMContentLoaded", () => {
  const WEATHER_API_KEY = "1561b5da9dcd4ffe9ce91111251708";
  const BASE_URL = "https://api.weatherapi.com/v1";

  // DOM Elements
  const scapeContainer = document.getElementById("scape-container");
  const celestialBody = document.getElementById("celestial-body");
  const cloudLayer = document.getElementById("cloud-layer");
  const precipitationLayer = document.getElementById("precipitation-layer");
  const searchBox = document.getElementById("search-box");
  const searchBtn = document.getElementById("search-btn");
  const weatherDisplay = document.getElementById("weather-display");
  const loader = document.getElementById("loader");

  // Alert Banner Elements
  const alertBanner = document.getElementById("alert-banner");
  const alertText = document.getElementById("alert-text");
  const alertClose = document.getElementById("alert-close");

  // --- Event Listeners ---
  searchBtn.addEventListener("click", handleSearch);
  searchBox.addEventListener(
    "keyup",
    (e) => e.key === "Enter" && handleSearch()
  );
  alertClose.addEventListener("click", () =>
    alertBanner.classList.add("hidden")
  );

  // --- Initial Fetch ---
  navigator.geolocation.getCurrentPosition(
    (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
    () => fetchWeather("London") // Default fallback
  );

  // --- Core Functions ---
  async function fetchWeather(query) {
    showLoader();
    const url = `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=1&aqi=no&alerts=yes`;
    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Location not found (${response.status})`);
      const data = await response.json();
      updateUI(data);
    } catch (error) {
      alert(error.message);
      hideLoader(false);
    }
  }

  function updateUI(data) {
    const { current, location, forecast, alerts } = data;

    // Update Scene
    updateScene(current, location);

    // Update Text Info
    document.getElementById("location-name").textContent = location.name;
    document.getElementById("condition-text").textContent =
      current.condition.text;
    document.getElementById("temp-c").textContent = Math.round(current.temp_c);
    document.getElementById("feels-like").textContent = Math.round(
      current.feelslike_c
    );
    document.getElementById("wind-kph").textContent = current.wind_kph;
    document.getElementById("humidity").textContent = current.humidity;
    document.getElementById("uv-index").textContent = current.uv;

    // Handle Alerts
    if (alerts.alert.length > 0) {
      alertText.textContent = alerts.alert[0].headline;
      alertBanner.classList.remove("hidden");
    } else {
      alertBanner.classList.add("hidden");
    }

    hideLoader(true);
  }

  function updateScene(current, location) {
    // 1. Day/Night Cycle
    scapeContainer.className = "scape-container"; // Reset
    if (current.is_day) {
      scapeContainer.classList.add("is-day");
      celestialBody.className = "celestial-body sun";
    } else {
      scapeContainer.classList.add("is-night");
      celestialBody.className = "celestial-body moon";
    }

    // Animate sun/moon position
    const localTime = new Date(location.localtime_epoch * 1000);
    const hours = localTime.getHours() + localTime.getMinutes() / 60;
    const percentOfDay = (hours - 5) / 15; // Simplified path from ~5am to 8pm
    const xPos = 100 * percentOfDay;
    const yPos = 50 - 50 * Math.sin(Math.PI * percentOfDay);
    celestialBody.style.left = `${xPos}vw`;
    celestialBody.style.top = `${yPos}vh`;

    // 2. Clouds
    cloudLayer.innerHTML = "";
    const cloudCount = current.cloud / 20; // More clouds if cloudier
    for (let i = 0; i < cloudCount; i++) {
      createCloud();
    }

    // 3. Precipitation
    precipitationLayer.innerHTML = "";
    if (current.condition.text.toLowerCase().includes("rain")) {
      createPrecipitation("rain", 70);
    } else if (current.condition.text.toLowerCase().includes("snow")) {
      createPrecipitation("snow", 70);
    }
  }

  // --- Element Creation ---
  function createCloud() {
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    cloud.style.top = `${Math.random() * 30}%`;
    cloud.style.left = `${Math.random() * 100 - 20}%`;
    cloud.style.animationDuration = `${Math.random() * 40 + 40}s`;
    cloud.style.transform = `scale(${Math.random() * 0.5 + 0.8})`;
    cloudLayer.appendChild(cloud);
  }

  function createPrecipitation(type, count) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement("div");
      if (type === "rain") {
        particle.className = "rain-drop";
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDuration = `${Math.random() * 0.2 + 0.3}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
      } else if (type === "snow") {
        particle.className = "snowflake";
        particle.style.left = `${Math.random() * 100}vw`;
        particle.style.animationDuration = `${Math.random() * 5 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.opacity = Math.random();
      }
      precipitationLayer.appendChild(particle);
    }
  }

  // --- Helpers ---
  function handleSearch() {
    const query = searchBox.value.trim();
    if (query) fetchWeather(query);
  }

  function showLoader() {
    loader.style.display = "block";
    weatherDisplay.classList.add("hidden");
  }

  function hideLoader(showContent) {
    loader.style.display = "none";
    if (showContent) weatherDisplay.classList.remove("hidden");
  }
});
