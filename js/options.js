(function () {
  $(function () {
    var BLACK_LIST = 'black_list', WHITE_LIST = 'white_list';
    var VERSION = 0;
    showVersion();
    checkUpdate();
    initDefaultData();
    showSettingData();
    bindEvents();

    function initDefaultData (force) {
      initDefaultList(force);
      initDefaultPosition(force);
      initDefaultScrollSpeed(force);
    }

    function initDefaultList(force){
      if (force || !getData('use')) {
        saveData('use', BLACK_LIST);
      }
      if (force || !getData(BLACK_LIST)) {
        saveData(BLACK_LIST, []);
      }
      if (force || !getData(WHITE_LIST)) {
        saveData(WHITE_LIST, []);
      }
    }

    function initDefaultPosition(force){
      var position = getData('position');
      if(force || !position){
        var position = {top: 85, right: 10};
        saveData("position", position);
      }
    }

    function initDefaultScrollSpeed(force){
      var speed = getData('scroll_speed');
      if(force || !speed){
        saveData('scroll_speed', 20);
      }
    }

    function showSettingData(){
      showList();
      showPosition();
      showAutoScrollSpeed();
    }

    function bindEvents(){
      $('#black_list_radio').click(function () {
        showBlackList();
      });

      $('#white_list_radio').click(function () {
        showWhiteList();
      });

      $('#save_btn').click(function () {
        var use = $('#black_list_radio').is(':checked') ? BLACK_LIST : WHITE_LIST;
        var data = $('#' + use).val().split('\n');
        saveData(use, data);
        savePosition();
        saveAutoScrollSpeed();
        saveData('use', use);
        saveData('autoSavePosition', $('#auto_save_position').is(':checked'));
        $('#notice_wrap').slideDown('fast');
        window.setTimeout(function () {
          $('#notice_wrap').slideUp('fase');
        }, 3000);
      });

      $('#example').click(function () {
        var $content = $('.example_content');
        if ($content.is(':visible')) {
          $content.slideUp('fast');
        } else {
          $content.slideDown('fast');
        }
      });

      $('#to_default').click(function(){
        initDefaultData(true);
        showSettingData();
      });
    }

    function checkUpdate(){
      $.get("https://raw.githubusercontent.com/lingzhuzi/scroll_page_helper/master/release/version.json", function(json){
        var data = JSON.parse(json);
        var version = data.version;
        var log = data.log;
        if (version > VERSION){
          $('#update_ctn').show();
          $('#update_ctn .version').html("版本：" + version);
          $('#update_ctn .log').html($(log));
        } else {
          $('#update_ctn').remove();
        }
      });
    }

    function showVersion(){
      $.get(chrome.extension.getURL('manifest.json'), function(info){
        VERSION = parseFloat(info.version);
        $('#version_no').text(info.version);
      }, 'json');
    }

    function showList(){
      var use = getData('use');
      if (use == BLACK_LIST) {
        showBlackList();
      } else if (use == WHITE_LIST) {
        showWhiteList();
      }
    }

    function showBlackList() {
      $('#black_list_radio').attr('checked', 'checked');
      $('#black_list_ctn').show();
      $('#white_list_ctn').hide();

      var data = getData(BLACK_LIST, []).join('\n');
      $('#black_list').text(data);
    }

    function showWhiteList() {
      $('#white_list_radio').attr('checked', 'checked');
      $('#white_list_ctn').show();
      $('#black_list_ctn').hide();

      var data = getData(WHITE_LIST, []).join('\n');
      $('#white_list').text(data);
    }

    function showPosition(){
      var autoSavePosition = getData('autoSavePosition');
      if (autoSavePosition) {
        $('#auto_save_position').attr('checked', 'checked');
      }

      var position = getData("position");
      var left     = position.left;
      var right    = position.right;
      var top      = position.top;
      var bottom   = position.bottom;

      if(left) {
        $("select.left_or_right").val('1');
        $("input.left_or_right").val(left);
      }

      if(right) {
        $("select.left_or_right").val('2');
        $("input.left_or_right").val(right);
      }

      if(top) {
        $("select.top_or_bottom").val('3');
        $("input.top_or_bottom").val(top);
      }

      if(bottom) {
        $("select.top_or_bottom").val('4');
        $("input.top_or_bottom").val(bottom);
      }
    }

    function savePosition(){
      var position = {};
      var lor = $("select.left_or_right").val() == 1 ? 'left' : 'right';
      position[lor] = parseInt($("input.left_or_right").val());

      var tob = $("select.top_or_bottom").val() == 3 ? 'top' : 'bottom';
      position[tob] = parseInt($("input.top_or_bottom").val());

      saveData("position", position);
    }

    function saveData(list_name, data) {
      var strData = JSON.stringify(data);
      localStorage.setItem(list_name, strData);
    }

    function getData(name, defaultData){
      var strData = localStorage.getItem(name);
      return strData ? JSON.parse(strData) : defaultData;
    }

    function showAutoScrollSpeed(){
      var speed = getData('scroll_speed');
      $("#auto_scroll_speed").val(speed);
    }

    function saveAutoScrollSpeed(){
      var speed = $("#auto_scroll_speed").val();
      saveData('scroll_speed', speed);
    }
  });
})();