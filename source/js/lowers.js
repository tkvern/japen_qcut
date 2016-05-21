jQuery(function(){

/*-----------------------------------------------------------------

lowers.js

-----------------------------------------------------------------*/


	var $window = $(window);

	(function(container){
		if(container.length === 0) return;

		var locked = false;

		var lightbox = $('<div class="style-lightbox"><img class="image" /><div class="texts"><p class="style" /><p class="text" /><dl class="staffs"><dt class="section1"></dt><dd class="staff1" /><dt class="section2"></dt><dd class="staff2" /><dt class="section3"></dt><dd class="staff3" /><dt class="section4"></dt><dd class="staff4" /><dt class="section5"></dt><dd class="staff5" /></dl></div><div class="prev" /><div class="next" /><div class="close" /></div>').appendTo("body");
		var overlay = $('<div class="lightbox-overlay" />').appendTo("body");

		var lis = container.find("ul li");
		var current;
		
		var openLightbox = function(){
			if(locked) return;
			locked = true;

			overlay.fadeTo(400, 0.9, function(){
				lightbox.fadeIn(function(){
					locked = false;
				});
			});
			lightbox.find(".staffs a").on("click",closeLightbox);
		};

		var closeLightbox = function(){
			if(locked) return;
			locked = true;

			overlay.fadeOut();
			lightbox.fadeOut(function(){
				locked = false;
			});
		};

		var changeStyle = function(index){
			var li = lis.eq(index);
			var src = li.find(".zoom").attr("src");
			lightbox.find(".image").attr("src", src);

			$.each([".style", ".text", ".section1", ".section2", ".section3", ".section4", ".section5", ".staff1", ".staff2", ".staff3", ".staff4", ".staff5"], function(i, selector){
				lightbox.find(selector).html(li.find(selector).html());
			});

			current = index;
		};

		lis.each(function(i){
			$(this).data("index", i);
		});

		lis.find("img").on("click", function(){
			changeStyle($(this).parent().data("index"));
			openLightbox();
		});

		lightbox.find(".prev").on("click", function(){
			changeStyle((current - 1 + lis.length) % lis.length);
		});

		lightbox.find(".next").on("click", function(){
			changeStyle((current + 1) % lis.length);
		});

		lightbox.find(".close").on("click", function(){
			closeLightbox();
		});
		
		overlay.on("click", function(){
			closeLightbox();
		});
		
		
	})($("#StylePage, #Style"));

	(function(container){
		if(container.length === 0) return;

		var locked = false;

		var lightbox = $('<div class="gallery-lightbox"><img class="image" /><div class="caption" /><div class="prev" /><div class="next" /><div class="close" /></div>').appendTo("body");
		var overlay = $('<div class="lightbox-overlay" />').appendTo("body");

		var lis = container.find("ul li");
		var current;

		var scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

		var openLightbox = function(){
			if(locked) return;
			locked = true;

			overlay.fadeTo(400, 0.9, function(){
				lightbox.css({visibility: "hidden", display: "block"});
				fixImageSize();
				lightbox.css({
					display: "none",
					top: $window.scrollTop(),
					visibility: "visible"
				}).fadeIn(function(){
					locked = false;
				});
			});

			$("body").css({"padding-right": scrollbarWidth, overflow: "hidden"});
			$("#Navigation").css({width: $window.width() - scrollbarWidth});
		};

		var closeLightbox = function(){
			if(locked) return;
			locked = true;

			overlay.fadeOut();
			lightbox.fadeOut(function(){
				$("body").css({"padding-right": 0, overflow: "auto"});
				$("#Navigation").css({width: "100%"});
				locked = false;
			});
		};

		var changeGallery = function(index){
			var li = lis.eq(index);
			var src = li.find("img").attr("src").replace(/(-on)?\.jpg/, "l.jpg");
			lightbox.find(".image").attr("src", src).on("load", fixImageSize);
			lightbox.find(".caption").html(li.find(".caption").html());

			current = index;
		};

		var fixImageSize = (function(){
			var origImageSizes = {};

			return function(){
				var image = lightbox.find(".image");
				var src = image.attr("src");
				var size = {};

				if(origImageSizes[src]){
					size = origImageSizes[src];
				}else{
					var _image = new Image();
					_image.src = src;

					size = origImageSizes[src] = {
						width: _image.width,
						height: _image.height
					};
				}

				var w_size = {
					width: $window.width(),
					height: $window.height() - 22
				};

				var scale = Math.min(1, w_size.width / size.width, w_size.height / size.height);
				image.css({
					top: Math.max(0, (w_size.height - size.height * scale) / 2 - 11),
					left: (w_size.width - size.width * scale) / 2,
					width: size.width * scale,
					height: size.height * scale
				});
				lightbox.find(".caption").css({
					top: parseInt(image.css("top")) + image.height() + 6
				});
			};
		})();

		lis.each(function(i){
			$(this).data("index", i);
		});

		lis.find("img").each(function(i){
			preload_image($(this).attr("src").replace(/(-on)?\.jpg/, "l.jpg"));

		}).on("click", function(){
			changeGallery($(this).parent().data("index"));
			openLightbox();
		});

		lightbox.find(".prev").on("click", function(){
			changeGallery((current - 1 + lis.length) % lis.length);
		});

		lightbox.find(".next").on("click", function(){
			changeGallery((current + 1) % lis.length);
		});

		lightbox.find(".close").on("click", function(){
			closeLightbox();
		});

		overlay.on("click", function(){
			closeLightbox();
		});

		$window.on("resize", function(){
			fixImageSize();
		});
	})($("#GalleryPage"));
});



//---------------------------------------------------------
//	grayscaleのロールオーバー
//---------------------------------------------------------
$(function(){
	var $thumbnails = $("#GalleryPage.image-gallery li, #Catalog.image-gallery li,#StylePage.image-gallery li");
	$thumbnails.on("mouseenter",_onMouseEnter);
	$thumbnails.on("mouseout",_onMouseOut);
	$thumbnails.find("img.color").wrap('<span class="colorImageMask" width="33.33%" square="1" style="display:block;overflow:hidden"></span>');
	
	function _onMouseEnter() {
		$(this).children(".grayscale").stop(true).css( {opacity:0} );
		$(this).find("img.color").stop(true).animate({ scale:1.025 },750,"easeOutExpo");
		$(this).find("img.grayscale").css("z-index",1);
	}
	function _onMouseOut() {
		$(this).children(".grayscale").stop(true).animate( {opacity:1}, 1000);
		$(this).find("img.color").stop(true).animate({ scale:1.00 },200,"easeOutCubic");
	}
});

//---------------------------------------------------------
//	global navi
//---------------------------------------------------------
$(function(){
	var loc = document.location.pathname.replace("index.html", "");
	var $navi = $('#Navigation a[href="'+loc+'"]');
	var $img = $navi.find("img");
	$navi.removeClass('hover');
	$img.attr("src",$img.data("src_on"));
	$img.data("src",$img.data("src_on"));
});

//---------------------------------------------------------
//	style gallery
//---------------------------------------------------------
$(function(){
	var $container			= $("#Catalog.image-gallery");
	var $ul					= $("#Catalog.image-gallery ul");
	var $thumbnails			= $("#Catalog.image-gallery li");
	var $grayscaleImages	= $("#Catalog.image-gallery li img.grayscale");
	var $colorImages		= $("#Catalog.image-gallery li img.color");
	var $allowLeft			= $("#AllowLeft");
	var $allowRight			= $("#AllowRight");
	var page				= 0;
	var maxPage				= Math.ceil($thumbnails.length/3)-1;
	if ( !$ul.length ) return;
	
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
		if ( page < 0 ) page = 0;
		else if ( page > maxPage ) page = maxPage;
		var left = page * -$(window).width();
		$ul.stop(true).animate( {marginLeft:left}, 500, "easeInOutCubic");
		
		if ( page <= 0 ) $allowLeft.hide();
		else $allowLeft.show();
		if ( page >= maxPage ) $allowRight.hide();
		else $allowRight.show();
	}
	
	function _onResize() {
		var imageWidth = Math.ceil( $(window).width() / 3 );
		$thumbnails.css( { "width": imageWidth + "px", "height": imageWidth + "px" } );
		$grayscaleImages.css( { "width": imageWidth + "px", "height": imageWidth + "px" } );
		$colorImages.css( { "width": imageWidth + "px", "height": imageWidth + "px" } );
		$ul.css( "width", $thumbnails.length * imageWidth + "px" );
		$container.css( { "width": "100%", "height": imageWidth + "px" } );
		_move();
	}
});


//---------------------------------------------------------
// Add 2016.02 各店舗メインビジュアルスライド
//---------------------------------------------------------
(function($){
	var init = function() {
		if ($("#SalonImage img").length > 0) {
			$("#SalonImage img").resizableImage({
				maskHeight:600,
				pointOfInterst:{
					x:0.5,
					y:0.1
				}
			});
		}
		if ($("#SalonImage img").length > 1) {
			
			setupSalonImage();
		}
	};

	//---------------------------------------------------------
	//	SalonImage
	//---------------------------------------------------------
	function setupSalonImage() {
		var $container			= $("#SalonImage .visual");
		var $inner				= $("#SalonImage .visual div.inner");
		var $images				= $("#SalonImage .visual div.inner>.resizableImageMask");
		var $allowLeft			= $("#AllowLeft");
		var $allowRight			= $("#AllowRight");
		var page				= 0;
		var maxPage				= $images.length - 1;
		var timer;
		if ( !$images.length ) return;
		$images.css("float","left")
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
			timer = setTimeout(_right, 5000);
		}
		
		function _onResize() {
			$inner.css( { "width": $(window).width()*$images.length + "px" } );
			$images.css("width", 100 / $images.length + "%");
			_move();
		}
	}

	$(init);
})(jQuery);