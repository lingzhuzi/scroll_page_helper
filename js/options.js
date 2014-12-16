(function () {
  $(function () {
    var BLACK_LIST = 'black_list', WHITE_LIST = 'white_list';
    showData();

    $('#black_list_radio').click(function () {
      showBlackList();
    });

    $('#white_list_radio').click(function () {
      showWhiteList();
    });

    $('#save_btn').click(function () {
      var data = $('#' + use).val().split('\n');
      saveData(use, data);
      savePosition();
      saveAutoScrollSpeed();
      localStorage.setItem('use', use);
      localStorage.setItem('savePosition', $('#save_position').is(':checked'));
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

    function showData(){
      $.get(chrome.extension.getURL('manifest.json'), function(info){
        var version = info.version;
        $('#version_no').text(version);
      }, 'json');

      var defualtBlackList = [];
      var use = localStorage.getItem('use');
      if (!use) {
        use = BLACK_LIST;
        localStorage.setItem('use', use);
        saveData(BLACK_LIST, defualtBlackList);
        saveData(WHITE_LIST, []);
        showBlackList();
      } else if (use == BLACK_LIST) {
        showBlackList();
      } else if (use == WHITE_LIST) {
        showWhiteList();
      }

      var savePosition = localStorage.getItem('savePosition');
      if (savePosition == 'true') {
        $('#save_position').attr('checked', 'checked');
      }

      showPosition();
      showAutoScrollSpeed();
    }

    function showBlackList() {
      $('#black_list_radio').attr('checked', 'checked');
      $('#black_list_ctn').show();
      $('#white_list_ctn').hide();
      use = BLACK_LIST;
      var data = JSON.parse(localStorage.getItem(BLACK_LIST)).join('\n');
      $('#black_list').text(data);
    }

    function showWhiteList() {
      $('#white_list_radio').attr('checked', 'checked');
      $('#white_list_ctn').show();
      $('#black_list_ctn').hide();
      use = WHITE_LIST;
      var data = JSON.parse(localStorage.getItem(WHITE_LIST)).join('\n');
      $('#white_list').text(data);
    }

    function showPosition(){
      var position = JSON.parse(localStorage.getItem("position"));
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

      localStorage.setItem("position", JSON.stringify(position));
    }

    function saveData(list_name, data) {
      localStorage.setItem(list_name, JSON.stringify(data));
    }

    function showAutoScrollSpeed(){
      var speed = localStorage.getItem('scroll_speed');
      if(!speed) {
        speed = 1;
        localStorage.setItem('scroll_speed', speed);
      }
      $("#auto_scroll_speed").val(speed);
    }

    function saveAutoScrollSpeed(){
      var speed = $("#auto_scroll_speed").val();
      localStorage.setItem('scroll_speed', speed);
    }
  });
})();