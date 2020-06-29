var idCounter = 0;
var cities = [];

//Today's date
var dateToday = moment().format(`ddd, ll`);
$("#currentDay").append(dateToday);

//get the weather information and fetch data
function weatherInfo(cityName){
    var weatherApiUrl = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&units=imperial&appid=258563bcd408b087604452eb2e20b86f"
    fetch(weatherApiUrl).then(function(response){
        if (response.ok){
            response.json().then(function(data){
                var lat = data.coord.lat;
                var lon = data.coord.lon;
                var uvApiUrl = "https://api.openweathermap.org/data/2.5/uvi?appid=258563bcd408b087604452eb2e20b86f&lat=" + lat + "&lon=" + lon
                fetch(uvApiUrl).then(function(response){
                    if (response.ok){
                        response.json().then(function(uvData){                 
                            mergeWeatherInfo(data, uvData, cityName);
                        })
                    }
                    else{
                        alert("Error: " + response.statusText);
                    }
                })
                .catch(function(error){
                    alert("Connection Error To Open Weather");
                })
            })
        }
        else{
            alert("Error: " + response.statusText);
        }
    })
    .catch(function(error){
        alert("Unable to Access Open Weather");
    })
};

function dateFormat(date){
    var formattedDate = date.split("T")[0];
    var dateArr = formattedDate.split("-");
    return "(" + dateArr[1] + "/" + dateArr[2] + "/" + dateArr[0] + ")";
};
// creat the city data object
function mergeWeatherInfo(data, uvData, cityName){
    var temperature = data.main.temp;
    var humid = data.main.humidity;
    var windSpeed = data.wind.speed;
    var iconID = data.weather[0].icon;
    var ultraViolet = uvData.value;
    var date = uvData.date_iso;
    var timeCreated = moment();
    var idGenerator = "city-" + idCounter
    idCounter++;
    var iconUrl = "https://openweathermap.org/img/wn/"+ iconID + "@2x.png";
    var formattedDate = dateFormat(date);
    var cityDataObj = {
        name: cityName,
        id: idGenerator,
        humidity: humid,
        temp: temperature,
        wind: windSpeed,
        icon: iconUrl,
        uv: ultraViolet,
        date: formattedDate,
        time: timeCreated
    };
    
    if(cities.length != 0){
        var alreadySaved = false;
        for(var i = 0;i < cities.length;i++){
            if(cities[i].name == cityName){
                alreadySaved = true;
            }
        }

        if(!alreadySaved){
            cities.push(cityDataObj);
        }
        
    }  

    else if(cities.length == 0){
        console.log("adding new city");
        console.log("cities: " + cities);
        cities.push(cityDataObj);
        console.log("cities: " + cities);
    }
   
    saveCities();
    display(cityDataObj);   
};

function display(cityDataObj){
    displayCityButtons(cityDataObj);
    displayCurrentWeatherData(cityDataObj);
};


function displayCityButtons(cityWeatherObject){
    var deleteX = $("<i>")
        .addClass("icofont-close closeIcon");
        // window.location.reload(true);

    var cityDeleteButton = $("<button>")
        .addClass("delete-btn")
        .attr("id", cityWeatherObject.id)
        .append(deleteX);

    var cityButton = $("<button>")
        .addClass("city-btn")
        .attr("id", cityWeatherObject.id)
        .text(cityWeatherObject.name);

    var cityPlateLeft = $("<div>")
        .addClass("col-10 button-div")
        .append(cityButton);

    var cityPlateRight = $("<div>")
        .addClass("col-2 button-div")
        .append(cityDeleteButton);

    var cityPlate = $("<div>")
        .addClass("row")
        .attr("id", cityWeatherObject.id)
        .append(cityPlateLeft, cityPlateRight);
    $("#locations").prepend(cityPlate);

};

//Function to display the weather data

function displayCurrentWeatherData(cityWeatherObject){

    var icon = $("<img>")
        .attr("src", cityWeatherObject.icon);

    var cityTitle = $("<h3>")
        .text(cityWeatherObject.name + " " + cityWeatherObject.date)
        .append(icon);

    var tempLevel = $("<p>")
        .text("Temperature: " + cityWeatherObject.temp + " °F");

    var humidityLevel = $("<p>")
        .text("Humdity: " + cityWeatherObject.humidity + "%");

    var windLevel = $("<p>")
        .text("Wind Speed: " + cityWeatherObject.wind + " MPH");
        
    var uvSpan = $("<span>")
        .css("background-color", uvColor(cityWeatherObject.uv)[0])
        .css("color", uvColor(cityWeatherObject.uv)[1])
        .text(cityWeatherObject.uv);
    
    var uvLevel = $("<p>")
        .text("UV index: ")
        .append(uvSpan);

    var cardContent = $("<div>")
        .addClass("card-content")
        .append( cityTitle, tempLevel, humidityLevel, windLevel, uvLevel);

    var today = $("<div>")
        .addClass("card")
        .append( cardContent);

    $("#today").empty();

    $("#today").append(today);
};

function displayForecastWeatherData(cityWeatherObject){

};
//Function to remove the  city 
function deleteCity(cityId){

    var citySelected = $("#" + cityId).parent(".row").prevObject[0];
    citySelected.remove();
    var updatedCities = [];    for (var i = 0; i < cities.length; i++){
        if (cities[i].id !==cityId){
            updatedCities.push(cities[i]);
        }
    }

    cities = updatedCities;

    saveCities();

    if(cities.length != 0){
        displayCurrentWeatherData(cities[cities.length-1]);
    }
};

function saveCities(){
    localStorage.setItem("cities", JSON.stringify(cities));
};

function loadCities(){
    var loadedCities = localStorage.getItem("cities");

    if(!loadedCities){
        cities = [];
        return false;
    };
    cities = JSON.parse(loadedCities);
    var currentTime = moment();

    for(var i = 0;i < cities.length;i++){
        if(currentTime.diff(cities[i].time) > 10800000){
            console.log("a minimum of 3 hours have passed, grabbing more data");
            weatherInfo(cities[i].name);
        }
        cities[i].id = "city-" + idCounter;
        idCounter++;
        display(cities[i]);
        
    }

    saveCities();

};

$("#search-button").on("click", function(){

    var cityName = $(this).siblings("#search-bar").val().trim();
    
    if(cityName != ""){
        
        for(var i = 0; i < cities.length; i++){
            if(cityName == cities[i].name){
                alert("That City is Already Listed")
                return
            }
        }
        weatherInfo(cityName);
    }
    else{
        return;
    }
});

$("#locations").on("click", function(){

    if(event.target.matches(".city-btn")){
        var cityId = event.target.getAttribute("id");
        for(var i = 0; i < cities.length; i++){
            if(cities[i].id == cityId){
                displayCurrentWeatherData(cities[i]);
            }
        }
        
    }    
    else if(event.target.matches(".delete-btn")){
        var cityId = event.target.getAttribute("id");
        deleteCity(cityId);
    }

});
//uv color index
function uvColor(uvIndex){

    var color = ["magenta", "white"];

    if (uvIndex >= 0 && uvIndex < 4){
        color = ["green", "white"];
    }
    else if (uvIndex >= 5 && uvIndex < 7){
        color = ["yellow", "white"];
    }
    else if (uvIndex >= 8 && uvIndex < 10){
        color = ["purple", "white"];
    }
    else if (uvIndex >= 11 && uvIndex < 13){
        color = ["red", "white"];
    }
        return color;
    
};

loadCities();