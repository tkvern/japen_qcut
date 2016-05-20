var preload_image = function(src){
	$("<img />").attr("src", src).hide().appendTo("body").on("load", function(){
		$(this).remove();
	});
};

jQuery(function($){
	$(".hover").each(function(){
		var img = $(this);
		img.data({
			src: img.attr("src"),
			src_on: img.attr("src").replace(/\.(png|jpg|gif)$/, "-on.$1")
		});
		preload_image(img.data("src_on"));

	}).hover(function(){
		$(this).attr("src", $(this).data("src_on"));
	}, function(){
		$(this).attr("src", $(this).data("src"));
	});


	var $window = $(window);
	var $scrollBtn = $("#Navigation .scrollBtn");
	var windowHeight;
	var isScrolling = false;
	var isTop = true;
	var top = $(".scrollTo").length > 0 ? $(".scrollTo").offset().top - 235 : $window.height() - 84;

	var _onScroll = function(){
		if ( isScrolling ) return;
		var st = $window.scrollTop();
		windowHeight = $window.height();

		if ( st < top ) {
			if ( !isTop ) {
				isTop = true;
				$scrollBtn.stop(true).animate( {rotate:"0deg"}, 250, "easeInOutQuad" );
			}
		} else {
			if ( isTop ) {
				isTop = false;
				$scrollBtn.stop(true).animate( {rotate:"180deg"}, 250, "easeInOutQuad" );
			}
		}
	};

	$scrollBtn.on("click", function(){
		var st = isTop ? top : 0;
		var time = isTop ? 600 : 800;
		isScrolling = true;
		$("html,body").stop(true).animate( { scrollTop:st }, time, "easeInOutQuad", function(){
			isScrolling = false;
			_onScroll();
		});
		return false;
	});

	$window.on("scroll", _onScroll);
	$("#Navigation").followScroll();
});
