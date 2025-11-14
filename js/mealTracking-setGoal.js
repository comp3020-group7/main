'use strict';

// #----------- DOM -----------#
const clearBtn = document.querySelector('.panel-button-clear');
const confirmBtn = document.querySelector('.panel-button-confirm');
const inputBoxes = document.querySelectorAll('.panel-item-input-box');
const closeBtn = document.querySelector('.popup-close');

// #----------- CONSTS -----------#
const PROGRESS_GOAL_DEFAULT = 2000;

// #----------- FUNCTIONS -----------#
function updateUIForGoals() {
	// fetch from storage
	const goals = JSON.parse(sessionStorage.getItem('nutritionGoal'));

	const goalCalorie = goals.calorieGoal || PROGRESS_GOAL_DEFAULT;
	const goalFat = goals.fatsGoal || PROGRESS_GOAL_DEFAULT;
	const goalProtein = goals.proteinGoal || PROGRESS_GOAL_DEFAULT;
	const goalCarbs = goals.carbGoal || PROGRESS_GOAL_DEFAULT;

	// update input value
	inputBoxes[0].value = goalCalorie;
	inputBoxes[1].value = goalFat;
	inputBoxes[2].value = goalProtein;
	inputBoxes[3].value = goalCarbs;
}

updateUIForGoals();

// #----------- Events -----------#
clearBtn.addEventListener('click', () => {
	inputBoxes.forEach((inputBox) => {
		inputBox.value = '';
	});
});

confirmBtn.addEventListener('click', () => {
	// 1. make sure all inputs are there (and are numbers)
	for (const input of inputBoxes) {
		const value = input.value.trim();
		const asNumber = Number(value);

		if (!value || Number.isNaN(asNumber)) {
			alert("Please fill all fields and make sure you're only entering numbers!");

			return;
		}
	}

	// 2. store information to sessionalStorage
	const goalCalorie = Number(inputBoxes[0].value);
	const goalFats = Number(inputBoxes[1].value);
	const goalProtein = Number(inputBoxes[2].value);
	const goalCarbs = Number(inputBoxes[3].value);

	const nutritionGoal = {
		calorieGoal: goalCalorie,
		carbGoal: goalCarbs,
		proteinGoal: goalProtein,
		fatsGoal: goalFats,
	};

	// console.log(nutritionGoal);

	sessionStorage.setItem('nutritionGoal', JSON.stringify(nutritionGoal));

	// added an alert letting user know it's successed!
	alert('Your nutrition goals have been updated! Good job!!');
});

closeBtn.addEventListener('click', () => {
	closeBtn.parentElement.style.display = 'none';
});
