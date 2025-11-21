'use strict';

// #----------- DOM -----------#
const grid = document.querySelector('.grid');
const recentlyBtn = document.querySelector('.switch-tab-recently');
const favoriteBtn = document.querySelector('.switch-tab-favorite');
const allBtn = document.querySelector('.switch-tab-all');
const tabs = document.querySelectorAll('.tab');
const foodSearch = document.querySelector('.food-search-input');
const mealTypeLabel = document.querySelector('.welcome-msg-meal-type');
const dateLabel = document.querySelector('.welcome-msg-date');

// #----------- CONSTS -----------#
const FOOD_DATA = Array.isArray(window.MEAL_TRACKING_FOODS) ? window.MEAL_TRACKING_FOODS : [];
const DEFAULT_FOOD_IMAGE = './images/mealTracking/food-img/apple.png';

// #----------- FUNCTIONS -----------#
/**
 * * render all food cards in the grid
 * * @param {*} filterFn
 */
function renderFoods(filterFn = () => true) {
	grid.innerHTML = ''; // clear existing cards

	if (!FOOD_DATA.length) {
		grid.insertAdjacentHTML('beforeend', '<p class="empty-state">No foods available.</p>');
		return;
	}

	FOOD_DATA.filter(filterFn).forEach((food) => {
		grid.insertAdjacentHTML(
			'beforeend',
			`<div class="card">
						<div class="title food-name">${food.name}</div>
						<div class="card-main-section">
							<img src="${food.image || DEFAULT_FOOD_IMAGE}" alt="${food.name}" class="food-img" />
							<div class="nutrition-fact">
								<div class="nutrition-fact-item">
									<span class="nutrition-fact-label">cals</span>
									<span class="nutrition-fact-val nutrition-fact-val-calories">${food.calories}</span>
								</div>
								<div class="nutrition-fact-item">
									<span class="nutrition-fact-label">carbs</span>
									<span class="nutrition-fact-val nutrition-fact-val-carbs">${food.carbs}</span>
								</div>
								<div class="nutrition-fact-item">
									<span class="nutrition-fact-label">protein</span>
									<span class="nutrition-fact-val nutrition-fact-val-protein">${food.protein}</span>
								</div>
								<div class="nutrition-fact-item">
									<span class="nutrition-fact-label">fats</span>
									<span class="nutrition-fact-val nutrition-fact-val-fat">${food.fats}</span>
								</div>
							</div>
						</div>
						<button class="plus" title="Add">
							<span class="material-symbols-outlined">add</span>
						</button>

						<div class="card-select-quantity card">
							<span class="title food-name select-quantity-title">Select quantity: </span>
							<div class="quantity-selector">
								<button class="decrease">-</button>
								<span class="quantity">1</span>
								<button class="increase">+</button>
							</div>
							<button class="plus confirm" title="Add">
								<span class="material-symbols-outlined">check</span>
							</button>
						</div>
						</div>`
		);
	});
}

function updateMealType() {
	mealTypeText;
}

/**
 * * remove "active" class for category label (for highlight purpose)
 */
function removePreviousActive() {
	tabs.forEach((t) => t.classList.remove('active'));
}

function updateSavedFood(selectedFood) {
	const existing = JSON.parse(sessionStorage.getItem('pendingFood') || '[]');
	existing.push(selectedFood);
	sessionStorage.setItem('pendingFood', JSON.stringify(existing));
}

// #----------- Events -----------#
allBtn.addEventListener('click', () => {
	// 1. remove "active" class for previous tab
	removePreviousActive();

	// 2. add .active for "recently" btn
	allBtn.classList.add('active');

	// 3. render food (with filter for recently label)
	renderFoods();
});

recentlyBtn.addEventListener('click', () => {
	// 1. remove "active" class for previous tab
	removePreviousActive();

	// 2. add .active for "recently" btn
	recentlyBtn.classList.add('active');

	// 3. render food (with filter for recently label)
	renderFoods((food) => food.label.includes('recently'));
});

favoriteBtn.addEventListener('click', () => {
	// 1. remove "active" class for previous tab
	removePreviousActive();

	// 2. add .active for "recently" btn
	favoriteBtn.classList.add('active');

	// 3. render food (with filter for recently label)
	renderFoods((food) => food.label.includes('favorite'));
});

foodSearch.addEventListener('keyup', (e) => {
	let currValue = e.target.value.toLowerCase();
	let cards = document.querySelectorAll('.grid > .card');

	cards.forEach((card) => {
		const foodName = card.querySelector('.title.food-name');
		if (!foodName) return;
		const matches = foodName.textContent.toLowerCase().includes(currValue);
		card.style.display = matches ? 'block' : 'none';
	});
});

document.addEventListener('DOMContentLoaded', () => {
	const mealType = sessionStorage.getItem('mealSelected');
	const date = sessionStorage.getItem('dateSelected');

	mealTypeLabel.textContent = `${mealType}`;
	dateLabel.textContent = `${date}`;
});

grid.addEventListener('click', (event) => {
	const decreaseBtn = event.target.closest('button.decrease');
	if (decreaseBtn) {
		const overlay = decreaseBtn.closest('.card-select-quantity');
		const quantityEl = overlay.querySelector('.quantity');
		const current = Number(quantityEl.textContent);
		if (current > 1) {
			quantityEl.textContent = current - 1;
		}
		return;
	}

	const increaseBtn = event.target.closest('button.increase');
	if (increaseBtn) {
		const overlay = increaseBtn.closest('.card-select-quantity');
		const quantityEl = overlay.querySelector('.quantity');
		const current = Number(quantityEl.textContent);
		quantityEl.textContent = current + 1;
		return;
	}

	const confirmBtn = event.target.closest('button.confirm');
	if (confirmBtn) {
		const overlay = confirmBtn.closest('.card-select-quantity');
		const baseCard = overlay.parentElement;
		const quantityEl = overlay.querySelector('.quantity');
		const addBtn = baseCard.querySelector('button.plus:not(.confirm)');
		if (addBtn) {
			addBtn.remove();
			alert('Food successfully added!');
		}

		const date = sessionStorage.getItem('dateSelected');
		const meal = sessionStorage.getItem('mealSelected');
		const name = baseCard.querySelector('.food-name').textContent;
		const cals = Number(baseCard.querySelector('.nutrition-fact-val-calories').textContent);
		const carbs = Number(baseCard.querySelector('.nutrition-fact-val-carbs').textContent);
		const protein = Number(baseCard.querySelector('.nutrition-fact-val-protein').textContent);
		const fats = Number(baseCard.querySelector('.nutrition-fact-val-fat').textContent);
		const quantity = Number(quantityEl.textContent);

		const selectedFood = {
			date,
			meal,
			name,
			calories: cals,
			carbs,
			protein,
			fats,
			quantity,
		};

		updateSavedFood(selectedFood);
		overlay.classList.remove('selected');
		baseCard.classList.add('confirmed');
		return;
	}

	const addBtn = event.target.closest('button.plus');
	if (!addBtn) {
		return;
	}

	// Clicking the main card "+" opens the quantity selector.
	const card = addBtn.closest('.card');
	const overlay = card.querySelector('.card-select-quantity');
	if (!overlay) {
		return;
	}

	overlay.querySelector('.quantity').textContent = '1';
	overlay.classList.add('selected');
});

// #----------- function calling -----------#
renderFoods(); // initial render, show all foods by default
