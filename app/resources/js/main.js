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

		var $parallaxImage = $('.has-parallax img');		

		var mql = window.matchMedia('(min-width: 1024px)');
		mql.addListener(mqHandler);
		mqHandler(mql);

		function mqHandler(mql) {
		  if (mql.matches) {
			  $(window).on('scroll', parallax);
		  } else {
			  $(window).off('scroll');
			  $parallaxImage.css({
				  'transform': 'translateY(0)'
			  });
		  }
		}

		function parallax() {
			$parallaxImage.css({
				'transform': 'translateY(' +  $(window).scrollTop() * 0.5 + 'px)'
			});
		}
	});
})();
