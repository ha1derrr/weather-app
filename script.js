document.addEventListener("DOMContentLoaded", () => {
  const BASE_URL = "http://api.weatherapi.com/v1";
  const WEATHER_API_KEY = "1561b5da9dcd4ffe9ce91111251708";
  const search = document.querySelector(".search");
  const searchBtn = document.querySelector("#search-btn");
  const weather = document.querySelector(".weather-display");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (error) => {
        console.log(error.message);
        fetchWeather("London");
      }
    );
  } else {
    fetchWeather("London");
  }
  const fetchWeather = async (query) => {
    try {
      const url = `${BASE_URL}/forecast.json?key=${WEATHER_API_KEY}&q=${query}&days=1&aqi=yes&alerts=no`;
      console.log(url);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`City not found (${res.status})`);
      }
      const data = await res.json();
      updateUI(data);
    } catch (error) {
      alert(error.message);
    }
  };

  const updateUI = (data) => {
    const { location, current, forecast } = data;
  };
});
