jQuery(function(){var i=$(window);!function(i){if(0!==i.length){var t,n=!1,a=$('<div class="style-lightbox"><img class="image" /><div class="texts"><p class="style" /><p class="text" /><dl class="staffs"><dt class="section1"></dt><dd class="staff1" /><dt class="section2"></dt><dd class="staff2" /><dt class="section3"></dt><dd class="staff3" /><dt class="section4"></dt><dd class="staff4" /><dt class="section5"></dt><dd class="staff5" /></dl></div><div class="prev" /><div class="next" /><div class="close" /></div>').appendTo("body"),e=$('<div class="lightbox-overlay" />').appendTo("body"),s=i.find("ul li"),o=function(){n||(n=!0,e.fadeTo(400,.9,function(){a.fadeIn(function(){n=!1})}),a.find(".staffs a").on("click",c))},c=function(){n||(n=!0,e.fadeOut(),a.fadeOut(function(){n=!1}))},l=function(i){var n=s.eq(i),e=n.find(".zoom").attr("src");a.find(".image").attr("src",e),$.each([".style",".text",".section1",".section2",".section3",".section4",".section5",".staff1",".staff2",".staff3",".staff4",".staff5"],function(i,t){a.find(t).html(n.find(t).html())}),t=i};s.each(function(i){$(this).data("index",i)}),s.find("img").on("click",function(){l($(this).parent().data("index")),o()}),a.find(".prev").on("click",function(){l((t-1+s.length)%s.length)}),a.find(".next").on("click",function(){l((t+1)%s.length)}),a.find(".close").on("click",function(){c()}),e.on("click",function(){c()})}}($("#StylePage, #Style")),function(t){if(0!==t.length){var n,a=!1,e=$('<div class="gallery-lightbox"><img class="image" /><div class="caption" /><div class="prev" /><div class="next" /><div class="close" /></div>').appendTo("body"),s=$('<div class="lightbox-overlay" />').appendTo("body"),o=t.find("ul li"),c=window.innerWidth-document.documentElement.clientWidth,l=function(){a||(a=!0,s.fadeTo(400,.9,function(){e.css({visibility:"hidden",display:"block"}),f(),e.css({display:"none",top:i.scrollTop(),visibility:"visible"}).fadeIn(function(){a=!1})}),$("body").css({"padding-right":c,overflow:"hidden"}),$("#Navigation").css({width:i.width()-c}))},d=function(){a||(a=!0,s.fadeOut(),e.fadeOut(function(){$("body").css({"padding-right":0,overflow:"auto"}),$("#Navigation").css({width:"100%"}),a=!1}))},h=function(i){var t=o.eq(i),a=t.find("img").attr("src").replace(/(-on)?\.jpg/,"l.jpg");e.find(".image").attr("src",a).on("load",f),e.find(".caption").html(t.find(".caption").html()),n=i},f=function(){var t={};return function(){var n=e.find(".image"),a=n.attr("src"),s={};if(t[a])s=t[a];else{var o=new Image;o.src=a,s=t[a]={width:o.width,height:o.height}}var c={width:i.width(),height:i.height()-22},l=Math.min(1,c.width/s.width,c.height/s.height);n.css({top:Math.max(0,(c.height-s.height*l)/2-11),left:(c.width-s.width*l)/2,width:s.width*l,height:s.height*l}),e.find(".caption").css({top:parseInt(n.css("top"))+n.height()+6})}}();o.each(function(i){$(this).data("index",i)}),o.find("img").each(function(i){preload_image($(this).attr("src").replace(/(-on)?\.jpg/,"l.jpg"))}).on("click",function(){h($(this).parent().data("index")),l()}),e.find(".prev").on("click",function(){h((n-1+o.length)%o.length)}),e.find(".next").on("click",function(){h((n+1)%o.length)}),e.find(".close").on("click",function(){d()}),s.on("click",function(){d()}),i.on("resize",function(){f()})}}($("#GalleryPage"))}),$(function(){function i(){$(this).children(".grayscale").stop(!0).css({opacity:0}),$(this).find("img.color").stop(!0).animate({scale:1.025},750,"easeOutExpo"),$(this).find("img.grayscale").css("z-index",1)}function t(){$(this).children(".grayscale").stop(!0).animate({opacity:1},1e3),$(this).find("img.color").stop(!0).animate({scale:1},200,"easeOutCubic")}var n=$("#GalleryPage.image-gallery li, #Catalog.image-gallery li,#StylePage.image-gallery li");n.on("mouseenter",i),n.on("mouseout",t),n.find("img.color").wrap('<span class="colorImageMask" width="33.33%" square="1" style="display:block;overflow:hidden"></span>')}),$(function(){var i=document.location.pathname.replace("index.html",""),t=$('#Navigation a[href="'+i+'"]'),n=t.find("img");t.removeClass("hover"),n.attr("src",n.data("src_on")),n.data("src",n.data("src_on"))}),$(function(){function i(){f--,n()}function t(){f++,n()}function n(){0>f?f=0:f>g&&(f=g);var i=f*-$(window).width();s.stop(!0).animate({marginLeft:i},500,"easeInOutCubic"),0>=f?d.hide():d.show(),f>=g?h.hide():h.show()}function a(){var i=Math.ceil($(window).width()/3);o.css({width:i+"px",height:i+"px"}),c.css({width:i+"px",height:i+"px"}),l.css({width:i+"px",height:i+"px"}),s.css("width",o.length*i+"px"),e.css({width:"100%",height:i+"px"}),n()}var e=$("#Catalog.image-gallery"),s=$("#Catalog.image-gallery ul"),o=$("#Catalog.image-gallery li"),c=$("#Catalog.image-gallery li img.grayscale"),l=$("#Catalog.image-gallery li img.color"),d=$("#AllowLeft"),h=$("#AllowRight"),f=0,g=Math.ceil(o.length/3)-1;s.length&&(d.on("click",i),h.on("click",t),$(window).on("resize",a),a(),n())}),function(i){function t(){function t(){h--,a()}function n(){h++,a()}function a(){0>h?h=f:h>f&&(h=0);var t=h*-i(window).width();o.stop(!0).animate({marginLeft:t},750,"easeInOutCubic"),0>=h?l.hide():l.show(),h>=f?d.hide():d.show(),s&&clearTimeout(s),s=setTimeout(n,5e3)}function e(){o.css({width:i(window).width()*c.length+"px"}),c.css("width",100/c.length+"%"),a()}var s,o=(i("#SalonImage .visual"),i("#SalonImage .visual div.inner")),c=i("#SalonImage .visual div.inner>.resizableImageMask"),l=i("#AllowLeft"),d=i("#AllowRight"),h=0,f=c.length-1;c.length&&(c.css("float","left"),l.on("click",t),d.on("click",n),i(window).on("resize",e),e(),a())}var n=function(){i("#SalonImage img").length>0&&i("#SalonImage img").resizableImage({maskHeight:600,pointOfInterst:{x:.5,y:.1}}),i("#SalonImage img").length>1&&t()};i(n)}(jQuery);