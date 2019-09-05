const Hebcal = require('..');

const hebcal = new Hebcal();

// Test that hebcal can be initialized
console.assert(new Hebcal(), "can't initialize hebcal"); 

// Test that a hebcal instance is an instance of the base object
console.assert(hebcal instanceof Hebcal); 

// Test that years are numbers
console.assert(typeof hebcal.months[0].year === 'number', "years should be returned as numbers");

// Test that you can set a location, and it returns a Hebcal
console.assert(hebcal.setCity('Jerusalem') instanceof Hebcal); 

// Test that you can initialize a Hebcal instance with a gregorian year and month and access the hebrew year of that instance
console.assert(new Hebcal.GregYear(2017, 08).hebyears[0] === 5777, "should return the hebrew year from the gregorian year");

// Test that you can initialize a Hebcal instance via a Date object, and get the Hebrew date value back
const anHDate = new Hebcal.HDate(new Date(2014, 0, 1));
console.assert(anHDate instanceof Hebcal.HDate, "should be an instance of HDate");
console.assert(JSON.stringify(anHDate) === '{"month":10,"day":29,"year":5774,"lat":0,"long":0,"il":false}');

// Test that you can initialize an HDate with a Hebrew date string and parse it
console.assert(JSON.stringify(new Hebcal.HDate('1 Tishrei 5774')) === JSON.stringify({ month: 7, day: 1, year: 5774, lat: 0, long: 0, il: false }), "Should parse a Hebrew date string to an object");

// Test that there is a holiday property containing holidays for a given year, with a description for rosh hashana
console.assert(new Hebcal(5777).holidays['1 Tishrei 5777'][0].desc[0] === 'Rosh Hashana 1', "should have a holiday title for rosh hashana in 5777");