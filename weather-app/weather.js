var latitude, longitude;
var city, countryCode;
var apiKey = "6f1e1aeedc69dd16f6982bc19b64217f"; // move to separate file.
var api = "http://api.openweathermap.org/data/2.5/weather?";

function getLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      callback();
    });
  } else {
    $("#debug").text("No geolocation :(");
  }
}

function deduceCity() {
  return $.getJSON("http://ipinfo.io", function (json) {
    city = json.city;
  });
}

function getWeatherByLoc(lat, lon) {
  var parameters = "lat=" + lat + "&lon=" + lon + "&APPID=" + apiKey;
  var link = api + parameters;
  return $.getJSON(link, function (json) {
    countryCode = json.sys.country;
    $("#temp").text(round2(json.main.temp));
    $("#desc").text(json.weather[0].main);
    $("#weather-icon").html("<img src=\"http://openweathermap.org/img/w/" +
    json.weather[0].icon + ".png\"></img>");
  });
}

function round2 (val) {
  return Math.round((val + 0.00001) * 100) / 100;
}

// the following chain is implied: K (Kelvin) -> C (Celcius) -> F (Fahrenheit)
function convertTemp(tempModifier, absolute) {
  switch (tempModifier) {
    case 'K':
      return [round2(absolute - 273.15), 'C'];
    case 'C':
      return [round2(absolute * 9 / 5 + 32), 'F'];
    case 'F':
      return [round2((absolute - 32) * 5 / 9 + 273.15), 'K'];
  }
}

$(document).ready(function () {
  $("#temp-unit").on("click", function () {
    var mod = $("#temp-unit").text(),
        val = $("#temp").text();
    var newTemp = convertTemp(mod, val); // [temp, modifier];
    $("#temp").text(newTemp[0]);
    $("#temp-unit").text(newTemp[1]);
  });

  getLocation(function () {
    // at this point latitude and longitude are set.
    Promise.all([
      deduceCity(),
      getWeatherByLoc(latitude, longitude)
    ]).then(function (r) {
      $("#locName").text(city + ", " + countryCode);
    }).catch(function () {
      $("#locName").text("Cannot detect city / get the weather");
    });
  });
});
