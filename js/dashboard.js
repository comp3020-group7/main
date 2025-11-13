'use strict';

// #----------- DOM -----------#
const calorieGoalEl = document.querySelector('.meter-calorie-goal');
const calorieCurrentEl = document.querySelector('.meter-calorie-current');
const countLabels = document.querySelectorAll('.count-label');
const goalLabels = document.querySelectorAll('.goal-label');
const dateLabel = document.querySelector('.date');
const ringCarbs = document.querySelector('.ring-carbs');
const ringProtein = document.querySelector('.ring-protein');
const ringFat = document.querySelector('.ring-fat');
const ringTotal = document.querySelector('.ring-total');
const waterLabel = document.querySelector('.water-intake-count');
const addWaterBtns = document.querySelectorAll('.water-intake-button');
const clearWaterBtn = document.querySelector('.water-intake-button-cancel');
const calendarEl = document.getElementById('workoutCalendar');
const lastMealName = document.querySelector('.meal-name');
const lastMealCalorie = document.querySelector('.last-meal-count');
const lastMealImg = document.querySelector('.meal-thumb-img');

// #----------- CONSTS -----------#
const DEFAULT_CALORIE_GOAL = 2000;
const DEFAULT_CALORIE_COUNT = 0;
const DEFAULT_MACRO = 0;
const WORKOUT_STORAGE_KEY = 'workouts';
const IMAGE_PATH_PREFIX = './images/mealTracking/food-img/';

// #----------- FUNCTIONS -----------#
function initializeSomeSessionStorageLOL() {
	if (!sessionStorage.getItem('nutritionGoal')) {
		sessionStorage.setItem(
			'nutritionGoal',
			JSON.stringify({calorieGoal: 2000, carbGoal: 130, proteinGoal: 56, fatsGoal: 60})
		);
	}

	if (!sessionStorage.getItem('dailyTotals')) {
		sessionStorage.setItem('dailyTotals', JSON.stringify({calories: 0, carbs: 0, protein: 0, fats: 0}));
	}

	if (!sessionStorage.getItem('pendingFood')) {
		sessionStorage.setItem('pendingFood', '[]');
	}

	// initialize water
	if (!sessionStorage.getItem('waterCount')) {
		sessionStorage.setItem('waterCount', 0);
	}
}
initializeSomeSessionStorageLOL();

function updateCalorie() {
	// 1. get value from storage
	const nutritionGoals = JSON.parse(sessionStorage.getItem('nutritionGoal'));
	const nutritionCount = JSON.parse(sessionStorage.getItem('dailyTotals'));

	let calorieGoal = DEFAULT_CALORIE_GOAL;
	let calorieCount = DEFAULT_CALORIE_COUNT;

	if (nutritionGoals) {
		calorieGoal = nutritionGoals.calorieGoal;
	}

	if (nutritionCount) {
		calorieCount = nutritionCount.calories;
	}

	// console.log(calorieGoal);

	// 2. update UI
	calorieGoalEl.innerHTML = calorieGoal;
	calorieCurrentEl.innerHTML = calorieCount;
}

function updateMacro() {
	// 1. get values from storage for goals
	const nutritionGoals = JSON.parse(sessionStorage.getItem('nutritionGoal'));

	let carbsGoal = DEFAULT_MACRO;
	let proteinGoal = DEFAULT_MACRO;
	let fatGoal = DEFAULT_MACRO;

	if (nutritionGoals) {
		carbsGoal = nutritionGoals.carbGoal;
		proteinGoal = nutritionGoals.proteinGoal;
		fatGoal = nutritionGoals.fatsGoal;
	}

	// console.log(fatGoal);

	// 2. get values from storage for current counts
	const nutritionCount = JSON.parse(sessionStorage.getItem('dailyTotals'));

	let carbsCount = DEFAULT_MACRO;
	let proteinCount = DEFAULT_MACRO;
	let fatCount = DEFAULT_MACRO;

	if (nutritionCount) {
		carbsCount = nutritionCount.carbs;
		proteinCount = nutritionCount.protein;
		fatCount = nutritionCount.fats;
	}

	// 3. get water
	const waterCount = parseInt(sessionStorage.getItem('waterCount'));

	// 4. render goals
	goalLabels[0].innerHTML = carbsGoal;
	goalLabels[1].innerHTML = proteinGoal;
	goalLabels[2].innerHTML = fatGoal;
	goalLabels[3].innerHTML = carbsGoal + proteinGoal + fatGoal;

	// 5. rendr current count
	countLabels[0].innerHTML = carbsCount;
	countLabels[1].innerHTML = proteinCount;
	countLabels[2].innerHTML = fatCount;
	countLabels[3].innerHTML = carbsCount + proteinCount + fatCount;

	// 6. update rings
	ringCarbs.style.setProperty('--progress', (carbsCount / carbsGoal) * 100);
	ringProtein.style.setProperty('--progress', (proteinCount / proteinGoal) * 100);
	ringFat.style.setProperty('--progress', (fatCount / fatGoal) * 100);
	ringTotal.style.setProperty(
		'--progress',
		((carbsCount + proteinCount + fatCount) / (carbsGoal + proteinGoal + fatGoal)) * 100
	);
}

function updateDate() {
	const today = new Date();
	const dateString = today.toDateString();

	dateLabel.innerHTML = dateString;
}

function updateWater() {
	const waterCount = sessionStorage.getItem('waterCount');
	waterLabel.innerHTML = waterCount;
}

function readWorkoutHistory() {
	try {
		return JSON.parse(localStorage.getItem(WORKOUT_STORAGE_KEY)) || [];
	} catch (error) {
		console.warn('Unable to get workout history', error);
		return [];
	}
}

function createCalendar() {
	const calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: '',
		},
		events: readWorkoutHistory().map((session) => ({
			title: (session.exercises || []).map((ex) => ex.name),
			start: session.date,
			allDay: true,
		})),
	});
	calendar.render();
}

/*
[
  {
    "date": "2025-11-12",
    "exercises": [
      {"name": "squat", "type": "resistance training maybe??????"},
      {"name": "run", "type": "cardiovascular training"}
    ],
    
  },
  {
    "date": "2025-11-13",
    "exercises": [
      {"name": "bench press", "type": "resistance training"}
    ],
    
  }
]
*/

function updateLastMeal() {
	// 1. get pending food from storage
	const pendingFoods = JSON.parse(sessionStorage.getItem('pendingFood'));

	// console.log(pendingFoods);

	// 2. check if it has any food
	const noFoodLogged = pendingFoods.length === 0;

	// 3. give default values
	let imgPath = './images/sadface.png';
	let foodName = 'No food logged yet';
	let calorieCount = 0;

	// 4. if not empty -> get last food
	if (!noFoodLogged) {
		const lastFoodIndex = pendingFoods.length - 1;
		foodName = pendingFoods[lastFoodIndex].name.toLowerCase();
		// console.log(foodName);
		imgPath = `${IMAGE_PATH_PREFIX}${foodName.replace(' ', '')}.png`;
		calorieCount = pendingFoods[lastFoodIndex].calories;
		console.log(calorieCount);
	}

	// 5. render
	lastMealName.innerHTML = foodName;
	lastMealImg.src = imgPath;
	lastMealCalorie.innerHTML = calorieCount;
}

// #----------- Events -----------#
document.addEventListener('DOMContentLoaded', () => {
	updateCalorie();
	updateMacro();
	updateDate();
	updateWater();
	createCalendar();
	updateLastMeal();
});

addWaterBtns.forEach((btn) => {
	btn.addEventListener('click', () => {
		// 1. get number on each btn (well, not a good choice but whatever)
		const value = parseInt(btn.textContent.replace('+', '').trim());

		// console.log(value);

		// 2. get current water count from storage
		let currWater = Number(sessionStorage.getItem('waterCount'));

		// 3. store new value back to storage
		sessionStorage.setItem('waterCount', currWater + value);

		// 4. re-render
		updateWater();
	});
});

clearWaterBtn.addEventListener('click', () => {
	sessionStorage.setItem('waterCount', 0);

	// 2. re-render
	updateWater();
});

// #----------- function calling -----------#
