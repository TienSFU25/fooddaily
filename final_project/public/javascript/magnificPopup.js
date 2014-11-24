$(document).ready(function() {
	$('.popup-with-form').magnificPopup({
		type: 'inline',
		preloader: true, 
		focus: '#name',
		removalDelay: 300,
		  mainClass: 'mfp-fade',
		  callbacks: {
		    open: function() {
		      console.log('popup opened!')
		    },
		    close: function() {
		    	console.log('popup closed')
		    }
		  }  
	});
})