'use strict';

// #----------- DOM -----------#
const settingIcon = document.querySelector('.settings-icon');
const settingWindow = document.querySelector('.setting-pop-up');
const settingWindowCloseBtn = document.querySelector('.setting-close-btn');
const overLay = document.querySelector('#overlay');
const changeFontSizeBtn = document.querySelectorAll('.font-size-letter');
const settingUsernameLabel = document.querySelector('.setting-change-username-input');
const settingChangeUsernameConfirmBtn = document.querySelector('.setting-change-username-confirm-btn');
const settingColorOptions = document.querySelectorAll('.color-palette-option');
const settingSecondMessageCloseBtn = document.querySelector('.setting-second-message-close-btn');
const settingSecondMsgBox = document.querySelector('.setting-pop-up-top-level-message');
const secondOverlay = document.querySelector('.setting-pop-up-overlay');
const infoBtn = document.querySelector('.info-icon-color-explanation');

// #----------- CONSTS -----------#
const FONT_SIZE_OPTIONS = [55, 62.5, 65];
const DEFAULT_FONT_SIZE = 62.5;

const COLOR_OPTIONS = ['default', 'rg-blind', 'dark'];
const DEFAULT_COLOR = 'default';
const COLOR_THEME_MAP = {
	default: '',
	'rg-blind': 'rg-color-blind',
	dark: 'dark-theme',
};
const COLOR_STORAGE_KEY = 'colorSelected'; // TODO: update name in session storage

// #----------- FUNCTIONS -----------#
/**
 * *change font size
 * @param {*} percent
 */
function setFontSize(percent) {
	// 1. store it to session storage
	sessionStorage.setItem('fontSizeSelected', percent);

	// 2. get value from session storage
	const value = parseFloat(sessionStorage.getItem('fontSizeSelected'));

	// 3. set the size (by changing percentage in html)
	document.documentElement.style.fontSize = value + '%';
	highlightSelectedFontSize(value);
}

function clearFontHighlight() {
	changeFontSizeBtn.forEach((btn) => {
		btn.classList.remove('selected');
	});
}

function clearColorHighlight() {
	settingColorOptions.forEach((option) => {
		option.classList.remove('selected');
	});
}

function highlightSelectedFontSize(percent) {
	clearFontHighlight();
	const idx = FONT_SIZE_OPTIONS.indexOf(percent);

	// if weired number found, it would return -1 -> not found
	if (idx !== -1 && changeFontSizeBtn[idx]) {
		changeFontSizeBtn[idx].classList.add('selected');
	}
}

function highlightSelectedColor(option) {
	clearColorHighlight();
	const idx = COLOR_OPTIONS.indexOf(option);

	// same logic as about (font size)
	if (idx !== -1 && settingColorOptions[idx]) {
		settingColorOptions[idx].classList.add('selected');
	}
}

function initializeFontSize() {
	const stored = parseFloat(sessionStorage.getItem('fontSizeSelected'));
	const percent = Number.isFinite(stored) ? stored : DEFAULT_FONT_SIZE;
	document.documentElement.style.fontSize = percent + '%';
	highlightSelectedFontSize(percent);
}

function initializeColor() {
	const stored = sessionStorage.getItem(COLOR_STORAGE_KEY);
	const colorSelected = COLOR_OPTIONS.includes(stored) ? stored : DEFAULT_COLOR;
	applyColorTheme(colorSelected);
}

function applyColorTheme(option) {
	const themeName = COLOR_THEME_MAP[option] || '';
	sessionStorage.setItem(COLOR_STORAGE_KEY, option);
	if (themeName) {
		document.documentElement.setAttribute('data-theme', themeName);
	} else {
		document.documentElement.removeAttribute('data-theme');
	}
	highlightSelectedColor(option);
}

/**
 * basically copied from dashboard, changing username logic should happen on every page
 */
function updateUsernameForSetting() {
	// 1. get username from sessionStorage(i'll assume there MUST be a username there)
	const username = sessionStorage.getItem('username');

	// 3. also render it on setting popup window
	settingUsernameLabel.placeholder = username;
}

// #----------- Events -----------#
settingIcon.addEventListener('click', () => {
	settingWindow.style.display = 'block';
	overLay.style.display = 'block';
});

settingWindowCloseBtn.addEventListener('click', () => {
	settingWindow.style.display = 'none';
	overLay.style.display = 'none';
});

changeFontSizeBtn[0].addEventListener('click', () => {
	setFontSize(55);
});

changeFontSizeBtn[1].addEventListener('click', () => {
	setFontSize(62.5);
});

changeFontSizeBtn[2].addEventListener('click', () => {
	setFontSize(65);
});

settingChangeUsernameConfirmBtn.addEventListener('click', () => {
	// 1. store input for new username to session storage (if not)
	const currInput = settingUsernameLabel.value;

	// console.log(currInput);

	if (currInput) {
		sessionStorage.setItem('username', currInput);
	} else {
		alert("Please enter a valid username (can't be empty)");

		return;
	}

	updateUsername();

	alert('Username successfully changed!');
});

settingColorOptions.forEach((optionEl) => {
	optionEl.addEventListener('click', () => {
		const option = optionEl.dataset.colorOption;
		if (option) {
			applyColorTheme(option);
		}
	});
});

settingSecondMessageCloseBtn.addEventListener('click', () => {
	settingSecondMsgBox.style.display = 'none';
	secondOverlay.style.display = 'none';
});

infoBtn.addEventListener('click', () => {
	secondOverlay.style.display = 'block';
	settingSecondMsgBox.style.display = 'block';
});

// #----------- function calling -----------#
updateUsernameForSetting();
initializeFontSize();
initializeColor();
