(function () {

    var ScrollHelper = function () {
        var self = this;
        chrome.extension.sendMessage({message:"getData"}, 
            function(response){
              self.use = response.use;
              self.data = response.data;
              if(self._canInit()){
                self.createBoxes();
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
                if(url.indexOf(list[i]) > -1){
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
            self.$container = $('<div class="scroll-helper"></div>');
            self.$topBox = $('<a class="box top-box" href="javascript:void(0);" title="回到顶部">顶部</a>');
            self.$bottomBox = $('<a class="box bottom-box" href="javascript:void(0);" title="回到底部">底部</a>');
            self.$prevBox = $('<a class="box prev-box" href="javascript:void(0);" title="向上一屏">向上</a>');
            self.$nextBox = $('<a class="box next-box" href="javascript:void(0);" title="向下一屏">向下</a>');
            self.$settingBox = $('<a class="box setting-box" href="javascript:void(0)" title="设置">S</a>');
            self.$container.append([self.$topBox, self.$bottomBox, self.$prevBox, self.$nextBox, self.$settingBox]);
            self.$body.append(self.$container);
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
                $this.animate({opacity: 0}, 'fast');
            });

            self.$settingBox.mouseenter(function () {
                var $this = $(this);
                $this.animate({opacity: 0.8}, 'fast');
            });

            self.$settingBox.click(function(){
                chrome.extension.sendMessage({message: 'openOptions'});
            })
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