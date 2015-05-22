(function () {
  chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'getData') {
      var use = getData('use', 'black_list');
      var data = getData(use, []);
      var position = getData('position', null);
      var scroll_speed = getData('scroll_speed', 20);
      var autoHideButtons = getData('autoHideButtons');
      var autoHideSettingButton = getData('autoHideSettingButton');
      var responseData = {
        use: use,
        data: data,
        position: position,
        scroll_speed: scroll_speed,
        auto_hide_buttons: autoHideButtons,
        auto_hide_s_buttons: autoHideSettingButton
      };
      sendResponse(responseData);
    } else if (request.message == 'openOptions') {
      chrome.extension.getBackgroundPage().open('options.html');
    } else if (request.message == 'savePosition') {
      var savePosition = localStorage.getItem('autoSavePosition');
      if (savePosition == 'true' || request.from == 'menu') {
        localStorage.setItem('position', JSON.stringify(request.position));
      }
    } else if (request.message == 'addToBlackList'){
      var use = 'black_list';
      var data = JSON.parse(localStorage.getItem(use)) || [];
      data.push(request.url);
      var json = JSON.stringify(data);
      localStorage.setItem(use, json);
    }
  });

  function getData(name, defaultData){
    var strData = localStorage.getItem(name);
    return strData ? JSON.parse(strData) : defaultData;
  }

})();