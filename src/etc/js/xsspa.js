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
			//eslint-disable-next-line no-param-reassign
			res = JSON.parse(res);
			if(res.title){
				_document.title = res.title + " - m98.be";
			}
			// eslint-disable-next-line no-undef
			return xste(res.template, res.data);
		}
		_document.title = "m98.be";
		return res;
	}
	//ページ移動後に発火
	//lazyloadとか発火させたければここに挿入
	function onAfterPageMoved(){
		// eslint-disable-next-line no-undef
		//if(_window.echo)echo.render();
	}
	
	function relPathToAbs(relative){
		var parts = relative.split("/"),
			stack =
				relative[0] === "/"
					? []
					: _location.pathname.replace(/\/[^\/]+$/, "")
						.split("/");
			
		for(var i = 0; i < parts.length; i++){
			if(parts[i] !== "."){
				if(parts[i] === ".."){
					stack.pop();
				}else{
					stack.push(parts[i]);
				}
			}
		}
		return stack.join("/")
			.replace(/\/\//g, "/");
	}


	function showLoading(flg){
		_documentElement.classList[flg ? "add" : "remove"]("xsspa-loading");
	}
	function updateState(new_path, update_path){
		//console.log(new_path?"push":"replace", new_path, update_path);
		//eslint-disable-next-line no-param-reassign
		update_path = new_path ? new_path : path_current;
		if(loading)return;
		_history[new_path ? "pushState" : "replaceState"]({
			//p: update_path,
			x: scrollBase.scrollLeft,
			y: scrollBase.scrollTop,
		}, null, update_path);
	}
	function updateScrollPosition(toTop){
		scrollBase.scrollLeft = toTop ? 0 : _history.state.x;
		scrollBase.scrollTop = toTop ? 0 : _history.state.y;
	}

	function loadPage(path_moveTo, state, isFromHistory){
		//eslint-disable-next-line no-param-reassign
		path_moveTo = relPathToAbs(path_moveTo);
		if(path_current === path_moveTo)return;
		
		//人間が負担を感じない程早ければloading見せない
		var timer_showLoading = setTimeout(showLoading, 50, 1);
		var addr =
			path_moveTo
				.replace(/\/$/g, "/index")
				.replace(/\.html$/, "")
				.replace(/^[^?]+/, "$&.src.json");
		
		function xhr_fallback(e){
			//console.log("load error", e);
			//showLoading(0);
			_location.href = path_moveTo;
			//loading = 0;
		}
		
		if(_window.stop)_window.stop();
		if(xhr_agent){
			xhr_agent.abort();
		}
		xhr_agent = new XMLHttpRequest();
		xhr_agent.open("GET", addr, true);
		xhr_agent.send();
		//xhr.on("load",function(){});
		xhr_agent.onload = function(){
			//console.log(xhr, xhr.status);
			if(xhr_agent.status >= 400){
				xhr_fallback();
				return;
			}
			clearInterval(timer_showLoading);
			showLoading(0);
			loading = 0;
			
			content.innerHTML = decoder(xhr_agent.responseText);
			updateScrollPosition(!state);
			if(!isFromHistory){
				updateState(path_moveTo);//pushState
			}
			path_current = path_moveTo;
			xhr_agent = null;
			onAfterPageMoved();
		};
		xhr_agent.timeout = 5000;
		//xhr.on("error",function(e){});
		xhr_agent.ontimeout =
		xhr_agent.onerror = xhr_fallback;
		loading = 1;
	}

	if(_history.pushState){
		_history.scrollRestoration = "manual";
		if(_history.state)updateScrollPosition();
		//色々試した結果落ち着いたスクロール同期法がこれ。
		//若干キモいけどyahoo/fluxible.gitもこんな感じだし…
		//挙動いい感じにするにはこれしかないらしい(半ば諦め
		//なんかいい案あれば下さい
		//_windowAddEventListener("scroll", updateState);
		setInterval(updateState, 500);
		
		_windowAddEventListener("popstate", function(e){
			loadPage(_location.pathname, e.state, 1);
		}, false);
		
		_windowAddEventListener("click", function(e){
			if(e.button === 2 || e.ctrlKey || e.altKey || e.shiftKey)return;
			for(
				var href, target = e.target;
				target.parentNode && target.parentNode !== target;
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
			}
		}, true);
	}
})();
