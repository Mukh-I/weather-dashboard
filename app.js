const form = document.querySelector(".form");
const inputField = document.querySelector(".form input");
const forecastDiv = document.querySelector(".forecast");
const cardContainer = document.querySelector(".card-container");
const clearHistoryBtn = document.querySelector(".clear-history");
const ul = document.querySelector(".cities");

const searchHistory = JSON.parse(localStorage.getItem("searchTerms")) || [];

searchHistory.forEach(function (searchTerm) {
  const searchTermEl = `<li class='city'>${searchTerm}</li>`;
  ul.insertAdjacentHTML("afterbegin", searchTermEl);
});

clearHistoryBtn.addEventListener("click", function () {
  localStorage.clear();
  ul.innerHTML = "";
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const city = inputField.value;

  const data = await getWeatherData(city);
  inputField.value = "";
  //console.log(data);

  searchHistory.push(city);
  localStorage.setItem("searchTerms", JSON.stringify(searchHistory));
  forecastDiv.innerHTML = "";

  displayCurrentWeather(data.current, city);
  //console.log(data.daily.slice(1, 6));

  // display weather for the next 5 days
  data.daily.slice(1, 6).forEach(function (day) {
    displayForecast(day);
  });
});

ul.addEventListener("click", async function (e) {
  if (e.target.tagName !== "LI") return;
  const city = e.target.textContent;
  const data = await getWeatherData(city);
  forecastDiv.innerHTML = "";
  displayCurrentWeather(data.current, city);
  data.daily.slice(1, 6).forEach(function (day) {
    displayForecast(day);
  });
});

async function getWeatherData(city) {
  const apiKey = "02202a6ebc2cd24ba06290741876caed";
  const urlOne = `http://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric
  `;
  try {
    const res = await fetch(urlOne);
    const data = await res.json();

    const coords = data.city.coord;

    const urlTwo = `https://api.openweathermap.org/data/2.5/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${apiKey}&units=metric`;

    const weatherRes = await fetch(urlTwo);
    const weatherData = await weatherRes.json();

    return weatherData;
  } catch (err) {
    cardContainer.innerHTML =
      "<p style='color: orangered; font-size: 1.8rem'>Something went wrong! Try again.</p>";
  }
}

//getWeatherData();

function displayCurrentWeather(obj, city) {
  const iconurl = getIconUrl(obj);

  const bgColor =
    obj.uvi < 2
      ? "green"
      : obj.uvi > 2 && obj.uvi <= 5
      ? "orange"
      : obj.uvi > 5 && obj.uvi <= 10
      ? "red"
      : "";

  //console.log(bgColor);
  const html = `
      <div class="card">
        <div class="temp">
          <h2 style="font-weight: 400; margin-bottom: -8px">Now</h2>
          <p>${capitalise(city)}</p>
          <h3>${obj.temp.toFixed(0)} <sup>o</sup></h3>
          <p style='position: absolute; top: 40%;'>${capitalise(
            obj.weather[0].description
          )}</p>
        </div>
        <div class="secondary-info">
          <img
            src=${iconurl}
            alt=""
          />
          <p>Humidity:  ${obj.humidity}%</p>
          <p>Wind Speed:  ${(obj.wind_speed * 3.6).toFixed(0)} km/h</p>
          <p>UV Index: <span style='background-color:${bgColor}; border-radius: 5px; padding:0 3px;'>
            ${obj.uvi}</span></p>
        </div>
      </div>
  `;

  cardContainer.innerHTML = html;
}

function displayForecast(day) {
  const iconurl = getIconUrl(day);
  const html = `
 
    <div class="forecast-card">
      <p>${getDay(day.dt)}</p>
      <img src=${iconurl} alt="" />
      <p>Temp: ${day.temp.day.toFixed(
        0
      )} <sup style='font-size: 10px'>o</sup>C</p>
      <p>Humidity: ${day.humidity}%</p>
    </div>
  `;
  forecastDiv.insertAdjacentHTML("beforeend", html);
}

function getIconUrl(obj) {
  const iconcode = obj.weather[0].icon;
  const iconurl = `http://openweathermap.org/img/w/${iconcode}.png`;

  return iconurl;
}

function getDay(unixTimestamp) {
  const date = new Date(unixTimestamp * 1000);
  const day = String(date).split(" ").slice(0, 3).join(" ");
  return day;
}

function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1, str.length);
}
