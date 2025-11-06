// #----------- DOM -----------#
const calendarIcon = document.querySelector('.calendar-icon');
const datePicker = document.querySelector('.date-picker');
const dateLabel = document.querySelector('.date-label');
const dateBackArrow = document.querySelector('.arrow-back');
const dateForwardArrow = document.querySelector('.arrow-forward');

// #----------- date picker -----------#
// initialize flatpickr
const dateInput = flatpickr(datePicker, {
	dateFormat: 'M. d, Y',
	defaultDate: 'today',
	appendTo: document.querySelector('.date'),
	onChange: (_, dateStr) => {
		dateLabel.textContent = `${dateStr}`;
	},
});

// give default value (today's date)
dateLabel.textContent = 'Today, ' + dateInput.input.value;

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
