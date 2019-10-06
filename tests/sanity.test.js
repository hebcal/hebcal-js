const Hebcal = require("../src/hebcal");

const createNewHebcal = () => new Hebcal();

describe("Sanity Test", () => {
    let hebcal = createNewHebcal();
    beforeEach(() => {
        const hebcal = createNewHebcal();
    });
    describe("Initialize Hebcal instance", () => {
        test("that hebcal can be initialized without throwing an error", () => {
            expect(createNewHebcal).not.toThrow();
        });
        test("hebcal instance should be an instance of the base object ", () => {
            expect(hebcal).toBeInstanceOf(Hebcal);
        });
        test("should allow changing the city after initialization", () => {
            // Arrange
            const newYorkCalendar = createNewHebcal().setCity("New_York");
            // Action
            const jerusalemCalendar = hebcal.setCity("Jerusalem");
            // Assert
            expect(newYorkCalendar).not.toEqual(jerusalemCalendar);
        });
        test("should allow initialization using a Date object", () => {
            // Arrange
            const anHDate = new Hebcal.HDate(new Date(2014, 0, 1));
            // Assert
            expect(anHDate).toBeInstanceOf(Hebcal.HDate);
            expect(anHDate).toMatchSnapshot();
        });
        test("should initialize an HDate with a Hebrew date string", () => {
            // Arrange
            const specificDate = new Hebcal.HDate("1 Tishrei 5774");
            // Assert
            expect(specificDate).toMatchSnapshot();
        });
    });
    describe("Defaults", () => {
        test("should be initialized with this year as typeof number", () => {
            // Arrange
            const thisYear = hebcal.months[0].year;
            // Action
            const typeofYear = typeof thisYear;
            // Assert
            expect(typeofYear).toMatch("number");
            expect(thisYear).toBeGreaterThanOrEqual(5780);
        });
    });
    describe("Converting Dates", () => {
        test("should convert from gregorian year to hebrew year", () => {
            // Arrange
            const hebcalInstance = new Hebcal.GregYear(2017, 8);
            // Assert
            expect(hebcalInstance).toHaveProperty(["hebyears", 0], 5777);
        });
    });
    describe("Finding the date of a holiday", () => {
        test("should have a holiday property containing holidays for a given year, with a description for rosh hashana", () => {
            // Arrange
            const specificYear = new Hebcal(5777);
            // Assert
            expect(specificYear).toHaveProperty(
                ["holidays", "1 Tishrei 5777", 0, "desc", 0],
                "Rosh Hashana 1"
            );
        });
    });
});
