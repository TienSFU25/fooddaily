$(document).ready(function() {
	$('.popup-with-form').magnificPopup({
		type: 'inline',
		preloader: true, 
		removalDelay: 300,
		gallery: {
			enabled: true
		},
		  mainClass: 'mfp-fade',
		  callbacks: {
		    open: function() {
		      console.log('popup openedeee!')
		    },
		    close: function() {
		    	console.log('popup closed')
		    }
		  }  
	});


    $('#tabs').tabs();
})