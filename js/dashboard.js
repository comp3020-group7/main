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
const usernameLabel = document.querySelector('.username');
const lastWorkoutDateLabel = document.querySelector('.last-workout-date');
const lastWorkoutList = document.querySelector('.last-workout-list');
const workoutDetailOverlay = document.querySelector('.workout-detail-overlay');
const workoutDetailModal = document.querySelector('.workout-detail-modal');
const workoutDetailCloseBtn = document.querySelector('.workout-detail-close');
const workoutDetailDate = document.querySelector('.workout-detail-date');
const workoutDetailList = document.querySelector('.workout-detail-list');
const workoutDetailEmpty = document.querySelector('.workout-detail-empty');

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
		return JSON.parse(sessionStorage.getItem(WORKOUT_STORAGE_KEY)) || [];
	} catch (error) {
		console.warn('Unable to get workout history', error);
		return [];
	}
}

function formatWorkoutDate(date) {
	if (!date) {
		return '-';
	}
	const parsed = new Date(date);

	// check if parsed date is a valid date or not, if invalid will get a NaH
	if (Number.isNaN(parsed.getTime())) {
		return date;
	}
	return parsed.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	});
}

function renderWorkoutDetail(workout) {
	if (!workoutDetailDate || !workoutDetailList || !workoutDetailEmpty) {
		return;
	}

	// workoutDetailDate.textContent = formatWorkoutDate(workout?.date);
	const workoutObj = JSON.parse(sessionStorage.getItem('workouts'));
	const date = workoutObj[0].date;
	workoutDetailDate.textContent = `${date}:`;

	// clear old content
	workoutDetailList.innerHTML = '';

	// TODO: error checking, make sure an array exists
	const exercises = Array.isArray(workout?.exercises) ? workout.exercises : [];

	// if there is nothing to show for details, show this:
	if (exercises.length === 0) {
		workoutDetailEmpty.hidden = false;
		return;
	}

	// otherwise, there is something to show, hide hidden one:
	workoutDetailEmpty.hidden = true;

	exercises.forEach((exercise) => {
		const item = document.createElement('li');

		// if no type, then don't show type
		const typeLabel = exercise.type ? ` (${exercise.type})` : '';
		item.textContent = `${exercise.name || 'Exercise'}${typeLabel}`;

		// TODO: format cardio
		if (exercise.type === 'cardio') {
			const stats = [];
			if (exercise.distance) stats.push(`<br />Distance: ${exercise.distance} km `);
			if (exercise.time) stats.push(`Time: ${exercise.time} min`);
			if (exercise.avgPace) stats.push(`Avarage Pace: ${exercise.avgPace} min/km`);
			if (stats.length) item.innerHTML += ` <br /> ${stats.join(' <br /> ')}`;
		}
		// TODO: format weight lifting (non-cardio exercies, I think it's called heavy lifting??)
		else if (Array.isArray(exercise.sets) && exercise.sets.length > 0) {
			const setsSummary = exercise.sets
				.map((set, index) => `<br />Set ${index + 1}: ${set.reps ?? 0} reps @ ${set.weight ?? 0} kg`)
				.join('<br /> ');
			item.innerHTML += ` <br /> ${setsSummary}`;
		}

		workoutDetailList.appendChild(item);
	});
}

function showWorkoutDetail(workout) {
	if (!workoutDetailOverlay || !workoutDetailModal) {
		return;
	}
	renderWorkoutDetail(workout);
	workoutDetailOverlay.hidden = false;
	workoutDetailModal.hidden = false;
	workoutDetailModal.setAttribute('aria-hidden', 'false');
}

function hideWorkoutDetail() {
	if (!workoutDetailOverlay || !workoutDetailModal) {
		return;
	}
	workoutDetailOverlay.hidden = true;
	workoutDetailModal.hidden = true;
	workoutDetailModal.setAttribute('aria-hidden', 'true');
}

workoutDetailCloseBtn?.addEventListener('click', hideWorkoutDetail);
workoutDetailOverlay?.addEventListener('click', hideWorkoutDetail);
document.addEventListener('keydown', (event) => {
	if (event.key === 'Escape' && workoutDetailModal && !workoutDetailModal.hidden) {
		hideWorkoutDetail();
	}
});

function createCalendar() {
	const calendar = new FullCalendar.Calendar(calendarEl, {
		initialView: 'dayGridMonth',
		headerToolbar: {
			left: 'prev,next today',
			center: 'title',
			right: '',
		},
		// Keep the current day easy to spot by centering it after each render/navigation
		datesSet() {
			requestAnimationFrame(() => {
				const todayCell = calendarEl.querySelector('.fc-day-today');
				todayCell?.scrollIntoView({
					behavior: 'smooth',
					block: 'center',
					inline: 'center',
				});
			});
		},
		// datesSet(info) {
		// 	const titleEl = calendarEl.querySelector('.fc-toolbar-title');
		// 	if (titleEl) {
		// 		titleEl.textContent = `Workout Calendar · ${info.view.title} `;
		// 	}
		// },
		eventClick(info) {
			info.jsEvent.preventDefault();
			const workout = info.event.extendedProps.workout;
			if (workout) {
				showWorkoutDetail(workout);
			}
		},
		events: readWorkoutHistory().map((session) => {
			const exerciseNames = (session.exercises || []).map((ex) => ex.name).filter(Boolean);
			return {
				title: exerciseNames.length ? exerciseNames.join(', ') : 'Workout',
				start: session.date,
				allDay: true,
				extendedProps: {
					workout: session,
				},
			};
		}),
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

function updateUsername() {
	// 1. get username from sessionStorage(i'll assume there MUST be a username there)
	const username = sessionStorage.getItem('username');

	// 2. render it
	usernameLabel.innerHTML = username;

	// !!! render setting popup moved to navbar.js
}

function updateLastWorkout() {
	if (!lastWorkoutDateLabel || !lastWorkoutList) {
		return;
	}
	const workouts = readWorkoutHistory();
	lastWorkoutList.innerHTML = '';

	if (workouts.length === 0) {
		lastWorkoutDateLabel.textContent = 'No workout logged yet.';
		return;
	}

	const lastWorkout = workouts[workouts.length - 1];
	lastWorkoutDateLabel.textContent = `${formatWorkoutDate(lastWorkout.date)}`;

	const exercises = Array.isArray(lastWorkout.exercises) ? lastWorkout.exercises : [];
	if (exercises.length === 0) {
		const item = document.createElement('li');
		item.textContent = 'No exercises recorded.';
		lastWorkoutList.appendChild(item);
		return;
	}

	exercises.forEach((exercise) => {
		const item = document.createElement('li');
		const typeLabel = exercise.type ? ` (${exercise.type})` : '';
		item.textContent = `${exercise.name || 'Exercise'}${typeLabel}`;
		lastWorkoutList.appendChild(item);
	});
}

// #----------- Events -----------#
document.addEventListener('DOMContentLoaded', () => {
	updateCalorie();
	updateMacro();
	updateDate();
	updateWater();
	createCalendar();
	updateLastMeal();
	updateUsername();
	updateLastWorkout();
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
