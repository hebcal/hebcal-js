var Hebcal = require('../src/hebcal')

describe('Check that errors are thrown at proper times', () => {
	describe('Should Throw', () => {
		test.each([
			['year should not be a string', ['5774']],
			['should not have empty options object', [5774, {}]],
			['should have valid options object', [5774, { 0: 1, 1: 2 }]]
		])('should throw because %s', (reason, args) => {
			expect(() => new Hebcal(...args)).toThrow();
		})
		test.each([
			['adding a holiday incorrectly', function () {
				var yr = new Hebcal();
				yr.addHoliday('my birthday');
			}],
			['bad arguments to month constructor', function () {
				new Hebcal.Month([], null);
			}],
			['month options invalid', function () {
				new Hebcal.Month(3, null);
			}],
			['Hebcal.HDate(null)', function () {
				new Hebcal.HDate(null);
			}],
			["Hebcal.HDate(1, 2, 3, 4)", function () {
				new Hebcal.HDate(1, 2, 3, 4);
			}],
			["day.setLocation()", function(){
				var day = new Hebcal.HDate();
				day.setLocation();
			}],
		])('should throw because %s', (reason, shouldThrow) => {
			expect(shouldThrow).toThrow();
		})
	})
	describe('Usage which should not throw', () => {
		test.each([
			[() => {
				new Hebcal(5774)
			}],
			[function(){
				new Hebcal(5774, [1, 2]);
			}],
			[function(){
				var yr = new Hebcal();
				yr.addHoliday(new Hebcal.holidays.Event(new Date(), 'today', 0));
			}],
			[function(){
				new Hebcal.Month(5, 5774);
			}],
			[function(){
				new Hebcal.HDate(undefined);
				new Hebcal.HDate();
			}],

		])('expected usage should not throw', (shouldNotThrow) => {
			expect(shouldNotThrow).not.toThrow();
		})
	})
})
