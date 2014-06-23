(function () {

    var ScrollHelper = function () {
        var self = this;
        chrome.extension.sendMessage({message:"getData"}, 
            function(response){
              self.use = response.use;
              self.data = response.data;
              if(self._canInit()){
                self.createBoxes();
                self.initPosition(response.position);
                self.bindEvents();
                self.displayBoxes();
            }
        });
    };

    ScrollHelper.prototype = {
        _canInit: function(){
            var self = this, isIn = self._inList();
            return self.use == 'black_list' && !isIn || self.use == 'white_list' && isIn;
        },
        _inList: function(){
            var self = this, url = window.location.href, list = self.data, length = list.length, isIn = false;
            for(var i=0;i<length;i++){
                if(list[i] && url.indexOf(list[i]) > -1){
                    isIn = true;
                    break;
                }
            }
            return isIn;
        },
        createBoxes: function () {
            var self = this;
            self.$body = $('body');
            self.$document = $(document);
            self.$window = $(window);
            
            self.$topBox = $('<a class="scroll-helper box top-box" href="javascript:void(0);" title="回到顶部">顶部</a>');
            self.$bottomBox = $('<a class="scroll-helper box bottom-box" href="javascript:void(0);" title="回到底部">底部</a>');
            self.$prevBox = $('<a class="scroll-helper box prev-box" href="javascript:void(0);" title="向上一屏">向上</a>');
            self.$nextBox = $('<a class="scroll-helper box next-box" href="javascript:void(0);" title="向下一屏">向下</a>');
            self.$settingBox = $('<a class="scroll-helper box setting-box" href="javascript:void(0)" title="设置">S</a>');
            self.$body.append([self.$topBox, self.$bottomBox, self.$prevBox, self.$nextBox, self.$settingBox]);
        },
        initPosition: function(position){
            var self = this;
            if(position){
                var left = position.left, right = position.right, top = position.top, bottom = position.bottom;
                if(top != undefined){
                    self.$settingBox.css({top: top});
                    self.$topBox.css({top: top - 16});
                    self.$bottomBox.css({top: top + 13});
                    self.$prevBox.css({top: top - 16});
                    self.$nextBox.css({top: top + 13});
                }else {
                    self.$settingBox.css({top: 'inherit', bottom: bottom});
                    self.$topBox.css({top: 'inherit', bottom: bottom + 13});
                    self.$bottomBox.css({top: 'inherit', bottom: bottom - 16});
                    self.$prevBox.css({top: 'inherit', bottom: bottom + 13});
                    self.$nextBox.css({top: 'inherit', bottom: bottom - 16});
                }

                if(left != undefined){
                    self.$settingBox.css({left: left});
                    self.$topBox.css({left: left + 13});
                    self.$bottomBox.css({left: left + 13});
                    self.$prevBox.css({left: left - 34});
                    self.$nextBox.css({left: left - 34});
                } else {
                    self.$settingBox.css({right: right, left: 'inherit'});
                    self.$topBox.css({right: right - 34, left: 'inherit'});
                    self.$bottomBox.css({right: right - 34, left: 'inherit'});
                    self.$prevBox.css({right: right + 13, left: 'inherit'});
                    self.$nextBox.css({right: right + 13, left: 'inherit'});
                }
            }
        },
        bindEvents: function () {
            var self = this;
            self.$topBox.click(function () {
                self.scrollTo(0);
            });

            self.$bottomBox.click(function () {
                self.scrollTo(self.$document.height());
            });

            self.$prevBox.click(function () {
                self.scrollTo(self.$body.scrollTop() - self.$window.height());
            });

            self.$nextBox.click(function () {
                self.scrollTo(self.$body.scrollTop() + self.$window.height());
            });

            self.$window.scroll(function () {
                self.displayBoxes();
            });

            self.$window.resize(function () {
                self.displayBoxes();
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
                if(!self.dragging){
                    $this.animate({opacity: 0}, 'fast');
                }
            });

            self.$settingBox.mouseenter(function () {
                var $this = $(this);
                $this.animate({opacity: 0.8}, 'fast');
            });

            self.$settingBox.click(function(){
                if(!self.dragging){
                    chrome.extension.sendMessage({message: 'openOptions'});
                }
            });

            self.$settingBox.draggable({
                start: function(event, ui){
                    self.dragging = true;
                    self.$topBox.show();
                    self.$bottomBox.show();
                    self.$prevBox.show();
                    self.$nextBox.show();
                    self.$settingBox.show();
                },
                stop: function(event, ui){
                    var position = ui.position, left = position.left, top = position.top, width = self.$window.width(), height = self.$window.height();
                    var pos = {};
                    if(left > width/2){
                        self.$topBox.css({left: 'inherit', right: width - left - 13 - self.$topBox.width()});
                        self.$bottomBox.css({left: 'inherit', right: width - left - 13 - self.$bottomBox.width()});
                        self.$prevBox.css({left: 'inherit', right: width - left + 34 - self.$prevBox.width()});
                        self.$nextBox.css({left: 'inherit', right: width - left + 34 - self.$nextBox.width()});
                        self.$settingBox.css({left: 'inherit', right: width - left - self.$settingBox.width()});
                        pos.right = width - left - self.$settingBox.width();
                    } else {
                        pos.left = position.left;
                    }

                    if(top > height/2){
                        self.$topBox.css({top: 'inherit', bottom: height - top + 16 - self.$topBox.height() });
                        self.$bottomBox.css({top: 'inherit', bottom: height - top - 13 - self.$topBox.height()});
                        self.$prevBox.css({top: 'inherit', bottom: height - top + 16 - self.$topBox.height()});
                        self.$nextBox.css({top: 'inherit', bottom: height - top - 13 - self.$topBox.height()});
                        self.$settingBox.css({top: 'inherit', bottom: height - top - self.$settingBox.height()});
                        pos.bottom = height - top - self.$settingBox.height();
                    }  else {
                        pos.top = position.top;
                    }
                    chrome.extension.sendMessage({message:"savePosition", position: pos}, 
                        function(response){
                          self.use = response.use;
                          self.data = response.data;
                          if(self._canInit()){
                            self.createBoxes();
                            self.bindEvents();
                            self.displayBoxes();
                        }
                    });
                    window.setTimeout(function(){
                        self.dragging = false;
                    }, 100);
                },
                drag: function(event, ui){
                    var position = ui.position, left = position.left, top = position.top;
                    self.$topBox.css({left: left + 13, top: top - 16});
                    self.$bottomBox.css({left: left + 13, top: top + 13});
                    self.$prevBox.css({left: left - 34, top: top - 16});
                    self.$nextBox.css({left: left - 34, top: top + 13});
                }
            });
},
scrollTo: function (scrollTop) {
    var self = this;
    self.$body.animate({scrollTop: scrollTop}, 'fast', function () {
        self.displayBoxes();
    });
},
displayBoxes: function () {
    var self = this, scrollTop = self.$body.scrollTop(), winHeight = self.$window.height(), docHeight = self.$document.height();

    if (scrollTop > 0) {
        self.$topBox.show();
        self.$prevBox.show();
    } else {
        self.$topBox.hide();
        self.$prevBox.hide();
    }

    if (scrollTop + winHeight >= docHeight) {
        self.$nextBox.hide();
        self.$bottomBox.hide();
    } else {
        self.$nextBox.show();
        self.$bottomBox.show();
    }
}
};

$(function () {
    new ScrollHelper();
});
})();