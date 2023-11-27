document.addEventListener("DOMContentLoaded", function () {
  const weatherApp = document.querySelector(".weather-app");
  const subtitleText = document.querySelector("#subtitleFormat h4");
  const inputPart = weatherApp.querySelector(".search-section");
  const infoTxt = subtitleText;
  const inputField = inputPart.querySelector("input");
  const arrowBack = weatherApp.querySelector("header i");
  const searchIcon = inputPart.querySelector(".search-button");
  const stadiumButtonsContainer = document.querySelector(".stadium-buttons-container");
  const weatherDetailsContainer = document.querySelector(".weather-details");
  let api;
  let stadiums;

  function handleSearch() {
    if (inputField.value.trim() !== "") {
      requestApi(inputField.value.trim());
    } else {
      alert("Please enter a city name");
    }
  }

  inputField.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && inputField.value.trim() !== "") {
      e.preventDefault();
      handleSearch();
    }
  });

  searchIcon.addEventListener("click", function () {
    handleSearch();
  });

  function requestApi(city) {
    const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    api = "https://pvq5q52hi0.execute-api.us-east-2.amazonaws.com/StadiumWeatherProduction/stadium-info?city=" + encodeURIComponent(formattedCity);
    fetchData();
  }
  
  function onSuccess(position) {
    const { latitude, longitude } = position.coords;
    api = `https://pvq5q52hi0.execute-api.us-east-2.amazonaws.com/StadiumWeatherProduction/stadium-info?lat=${latitude}&lon=${longitude}`;
    fetchData();
  }

  function onError(error) {
    infoTxt.innerText = error.message;
    infoTxt.classList.add("error");
  }

  function fetchData() {
    infoTxt.innerText = "Getting stadium information...";
    infoTxt.classList.add("pending");
    fetch(api, {
      headers: {
        "x-api-key": "4BFHig62Te7qeE9ZSAJ1F2EnzQGBtCZAcKvwc4K7",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        stadiums = data.stadiums;
        displayStadiums(stadiums);
      })
      .catch((error) => {
        console.error("Error fetching stadiums:", error);
        infoTxt.innerText = "Error fetching stadium information";
        infoTxt.classList.add("error");
      });
  }

  function displayStadiums(stadiums) {
    infoTxt.classList.remove("pending", "error");
    infoTxt.innerText = "";
    inputField.value = "";
    const stadiumButtonsContainer = document.querySelector(".stadium-buttons-container");
    stadiumButtonsContainer.innerHTML = "";

    if (stadiums.length === 0) {
      subtitleText.innerText = "No stadiums found for the searched city. Please try another city.";
      return;
    }

    stadiums.forEach((stadium) => {
      const button = document.createElement("button");
      button.classList.add("stadium-button");
      button.setAttribute("data-stadium-id", stadium.stadium_id);
      button.innerText = `${stadium.stadium_name} - ${stadium.stadium_team}`;
      stadiumButtonsContainer.appendChild(button);
    });

    stadiumButtonsContainer.addEventListener("click", function (event) {
      if (event.target.classList.contains("stadium-button")) {
        const stadiumId = event.target.getAttribute("data-stadium-id");
        fetchWeatherData(stadiumId);
      }
    });

    subtitleText.innerText = "Find the weather at a stadium by searching below the city .";
    stadiumButtonsContainer.style.display = "block";
  }

  function fetchWeatherData(stadiumId) {
    const selectedStadium = stadiums.find((stadium) => stadium.stadium_id === stadiumId);
    const { stadium_latitude, stadium_longitude } = selectedStadium;
    const weatherApi = `https://api.openweathermap.org/data/2.5/weather?lat=${stadium_latitude}&lon=${stadium_longitude}&units=imperial&appid=e6d5f086c46945ffeda378e84cf6688d`; // Change 'metric' to 'imperial' for Fahrenheit
    fetch(weatherApi)
      .then((response) => response.json())
      .then((weatherData) => displayWeatherData(weatherData, selectedStadium))
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        infoTxt.innerText = "Error fetching weather information";
        infoTxt.classList.add("error");
      });
  }

  function displayWeatherData(weatherData, stadium) {
    const weatherDetailsContainer = document.querySelector(".weather-details");
    const temperatureFahrenheit = weatherData.main.temp;
    const feelsLikeFahrenheit = weatherData.main.feels_like;

    weatherDetailsContainer.innerHTML = `
      <h2>${stadium.stadium_name} - ${stadium.stadium_team}</h2>
      <p>Current Weather: ${weatherData.weather[0].description}</p>
      <p>Temperature: ${temperatureFahrenheit.toFixed(2)}°F</p>
      <p>Feels Like: ${feelsLikeFahrenheit.toFixed(2)}°F</p>
      <p>Humidity: ${weatherData.main.humidity}%</p>
      <p>Wind Speed: ${weatherData.wind.speed} mph</p>
  `;

    weatherDetailsContainer.style.display = "block";
    const stadiumButtonsContainer = document.querySelector(".stadium-buttons-container");
    if (stadiumButtonsContainer) {
      stadiumButtonsContainer.style.display = "none";
    }
  }


  arrowBack.addEventListener("click", function () {
    const stadiumButtonsContainer = document.querySelector(".stadium-buttons-container");
    const weatherDetailsContainer = document.querySelector(".weather-details");

    if (stadiumButtonsContainer && weatherDetailsContainer) {
      stadiumButtonsContainer.style.display = "block";
      weatherDetailsContainer.style.display = "none";
    }
  });
});