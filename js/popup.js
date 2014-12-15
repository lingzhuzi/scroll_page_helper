(function () {
  chrome.extension.sendMessage({message: 'openOptions'});

  $.get(chrome.extension.getURL('manifest.json'), function(info){
    var version = info.version;
    $('#version_no').text(version);
  }, 'json');
})();