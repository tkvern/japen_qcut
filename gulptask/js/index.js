/*-----------------------------------------------------------------

lowers.js

-----------------------------------------------------------------*/

jQuery(function(){
	var $window = $(window);
	var $wrapper;
	var windowHeight;

	var _onResize = function(){
		windowHeight = $window.height();
		$(".page-header").height(windowHeight);
	};


	//_onResize();

	$wrapper = $("#Wrapper").hide();

	$(document).onImagesLoad(function(){
		$wrapper.fadeIn(500);
		$("#MainVisual img").resizableImage({ maskOffsetHeight:-85, pointOfInterst:{ x:0.5, y:0.2 } });
		$("#Gallery .visual img").resizableImage({ maskHeight:600, pointOfInterst:{ x:0.5, y:0.1 } });
		setupGllery();
		$("#Salon .visual img[width='50%']").resizableImage({ maskHeight:300, maskWidth:0.5 });
		$("#Salon .visual img[width='100%']").resizableImage({ maskHeight:300 });
		$("#Salon .resizableImageMask").eq(0).prepend('<div class="salonName">优客首页</div>');
		$("#Salon .resizableImageMask").eq(1).prepend('<div class="salonName">植物染发</div>');
		$("#Salon .resizableImageMask").eq(2).prepend('<div class="salonName">关于快剪</div>');
		$("#Salon .resizableImageMask").eq(3).prepend('<div class="salonName">公司介绍</div>');
		$("#Salon .resizableImageMask").eq(4).prepend('<div class="salonName">加入我们</div>');
		$("#Salon .visual a").hover(function(){
			$(this).find(".resizableImageMask>img").stop(true).animate({ scale:1.025, opacity:0.4 },750,"easeOutExpo");
			$(this).find(".resizableImageMask>img").css("background-color","black");
			$(this).find(".resizableImageMask div").css("z-index",1);
		}, function(){
			$(this).find(".resizableImageMask>img").stop(true).animate({ scale:1.0, opacity:1.0 },200,"easeOutCubic");
		});

		$window.resize();
	});


	$window.on("resize", _onResize);

	// Page Navigation
	$(window).on("load",function(){
		var wHeight = $window.height() - 80;;
		var nav = $("#PageNavigation li");
		
		var sectionTops = [
			0,
			$("#Gallery").offset().top - 200,
			$("#News").offset().top - 200,
			$("#Salon").offset().top - 200,
			$("#Company").offset().top - 200
		];
		
		nav.on("click",function() {
			for ( var i=0; i<5; i++ ) {
				if (nav.get(i) === this) break;
			}
			$("html,body").stop().animate({scrollTop:sectionTops[i]},450,"easeOutCubic");
			return false;
		});
		
		

		$window.on("scroll resize", function(){
			wHeight = $window.height() - 80;
			var scrollTop = $window.scrollTop();
			nav.removeClass("on");
			for (var i=4; i>=0; i--) {
				if ( i==0 || sectionTops[i] <= scrollTop) {
					nav.eq(i).addClass("on");
					break;
				}
			}
		});
	});
});


//---------------------------------------------------------
//	gallery
//---------------------------------------------------------
function setupGllery() {
	var $container			= $("#Gallery .visual");
	var $inner				= $("#Gallery .visual div.inner");
	var $images				= $("#Gallery .visual div.inner>.resizableImageMask");
	var $allowLeft			= $("#AllowLeft");
	var $allowRight			= $("#AllowRight");
	var page				= 0;
	var maxPage				= $images.length - 1;
	var timer;
	if ( !$images.length ) return;
	
	$allowLeft.on("click",_left);
	$allowRight.on("click",_right);
	$(window).on("resize",_onResize);
	_onResize();
	_move();
	
	function _left() {
		page--;
		_move();
	}
	
	function _right() {
		page++;
		_move();
	}
	
	function _move() {
		if ( page < 0 ) page = maxPage;
		else if ( page > maxPage ) page = 0;
		var left = page * -$(window).width();
		$inner.stop(true).animate( {marginLeft:left}, 750, "easeInOutCubic");
		
		if ( page <= 0 ) $allowLeft.hide();
		else $allowLeft.show();
		if ( page >= maxPage ) $allowRight.hide();
		else $allowRight.show();
		
		if ( timer ) clearTimeout(timer);
		timer = setTimeout(_right, 10000);
	}
	
	function _onResize() {
		$inner.css( { "width": $(window).width()*$images.length + "px" } );
		_move();
	}
}


