(function(){
	$(function(){
		var BLACK_LIST = 'black_list', WHITE_LIST = 'white_list';
		var use = localStorage.getItem('use');
		if(!use){
			use = BLACK_LIST;
			localStorage.setItem('use', use);
			saveData(BLACK_LIST, []);
			saveData(WHITE_LIST, []);
		} else if(use == BLACK_LIST){
			showBlackList();
		} else if (use == WHITE_LIST){
			showWhiteList();
		}

		$('#black_list_radio').click(function(){
			showBlackList();
		});

		$('#white_list_radio').click(function(){
			showWhiteList();
		});

		$('#save_btn').click(function(){
			var data = $('#' + use).val().split('\n');
			saveData(use, data);
			localStorage.setItem('use', use);
			$('#notice_wrap').slideDown('fast');
			window.setTimeout(function(){
				$('#notice_wrap').slideUp('fase');
			}, 3000);
		});


		function showBlackList(){
			$('#black_list_radio').attr('checked', 'checked');
			$('#black_list_ctn').show();
			$('#white_list_ctn').hide();
			use = BLACK_LIST;
			var data = JSON.parse(localStorage.getItem(BLACK_LIST)).join('\n');
			$('#black_list').text(data);
		}

		function showWhiteList(){
			$('#white_list_radio').attr('checked', 'checked');
			$('#white_list_ctn').show();
			$('#black_list_ctn').hide();
			use = WHITE_LIST;
			var data = JSON.parse(localStorage.getItem(WHITE_LIST)).join('\n');
			$('#white_list').text(data);
		}

		function saveData(list_name, data){
			localStorage.setItem(list_name, JSON.stringify(data));
		}
	});
})();