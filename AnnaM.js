/* What i want to do in this script.
1. i want to get data (for now create data)
2. determine what needs to be stored and what i need to send to the API
3. send data to API or database.

Do we know what data to handle?
* Temperature (in the water or the engine?)
* Time (now or the time of update?)
* The lonitude and altidude from johan's code
* Velocity (if the we have that from a sensor or we can ruffly calculate it.)
* Diraction of travell(again he we have that from a sensor or we can ruffly calculate it.)
* What ever info we get form the sensors.

It is suposed to be easy to get hte data to put it in on the stingray tab.
*/
function theLocation() {
    var LAT = 56.181017; // Starting position
    var LONG = 15.588019; //Starting position
    var latChange = Math.random() / 20000;
    var longChange = Math.random() / 20000;
    var posNegLat = Math.random(); // Positive or negative direction
    var posNegLong = Math.random();
    if (posNegLat > 0.5) {
        LAT -= latChange;
    }
    else {
        LAT += latChange;
    }
    if (posNegLong > 0.5) {
        LONG -= longChange;
    }
    else {
        LONG += longChange;
    }
    return [LONG, LAT];
}
/*
function diractionOfTravell(LONG: number, LAT: number): void {
  let newLong = LONG;
  let newLat = LAT;
  const oldLong = newLong;
  const oldLat = newLat;
  // TODO: Implement direction of travel calculation
}
*/
function generateTheTemperature(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function getTheCurrentTime() {
    var now = new Date();
    return now.toLocaleTimeString();
}
// This loop function is just to simulate that the stingray send the data in intervals.
function theLoopFunction() {
    var temperature = generateTheTemperature(0, 20);
    console.log("The temperature is ".concat(temperature, " degrees."));
    var currentTime = getTheCurrentTime();
    console.log("The current time is ".concat(currentTime, "."));
    var loc = theLocation();
    console.log("Longitude = ".concat(loc[0], ", latitude ").concat(loc[1]));
}
setInterval(theLoopFunction, 1000); // Runs myLoopFunction every 1000 milliseconds (1 second)
