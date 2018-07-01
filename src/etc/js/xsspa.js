/*
	[!]必ずdefer属性付きで参照させて下さい！

	出来るだけjs圧縮で何とかなる箇所は
	分かりやすく書いていますが、
	どうしても圧縮でカバーしきれない部分が多く
	随所にコードゴルフ特有の書き方があります。
	…今回は短くする事を重視しているので、仕様です。
	(bad-practice的な関数が多数)
	(関数長すぎぃ)
	(単一責任原則違反！)
	(しゃーないんです許して…)
*/
(function(){
	var _document = document,
		_window = window;
	var _documentElement = _document.documentElement,
		_history = _window.history,
		_location = location;
	var _windowAddEventListener = _window.addEventListener.bind(_window);
	/* eslint-disable no-constant-condition */
	var content = _document.getElementById("content"), //テンプレートコンテナ要素
		scrollBase = _document.scrollingElement || _documentElement;
	var loading = 0,
		path_current = _location.pathname;
	var xhr_agent;
	/* eslint-enable no-constant-condition */
	
	//.srcファイルを処理する関数。
	//このサンプルはxsteのjson＆生htmlを処理できる設定
	//ここを書き換えれば、例えばmarked.jsを用いてmarkdownをparseさせたりもできる
	//…クライアントにパーサーDL&パース処理させるコスト、
	//  毎回生htmlの通信コスト、どちらを優先するか、などなど
	//  (プリレンダ/SSRでmarkdown処理させるのはどうよって話)
	//  尚xsteは0.3KB(!)なのでパーサの通信コストは安心！！(推していく
	function decoder(res){
		var isJSON = res[0] === "{";
		if(isJSON){
			res = JSON.parse(res);
			// eslint-disable-next-line no-undef
			return xste(res.template, res.data);
		}
		return res;
	}
	//ページ移動後に発火
	//lazyloadとか発火させたければここに挿入
	function onAfterPageMoved(){
		// eslint-disable-next-line no-undef
		//if(_window.echo)echo.render();
	}
	
	/*\
	|*|
	|*|  :: Translate relative paths to absolute paths ::
	|*|
	|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
	|*|  https://developer.mozilla.org/User:fusionchess
	|*|
	|*|  The following code is released under the GNU Public License, version 3 or later.
	|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
	|*|
	\*/
	function relPathToAbs(sRelPath){
		var nUpLn,
			sDir = "",
			sPath = _location.pathname.replace(
				/[^\/]*$/,
				sRelPath.replace(/(\/|^)(?:\.?\/+)+/g, "$1")
			);
		for(
			var nEnd, nStart = 0;
			nEnd = sPath.indexOf("/../", nStart), nEnd > -1;
			nStart = nEnd + nUpLn
		){
			nUpLn = /^\/(?:\.\.\/)*/.exec(sPath.slice(nEnd))[0].length;
			sDir = (
				sDir
				+ sPath.substring(nStart, nEnd)
			).replace(
				new RegExp("(?:\\\/+[^\\\/]*){0," + ((nUpLn - 1) / 3) + "}$")
				, "/"
			);
		}
		return sDir + sPath.substr(nStart);
	}


	function showLoading(flg){
		_documentElement.classList[flg ? "add" : "remove"]("xsspa-loading");
	}
	function updateState(new_path, update_path){
		//console.log(new_path?"push":"replace", new_path, update_path);
		update_path = new_path ? new_path : path_current;
		if(loading)return;
		_history[new_path ? "pushState" : "replaceState"]({
			p: update_path,
			x: scrollBase.scrollLeft,
			y: scrollBase.scrollTop,
		}, null, update_path);
	}

	function loadPage(path_moveTo, state, isFromHistory){
		//eslint-disable-next-line no-param-reassign
		if(path_moveTo[0] !== "/"){
			path_moveTo = relPathToAbs(path_moveTo);
		}
		if(path_current === path_moveTo)return;
		//eslint-disable-next-line no-unused-expressions
		_window.stop && _window.stop();
		//人間が負担を感じない程早ければloading見せない
		var timer_showLoading = setTimeout(showLoading, 50, 1);
		if(xhr_agent){
			xhr_agent.abort();
		}
		xhr_agent = new XMLHttpRequest();
		var addr =
			path_moveTo
				.replace(/\/$/g, "/index")
				.replace(/\.html$/, "")
				.replace(/^[^?]+/, "$&.src.json");
		xhr_agent.open("GET", addr, true);
		xhr_agent.send();
		//xhr.on("load",function(){});
		//console.log(xhr.onload);
		xhr_agent.onload = function(){
			//console.log(xhr, xhr.status);
			if(xhr_agent.status >= 400){
				xhr_agent.onerror();
				return;
			}
			clearInterval(timer_showLoading);
			showLoading(0);
			loading = 0;
			
			content.innerHTML = decoder(xhr_agent.responseText);
			if(isFromHistory){
				scrollBase.scrollTop = state.y;
			}else{
				//updateState();
				updateState(path_moveTo);
				scrollBase.scrollTop = 0;
			}
			path_current = path_moveTo;
			xhr_agent = null;
			onAfterPageMoved();
		};
		xhr_agent.timeout = 5000;
		//xhr.on("error",function(e){});
		xhr_agent.ontimeout =
		xhr_agent.onerror = function(e){
			//console.log("load error", e);
			showLoading(0);
			location.href = path_moveTo;
			loading = 0;
		};
		loading = 1;
	}

	if(_history.pushState){
		_history.scrollRestoration = "manual";
		if(_history.state){
			scrollBase.scrollLeft = _history.state.x;
			scrollBase.scrollTop = _history.state.y;
		}
		//色々試した結果落ち着いたスクロール同期法がこれ。
		//若干キモいけどyahoo/fluxible.gitもこんな感じだし…
		//挙動いい感じにするにはこれしかないらしい(半ば諦め
		//なんかいい案あれば下さい
		//_windowAddEventListener("scroll", updateState);
		setInterval(updateState, 500);
		
		_windowAddEventListener("popstate", function(e){
			var state = e.state;
			if(state)loadPage(state.p, state, 1);
		}, false);
		
		_windowAddEventListener("click", function(e){
			if(e.button === 2 || e.ctrlKey || e.altKey || e.shiftKey)return;
			for(
				var href, target = e.target;
				target.parentNode !== null && target.parentNode !== target;
				target = target.parentNode
			){
				if(target.nodeName === "A"){
					href = target.getAttribute("href");
					if(href.match(/^(?:https?|mailto):/))href = null;
					break;
				}
			}
			if(href){
				e.preventDefault();
				loadPage(href);
				return false;
			}
		}, true);
	}
})();
