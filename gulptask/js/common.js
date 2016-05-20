//---------------------------------------------------------
//	▼ UAManager ▼
//---------------------------------------------------------

var UAManager = {

	//---------------------------------------------------------
	//	constant
	//---------------------------------------------------------
	MOBILE : "mobile",
	PC : "pc",
	TABLET : "tablet",

	CHROME : "chrome",
	SAFARI : "safari",
	FIREFOX : "firefox",
	IE6 : "ie6",
	IE7 : "ie7",
	IE8 : "ie8",
	IE9 : "ie9",
	IE10 : "ie10",
	FIREFOX : "firefox",
	OPERA : "opera",
	DS3 : "DS3",
	WIIU : "Wiiu",
	IPHONE : "iphone",
	IPAD : "ipad",
	ANDROID : "android",

	//---------------------------------------------------------
	//	variable
	//---------------------------------------------------------
	isIE : false,
	type : null,
	career : null,

	//---------------------------------------------------------
	//	initialize
	//---------------------------------------------------------
	init : function() {

		var ua = window.navigator.userAgent.toLowerCase();
		UAManager.type = UAManager.PC;
		UAManager.career = UAManager.CHROME;

		if( ua.indexOf( '3ds' ) != -1 ) {

			UAManager.career = UAManager.DS3;

		}else if( ua.indexOf( 'wiiu' ) != -1 ) {

			UAManager.career = UAManager.WIIU;

		}else if( ua.indexOf( 'msie' ) != -1 ) {

			UAManager.isIE = true;
			if ( ua.indexOf( 'msie 6.' ) != -1 ) {
				UAManager.career = UAManager.IE6;
			}else if ( ua.indexOf( 'msie 7.' ) != -1 ) {
				UAManager.career = UAManager.IE7;
			}else if ( ua.indexOf( 'msie 8.' ) != -1 ) {
				UAManager.career = UAManager.IE8;
			}else if ( ua.indexOf( 'msie 9.' ) != -1 ) {
				UAManager.career = UAManager.IE9;
			}else if ( ua.indexOf( 'msie 10.' ) != -1 ) {
				UAManager.career = UAManager.IE10;
			}

		}else if( ua.indexOf( 'ipad' ) != -1 ) {

			UAManager.career = UAManager.IPAD;
			UAManager.type = UAManager.TABLET;

		}else if( ua.indexOf( 'iphone' ) != -1 || ua.indexOf( 'ipod' ) != -1 ) {

			UAManager.career = UAManager.IPHONE;
			UAManager.type = UAManager.MOBILE;

		}else if( ua.indexOf( 'android' ) != -1 ) {

			UAManager.career = UAManager.ANDROID;

			if( ua.indexOf( 'mobile' ) != -1 ) {
				UAManager.type = UAManager.MOBILE;
			}else {
				UAManager.type = UAManager.TABLET;
			}

		}else if( ua.indexOf( 'chrome' ) != -1 ) {

			UAManager.career = UAManager.CHROME;

		}else if( ua.indexOf( 'safari' ) != -1 ) {

			UAManager.career = UAManager.SAFARI;

		}else if( ua.indexOf( 'gecko' ) != -1 ) {

			UAManager.career = UAManager.FIREFOX;

		}else if( ua.indexOf( 'opera' ) != -1 ) {

			UAManager.career = UAManager.OPERA;

		}
	}
};
//---------------------------------------------------------
//	▲ UAManager ▲
//---------------------------------------------------------

(function(){
	
	//デバイスを判別して、PC/SPそれぞれのページにリダイレクトします
	UAManager.init();
	
	// var loc = location.pathname;
	// var currentMode = (loc.indexOf("/sp/") > -1) ? "MOBILE" : "PC"; 
	// if( UAManager.type === "mobile" && currentMode === "PC" ) {
	// 	location.href = loc.replace(/^(.+)$/, "/sp$1");					
	// } else if( UAManager.type === "pc" && currentMode === "MOBILE" ) {
	// 	loc = loc.replace(/(\/salon\/(ashiya|kobe|hiroo|osaka|cocochie)\/).*$/,"$1");
	// 	loc = loc.replace(/(\/recruit\/).*$/,"$1");
	// 	location.href = loc.replace("/sp/", "/");
	// }
	
})();

//---------------------------------------------------------

$(document).on("ready",function(){
	$(".scroll").simpleScroll();
	$(".menuScroll").simpleScroll({
		distance: 100
	});
});

