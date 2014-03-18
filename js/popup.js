(function(){
	$(function(){
		$('#options_page').click(function(){
			chrome.extension.getBackgroundPage().open('options.html');
		});
	});
})();