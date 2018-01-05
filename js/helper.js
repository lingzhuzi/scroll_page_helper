(function () {

  var ScrollHelper = function () {
    var self = this;
    chrome.extension.sendMessage({message: "getData"},
      function (response) {
        self.use = response.use;
        self.data = response.data;
        self.position = response.position;
        self.scroll_speed = response.scroll_speed;
        self.auto_hide_buttons = response.auto_hide_buttons;
        self.auto_hide_s_buttons = response.auto_hide_s_buttons;
        self.closed = false;

        self.initBoxes();
        self.bindGlobalEvents();
      });
  };

  ScrollHelper.prototype = {
    _canInit: function () {
      var self = this, isIn = self._inList();
      return !self.closed && self.use == 'black_list' && !isIn || self.use == 'white_list' && isIn;
    },
    _inList: function () {
      var self = this, url = window.location.href, list = self.data, length = list.length, isIn = false;
      for (var i = 0; i < length; i++) {
        if (list[i] && url.indexOf(list[i]) > -1) {
          isIn = true;
          break;
        }
      }
      return isIn;
    },
    initBoxes: function () {
      var self = this;
      var $helper = $('div.scroll-helper');
      if (self._canInit() && $helper.length == 0){
        self.createBoxes();
        self.setPosition();
        self.createContextMenus();
        self.displayBoxes();
        self.bindEvents();
      }
    },
    createBoxes: function () {
      var self = this;

      self.$body   = $('body');
      self.$document = $(document);
      self.$window  = $(window);

      self.$container = $('<div class="scroll-helper"></div>');
      self.$topBox   = $('<a class="box top-box" href="javascript:void(0);" title="回到顶部">顶部</a>');
      self.$bottomBox = $('<a class="box bottom-box" href="javascript:void(0);" title="回到底部">底部</a>');
      self.$prevBox  = $('<a class="box prev-box" href="javascript:void(0);" title="向上一屏">向上</a>');
      self.$nextBox  = $('<a class="box next-box" href="javascript:void(0);" title="向下一屏">向下</a>');
      self.$settingBox = $('<a class="box setting-box" href="javascript:void(0)" title="设置">S</a>');

      self.$container.append([self.$topBox, self.$bottomBox, self.$prevBox, self.$nextBox, self.$settingBox]);
      self.$body.append(self.$container);

      if (!self.auto_hide_s_buttons) {
        self.$settingBox.css({opacity: 0.8});
      }
    },
    createContextMenus: function(){
      var self = this;

      var $close               = $('<li><a href="javascript:void(0);" class="close">关闭</a></li>');
      var $auto_scroll         = $('<li><a href="javascript:void(0);" class="auto-scroll">开启自动滚动</a></li>');
      var $save_position       = $('<li><a href="javascript:void(0);" class="save-position">保存位置</a></li>');
      var $not_in_this_page    = $('<li><a href="javascript:void(0);" class="not-in-this-page">不在该网页使用</a></li>');
      var $not_in_this_website = $('<li><a href="javascript:void(0);" class="not-in-this-website">不在该网站使用</a></li>');

      self.$menus = $('<ul class="context-menu"></ul>');
      self.$menus.append([$close, $save_position, $auto_scroll, $not_in_this_page, $not_in_this_website]);
      self.$container.append(self.$menus);
    },
    getPosition: function (){
      var self = this;
      var $ctn = self.$container;

      var left  = $ctn.css('left');
      var right = $ctn.css('right');
      var top  = $ctn.css('top');
      var bottom = $ctn.css('bottom');

      var position = {};
      if (left == 'inherit' || left == 'auto' || !left){
        position['right'] = parseInt(right);
      } else {
        position['left'] = parseInt(left);
      }

      if(top == 'inherit'|| top == 'auto' || !top){
        position['bottom'] = parseInt(bottom);
      } else {
        position['top'] = parseInt(top);
      }

      return position;
    },
    setPosition: function () {
      var self = this, position = self.position;
      if (position) {
        var left = position.left, right = position.right, top = position.top, bottom = position.bottom;
        if (top != undefined) {
          self.$container.css({top: top});
        } else {
          self.$container.css({top: 'inherit', bottom: bottom});
        }

        if (left != undefined) {
          self.$container.css({left: left});
        } else {
          self.$container.css({right: right, left: 'inherit'});
        }
      }
    },
    bindEvents: function () {
      var self = this;
      self.bindBoxesEvents();
      self.bindDragEvents();
      self.bindMenuEvents();
    },
    bindGlobalEvents: function () {
      var self = this;
      self.$window.scroll(function () {
        self.initBoxes();
        self.displayBoxes();
      });

      self.$window.resize(function () {
        self.initBoxes();
        self.displayBoxes();
      });
    },
    bindBoxesEvents: function(){
      var self = this;
      self.$topBox.click(function () {
        self.scrollTo(0);
      });

      self.$bottomBox.click(function () {
        self.scrollTo(self.$document.height());
      });

      self.$prevBox.click(function () {
        self.scrollTo(self.$document.scrollTop() - self.$window.height());
      });

      self.$nextBox.click(function () {
        self.scrollTo(self.$document.scrollTop() + self.$window.height());
      });

      $.each([self.$topBox, self.$bottomBox, self.$prevBox, self.$nextBox], function (i, box) {
        var $box = $(box);
        $box.mouseleave(function () {
          var $this = $(this);
          $this.animate({opacity: 0.25}, 'fast');
        });

        $box.mouseenter(function () {
          var $this = $(this);
          $this.animate({opacity: 0.4}, 'fast');
        });
      });

      self.$settingBox.mouseleave(function () {
        var $this = $(this);
        if (!self.dragging && self.auto_hide_s_buttons) {
          $this.animate({opacity: 0}, 'fast');
        }
      });

      self.$settingBox.mouseenter(function () {
        var $this = $(this);
        $this.animate({opacity: 0.8}, 'fast');
      });

      self.$settingBox.click(function () {
        if (!self.dragging) {
          chrome.extension.sendMessage({message: 'openOptions'});
        }
      });
    },
    bindDragEvents: function(){
      var self = this;
      self.$container.draggable({
        handle: ".setting-box",
        start: function (event, ui) {
          self.dragging = true;
          self.$container.children('.box').show();
        },
        stop: function (event, ui) {
          var left = ui.position.left, top = ui.position.top;
          var position = self.buildPosition(left, top);
          self.position = position;
          self.setPosition();
          chrome.extension.sendMessage({message: "savePosition", position: position});
          window.setTimeout(function () {
            self.dragging = false;
          }, 100);
        }
      });
    },
    bindMenuEvents: function(){
      var self = this;

      self.$settingBox.bind("contextmenu", function(){
        self.$menus.show();
        return false;
      });

      $(document).bind('mousedown',function(){
        self.$menus.hide();
      });

      self.$menus.hover(function(){
        //菜单出来后移上去点左健不会隐藏当前菜单
        $(document).unbind('mousedown');
      },function(){
        //移出后点击其它区域则隐藏菜单
        $(document).bind('mousedown',function(){
          self.$menus.hide();
        });
      });

      self.bindMenuItemEvents();
    },
    bindMenuItemEvents: function(){
      var self = this;
      self.$menus.find('.close').click(function(){
        self.closed = true;
        self.$container.remove();
      });
      self.$menus.find('.auto-scroll').click(function(){
        var scrolling = self.scrolling;
        if(scrolling){
          self.stopAutoScroll();
        } else {
          self.startAutoScroll();
        }
      });
      self.$menus.find('.save-position').click(function(){
        var position = self.getPosition();
        chrome.extension.sendMessage({message: "savePosition", position: position, from: 'menu'});
      });
      self.$menus.find('.not-in-this-page').click(function(){
        var url = location.href;
        url = url.split(/[#?]/)[0];
        chrome.extension.sendMessage({message: "addToBlackList", url: url});
        self.closed = true;
        self.$container.remove();
      });
      self.$menus.find('.not-in-this-website').click(function(){
        var url = location.protocol + "//" + location.hostname;
        chrome.extension.sendMessage({message: "addToBlackList", url: url});
        self.closed = true;
        self.$container.remove();
      });
      self.$menus.find('a').click(function(){
        self.$menus.hide();
      });
    },
    buildPosition: function(left, top){
      var self = this, width = self.$window.width(), height = self.$window.height();
      var position = {};
      if (left > width / 2) {
        position.right = width - left - self.$container.width();
      } else {
        position.left = left;
      }

      if (top > height / 2) {
        position.bottom = height - top - self.$container.height();
      } else {
        position.top = top;
      }
      return position;
    },
    scrollTo: function (scrollTop) {
      var self = this;
      $('html, body').animate({scrollTop: scrollTop}, 'fast', function () {
        self.displayBoxes();
      });
    },
    displayBoxes: function () {
      var self = this, scrollTop = self.$body.scrollTop(), winHeight = self.$window.height(), docHeight = self.$document.height();

      if (scrollTop > 0) {
        self.$topBox.show();
        self.$prevBox.show();
      } else if (self.auto_hide_buttons) {
        self.$topBox.hide();
        self.$prevBox.hide();
      }

      if (scrollTop + winHeight >= docHeight && self.auto_hide_buttons) {
        self.$nextBox.hide();
        self.$bottomBox.hide();
      } else {
        self.$nextBox.show();
        self.$bottomBox.show();
      }
    },
    startAutoScroll: function(){
      var self = this, speed = 1000/self.scroll_speed;
      self.scrolling = true;
      self.$menus.find('.auto-scroll').text('关闭自动滚动');
      self.autoScrollInterval = window.setInterval(function(){
        var scrollTop = self.$body.scrollTop();
        if(!self.scrolling || scrollTop >= self.$document.height() - self.$window.height()){
          self.stopAutoScroll();
        } else {
         self.$body.scrollTop(scrollTop + 1);
        }
      }, speed);
    },
    stopAutoScroll: function(){
      var self = this;
      self.scrolling = false;
      window.clearInterval(self.autoScrollInterval);
      self.$menus.find('.auto-scroll').text('开启自动滚动');
    }
  };

  new ScrollHelper();

})();