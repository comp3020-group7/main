'use strict';

// #----------- DOM -----------#
const settingIcon = document.querySelector('.settings-icon');
const settingWindow = document.querySelector('.setting-pop-up');
const settingWindowCloseBtn = document.querySelector('.setting-close-btn');
const overLay = document.querySelector('#overlay');
const changeFontSizeBtn = document.querySelectorAll('.font-size-letter');

// #----------- CONSTS -----------#

// #----------- FUNCTIONS -----------#
/**
 * *change font size
 * @param {*} percent
 */
function setFontSize(percent) {
	document.documentElement.style.fontSize = percent + '%';
}

function clearFontHighlight() {
	changeFontSizeBtn.forEach((btn) => {
		btn.classList.remove('selected');
	});
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
	clearFontHighlight();
	changeFontSizeBtn[0].classList.add('selected');
});

changeFontSizeBtn[1].addEventListener('click', () => {
	setFontSize(62.5);
	clearFontHighlight();
	changeFontSizeBtn[1].classList.add('selected');
});

changeFontSizeBtn[2].addEventListener('click', () => {
	setFontSize(65);
	clearFontHighlight();
	changeFontSizeBtn[2].classList.add('selected');
});

// #----------- function calling -----------#
