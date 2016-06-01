(function() {
	'use strict';
	$(document).ready(function() {
		$('#menu').on('click', function() {
			$('#overall-wrapper').toggleClass('off-left');
		});

		$('.expandable').expandable({
			easing: 'easeOutQuart',
			time: 1000
		});
	});
})();
