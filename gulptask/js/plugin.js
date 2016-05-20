/* ///////////////////////////////////////////////////////////////////////////
 *
 *  resizableImage
 *  jQuery tab Plugin
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($){

	$.fn.resizableImage = function( i_options ){

		var defaults = {
			sourceWidth			: null,
			sourceHeight		: null,
			maskWidth			: null,
			maskHeight			: null,
			maskOffsetWidth		: null,
			maskOffsetHeight	: null,
			pointOfInterst		: { x:0.5, y:0.5 },
		};
		var options = $.extend( true, {}, defaults, i_options );
		
		return this.each(function(){
			
			var $img = $(this);
			var $mask;
			var $window;
			
			function _onResize() {
			
				//console.log("_onResize");
			
				var mw = options.maskWidth;
				var mh = options.maskHeight;
				if ( mw && mw < 1 ) mw = $window.width() * mw;
				if ( mh && mh < 1 ) mh = $window.height() * mh;
				if ( !mw && options.maskOffsetWidth ) mw = $window.width() + options.maskOffsetWidth;
				if ( !mh && options.maskOffsetHeight ) mh = $window.height() + options.maskOffsetHeight;
			
				var ww = mw ? mw : $window.width();
				var wh = mh ? mh : $window.height();
				
				//console.log("ww:"+ww+" wh:"+wh);
				
				var w = ww;
				var h = options.sourceHeight * ( w / options.sourceWidth );
				//console.log("h:"+h);
				if ( h < wh ) {
					h = wh;
					w = options.sourceWidth * ( h / options.sourceHeight );
				}
				
				$img.css( { width:w+"px", height:h+"px" } );
				
				if ( mw || mh ) {
					if ( mw ) $mask.css("width",mw+"px");
					if ( mh ) $mask.css("height",mh+"px");
					$img.css( { marginTop:((wh-h)*options.pointOfInterst.y)+"px", marginLeft:((ww-w)*options.pointOfInterst.x)+"px" } );
				}
			}
			
			function _init() {
				//
				if ( !$img.is("img") ) return;
				$img.wrap('<span class="resizableImageMask" style="display:block"></span>');
				$mask = $img.parent();
				if ( options.maskWidth || options.maskHeight || options.maskOffsetWidth || options.maskOffsetHeight ) $mask.css("overflow","hidden");
				
				$window = $(window);
				
				if ( ( options.sourceWidth && options.sourceHeight ) || ( $img.width() && $img.height() ) ) __init();
				else $img.on("load",__init);
			}
			
			function __init() {
				if ( !options.sourceWidth ) options.sourceWidth = $img.css("width","auto").width();
				if ( !options.sourceHeight ) options.sourceHeight = $img.css("height","auto").height();
				$window.on("resize",_onResize);
				_onResize();
			}
			
			_init();
		});
	};

})(jQuery);



/*-----------------------------------------------------------------

plugin.js
独立したプラグインやライブラリなど

-----------------------------------------------------------------*/

var console = console || {};
if ( typeof console.log == "undefined" ) console.log = function(){};


/* ///////////////////////////////////////////////////////////////////////////
 *
 * flexFixed - jQuery plugin
 *
/////////////////////////////////////////////////////////////////////////// */

(function($) {
	if (window.navigator.userAgent.toLowerCase().match( /msie [456]\./ ) ) {
		$.fn.flexFixed = function(){ return this; }
		return;
	}
	
	// デフォルト設定
	var defaults = {
		marginTop:20,
		marginBottom:20,
		bottom:0
	};
	
	// プライベートなスタティック変数
	var $doc;
	var $win;
	var winHeight;
	var winWidth;
	var docHeight;
	var docWidth;
	var instances = [];
	var isInitialized = false;
	
	function _onChange() {
		winWidth = $win.width();
		winHeight = $win.height();
		docWidth = $doc.width();
		docHeight = $doc.height();
		for ( var i=0, len=instances.length; i<len; i++ ) instances[i]._onChange();
	}
	
	function _init() {
		if ( isInitialized ) return;
		isInitialized = true;
		$doc = $(document);
		$win = $(window);
		winHeight = $win.height();
		winWidth = $win.width();
		docHeight = $doc.height();
		docWidth = $doc.width();
		$win.on("resize",_onChange);
		$win.on("load",_onChange);
		$doc.on("change",_onChange);
		_onChange();
	}
	
	function _addInstance( i_instance ) {
		_removeInstance( i_instance )
		instances.push(i_instance);
	}
	
	function _removeInstance( i_instance ) {
		for ( var i=0, len=instances.length; i<len; i++ ) {
			if ( instances[i] === i_instance ) {
				instances.splice(i, 1);
				i--;
			}
		}
	}
	
	// クラス定義
	var FlexFixed = function( $i_target, i_options ) {
		this.$target = $($i_target);						// 対象エレメント
		this.options = i_options;							// オプション
		this.cssPosition = this.$target.css('position');	// 元のポジション
		this.cssTop = this.$target.css('top');				// 元のtop
		this.offsetTop = this.$target.offset().top;			// 元のオフセット位置
		this.height = this.$target.height();				// コンテンツの高さ
		this.isFixed = false;								// 位置調整されているかどうか
		this.isScrolling = false;							// コンテンツをスクロールしているかどうか
		this.lastScrollTop = -1;							// 前回のウィンドウのスクロール位置（スクロールしている方向を取得するため）
		this.lastDirection = false;							// 前回のスクロール方向
		this.init.apply(this);
	};
	
	FlexFixed.prototype = {
		
		// 初期化
		init: function() {
			_init();
			_addInstance(this);
			this.$target.on("change",$.proxy(this._onChange,this));
			this._onChange();
		},
		
		destroy: function() {
			this.$target.css({ 'position':this.cssPosition, 'top':this.cssTop });	// cssの設定をデフォルトに
			this.$target.off("change",$.proxy(this._onChange,this));
			$win.off("scroll",$.proxy(this._onScroll,this));
			_removeInstance(this);
		},
		
		// 変更時
		_onChange: function(){
			this.lastScrollTop = -1;
			this.height = this.$target.height();
			this.$target.css({ 'position':this.cssPosition, 'top':this.cssTop });	// cssの設定をデフォルトに
			this.offsetTop = this.$target.offset().top;		// 現在のoffsetTopを取得
			this.isFixed = false;							// 位置調整されてるフラグをfalseに
			this.isScrolling = false;						// コンテンツをスクロールしているフラグをoffに
			$win.off("scroll",$.proxy(this._onScroll,this));
			if ( winWidth >= docWidth ) {
				$win.on("scroll",$.proxy(this._onScroll,this));
				this._onScroll();
			}
		},
		
		// スクロール時
		_onScroll: function(){
			var st = $win.scrollTop();					// ウィンドウのスクロール位置
			var t = st + this.options.marginTop;		// スクロール位置+マージン
			var b = docHeight - ( t + this.height );	// ドキュメントの一番下からコンテンツの一番下までの距離
			var isUnder = ( t < this.offsetTop );		// ウィンドウのスクロール位置が調整すべきライン未満かどうか
			var d = ( this.lastScrollTop == st ) ? 0  :  ( this.lastScrollTop > st ? -1 : 1);	// スクロール方向
			if ( d == 0 ) return;
			if ( isUnder && this.isFixed ) {
			
				//----------------------------------------
				// 位置調整をするべきでないが、されている場合
				//----------------------------------------
				this.$target.css({ 'position':this.cssPosition, 'top':this.cssTop });	// cssの設定をデフォルトに
				this.offsetTop = this.$target.offset().top;		// 現在のoffsetTopを取得
				this.isFixed = false;							// 位置調整されてるフラグをfalseに
				this.isScrolling = false;						// コンテンツをスクロールしているフラグをoffに
				
			} else {
				
				//----------------------------------------
				// 位置調整をするべきでないが、されている場合
				//----------------------------------------
				var ot = this.$target.offset().top;			// コンテンツの現在のオフセットトップ位置
				var ob = docHeight - ( ot + this.height );	// コンテンツの現在のオフセットボトム位置
				
				if ( ( this.height + this.options.marginBottom > winHeight && !isUnder ) && ( !this.options.bottom || ob > this.options.bottom ) ) {
					
					//----------------------------------------
					// コンテンツがウィンドウの高さに収まらず、
					// ウィンドウのスクロール位置が調整すべきラインを超えていて、
					// ボトム位置が指定されていないか、もしくは、　コテンツのオフセットボトム位置がボトム位置の設定より大きく、かつ...
					// 要はスクロールすべきってことぽい？
					//----------------------------------------
					if ( ( d > 0 && ot + this.height + this.options.marginBottom <= st + winHeight ) && ( d != this.lastDirection || !this.isFixed ) ) {
						// スクロール方向が正方向で、まだ下にコンテンツをスクロールする余地が残っている場合
						this.$target.css( { 'position':'fixed', 'top':(winHeight - this.height - this.options.marginBottom)+'px' } );	// ボトムで固定
						isFixed = true;
					} else if ( ( d < 0 && ot >= t ) && ( d != this.lastDirection || !this.isFixed ) ) {
						// スクロール方向が負方向で、コンテンツの位置がウィンドウの枠よりも下にある場合
						this.$target.css({ 'position':'fixed', 'top':this.options.marginTop + 'px' });	// トップで固定
						this.isFixed = true;
					} else if ( d != this.lastDirection || !this.isScrolling ) {
						// 前回とスクロール方向が変わってるか、スクロールすべき状態だがスクロールしていない場合
						this.$target.css( { 'position':'absolute', 'top':this.$target.offset().top+'px' } );
						this.isFixed = false;
					}
					this.isScrolling = true;
					
				} else if ( this.options.bottom && b < this.options.bottom ) {
					// ボトム位置の設定がされていて、スクロール位置がそれを超えた場合
					if ( this.isFixed || this.isScrolling ) {
						this.$target.css({ 'position':'absolute', 'top': (docHeight - ( this.options.bottom + this.height )) + 'px' }); 
						this.isFixed = false;
						this.isScrolling = false;
					}
					
				} else if ( !isUnder && !this.isFixed ) {
					// 上記以外で、ウィンドウのスクロール位置が調整すべきラインを超えていて
					this.$target.css({ 'position':'fixed', 'top':this.options.marginTop + 'px' });
					this.isFixed = true;
					this.isScrolling = false;
				}
			}
			
			this.lastScrollTop = st;
			this.lastDirection = d;
		}
		
	};
	
	
	// jQuery プラグイン
	$.fn.flexFixed = function( i_options ){
		var options = $.extend( true, {}, defaults, i_options );
		// メイン
		return this.each(function(){
			var f = this.flexFixed;
			if ( typeof f != "undefined" ) f.destroy();
			this.flexFixed = new FlexFixed(this,options);
		});
	};
})(jQuery);


/* ///////////////////////////////////////////////////////////////////////////
 *
 *  EnterFrameManager
 *  
 *  
 *  EnterFrameManager.add( function );		// ファンクション追加
 *  EnterFrameManager.remove( function );	// ファンクションを削除
 *
 ////////////////////////////////////////////////////////////////////////////*/

var EnterFrameManager = {

	_length: 0,
	_functions : [],
	_isInit: false,
	fps: 60,

	//---------------------------------------------------------
	//	initialize
	//---------------------------------------------------------
	init : function(){
		EnterFrameManager._isInit = true;
		if ( typeof(window.requestAnimationFrame) == "undefined") {
			window.requestAnimationFrame = ( function() {
				return function( callback, element ) {
					window.setTimeout( callback, 1000 / EnterFrameManager.fps );
				};
			} )();
		}
		window.requestAnimationFrame( EnterFrameManager._loop );
	},

	//---------------------------------------------------------
	//	EnterFrame
	//---------------------------------------------------------
	_loop : function() {

		for( var i = 0; i < EnterFrameManager._length; i++ ) {
			var f = EnterFrameManager._functions[i];
			f();
		}
		window.requestAnimationFrame( EnterFrameManager._loop );

	},

	//---------------------------------------------------------
	//	イベント追加
	//---------------------------------------------------------
	add : function( i_func ) {
		if ( !EnterFrameManager._isInit ) EnterFrameManager.init();
		for( var i = 0; i < EnterFrameManager._length; i++ ) {

			var f = EnterFrameManager._functions[i];
			if( f == i_func ) {
				return;
			}

		}
		EnterFrameManager._functions.push( i_func );
		EnterFrameManager._length = EnterFrameManager._functions.length;

	},

	//---------------------------------------------------------
	//	イベント解除
	//---------------------------------------------------------
	remove : function( i_func ) {

		for ( var i = 0; i < EnterFrameManager._length; i++ ) {
			var f = EnterFrameManager._functions[i];
			if( f == i_func ) {
				EnterFrameManager._functions.splice( i, 1 );
				break;
			}
		}
		EnterFrameManager._length = EnterFrameManager._functions.length;
	}

};

/* ///////////////////////////////////////////////////////////////////////////
 *
 *  button
 *  jQuery button Plugin
 *
 *
 *	$("selector").button( options ); // オプションの内容は以下のソースのデフォルトオプションの箇所に記載あり
 *
 *	// 状態の変更
 *
 *	$("selector").button("none");
 *	$("selector").button("over");
 *	$("selector").button("down");
 *	$("selector").button("selected",true);
 *	$("selector").button("loading",true);
 *
 *	// 状態の取得
 *
 *	var status = $("selector").button("status");
 *	var selected = $("selector").button("selected");
 *
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){
	
	//------------------------------------------------------------
	// デフォルトオプション
	//------------------------------------------------------------
	var defaults = {
		preload				: true,				// 画像をプリロードするかどうか
		$img				: null,				// 対象オブジェクトの子の画像要素を明示的に指定（nullの場合は自動的に画像要素を取得）
		defaultStatus		: "none",			// 初期の状態
		disableUserSelect	: true,				// user-select: noneにする
		statuses			: {
			over				: true,			// マウスオーバーを有効にするかどうか
			down				: false,		// マウスダウンを有効にするかどうか
			loading				: false,		// ローディング中の表示を有効にするかどうか
			selected			: false,		// 選択状態の表示を有効にするかどうか
			selectedOver		: false,		// 選択状態時のマウスオーバーを有効にするかどうか
			selectedDown		: false,		// 選択状態のマウスダウンを有効にするかどうか
			selectedLoading		: false			// 選択状態のローディング表示
		},
		postfixes			: {
			none				: "",			// 通常時の画像の接尾辞
			over				: "-over",		// マウスオーバー時の画像の接尾辞
			down				: "-down",		// マウスダウン時の画像の接尾辞
			loading				: "-loading",	// ローディング時の画像の接尾辞
			selected			: "-selected",	// 選択状態時の画像の接尾辞
			retina				: "@2x"			// retina画像の接尾辞
		}
	};
	
	//------------------------------------------------------------
	// Button クラス
	//------------------------------------------------------------
	var Button = function( $i_target, i_options ){
		this.$target = $i_target;
		this.$img;
		this.pathes = {
			"none":"",
			"over":"",
			"down":"",
			"loading":"",
			"selected": {
				"none":"",
				"over":"",
				"down":"",
				"loading":""
			}
		};
		this.options = i_options;
		this.status = "none";
		this.isSelected = false;
		this.isLoading = false;
		this.isMouseOver = false;
		this.init.apply( this );
	};
	
	Button.prototype = {
		
		// 初期化
		init: function() {
		
			this.$img = this.options.$img || (this.$target.is("img") || this.$target.is("input[type=image]") ? this.$target : this.$target.find("img"));
			if ( !this.$img.length ) return;
			
			// パスの取得
			var retinaReg = new RegExp("(("+this.options.postfixes.retina+")?(\\.(jpg|jpeg|gif|png|bmp|wbmp|tiff|pict|psd))?)$","i");
			var src = this.$img.attr("src");
			
			// 接尾辞を取り除く
			var postfixStrs = [];
			if ( this.options.postfixes.none ) postfixStrs.push( this.options.postfixes.none );
			if ( this.options.postfixes.over ) postfixStrs.push( this.options.postfixes.over );
			if ( this.options.postfixes.down ) postfixStrs.push( this.options.postfixes.down );
			if ( this.options.postfixes.loading ) postfixStrs.push( this.options.postfixes.loading );
			if ( this.options.postfixes.selected ) postfixStrs.push( this.options.postfixes.selected );
			var reg = new RegExp(
				(this.options.postfixes.selected ? "("+this.options.postfixes.selected+")?" : "")+
				"("+postfixStrs.join("|")+")?"+
				"(("+this.options.postfixes.retina+")?"+
				"(\\.(jpg|jpeg|gif|png|bmp|wbmp|tiff|pict|psd))?)$",
				"i"
			);
			src = src.replace( reg, this.options.postfixes.selected ? "$3" : "$2" );
			
			// パスの設定
			this.pathes.none = src.replace( retinaReg, this.options.postfixes.none+"$1" );
			this.pathes.over = src.replace( retinaReg, this.options.postfixes.over+"$1" );
			this.pathes.down = src.replace( retinaReg, this.options.postfixes.down+"$1" );
			this.pathes.loading = src.replace( retinaReg, this.options.postfixes.loading+"$1" );
			this.pathes.selected.none = src.replace( retinaReg, this.options.postfixes.selected+this.options.postfixes.none+"$1" );
			this.pathes.selected.over = src.replace( retinaReg, this.options.postfixes.selected+this.options.postfixes.over+"$1" );
			this.pathes.selected.down = src.replace( retinaReg, this.options.postfixes.selected+this.options.postfixes.down+"$1" );
			this.pathes.selected.loading = src.replace( retinaReg, this.options.postfixes.selected+this.options.postfixes.loading+"$1" );
			
			// プリロード
			if ( this.options.statuses.over ) $('<img />').attr("src",this.pathes.over);
			if ( this.options.statuses.down ) $('<img />').attr("src",this.pathes.down);
			if ( this.options.statuses.loading ) $('<img />').attr("src",this.pathes.loading);
			if ( this.options.statuses.selected ) {
				$('<img />').attr("src",this.pathes.selected.none);
				if ( this.options.statuses.selectedOver ) $('<img />').attr("src",this.pathes.selected.over);
				if ( this.options.statuses.selectedDown ) $('<img />').attr("src",this.pathes.selected.down);
				if ( this.options.statuses.selectedLoading ) $('<img />').attr("src",this.pathes.selected.loading);
			}
			
			this.setStatus( this.options.defaultStatus );
			
			// user-select
			if ( this.options.disableUserSelect ) {
/*
				this.$target.css("-webkit-user-select","none");
				this.$target.css("-moz-user-select","none");
				this.$target.css("-ms-user-select","none");
*/
				this.$target.css("user-select","none");
			}
			
			// イベントのセット
			this._enableMouseEvents();
		},
		
		// マウスイベントをON
		_enableMouseEvents: function() {
			if ( this.options.statuses.over ) {
				this.$target.on( "mouseover", $.proxy( this._onMouseOver, this ) );
				this.$target.on( "mouseout", $.proxy( this._onMouseOut, this ) );
			}
			if ( this.options.statuses.down ) {
				this.$target.on( "mousedown", $.proxy( this._onMouseDown, this ) );
				this.$target.on( "mouseup", $.proxy( this._onMouseUp, this ) );
			}
		},
		
		// マウスイベントをOFF
		_disableMouseEvents: function() {
			if ( this.options.statuses.over ) {
				this.$target.off( "mouseover", $.proxy( this._onMouseOver, this ) );
				this.$target.off( "mouseout", $.proxy( this._onMouseOut, this ) );
			}
			if ( this.options.statuses.down ) {
				this.$target.off( "mousedown", $.proxy( this._onMouseDown, this ) );
				this.$target.off( "mouseup", $.proxy( this._onMouseUp, this ) );
			}
		},
		
		// マウスイベントのハンドラ
		_onMouseOver: function() {
			this.isMouseOver = true;
			this.setStatus("over");
		},
		
		_onMouseOut: function() {
			this.isMouseOver = false;
			this.setStatus("none");
		},
		
		_onMouseDown: function() {
			this.setStatus("down");
		},
		
		_onMouseUp: function() {
			this.setStatus( this.isMouseOver ? "over" : "none" );
		},
		
		
		// 選択状態の変更
		setSelected: function( i_selected ) {
			this.isSelected = !!i_selected;
			if ( !this.options.statuses.selected && this.isSelected ) {
				this.options.statuses.selected = true;
				this.init();
			}
			this.setStatus();
		},
		
		// ローディング状態の変更
		setLoading: function( i_loading ) {
			this.isLoading  = i_loading;
			if ( this.isLoading ) {
				if ( !this.options.statuses.loading ) this.options.statuses.loading = true;
				if ( !this.options.statuses.selectedLoading && this.isSelected ) {
					this.options.statuses.selectedLoading = true;
					this.init();
				}
				this._disableMouseEvents();
				this.setStatus("loading");
			} else {
				this.setStatus("none");
				this._enableMouseEvents();
			}
		},
		
		setStatus: function( i_status ) {
			this.status = i_status || this.status;
			if ( this.options.statuses.selected && this.isSelected ) {
				if ( this.status == "over" && !this.options.statuses.selectedOver ) this.status = "none";
				if ( this.status == "down" && !this.options.statuses.selectedDown ) this.status = "none";
			} else if ( !this.options.statuses[this.status] ) {
				this.status = "none";
			}
			var p = this.isSelected ? this.pathes.selected : this.pathes;
			this.$img.attr("src",p[this.status]);
		},
		none: function() { this.setStatus("none"); },
		over: function() { this.setStatus("over"); },
		down: function() { this.setStatus("down"); }
	};
	
	//------------------------------------------------------------
	// jQuery プラグイン
	//------------------------------------------------------------
	$.fn.button = function( i_options ) {
		var target,button,options;
		
		// Buttonクラスのラッパ
		target = $(this).get(0);
		if ( target && ( i_options == "none" || i_options == "over" || i_options == "down" || i_options == "status" || i_options == "selected" || i_options == "loading" ) ) {
			button = target.buttonInstance;
			if ( typeof button == "undefined" ) target.buttonInstance = new Button( target );
			if ( i_options == "none" || i_options == "over" || i_options == "down" ) {
				button[i_options]();
				return this;
			} else if ( i_options == "status" ) {
				if ( arguments.length >= 2 ) {
					button.setStatus( arguments[1] );
					return this;
				} else {
					return button.status;
				}
			} else if ( i_options == "selected" ) {
				if ( arguments.length >= 2 ) {
					button.setSelected( arguments[1] );
					return this;
				} else {
					return button.isSelected;
				}
			} else if ( i_options == "loading" ) {
				if ( arguments.length >= 2 ) {
					button.setLoading( arguments[1] );
					return this;
				} else {
					return button.isLoading;
				}
			}
		}
		
		// 初期化
		options = $.extend( true, {}, defaults, i_options );
		return this.each(function(){
			this.buttonInstance = new Button( $(this), options );
		});
	}

})(jQuery(window), jQuery);

/* ///////////////////////////////////////////////////////////////////////////
 *
 *  fixHeight
 *  jQuery fixHeight Plugin
 *
 *  TODO Y座標は見ずに、一括で直近の子要素全てのheightを揃えるようにする
 *  TODO optionでY座標を見てheightを変えるかどうかの設定を付与する
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($){

	var parents = [];			// 親要素
	var isInitialized = false;	// 初期化済みフラグ
	var textHeight = 0;			// 文字のサイズ
	var $fontSizeDiv;			// 文字のサイズ取得用div
	
	//------------------------------------------------------------
	// jQuery プラグイン
	//------------------------------------------------------------
	$.fn.fixHeight = function( i_force ) {
		init();
		this.each(function(){
			var childrenGroups = getChildren( this );
			var children = childrenGroups.shift() || [];
			
			//$childrenのY座標が同じものは同じ高さに
			var rows = [[]];
			var top = 0;
			var c=0;
			var $c;
			
			for ( c=0; c<children.length; c++ ) {
				$c = $(children[c]);
				var i;
				if ( top != $c.offset().top ) {
					for ( i=0; i<rows.length; i++ ) if ( !$(rows[i]).hasClass("fixedHeight") || i_force ) $(rows[i]).sameHeight().addClass("fixedHeight");
					rows = [[]];
					top = $c.offset().top;
					for ( i=0; i<childrenGroups.length; i++ ) rows.push([]);
				}
				rows[0].push(children[c]);
				for ( i=0; i<childrenGroups.length; i++ ) {
					rows[i+1].push(childrenGroups[i][c]);
				}
			}
			if ( rows[0] && rows[0].length ) for ( i=0; i<rows.length; i++ ) $(rows[i]).sameHeight();
			_addParent( this );
		});

		return this;
	};
	
	//------------------------------------------------------------
	// 親要素の追加
	//------------------------------------------------------------
	function _addParent( i_parent ) {
		for ( var i=0, len=parents.length; i<len; i++ ) {
			if ( parents[i] == i_parent ) return;
		}
		parents.push(i_parent);
	}
	
	//------------------------------------------------------------
	// 同じ高さに揃えるjQueryプラグイン
	//------------------------------------------------------------
	$.fn.sameHeight = function() {
		var maxHeight = 0;
		this.css("height","auto");
		this.each(function(){
			if ( $(this).height() > maxHeight ) maxHeight = $(this).height();
		});
		return this.height(maxHeight);
	};
	
	//------------------------------------------------------------
	// フォントサイズの変更時やウィンドウのリサイズ時に高さを揃える処理を実行
	//------------------------------------------------------------
	$.checkFixHeight = function( i_force ) {
		if ( $fontSizeDiv.height() == textHeight && i_force !== true ) return;
		textHeight = $fontSizeDiv.height();
		if ( parents.length ) $(parents).fixHeight( i_force );
	}
	
	//------------------------------------------------------------
	// [private] フォントサイズ確認用のDIV追加とタイマーセット
	//------------------------------------------------------------
	function init() {
		if ( isInitialized ) return;
		isInitialized = true;
		$fontSizeDiv = $('body').append('<div style="position:absolute;left:-9999px;top:-9999px;">s</div>');
		setInterval($.checkFixHeight,1000);
		$.checkFixHeight();
		$(window).on("resize",$.checkFixHeight);
		$(window).on("load",$.checkFixHeight);
	}
	
	//------------------------------------------------------------
	// [private] 処理すべき子要素のグループを取得
	//------------------------------------------------------------
	function getChildren( i_parent ) {
		var $parent = $( i_parent );

		//既にデータが存在すればそれを返す
		//if ( $parent.data("fixHeightChildrenGroups") ) return $parent.data("fixHeightChildrenGroups");

		//子グループを格納する配列
		var childrenGroups = [];

		//fixHeightChildクラスを持つ子要素を取得
		var $children = $parent.find(".fixHeightChild");
		if ( $children.length ) childrenGroups.push( $children );

		//fixHeightChildXXXクラスを持つ子要素を取得
		var $groupedChildren = $parent.find("*[class*='fixHeightChild']:not(.fixHeightChild)");
		if ( $groupedChildren.length ) {
			var classNames = {};
			$groupedChildren.each(function(){
				var a = $(this).attr("class").split(" ");
				var i;
				var l = a.length;
				var c;
				for ( i=0; i<l; i++ ) {
					c = a[i].match(/fixHeightChild[a-z0-9_-]+/i);
					if ( !c ) continue;
					c = c.toString();
					if ( c ) classNames[c] = c;
				}
			});
			for ( var c in classNames ) childrenGroups.push( $parent.find("."+c) );
		}

		//子要素の指定がない場合は直属の子を取得
		if ( !childrenGroups.length ) {
			$children = $parent.children();
			if ( $children.length ) childrenGroups.push( $children );
		}

		return childrenGroups;
	}

})(jQuery);

/* ///////////////////////////////////////////////////////////////////////////
 *
 *  imgSwap
 *  jQuery imgSwap Plugin
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){

	$.fn.imgSwap = function( i_options ){
		var defaults = { trigger:"click", attribute:"href", scrolling:false, scrollingTime:300, easing: "easeInOutSine" };
		var options = $.extend( true, {}, defaults, i_options );
		$(this).each(function(){
			var href = String($(this).attr(options.attribute));
			var rs = href.match(/#(.+)$/);

			if ( rs ) {
				var $display = $("#"+rs[1]);
				$('<img>').attr('src',href);
				$(this).on( options.trigger, function(){
					$display.attr('src', href).css({width:"auto",height:"auto"});
					if ( options.scrolling ) {
						var dt = $display.offset().top;
						var st = $(window).scrollTop();
						var wh = $(window).outerHeight();
						if ( st+wh < dt || st > dt ) $("html,body").animate( {scrollTop:dt}, options.scrollingTime, options.easing );
					}
					return false;
				});
			}
		});
	};

})(jQuery(window), jQuery);

/* ///////////////////////////////////////////////////////////////////////////
 *
 *  smoothScroll
 *  jQuery scroll Plugin
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){

	$.fn.smoothScroll = function( i_options ){

		var defaults = {
			time:600,
			ease:"swing"
		};
		var options = $.extend( true, {}, defaults, i_options );

		$(this).on("click", function(e){

			e.preventDefault();

			var key = $(this).attr('href');
			var dest = 0;

			if(key != "#") {
				if ( $(key).length == 0 ) return false;
				dest = $(key).offset().top;
			}
			$("html,body").animate( {scrollTop:dest}, options.time, options.ease );
			return false;
		});

		return this;
	};

})(jQuery(window), jQuery);

/* ///////////////////////////////////////////////////////////////////////////
 *
 *  tab
 *  jQuery tab Plugin
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){

	$.fn.tab = function( i_options ){

		var defaults = {
			tabSelector:"a.tab",						// タブにつけるクラス
			selectedClass:"selected",					// 選択状態のタブにつけるクラス
			trigger:"click",							// タブきりかえのトリガー click, rollover, mouseover等
			enableButtonPlugin: true,					// buttonプラグインを設定する
			enableHash: false,							// URLのハッシュを有効にする
			buttonOptions: {
				preload			: true,					// 画像をプリロードするかどうか
				$img			: null,					// 対象オブジェクトの子の画像要素を明示的に指定（nullの場合は自動的に画像要素を取得）
				defaultStatus	: "none",				// 初期の状態
				statuses		: {
					over			: true,				// マウスオーバーを有効にするかどうか
					down			: false,			// マウスダウンを有効にするかどうか
					selected		: true,				// 選択状態の表示を有効にするかどうか
					selectedOver	: false,			// 選択状態時のマウスオーバーを有効にするかどうか
					selectedDown	: false,			// 選択状態のマウスダウンを有効にするかどうか
					loading			: false				// ローディング中の表示を有効にするかどうか
				},
				postfixes		: {
					none			: "",				// 通常時の画像の接尾辞
					over			: "-over",			// マウスオーバー時の画像の接尾辞
					down			: "-down",			// マウスダウン時の画像の接尾辞
					loading			: "-loading",		// ローディング時の画像の接尾辞
					selected		: "-selected",		// 選択状態時の画像の接尾辞
					retina			: "@2x"				// retina画像の接尾辞
				}
			}
		};
		var options = $.extend( true, {}, defaults, i_options );
		
		return this.each(function(){
			
			var $parent = $(this);
			var $tabs = $(this).find(options.tabSelector);
			var $selected = null;
			
			function _onTabTrigger() {
				var hash = $(this).attr("href");
				if ( options.enableHash && typeof $.fn.hashchange == "function" ) {
					document.location.hash = "#tab_"+hash;
				} else {
					_selectTab( $tabs.filter("*[href="+hash+"]") );
				}
				return false;
			}
			
			function _onHashChange() {
				var hash = document.location.hash;
				var hashID = hash.match(/tab_(#[A-Za-z0-9]+)/) ? hash.replace(/^.*tab_(#[A-Za-z0-9]+).*$/,"$1") : "";
				if ( hashID && $tabs.filter("*[href="+hashID+"]").length ) _selectTab( $tabs.filter("*[href="+hashID+"]") );
			}
			
			function _selectTab( $i_selected ) {
				if ( !$i_selected.length && $selected ) return;
				$selected = $i_selected;
				if ( !$selected.length ) $selected = $tabs.eq(0);
				$tabs.each(function(){
					if ( this == $selected[0] ) return;
					$($(this).attr("href")).hide();
				});
				$($selected.attr("href")).show();
				if ( options.enableButtonPlugin && typeof( $tabs.button ) == "function" ) {
					$tabs.not($selected).button("selected",false);
					$selected.button("selected",true);
				}
				$tabs.not($selected).removeClass(options.selectedClass);
				$selected.addClass(options.selectedClass);
				$parent.trigger("change");
				$(document).trigger("change");
			}
			
			function _init() {
				// イベント設定
				if ( options.enableHash && typeof $.fn.hashchange == "function" ) $w.on( "hashchange", _onHashChange );
				$tabs.on( options.trigger, _onTabTrigger);
				if ( options.enableButtonPlugin && typeof( $tabs.button ) == "function" ) $tabs.button( options.buttonOptions );
				
				
				// 最初に選択されるもの
				var $s;
				var hash = document.location.hash;
				var hashID = hash.match(/tab_(#[A-Za-z0-9]+)/) ? hash.replace(/^.*tab_(#[A-Za-z0-9]+).*$/,"$1") : "";
				if ( options.enableHash && typeof $.fn.hashchange == "function" && hashID && $tabs.filter("*[href="+hashID+"]").length ) {
					$w.trigger( "hashchange" );
				} else {
					$tabs.each(function(){
						if ( $(this).hasClass(options.selectedClass) ){
							$s = $(this);
							return false;
						}
					});
					if ( $s == null || !$s.length ) $s = $tabs.eq(0);				
					$s.trigger( options.trigger );
				}
			}
			
			_init();
		});
	};

})(jQuery(window), jQuery);


/* ///////////////////////////////////////////////////////////////////////////
 *
 *  Retina
 *  jQuery Retina Plugin
 *  Retina対応プラグイン
 *
 *  $("selector").retina( options );			// 初期化（selectorはretina対応したい要素。
 *	// imgとinput[type=image]の場合はsrc属性、それ以外の場合はCSSのbackground-imageが書き換えられる）
 *
 *　オプション
 *
 *  postfix: "@2x"			// retina用画像の接尾辞
 *  checkExistence: true	// サーバーに画像をリクエストして存在する画像のみ差し替えるかどうか
 *	//（trueにすると先に非Retina画像が表示され、後からRetinaが表示されるので転送量が増える）
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){
	// Retinaディスプレイじゃなければ何もしない
	if ( !window.devicePixelRatio || ( window.devicePixelRatio < 2 && !document.location.href.match(/retina\=(1|true|yes|t|y)/) ) ) {
		$.fn.retina = function() { return this; };
		return;
	}
	
	// デフォルト設定
	var defaults = {
		postfix: "@2x",				
		checkExistence: false,
		retina: "",
		noRetina: ""	
	};
	
	// 画像の読み込み完了時
	function onLoad() {
		var options = this.retinaOptions;
		var $target = $(this);
		var src = options.noRetina;
		var retina = options.retina;
		if ( $target.is("img") || $target.is("input[type=image]") ) {
			$target.width($target.width());
			$target.height($target.height());
			$target.attr("src",retina);
		} else {
			var $dummy = $('<img />');
			$dummy.attr("src",src).on("load",function(){
				var w = $dummy.width();
				var h = $dummy.height();
				$target.css("background-size",w+"px "+h+"px").css("background-image","url("+retina+")");
			});
		}
	}
	
	// 初期化
	function init() {
		var options = this.retinaOptions;
		var src;
		var $target = $(this);
		if ( $target.is("img") || $target.is("input[type=image]") ) {
			src = $target.attr("src");
		} else {
			src = String($target.css("background-image")).replace(/url\(["']?([^\)]+)["']?\)/,"$1");
		}
		if  ( src == options.nonretina ) return;//既に処理済みなら何もしない
		if ( !src ) return;
		var retina = src.replace(new RegExp("("+options.postfix+")?\.([a-zA-Z]+)$"),options.postfix+".$2");
		options.noRetina = src;
		options.retina = retina;
		if ( options.checkExistence ) {
			$('<img />').attr("src",retina).on("load",$.proxy(onLoad,this));
		} else {
			$.proxy(onLoad,this)();
		}
	
	}
	
	// jQuery Plugin
	$.fn.retina = function( i_options ) {
		var options = $.extend( true, {}, defaults, i_options );
		return this.each(function(){
			this.retinaOptions = options;
			init.apply(this);
		});
	}
	
})(jQuery(window), jQuery);


/* ///////////////////////////////////////////////////////////////////////////
 *
 *  onImagesLoad
 *  jQuery onImagesLoad Plugin
 *  含まれる全ての画像のローディングが完了したらコールバックを実行
 *
 *  $("selector").onImagesLoad( callback, timeout );
 *
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($){
	$.fn.onImagesLoad = function( i_callback, i_timeout ) {
		var callback = i_callback;
		var timeout = i_timeout;
		var $images,
			timer,
			numImagesToLoad = 0,
			numImagesLoaded = 0;
		
		function _onImageLoad() {
			numImagesLoaded++;
			if ( numImagesLoaded >= numImagesToLoad ) _onLoadComplete();
		}
		
		function _onLoadComplete() {
			clearTimeout(timer);
			$images.off("load",_onImageLoad);
			if ( typeof callback == "function" ) callback();
		}
		
		if ( typeof timeout == "undefined" ) timeout = 3000;
		$images = this.filter("img").add(this.find("img"));
		
		// width,heightをautoにして幅高さが取得できるなら既にロード済み
		$images.each(function(){
			var $this = $(this);
			var style = $this.attr("style") || "";
			$this.css({"width":"auto","height":"auto"});
			if ( !$this.width() || !$this.height() ) numImagesToLoad++;
			$this.attr("style",style);
		});
		if ( numImagesToLoad > 0 ) {
			$images.on( "load", _onImageLoad );
			if ( timeout > 0 ) timer = setTimeout( _onLoadComplete, timeout );
		} else {
			_onLoadComplete();
		}
		return this;
	}
	
})(jQuery);


/* ///////////////////////////////////////////////////////////////////////////
 *
 *  PrevNext
 *  jQuery Prev-Next Button Plugin
 *  動的に表示を切り替える前後ボタンを設置するプラグイン
 *
 *  $("selector").prevNext( options );		// selectorは前後のボタンを配置したい親要素
 *
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){
	
	// 定数
	$.prevNext = {
		ANIMATION_SLIDE: "slide",
		ANIMATION_FADE: "fade"
	};
	var IS_TOUCH_DEVICE = ('ontouchstart' in window) ? true : false;
	
	// デフォルト設定
	var defaults = {
		animationType: $.prevNext.ANIMATION_SLIDE
	};

	
	// イベントハンドラ
	function onPrevClick() { $(this).trigger("prev"); return false; }
	function onNextClick() { $(this).trigger("next"); return false; }
	
	function onMouseOver() {
		var options  = $(this).data("options");
		var $prev = $(this).data("$prev");
		var $next = $(this).data("$next");
		if ( options.animationType == $.prevNext.ANIMATION_SLIDE ) {
			$prev.stop(true).animate( {"marginLeft":0},400,"easeOutExpo");
			$next.stop(true).animate( {"marginRight":0},400,"easeOutExpo");
		} else {
			$prev.stop(true).animate( {"opacity":1},200,"easeOutCubic");
			$next.stop(true).animate( {"opacity":1},200,"easeOutCubic");
		}
	}
	
	function onMouseOut() {
		var options  = $(this).data("options");
		var $prev = $(this).data("$prev");
		var $next = $(this).data("$next");
		if ( options.animationType == $.prevNext.ANIMATION_SLIDE ) {
			$prev.stop(true).delay(0).animate( {"marginLeft":-$prev.outerWidth()},300,"easeInCubic");
			$next.stop(true).delay(0).animate( {"marginRight":-$next.outerWidth()},300,"easeInCubic");
		} else {
			$prev.stop(true).animate( {"opacity":0},450,"easeOutCubic");
			$next.stop(true).animate( {"opacity":0},450,"easeOutCubic");
		}
	}
	
	function onResize() {
		var $prev = $(this).data("$prev");
		var $next = $(this).data("$next");
		if ( !$prev || !$next ) return;
		$prev.css("top",($(this).outerHeight()-$prev.outerHeight())*0.5+"px");
		$next.css("top",($(this).outerHeight()-$next.outerHeight())*0.5+"px");
	}
	
	// ON / OFF
	function enable() {
		var $this = $(this);
		var $prev = $(this).data("$prev");
		var $next = $(this).data("$next");
		if ( !$prev || !$next ) return;
		if ( IS_TOUCH_DEVICE ) {
			$prev.css({"marginLeft":0,"opacity":1}).show();
			$next.css({"marginRight":0,"opacity":1}).show();
		} else {
			$this.on("mouseover",$.proxy(onMouseOver,this)).on("mouseout",$.proxy(onMouseOut,this));
		}
	}
	
	function disable() {
		var $this = $(this);
		var $prev = $(this).data("$prev");
		var $next = $(this).data("$next");
		if ( !$prev || !$next ) return;
		if ( IS_TOUCH_DEVICE ) {
			$prev.hide();
			$next.hide();
		} else {
			$this.trigger("mouseout");
			$this.off("mouseover",$.proxy(onMouseOver,this)).off("mouseout",$.proxy(onMouseOut,this));
		}
	}
	
	// 初期化
	function init() {
		var options  = $(this).data("options");
		// event
		var $this = $(this);
		var $prev = $('<a href="#" class="jPrev"></a>').appendTo($this).on("click",$.proxy(onPrevClick,this));
		var $next = $('<a href="#" class="jNext"></a>').appendTo($this).on("click",$.proxy(onNextClick,this));
		$(this).data("$prev",$prev);
		$(this).data("$next",$next);
		
		if ( options.animationType == $.prevNext.ANIMATION_SLIDE ) {
			$prev.css("marginLeft",-$prev.outerWidth()+"px");
			$next.css("marginRight",-$next.outerWidth()+"px");
		} else {
			$prev.css("opacity",0);
			$next.css("opacity",0);
		}
		$w.on("resize",$.proxy(onResize,this));
		$.proxy(onResize,this)();
		$.proxy(enable,this)();
	}
	
	
	// jQuery Plugin
	$.fn.prevNext = function( i_options ) {
		
		if ( i_options == "enable" ) {
			return $(this).each(function(){
				$.proxy(enable,this)();
			});
		} else if ( i_options == "disable" ) {
			return $(this).each(function(){
				$.proxy(disable,this)();
			});
		}
		
		var options = $.extend( true, {}, defaults, i_options );
		$(this).data("options",options);
		return $(this).each(init);
	}
	
})(jQuery(window), jQuery);



/* ///////////////////////////////////////////////////////////////////////////
 *
 *  FollowScroll
 *  jQuery FollowScroll Plugin
 *  カラム追尾プラグイン
 *
 *  $("selector").followScroll( options );			// 初期化（selectorは追尾させたい要素）
 *  $("selector").followScroll( "disable" );		// 無効にする
 *  $("selector").followScroll( "enable" );			// 無効になってたものを有効にする
 *
 *
 ////////////////////////////////////////////////////////////////////////////*/
(function($w, $){
	// less than IE6
	if (window.navigator.userAgent.toLowerCase().match( /msie [456]\./ ) ) {
		$.fn.followScroll = function(){ return this; }
		return;
	}
	
	//------------------------------------------------------------
	// デフォルト設定
	//------------------------------------------------------------
	var defaults = {
		marginTop: 0
	};
	
	//------------------------------------------------------------
	// FollowScrollクラス
	//------------------------------------------------------------
	var FollowScroll = function( $i_target, i_options ) {
		this.$target = $i_target;
		this.$padding;
		this.options = i_options;
		this.defaultOffsetTop;
		this.defaultTop;
		this.defaultPosition;
		this.isFixed = false;
		this.isDisabled = true;
		
		//initialize
		this.init.apply( this );
	}
	FollowScroll.prototype = {
		//------------------------------------------------------------
		// 初期化
		//------------------------------------------------------------
		init : function() {
			this.$padding = $('<div></div>');
			this._onChange();
			$(document).on("change",$.proxy(this._onChange,this));
			$(window).on("resize",$.proxy(this._onResize,this));
			this.enable();
		},
		
		//------------------------------------------------------------
		// リセット
		//------------------------------------------------------------
		reset : function() {
			this.defaultOffsetTop = undefined;
			this.defaultTop = undefined;
			this.defaultPosition = undefined;
			this._onChange();
		},
		//------------------------------------------------------------
		// 変更時
		//------------------------------------------------------------
		_onChange : function() {
			this._disable();
			this.defaultOffsetTop = this.$target.offset().top;
			if ( !this.defaultTop || typeof this.defaultTop != "undefined" ) this.defaultTop = this.$target.css("top");
			if ( !this.defaultPosition || typeof this.defaultPosition != "undefined" ) this.defaultPosition = this.$target.css("position");
			if ( !this.isDisabled ) this._enable();
		},
		
		//------------------------------------------------------------
		// windowのリサイズ
		//------------------------------------------------------------
		_onResize: function() {
			if ( this.isDisabled ) return;
			this._onChange();
			// 固定する要素の高さがウィンドウの1/3を超える場合は固定しない。
			if ( this.$target.height() > $(window).height()/3 ) this._disable();
			else this._enable();
		},
		//------------------------------------------------------------
		// paddingの高さ調整
		//------------------------------------------------------------
		setHeight: function() {
			if ( this.defaultPosition != "absolute" && this.defaultPosition != "fixed" ) {
				this.$padding.hide().insertAfter(this.$target);
				var h = this.$target.outerHeight()+parseInt(this.$target.css("marginBottom").replace("px",""));
				this.$padding.height(h);
			}
		},
		
		//------------------------------------------------------------
		// on / off
		//------------------------------------------------------------
		enable : function() {
			if ( !this.isDisabled ) return;
			this.isDisabled = false;
			this._onChange();
			this._enable();
			this._onResize();
		},
		
		_enable: function() {
			$w.on( "scroll",$.proxy(this.onScroll,this) );
			this.onScroll();
		},
		
		disable : function() {
			if ( this.isDisabled ) return;
			this.isDisabled = true;
			this._disable();
		},
		
		_disable: function() {
			this.$target.css("position",this.defaultPosition);
			this.$target.css("top",this.defaultTop);
			this.$padding.hide();
			this.isFixed = false;
			$w.off( "scroll",$.proxy(this.onScroll,this) );
		},
		
		//------------------------------------------------------------
		// スクロール時
		//------------------------------------------------------------
		onScroll : function() {
			var st = $w.scrollTop();
			if ( st > this.defaultOffsetTop + this.options.marginTop ) {
				if ( !this.isFixed ) {
					this.setHeight();
					this.$target.css({"position":"fixed", "top":this.options.marginTop+"px"});
					this.$padding.show();
					this.isFixed = true;
				}
			} else {
				if ( this.isFixed ) {
					this.$target.css("position",this.defaultPosition);
					this.$target.css("top",this.defaultTop);
					this.$padding.hide();
					this.isFixed = false;
				}
			}
		}
	};
	
	
	//------------------------------------------------------------
	// jQueryプラグイン
	//------------------------------------------------------------
	$.fn.followScroll = function( i_options ) {
		
		var options,
			$this = $(this);
		
		//------------------------------------------------------------
		if ( i_options == "enable" ) {
			return $(this).each(function(){
				var followScroll = this.followScroll;
				if ( followScroll ) {
					followScroll.enable();
				} else {
					options = $.extend( true, {}, defaults, arguments[2] );
					this.followScroll = new FollowScroll( $(this), options );
				}
			});
		} else if ( i_options == "disable" ) {
			return $(this).each(function(){
				var followScroll = this.followScroll;
				if ( followScroll ) followScroll.disable();
			});
		}
		//------------------------------------------------------------
		options = $.extend( true, {}, defaults, i_options );
		return $this.each( function() {
			var followScroll = this.followScroll;
			if ( !followScroll ) this.followScroll = new FollowScroll( $(this), options );
		});
		
	}

})(jQuery(window), jQuery);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*
 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
 *
 * Uses the built in easing capabilities added In jQuery 1.1
 * to offer multiple easing options
 *
 * TERMS OF USE - jQuery Easing
 *
 * Open source under the BSD License.
 *
 * Copyright © 2008 George McGinley Smith
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
jQuery.easing["jswing"]=jQuery.easing["swing"];jQuery.extend(jQuery.easing,{def:"easeOutQuad",swing:function(a,b,c,d,e){return jQuery.easing[jQuery.easing.def](a,b,c,d,e)},easeInQuad:function(a,b,c,d,e){return d*(b/=e)*b+c},easeOutQuad:function(a,b,c,d,e){return-d*(b/=e)*(b-2)+c},easeInOutQuad:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b+c;return-d/2*(--b*(b-2)-1)+c},easeInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},easeOutCubic:function(a,b,c,d,e){return d*((b=b/e-1)*b*b+1)+c},easeInOutCubic:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b+c;return d/2*((b-=2)*b*b+2)+c},easeInQuart:function(a,b,c,d,e){return d*(b/=e)*b*b*b+c},easeOutQuart:function(a,b,c,d,e){return-d*((b=b/e-1)*b*b*b-1)+c},easeInOutQuart:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b+c;return-d/2*((b-=2)*b*b*b-2)+c},easeInQuint:function(a,b,c,d,e){return d*(b/=e)*b*b*b*b+c},easeOutQuint:function(a,b,c,d,e){return d*((b=b/e-1)*b*b*b*b+1)+c},easeInOutQuint:function(a,b,c,d,e){if((b/=e/2)<1)return d/2*b*b*b*b*b+c;return d/2*((b-=2)*b*b*b*b+2)+c},easeInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},easeOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c},easeInOutSine:function(a,b,c,d,e){return-d/2*(Math.cos(Math.PI*b/e)-1)+c},easeInExpo:function(a,b,c,d,e){return b==0?c:d*Math.pow(2,10*(b/e-1))+c},easeOutExpo:function(a,b,c,d,e){return b==e?c+d:d*(-Math.pow(2,-10*b/e)+1)+c},easeInOutExpo:function(a,b,c,d,e){if(b==0)return c;if(b==e)return c+d;if((b/=e/2)<1)return d/2*Math.pow(2,10*(b-1))+c;return d/2*(-Math.pow(2,-10*--b)+2)+c},easeInCirc:function(a,b,c,d,e){return-d*(Math.sqrt(1-(b/=e)*b)-1)+c},easeOutCirc:function(a,b,c,d,e){return d*Math.sqrt(1-(b=b/e-1)*b)+c},easeInOutCirc:function(a,b,c,d,e){if((b/=e/2)<1)return-d/2*(Math.sqrt(1-b*b)-1)+c;return d/2*(Math.sqrt(1-(b-=2)*b)+1)+c},easeInElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return-(h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g))+c},easeOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e)==1)return c+d;if(!g)g=e*.3;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);return h*Math.pow(2,-10*b)*Math.sin((b*e-f)*2*Math.PI/g)+d+c},easeInOutElastic:function(a,b,c,d,e){var f=1.70158;var g=0;var h=d;if(b==0)return c;if((b/=e/2)==2)return c+d;if(!g)g=e*.3*1.5;if(h<Math.abs(d)){h=d;var f=g/4}else var f=g/(2*Math.PI)*Math.asin(d/h);if(b<1)return-.5*h*Math.pow(2,10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)+c;return h*Math.pow(2,-10*(b-=1))*Math.sin((b*e-f)*2*Math.PI/g)*.5+d+c},easeInBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*(b/=e)*b*((f+1)*b-f)+c},easeOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;return d*((b=b/e-1)*b*((f+1)*b+f)+1)+c},easeInOutBack:function(a,b,c,d,e,f){if(f==undefined)f=1.70158;if((b/=e/2)<1)return d/2*b*b*(((f*=1.525)+1)*b-f)+c;return d/2*((b-=2)*b*(((f*=1.525)+1)*b+f)+2)+c},easeInBounce:function(a,b,c,d,e){return d-jQuery.easing.easeOutBounce(a,e-b,0,d,e)+c},easeOutBounce:function(a,b,c,d,e){if((b/=e)<1/2.75){return d*7.5625*b*b+c}else if(b<2/2.75){return d*(7.5625*(b-=1.5/2.75)*b+.75)+c}else if(b<2.5/2.75){return d*(7.5625*(b-=2.25/2.75)*b+.9375)+c}else{return d*(7.5625*(b-=2.625/2.75)*b+.984375)+c}},easeInOutBounce:function(a,b,c,d,e){if(b<e/2)return jQuery.easing.easeInBounce(a,b*2,0,d,e)*.5+c;return jQuery.easing.easeOutBounce(a,b*2-e,0,d,e)*.5+d*.5+c}})

/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright © 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */

//  Underscore.js 1.5.2
//  http://underscorejs.org
//  (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//  Underscore may be freely distributed under the MIT license.
!function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,v=e.reduce,h=e.reduceRight,d=e.filter,g=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,_=Object.keys,w=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.0";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a in n)if(j.has(n,a)&&t.call(e,n[a],a,n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduce===v)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduceRight===h)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:d&&n.filter===d?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:g&&n.every===g?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e};var F=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=F(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index<t.index?-1:1}),"value")};var k=function(n,t,r,e){var u={},i=F(null==t?j.identity:t);return A(n,function(t,a){var o=i.call(r,t,a,n);e(u,o,t)}),u};j.groupBy=function(n,t,r){return k(n,t,r,function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)})},j.countBy=function(n,t,r){return k(n,t,r,function(n,t){j.has(n,t)||(n[t]=0),n[t]++})},j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:F(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var R=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):R(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return R(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){return j.unzip.apply(j,o.call(arguments))},j.unzip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var M=function(){};j.bind=function(n,t){var r,e;if(w&&n.bind===w)return w.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));M.prototype=n.prototype;var u=new M;M.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u=null;return function(){var i=this,a=arguments,o=function(){u=null,r||(e=n.apply(i,a))},c=r&&!u;return clearTimeout(u),u=setTimeout(o,t),c&&(e=n.apply(i,a)),e}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=_||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push(n[r]);return t},j.pairs=function(n){var t=[];for(var r in n)j.has(n,r)&&t.push([r,n[r]]);return t},j.invert=function(n){var t={};for(var r in n)j.has(n,r)&&(t[n[r]]=r);return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","/":"&#x2F;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),D.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},z=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(z,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var D=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],D.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return D.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}.call(this);

//  Underscore.string
//  (c) 2010 Esa-Matti Suuronen <esa-matti aet suuronen dot org>
//  Underscore.string is freely distributable under the terms of the MIT license.
//  Documentation: https://github.com/epeli/underscore.string
//  Some code is borrowed from MooTools and Alexandru Marasteanu.
//  Version '2.3.0'
!function(e,t){"use strict";var n=t.prototype.trim,r=t.prototype.trimRight,i=t.prototype.trimLeft,s=function(e){return e*1||0},o=function(e,t){if(t<1)return"";var n="";while(t>0)t&1&&(n+=e),t>>=1,e+=e;return n},u=[].slice,a=function(e){return e==null?"\\s":e.source?e.source:"["+p.escapeRegExp(e)+"]"},f={lt:"<",gt:">",quot:'"',apos:"'",amp:"&"},l={};for(var c in f)l[f[c]]=c;var h=function(){function e(e){return Object.prototype.toString.call(e).slice(8,-1).toLowerCase()}var n=o,r=function(){return r.cache.hasOwnProperty(arguments[0])||(r.cache[arguments[0]]=r.parse(arguments[0])),r.format.call(null,r.cache[arguments[0]],arguments)};return r.format=function(r,i){var s=1,o=r.length,u="",a,f=[],l,c,p,d,v,m;for(l=0;l<o;l++){u=e(r[l]);if(u==="string")f.push(r[l]);else if(u==="array"){p=r[l];if(p[2]){a=i[s];for(c=0;c<p[2].length;c++){if(!a.hasOwnProperty(p[2][c]))throw new Error(h('[_.sprintf] property "%s" does not exist',p[2][c]));a=a[p[2][c]]}}else p[1]?a=i[p[1]]:a=i[s++];if(/[^s]/.test(p[8])&&e(a)!="number")throw new Error(h("[_.sprintf] expecting number but found %s",e(a)));switch(p[8]){case"b":a=a.toString(2);break;case"c":a=t.fromCharCode(a);break;case"d":a=parseInt(a,10);break;case"e":a=p[7]?a.toExponential(p[7]):a.toExponential();break;case"f":a=p[7]?parseFloat(a).toFixed(p[7]):parseFloat(a);break;case"o":a=a.toString(8);break;case"s":a=(a=t(a))&&p[7]?a.substring(0,p[7]):a;break;case"u":a=Math.abs(a);break;case"x":a=a.toString(16);break;case"X":a=a.toString(16).toUpperCase()}a=/[def]/.test(p[8])&&p[3]&&a>=0?"+"+a:a,v=p[4]?p[4]=="0"?"0":p[4].charAt(1):" ",m=p[6]-t(a).length,d=p[6]?n(v,m):"",f.push(p[5]?a+d:d+a)}}return f.join("")},r.cache={},r.parse=function(e){var t=e,n=[],r=[],i=0;while(t){if((n=/^[^\x25]+/.exec(t))!==null)r.push(n[0]);else if((n=/^\x25{2}/.exec(t))!==null)r.push("%");else{if((n=/^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(t))===null)throw new Error("[_.sprintf] huh?");if(n[2]){i|=1;var s=[],o=n[2],u=[];if((u=/^([a-z_][a-z_\d]*)/i.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1]);while((o=o.substring(u[0].length))!=="")if((u=/^\.([a-z_][a-z_\d]*)/i.exec(o))!==null)s.push(u[1]);else{if((u=/^\[(\d+)\]/.exec(o))===null)throw new Error("[_.sprintf] huh?");s.push(u[1])}n[2]=s}else i|=2;if(i===3)throw new Error("[_.sprintf] mixing positional and named placeholders is not (yet) supported");r.push(n)}t=t.substring(n[0].length)}return r},r}(),p={VERSION:"2.3.0",isBlank:function(e){return e==null&&(e=""),/^\s*$/.test(e)},stripTags:function(e){return e==null?"":t(e).replace(/<\/?[^>]+>/g,"")},capitalize:function(e){return e=e==null?"":t(e),e.charAt(0).toUpperCase()+e.slice(1)},chop:function(e,n){return e==null?[]:(e=t(e),n=~~n,n>0?e.match(new RegExp(".{1,"+n+"}","g")):[e])},clean:function(e){return p.strip(e).replace(/\s+/g," ")},count:function(e,n){return e==null||n==null?0:t(e).split(n).length-1},chars:function(e){return e==null?[]:t(e).split("")},swapCase:function(e){return e==null?"":t(e).replace(/\S/g,function(e){return e===e.toUpperCase()?e.toLowerCase():e.toUpperCase()})},escapeHTML:function(e){return e==null?"":t(e).replace(/[&<>"']/g,function(e){return"&"+l[e]+";"})},unescapeHTML:function(e){return e==null?"":t(e).replace(/\&([^;]+);/g,function(e,n){var r;return n in f?f[n]:(r=n.match(/^#x([\da-fA-F]+)$/))?t.fromCharCode(parseInt(r[1],16)):(r=n.match(/^#(\d+)$/))?t.fromCharCode(~~r[1]):e})},escapeRegExp:function(e){return e==null?"":t(e).replace(/([.*+?^=!:${}()|[\]\/\\])/g,"\\$1")},splice:function(e,t,n,r){var i=p.chars(e);return i.splice(~~t,~~n,r),i.join("")},insert:function(e,t,n){return p.splice(e,t,0,n)},include:function(e,n){return n===""?!0:e==null?!1:t(e).indexOf(n)!==-1},join:function(){var e=u.call(arguments),t=e.shift();return t==null&&(t=""),e.join(t)},lines:function(e){return e==null?[]:t(e).split("\n")},reverse:function(e){return p.chars(e).reverse().join("")},startsWith:function(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(0,n.length)===n)},endsWith:function(e,n){return n===""?!0:e==null||n==null?!1:(e=t(e),n=t(n),e.length>=n.length&&e.slice(e.length-n.length)===n)},succ:function(e){return e==null?"":(e=t(e),e.slice(0,-1)+t.fromCharCode(e.charCodeAt(e.length-1)+1))},titleize:function(e){return e==null?"":t(e).replace(/(?:^|\s)\S/g,function(e){return e.toUpperCase()})},camelize:function(e){return p.trim(e).replace(/[-_\s]+(.)?/g,function(e,t){return t.toUpperCase()})},underscored:function(e){return p.trim(e).replace(/([a-z\d])([A-Z]+)/g,"$1_$2").replace(/[-\s]+/g,"_").toLowerCase()},dasherize:function(e){return p.trim(e).replace(/([A-Z])/g,"-$1").replace(/[-_\s]+/g,"-").toLowerCase()},classify:function(e){return p.titleize(t(e).replace(/_/g," ")).replace(/\s/g,"")},humanize:function(e){return p.capitalize(p.underscored(e).replace(/_id$/,"").replace(/_/g," "))},trim:function(e,r){return e==null?"":!r&&n?n.call(e):(r=a(r),t(e).replace(new RegExp("^"+r+"+|"+r+"+$","g"),""))},ltrim:function(e,n){return e==null?"":!n&&i?i.call(e):(n=a(n),t(e).replace(new RegExp("^"+n+"+"),""))},rtrim:function(e,n){return e==null?"":!n&&r?r.call(e):(n=a(n),t(e).replace(new RegExp(n+"+$"),""))},truncate:function(e,n,r){return e==null?"":(e=t(e),r=r||"...",n=~~n,e.length>n?e.slice(0,n)+r:e)},prune:function(e,n,r){if(e==null)return"";e=t(e),n=~~n,r=r!=null?t(r):"...";if(e.length<=n)return e;var i=function(e){return e.toUpperCase()!==e.toLowerCase()?"A":" "},s=e.slice(0,n+1).replace(/.(?=\W*\w*$)/g,i);return s.slice(s.length-2).match(/\w\w/)?s=s.replace(/\s*\S+$/,""):s=p.rtrim(s.slice(0,s.length-1)),(s+r).length>e.length?e:e.slice(0,s.length)+r},words:function(e,t){return p.isBlank(e)?[]:p.trim(e,t).split(t||/\s+/)},pad:function(e,n,r,i){e=e==null?"":t(e),n=~~n;var s=0;r?r.length>1&&(r=r.charAt(0)):r=" ";switch(i){case"right":return s=n-e.length,e+o(r,s);case"both":return s=n-e.length,o(r,Math.ceil(s/2))+e+o(r,Math.floor(s/2));default:return s=n-e.length,o(r,s)+e}},lpad:function(e,t,n){return p.pad(e,t,n)},rpad:function(e,t,n){return p.pad(e,t,n,"right")},lrpad:function(e,t,n){return p.pad(e,t,n,"both")},sprintf:h,vsprintf:function(e,t){return t.unshift(e),h.apply(null,t)},toNumber:function(e,n){if(e==null||e=="")return 0;e=t(e);var r=s(s(e).toFixed(~~n));return r===0&&!e.match(/^0+$/)?Number.NaN:r},numberFormat:function(e,t,n,r){if(isNaN(e)||e==null)return"";e=e.toFixed(~~t),r=r||",";var i=e.split("."),s=i[0],o=i[1]?(n||".")+i[1]:"";return s.replace(/(\d)(?=(?:\d{3})+$)/g,"$1"+r)+o},strRight:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(r+n.length,e.length):e},strRightBack:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.lastIndexOf(n):-1;return~r?e.slice(r+n.length,e.length):e},strLeft:function(e,n){if(e==null)return"";e=t(e),n=n!=null?t(n):n;var r=n?e.indexOf(n):-1;return~r?e.slice(0,r):e},strLeftBack:function(e,t){if(e==null)return"";e+="",t=t!=null?""+t:t;var n=e.lastIndexOf(t);return~n?e.slice(0,n):e},toSentence:function(e,t,n,r){t=t||", ",n=n||" and ";var i=e.slice(),s=i.pop();return e.length>2&&r&&(n=p.rtrim(t)+n),i.length?i.join(t)+n+s:s},toSentenceSerial:function(){var e=u.call(arguments);return e[3]=!0,p.toSentence.apply(p,e)},slugify:function(e){if(e==null)return"";var n="ąàáäâãåæćęèéëêìíïîłńòóöôõøùúüûñçżź",r="aaaaaaaaceeeeeiiiilnoooooouuuunczz",i=new RegExp(a(n),"g");return e=t(e).toLowerCase().replace(i,function(e){var t=n.indexOf(e);return r.charAt(t)||"-"}),p.dasherize(e.replace(/[^\w\s-]/g,""))},surround:function(e,t){return[t,e,t].join("")},quote:function(e){return p.surround(e,'"')},exports:function(){var e={};for(var t in this){if(!this.hasOwnProperty(t)||t.match(/^(?:include|contains|reverse)$/))continue;e[t]=this[t]}return e},repeat:function(e,n,r){if(e==null)return"";n=~~n;if(r==null)return o(t(e),n);for(var i=[];n>0;i[--n]=e);return i.join(r)},levenshtein:function(e,n){if(e==null&&n==null)return 0;if(e==null)return t(n).length;if(n==null)return t(e).length;e=t(e),n=t(n);var r=[],i,s;for(var o=0;o<=n.length;o++)for(var u=0;u<=e.length;u++)o&&u?e.charAt(u-1)===n.charAt(o-1)?s=i:s=Math.min(r[u],r[u-1],i)+1:s=o+u,i=r[u],r[u]=s;return r.pop()}};p.strip=p.trim,p.lstrip=p.ltrim,p.rstrip=p.rtrim,p.center=p.lrpad,p.rjust=p.lpad,p.ljust=p.rpad,p.contains=p.include,p.q=p.quote,typeof exports!="undefined"?(typeof module!="undefined"&&module.exports&&(module.exports=p),exports._s=p):typeof define=="function"&&define.amd?define("underscore.string",[],function(){return p}):(e._=e._||{},e._.string=e._.str=p)}(this,String);

/**
    json2.js
    See http://www.JSON.org/js.html
**/

"object"!==typeof JSON&&(JSON={});
(function(){function m(a){return 10>a?"0"+a:a}function t(a){p.lastIndex=0;return p.test(a)?'"'+a.replace(p,function(a){var c=u[a];return"string"===typeof c?c:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function q(a,l){var c,d,h,r,g=e,f,b=l[a];b&&"object"===typeof b&&"function"===typeof b.toJSON&&(b=b.toJSON(a));"function"===typeof k&&(b=k.call(l,a,b));switch(typeof b){case "string":return t(b);case "number":return isFinite(b)?String(b):"null";case "boolean":case "null":return String(b);
case "object":if(!b)return"null";e+=n;f=[];if("[object Array]"===Object.prototype.toString.apply(b)){r=b.length;for(c=0;c<r;c+=1)f[c]=q(c,b)||"null";h=0===f.length?"[]":e?"[\n"+e+f.join(",\n"+e)+"\n"+g+"]":"["+f.join(",")+"]";e=g;return h}if(k&&"object"===typeof k)for(r=k.length,c=0;c<r;c+=1)"string"===typeof k[c]&&(d=k[c],(h=q(d,b))&&f.push(t(d)+(e?": ":":")+h));else for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(h=q(d,b))&&f.push(t(d)+(e?": ":":")+h);h=0===f.length?"{}":e?"{\n"+e+f.join(",\n"+
e)+"\n"+g+"}":"{"+f.join(",")+"}";e=g;return h}}"function"!==typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+m(this.getUTCMonth()+1)+"-"+m(this.getUTCDate())+"T"+m(this.getUTCHours())+":"+m(this.getUTCMinutes())+":"+m(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(){return this.valueOf()});var s,p,e,n,u,k;"function"!==typeof JSON.stringify&&(p=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
u={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(a,l,c){var d;n=e="";if("number"===typeof c)for(d=0;d<c;d+=1)n+=" ";else"string"===typeof c&&(n=c);if((k=l)&&"function"!==typeof l&&("object"!==typeof l||"number"!==typeof l.length))throw Error("JSON.stringify");return q("",{"":a})});"function"!==typeof JSON.parse&&(s=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,JSON.parse=function(a,
e){function c(a,d){var g,f,b=a[d];if(b&&"object"===typeof b)for(g in b)Object.prototype.hasOwnProperty.call(b,g)&&(f=c(b,g),void 0!==f?b[g]=f:delete b[g]);return e.call(a,d,b)}var d;a=String(a);s.lastIndex=0;s.test(a)&&(a=a.replace(s,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(a.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return d=
eval("("+a+")"),"function"===typeof e?c({"":d},""):d;throw new SyntaxError("JSON.parse");})})();


/*!
 * jQuery Cookie Plugin v1.4.0
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2013 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as anonymous module.
		define(['jquery'], factory);
	} else {
		// Browser globals.
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (value !== undefined && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setTime(+t + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path	? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {};

		// To prevent the for loop in the first place assign an empty array
		// in case there are no cookies at all. Also prevents odd result when
		// calling $.cookie().
		var cookies = document.cookie ? document.cookie.split('; ') : [];

		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			var name = decode(parts.shift());
			var cookie = parts.join('=');

			if (key && key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) === undefined) {
			return false;
		}

		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

/*
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */
(function($,e,b){var c="hashchange",h=document,f,g=$.event.special,i=h.documentMode,d="on"+c in e&&(i===b||i>7);function a(j){j=j||location.href;return"#"+j.replace(/^[^#]*#?(.*)$/,"$1")}$.fn[c]=function(j){return j?this.on(c,j):this.trigger(c)};$.fn[c].delay=50;g[c]=$.extend(g[c],{setup:function(){if(d){return false}$(f.start)},teardown:function(){if(d){return false}$(f.stop)}});f=(function(){var j={},p,m=a(),k=function(q){return q},l=k,o=k;j.start=function(){p||n()};j.stop=function(){p&&clearTimeout(p);p=b};function n(){var r=a(),q=o(m);if(r!==m){l(m=r,q);$(e).trigger(c)}else{if(q!==m){location.href=location.href.replace(/#.*/,"")+q}}p=setTimeout(n,$.fn[c].delay)}navigator.userAgent.match(/MSIE (\d\.\d+)/)&&!d&&(function(){var q,r;j.start=function(){if(!q){r=$.fn[c].src;r=r&&r+a();q=$('<iframe tabindex="-1" title="empty"/>').hide().one("load",function(){r||l(a());n()}).attr("src",r||"javascript:0").insertAfter("body")[0].contentWindow;h.onpropertychange=function(){try{if(event.propertyName==="title"){q.document.title=h.title}}catch(s){}}}};j.stop=k;o=function(){return a(q.location.href)};l=function(v,s){var u=q.document,t=$.fn[c].domain;if(v!==s){u.title=h.title;u.open();t&&u.write('<script>document.domain="'+t+'"<\/script>');u.close();q.location.hash=v}}})();return j})()})(jQuery,this);



/*!
 * jQuery Transit - CSS3 transitions and transformations
 * (c) 2011-2012 Rico Sta. Cruz <rico@ricostacruz.com>
 * MIT Licensed.
 *
 * http://ricostacruz.com/jquery.transit
 * http://github.com/rstacruz/jquery.transit
 */
(function(k){k.transit={version:"0.9.9",propertyMap:{marginLeft:"margin",marginRight:"margin",marginBottom:"margin",marginTop:"margin",paddingLeft:"padding",paddingRight:"padding",paddingBottom:"padding",paddingTop:"padding"},enabled:true,useTransitionEnd:false};var d=document.createElement("div");var q={};function b(v){if(v in d.style){return v}var u=["Moz","Webkit","O","ms"];var r=v.charAt(0).toUpperCase()+v.substr(1);if(v in d.style){return v}for(var t=0;t<u.length;++t){var s=u[t]+r;if(s in d.style){return s}}}function e(){d.style[q.transform]="";d.style[q.transform]="rotateY(90deg)";return d.style[q.transform]!==""}var a=navigator.userAgent.toLowerCase().indexOf("chrome")>-1;q.transition=b("transition");q.transitionDelay=b("transitionDelay");q.transform=b("transform");q.transformOrigin=b("transformOrigin");q.transform3d=e();var i={transition:"transitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",WebkitTransition:"webkitTransitionEnd",msTransition:"MSTransitionEnd"};var f=q.transitionEnd=i[q.transition]||null;for(var p in q){if(q.hasOwnProperty(p)&&typeof k.support[p]==="undefined"){k.support[p]=q[p]}}d=null;k.cssEase={_default:"ease","in":"ease-in",out:"ease-out","in-out":"ease-in-out",snap:"cubic-bezier(0,1,.5,1)",easeOutCubic:"cubic-bezier(.215,.61,.355,1)",easeInOutCubic:"cubic-bezier(.645,.045,.355,1)",easeInCirc:"cubic-bezier(.6,.04,.98,.335)",easeOutCirc:"cubic-bezier(.075,.82,.165,1)",easeInOutCirc:"cubic-bezier(.785,.135,.15,.86)",easeInExpo:"cubic-bezier(.95,.05,.795,.035)",easeOutExpo:"cubic-bezier(.19,1,.22,1)",easeInOutExpo:"cubic-bezier(1,0,0,1)",easeInQuad:"cubic-bezier(.55,.085,.68,.53)",easeOutQuad:"cubic-bezier(.25,.46,.45,.94)",easeInOutQuad:"cubic-bezier(.455,.03,.515,.955)",easeInQuart:"cubic-bezier(.895,.03,.685,.22)",easeOutQuart:"cubic-bezier(.165,.84,.44,1)",easeInOutQuart:"cubic-bezier(.77,0,.175,1)",easeInQuint:"cubic-bezier(.755,.05,.855,.06)",easeOutQuint:"cubic-bezier(.23,1,.32,1)",easeInOutQuint:"cubic-bezier(.86,0,.07,1)",easeInSine:"cubic-bezier(.47,0,.745,.715)",easeOutSine:"cubic-bezier(.39,.575,.565,1)",easeInOutSine:"cubic-bezier(.445,.05,.55,.95)",easeInBack:"cubic-bezier(.6,-.28,.735,.045)",easeOutBack:"cubic-bezier(.175, .885,.32,1.275)",easeInOutBack:"cubic-bezier(.68,-.55,.265,1.55)"};k.cssHooks["transit:transform"]={get:function(r){return k(r).data("transform")||new j()},set:function(s,r){var t=r;if(!(t instanceof j)){t=new j(t)}if(q.transform==="WebkitTransform"&&!a){s.style[q.transform]=t.toString(true)}else{s.style[q.transform]=t.toString()}k(s).data("transform",t)}};k.cssHooks.transform={set:k.cssHooks["transit:transform"].set};if(k.fn.jquery<"1.8"){k.cssHooks.transformOrigin={get:function(r){return r.style[q.transformOrigin]},set:function(r,s){r.style[q.transformOrigin]=s}};k.cssHooks.transition={get:function(r){return r.style[q.transition]},set:function(r,s){r.style[q.transition]=s}}}n("scale");n("translate");n("rotate");n("rotateX");n("rotateY");n("rotate3d");n("perspective");n("skewX");n("skewY");n("x",true);n("y",true);function j(r){if(typeof r==="string"){this.parse(r)}return this}j.prototype={setFromString:function(t,s){var r=(typeof s==="string")?s.split(","):(s.constructor===Array)?s:[s];r.unshift(t);j.prototype.set.apply(this,r)},set:function(s){var r=Array.prototype.slice.apply(arguments,[1]);if(this.setter[s]){this.setter[s].apply(this,r)}else{this[s]=r.join(",")}},get:function(r){if(this.getter[r]){return this.getter[r].apply(this)}else{return this[r]||0}},setter:{rotate:function(r){this.rotate=o(r,"deg")},rotateX:function(r){this.rotateX=o(r,"deg")},rotateY:function(r){this.rotateY=o(r,"deg")},scale:function(r,s){if(s===undefined){s=r}this.scale=r+","+s},skewX:function(r){this.skewX=o(r,"deg")},skewY:function(r){this.skewY=o(r,"deg")},perspective:function(r){this.perspective=o(r,"px")},x:function(r){this.set("translate",r,null)},y:function(r){this.set("translate",null,r)},translate:function(r,s){if(this._translateX===undefined){this._translateX=0}if(this._translateY===undefined){this._translateY=0}if(r!==null&&r!==undefined){this._translateX=o(r,"px")}if(s!==null&&s!==undefined){this._translateY=o(s,"px")}this.translate=this._translateX+","+this._translateY}},getter:{x:function(){return this._translateX||0},y:function(){return this._translateY||0},scale:function(){var r=(this.scale||"1,1").split(",");if(r[0]){r[0]=parseFloat(r[0])}if(r[1]){r[1]=parseFloat(r[1])}return(r[0]===r[1])?r[0]:r},rotate3d:function(){var t=(this.rotate3d||"0,0,0,0deg").split(",");for(var r=0;r<=3;++r){if(t[r]){t[r]=parseFloat(t[r])}}if(t[3]){t[3]=o(t[3],"deg")}return t}},parse:function(s){var r=this;s.replace(/([a-zA-Z0-9]+)\((.*?)\)/g,function(t,v,u){r.setFromString(v,u)})},toString:function(t){var s=[];for(var r in this){if(this.hasOwnProperty(r)){if((!q.transform3d)&&((r==="rotateX")||(r==="rotateY")||(r==="perspective")||(r==="transformOrigin"))){continue}if(r[0]!=="_"){if(t&&(r==="scale")){s.push(r+"3d("+this[r]+",1)")}else{if(t&&(r==="translate")){s.push(r+"3d("+this[r]+",0)")}else{s.push(r+"("+this[r]+")")}}}}}return s.join(" ")}};function m(s,r,t){if(r===true){s.queue(t)}else{if(r){s.queue(r,t)}else{t()}}}function h(s){var r=[];k.each(s,function(t){t=k.camelCase(t);t=k.transit.propertyMap[t]||k.cssProps[t]||t;t=c(t);if(k.inArray(t,r)===-1){r.push(t)}});return r}function g(s,v,x,r){var t=h(s);if(k.cssEase[x]){x=k.cssEase[x]}var w=""+l(v)+" "+x;if(parseInt(r,10)>0){w+=" "+l(r)}var u=[];k.each(t,function(z,y){u.push(y+" "+w)});return u.join(", ")}k.fn.transition=k.fn.transit=function(z,s,y,C){var D=this;var u=0;var w=true;if(typeof s==="function"){C=s;s=undefined}if(typeof y==="function"){C=y;y=undefined}if(typeof z.easing!=="undefined"){y=z.easing;delete z.easing}if(typeof z.duration!=="undefined"){s=z.duration;delete z.duration}if(typeof z.complete!=="undefined"){C=z.complete;delete z.complete}if(typeof z.queue!=="undefined"){w=z.queue;delete z.queue}if(typeof z.delay!=="undefined"){u=z.delay;delete z.delay}if(typeof s==="undefined"){s=k.fx.speeds._default}if(typeof y==="undefined"){y=k.cssEase._default}s=l(s);var E=g(z,s,y,u);var B=k.transit.enabled&&q.transition;var t=B?(parseInt(s,10)+parseInt(u,10)):0;if(t===0){var A=function(F){D.css(z);if(C){C.apply(D)}if(F){F()}};m(D,w,A);return D}var x={};var r=function(H){var G=false;var F=function(){if(G){D.unbind(f,F)}if(t>0){D.each(function(){this.style[q.transition]=(x[this]||null)})}if(typeof C==="function"){C.apply(D)}if(typeof H==="function"){H()}};if((t>0)&&(f)&&(k.transit.useTransitionEnd)){G=true;D.bind(f,F)}else{window.setTimeout(F,t)}D.each(function(){if(t>0){this.style[q.transition]=E}k(this).css(z)})};var v=function(F){this.offsetWidth;r(F)};m(D,w,v);return this};function n(s,r){if(!r){k.cssNumber[s]=true}k.transit.propertyMap[s]=q.transform;k.cssHooks[s]={get:function(v){var u=k(v).css("transit:transform");return u.get(s)},set:function(v,w){var u=k(v).css("transit:transform");u.setFromString(s,w);k(v).css({"transit:transform":u})}}}function c(r){return r.replace(/([A-Z])/g,function(s){return"-"+s.toLowerCase()})}function o(s,r){if((typeof s==="string")&&(!s.match(/^[\-0-9\.]+$/))){return s}else{return""+s+r}}function l(s){var r=s;if(k.fx.speeds[r]){r=k.fx.speeds[r]}return o(r,"ms")}k.transit.getTransitionValue=g})(jQuery);


/*
 * simpleScroll - jQuery plugin
 *
 * Version 1.0.2 on 2010.02.05
 *
 * Author Kazuo Uratani @ STARRYWORKS inc.
 * http://www.starryworks.co.jp/
 *
 * Licensed under the MIT License
 *
 */

(function($){

	$.fn.simpleScroll = function( i_options ){
		
		var defaults = {
			time:600,
			distance: 0
		};
		var options = $.extend( true, defaults, i_options );
		
		$(this).click(function(){ 
			var key = $(this).attr('href');
			var dest = 0;
			if(key != "#") {
				if ( $(key).length == 0 ) return false;
				dest = $(key).offset().top - options.distance;
			}
			$("html,body").animate( {scrollTop:dest}, options.time );
			return false;
		});
		
		return this;
	};

})(jQuery);