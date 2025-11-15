'use strict';

// #----------- DOM -----------#
const calendarIcon = document.querySelector('.calendar-icon');
const datePicker = document.querySelector('.date-picker');
const dateLabel = document.querySelector('.date-label');
const dateBackArrow = document.querySelector('.arrow-back');
const dateForwardArrow = document.querySelector('.arrow-forward');
const addFoodBreakfastBtn = document.querySelector('.add-food-btn-text-breakfast');
const addFoodLunchBtn = document.querySelector('.add-food-btn-text-lunch');
const addFoodDinnerBtn = document.querySelector('.add-food-btn-text-dinner');
const addFoodSnackBtn = document.querySelector('.add-food-btn-text-snack');
const toggleBtnCalorie = document.querySelector('.toggle-bar-item-calories');
const toggleBtnFat = document.querySelector('.toggle-bar-item-fat');
const toggleBtnProtein = document.querySelector('.toggle-bar-item-protein');
const toggleBtnCarbs = document.querySelector('.toggle-bar-item-carbs');
const toggles = document.querySelectorAll('.toggle-bar-item');
const circles = document.querySelectorAll('.progress-circle-wrapper');
const calorieLabel = document.querySelector('.current-count-calories');
const fatLabel = document.querySelector('.current-count-fat');
const proteinLabel = document.querySelector('.current-count-protein');
const carbsLabel = document.querySelector('.current-count-carbs');
const setValueCalorie = document.querySelector('.circular-value-calorie');
const setValueFat = document.querySelector('.circular-value-fat');
const setValueProtein = document.querySelector('.circular-value-protein');
const setValueCarbs = document.querySelector('.circular-value-carbs');
const goalCalorieLabel = document.querySelector('.progress-circle-goal-label-calorie');
const goalFatLabel = document.querySelector('.progress-circle-goal-label-fat');
const goalProteinLabel = document.querySelector('.progress-circle-goal-label-protein');
const goalCarbsLabel = document.querySelector('.progress-circle-goal-label-carbs');

// #----------- CONSTS -----------#
const PROGRESS_GOAL_DEFAULT = 2000;

const MEAL_SECTION_SELECTORS = {
	breakfast: '.meal-breakfast',
	lunch: '.meal-lunch',
	dinner: '.meal-dinner',
	snack: '.meal-snacks',
};

// #----------- functions -----------#
// TODO: Initializations moved to dashboard, since uses will get to that page first
// function initializeSomeSessionStorageLOL() {
// 	if (!sessionStorage.getItem('nutritionGoal')) {
// 		sessionStorage.setItem(
// 			'nutritionGoal',
// 			JSON.stringify({calorieGoal: 2000, carbGoal: 130, proteinGoal: 56, fatsGoal: 60})
// 		);
// 	}

// 	if (!sessionStorage.getItem('dailyTotals')) {
// 		sessionStorage.setItem('dailyTotals', JSON.stringify({calories: 0, carbs: 0, protein: 0, fats: 0}));
// 	}

// 	if (!sessionStorage.getItem('pendingFood')) {
// 		sessionStorage.setItem('pendingFood', '[]');
// 	}
// }

// initializeSomeSessionStorageLOL();

/**
 * * Update counts, macros, and item list for each meal block.
 * * @param {string} mealKey
 * * @param {Array} items
 */
function renderMealSection(mealKey, items = []) {
	const section = document.querySelector(MEAL_SECTION_SELECTORS[mealKey]);
	if (!section) {
		return {calories: 0, carbs: 0, protein: 0, fats: 0}; // return  dailyCount with all 0
	}

	const calorieEl = section.querySelector('.meal-header-text-calory-count');
	const itemsCountEl = section.querySelector('.meal-header-text-items-count');
	const macroValueEls = section.querySelectorAll('.macro-summary-item .value');
	const listEl = section.querySelector('.food-item-list');

	let totalCalories = 0;
	let totalCarbs = 0;
	let totalProtein = 0;
	let totalFats = 0;

	listEl.innerHTML = ''; // clear the list from previous

	if (!items.length) {
		listEl.insertAdjacentHTML(
			'beforeend',
			`<li class="food-item food-item-empty">
				<span class="food-item-content">No food added yet.</span>
			</li>`
		);
	}

	items.forEach((item, index) => {
		const quantity = Number(item.quantity) || 1;
		const calories = Number(item.calories) || 0;
		const carbs = Number(item.carbs) || 0;
		const protein = Number(item.protein) || 0;
		const fats = Number(item.fats) || 0;

		totalCalories += Number((calories * quantity).toFixed(0));
		totalCarbs += Number((carbs * quantity).toFixed(0));
		totalProtein += Number((protein * quantity).toFixed(0));
		totalFats += Number((fats * quantity).toFixed(0));

		listEl.insertAdjacentHTML(
			'beforeend',
			`<li class="food-item" data-meal="${mealKey}" data-index="${index}">
				<span class="food-item-name">${item.name}</span>
				<span class="food-item-quantity-display">x${quantity}</span>
				<span class="material-symbols-outlined btn delete-food-item-btn">close</span>
			</li>`
		);
	});

	calorieEl.textContent = totalCalories;
	itemsCountEl.textContent = items.length;
	macroValueEls[0].textContent = `${totalCarbs} g`;
	macroValueEls[1].textContent = `${totalProtein} g`;
	macroValueEls[2].textContent = `${totalFats} g`;

	return {
		calories: totalCalories,
		carbs: totalCarbs,
		protein: totalProtein,
		fats: totalFats,
	};
}

/**
 * * Render all meal sections for the provided date.
 * * @param {string} dateStr
 */
function renderMealsForDate(dateStr) {
	if (!dateStr) return;
	let storedItems = [];

	// get stored foods from storage, use try-catch for error-prevention
	try {
		storedItems = JSON.parse(sessionStorage.getItem('pendingFood') || '[]');
	} catch (err) {
		console.error('Failed to parse stored meals:', err);
	}

	const grouped = {
		breakfast: [],
		lunch: [],
		dinner: [],
		snack: [],
	};

	storedItems.forEach((item) => {
		if (item.date !== dateStr) return; // only render "today"
		grouped[item.meal].push(item);
	});

	const dailyTotals = {
		calories: 0,
		carbs: 0,
		protein: 0,
		fats: 0,
	};

	Object.keys(MEAL_SECTION_SELECTORS).forEach((mealKey) => {
		const {calories, carbs, protein, fats} = renderMealSection(mealKey, grouped[mealKey] || []);
		dailyTotals.calories += calories;
		dailyTotals.carbs += carbs;
		dailyTotals.protein += protein;
		dailyTotals.fats += fats;
	});

	sessionStorage.setItem('dailyTotals', JSON.stringify(dailyTotals));
	updateProgressCircles(dailyTotals);
}

function updateProgressCircles(totals = {calories: 0, fats: 0, protein: 0, carbs: 0}) {
	const {calories, fats, protein, carbs} = totals;

	const nutritionGoal = JSON.parse(sessionStorage.getItem('nutritionGoal'));
	const calorieGoal = Number(nutritionGoal.calorieGoal) || PROGRESS_GOAL_DEFAULT;
	const fatGoal = Number(nutritionGoal.fatsGoal) || PROGRESS_GOAL_DEFAULT;
	const proteinGoal = Number(nutritionGoal.proteinGoal) || PROGRESS_GOAL_DEFAULT;
	const carbsGoal = Number(nutritionGoal.carbGoal) || PROGRESS_GOAL_DEFAULT;

	if (calorieLabel) calorieLabel.textContent = calories;
	if (fatLabel) fatLabel.textContent = fats;
	if (proteinLabel) proteinLabel.textContent = protein;
	if (carbsLabel) carbsLabel.textContent = carbs;

	// update the UI for goals
	goalCalorieLabel.innerHTML = calorieGoal;
	goalFatLabel.innerHTML = fatGoal;
	goalProteinLabel.innerHTML = proteinGoal;
	goalCarbsLabel.innerHTML = carbsGoal;

	if (setValueCalorie) setValueCalorie.style.setProperty('--progress', Math.min((calories / calorieGoal) * 100, 100));
	if (setValueFat) setValueFat.style.setProperty('--progress', Math.min((fats / fatGoal) * 100, 100));
	if (setValueProtein) setValueProtein.style.setProperty('--progress', Math.min((protein / proteinGoal) * 100, 100));
	if (setValueCarbs) setValueCarbs.style.setProperty('--progress', Math.min((carbs / carbsGoal) * 100, 100));
}

// #----------- date picker -----------#
// initialize flatpickr
const dateInput = flatpickr(datePicker, {
	dateFormat: 'M. d, Y',
	defaultDate: 'today',
	appendTo: document.querySelector('.date'),
	onChange: (_, dateStr) => {
		// 1. update date on UI
		dateLabel.textContent = `${dateStr}`;

		// 2. update sessionSelected: dateSelected
		sessionStorage.setItem('dateSelected', dateStr);

		// 3. render meals for the selected date
		renderMealsForDate(dateStr); // !- render if date changes
	},
});

// give default value (today's date)
const todayDate = dateInput.input.value;
dateLabel.textContent = 'Today, ' + todayDate;
sessionStorage.setItem('dateSelected', todayDate);
renderMealsForDate(todayDate); // !- initial render

//FIXME: console.log(dateInput.input.value);

// Open on icon click
calendarIcon.addEventListener('click', () => {
	dateInput.open();
});

// arrows
dateBackArrow.addEventListener('click', () => {
	const d = dateInput.selectedDates[0] || new Date();
	d.setDate(d.getDate() - 1);
	dateInput.setDate(d, true);
});

dateForwardArrow.addEventListener('click', () => {
	const d = dateInput.selectedDates[0] || new Date();
	d.setDate(d.getDate() + 1);
	dateInput.setDate(d, true);
});

function removeToggleHighlight() {
	toggles.forEach((toggle) => toggle.classList.remove('selected'));
	circles.forEach((circle) => circle.classList.remove('active'));
}

// #----------- events -----------#
addFoodBreakfastBtn.addEventListener('click', () => {
	// 1. update sessionStorage for "mealSelected"
	sessionStorage.setItem('mealSelected', 'breakfast');
});

addFoodLunchBtn.addEventListener('click', () => {
	// 1. update sessionStorage for "mealSelected"
	sessionStorage.setItem('mealSelected', 'lunch');
});

addFoodDinnerBtn.addEventListener('click', () => {
	// 1. update sessionStorage for "mealSelected"
	sessionStorage.setItem('mealSelected', 'dinner');
});

addFoodSnackBtn.addEventListener('click', () => {
	// 1. update sessionStorage for "mealSelected"
	sessionStorage.setItem('mealSelected', 'snack');
});

// this logic I got help from my Friend, thank you Linpu
// it's for deleting the food item, I had some trouble with it
document.addEventListener('click', (event) => {
	const deleteBtn = event.target.closest('.delete-food-item-btn');
	if (!deleteBtn) return;

	const listItem = deleteBtn.closest('.food-item');
	const mealKey = listItem?.dataset?.meal;
	const itemIndex = Number(listItem?.dataset?.index);
	const dateStr = sessionStorage.getItem('dateSelected');

	if (!mealKey || Number.isNaN(itemIndex) || !dateStr) return;

	let storedItems = [];
	try {
		storedItems = JSON.parse(sessionStorage.getItem('pendingFood') || '[]');
	} catch (err) {
		console.error('Failed to parse stored meals:', err);
		return;
	}

	let matchIndex = -1;
	const updatedItems = storedItems.filter((item) => {
		if (item.date !== dateStr || item.meal !== mealKey) return true;
		matchIndex += 1;
		return matchIndex !== itemIndex;
	});

	sessionStorage.setItem('pendingFood', JSON.stringify(updatedItems));
	renderMealsForDate(dateStr);
});

toggleBtnCalorie.addEventListener('click', () => {
	// 1. remove toggle button "selected" class
	// 2. remove container "active" class
	removeToggleHighlight();

	// 3.highlight calorie option
	toggleBtnCalorie.classList.add('selected');
	circles[0].classList.add('active');
});

toggleBtnFat.addEventListener('click', () => {
	// 1. remove toggle button "selected" class
	// 2. remove container "active" class
	removeToggleHighlight();

	// 3.highlight calorie option
	toggleBtnFat.classList.add('selected');
	circles[1].classList.add('active');
});

toggleBtnProtein.addEventListener('click', () => {
	// 1. remove toggle button "selected" class
	// 2. remove container "active" class
	removeToggleHighlight();

	// 3.highlight calorie option
	toggleBtnProtein.classList.add('selected');
	circles[2].classList.add('active');
});

toggleBtnCarbs.addEventListener('click', () => {
	// 1. remove toggle button "selected" class
	// 2. remove container "active" class
	removeToggleHighlight();

	// 3.highlight calorie option
	toggleBtnCarbs.classList.add('selected');
	circles[3].classList.add('active');
});

document.addEventListener('DOMContentLoaded', () => {
	const totals = JSON.parse(sessionStorage.getItem('dailyTotals') || '{"calories":0,"fats":0,"protein":0,"carbs":0}');
	updateProgressCircles(totals);
});
