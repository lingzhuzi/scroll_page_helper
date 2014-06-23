(function(){
	chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
		if(request.message == 'getData'){
			var use = localStorage.getItem('use') || 'black_list';
			var data = JSON.parse(localStorage.getItem(use)) || [];
			var position = JSON.parse(localStorage.getItem('position'));
			sendResponse({use: use, data: data, position: position});
		} else if (request.message == 'openOptions'){
			chrome.extension.getBackgroundPage().open('options.html');
		} else if(request.message == 'savePosition'){
			var savePosition = localStorage.getItem('savePosition');
			if(savePosition == 'true'){
				localStorage.setItem('position', JSON.stringify(request.position));
			}
		}
	});
})();