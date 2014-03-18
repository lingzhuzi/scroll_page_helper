(function(){
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
		if(request.message == 'getData'){
			var use = localStorage.getItem('use') || 'black_list';
			var data = JSON.parse(localStorage.getItem(use)) || [];
			sendResponse({use: use, data: data});
		} else if (request.message == 'openOptions'){
			chrome.extension.getBackgroundPage().open('options.html');
		}
	});
})();