if(document.getElementById('history-container')){
    function append(parent, text) {
        if (typeof text === 'string') {
            var temp = document.createElement('div');
            temp.innerHTML = text;
            // 防止元素太多 进行提速
            var frag = document.createDocumentFragment();
            while (temp.firstChild) {
                frag.appendChild(temp.firstChild);
            }
            parent.appendChild(frag);
        }
        else {
            parent.appendChild(text);
        }
    }

    function history_get_data(){
        var myDate = new Date();
        var myMonth = myDate.getMonth() + 1;
        if (myMonth < 10) {
            getMonth = "0" + String(myMonth);
        } else {
            getMonth = String(myMonth);
        }
        var getDate = String(myDate.getDate());
        if (getDate < 10) {
            getDate = "0" + String(getDate);
        } else {
            getDate = String(getDate);
        }
        var getMonthDate = "S" + getMonth + getDate;
        return ["https://cdn.staticaly.com/gh/celestezj/Butterfly-card-history/master/baiduhistory/json/" + getMonth + ".json",getMonthDate]
    }
	
	function load_history_data_and_init_swiper(history_data, data){
		if (typeof(window.today_history_date) === "undefined" || typeof(window.today_history_data) === "undefined") {
			window.today_history_date = history_data;
			window.today_history_data = data;
		}
		console.log(data[history_data[1]])
        html_item =''
        for (var item of data[history_data[1]]){
            html_item += '<div class="swiper-slide history_slide"><span class="history_slide_time">A.D.' +
                item.year +'</span>' + '<span class="history_slide_link">'+ item.title +'</span></div>'

        }
        var history_container_wrapper = document.getElementById('history_container_wrapper')
        append(history_container_wrapper, html_item);
        var swiper_history = new Swiper('.history_swiper-container', {
            passiveListeners:true,
            spaceBetween: 30,
            effect: 'coverflow',
            coverflowEffect: {
                rotate: 30,
                slideShadows: false,
            },
            loop: true,
            direction: 'vertical',
            autoplay: {
                disableOnInteraction: true,
                delay:5000
            },

            mousewheel:false,
            // autoHeight: true,

        });

        var history_comtainer = document.getElementById('history-container');
        history_comtainer.onmouseenter = function () {
            swiper_history.autoplay.stop();
        };
        history_comtainer.onmouseleave = function () {
            swiper_history.autoplay.start();
        }
	}
	
	function loadDataPjaxScript(url, callback){
		var script = document.createElement("script");
		script.type = "text/javascript";
		script.setAttribute('data-pjax', '');
		script.src = url;
		document.body.appendChild(script);
		script.onload = function(e){
			if(e.readystate == "complete" ){
				callback();
			}
		}
	}
    if (typeof(window.loadingTodayHistoryTimer) !== 'undefined') {
		clearInterval(window.loadingTodayHistoryTimer);
		window.loadingTodayHistoryTimer = undefined;
		window.loadingTodayHistoryCounter = 0;
	}
	/* 由于加载顺序不当，此js可能在swiper.js加载完成前执行，导致找不到Swiper对象的错误
	   解决方案（找不到则延迟）：定时任务触发5次等待Swiper.js加载完成，否则动态创建Script标签加载Swiper.js，之
	   后定时任务再触发5次，若Swiper仍不存在，则清除定时器，Swiper(today_history)创建宣告失败
	   适用于_config.yaml中swiper.enable=true的场景，否则请将window.loadingTodayHistoryCounter === 5
	   处的loadDataPjaxScript()注释掉，避免重复加载swiper.bundle.js的可能。当前swiper.enable为true是因为
	   开启了首页轮播图功能，已经加载了swiper.js */
	window.loadingTodayHistoryTimer = setInterval(function(){
	if (typeof(Swiper) !== "undefined" || window.loadingTodayHistoryCounter >= 10) {
		clearInterval(window.loadingTodayHistoryTimer);
		window.loadingTodayHistoryTimer = undefined;
		window.loadingTodayHistoryCounter = 0;
		if (typeof(Swiper) !== "undefined") {
			if (typeof(window.today_history_date) === "undefined" || typeof(window.today_history_data) === "undefined") {
				var history_data = history_get_data()
				fetch(history_data[0]).then(data=>data.json()).then(data=>{
					load_history_data_and_init_swiper(history_data, data);
				})
			} else {
				load_history_data_and_init_swiper(window.today_history_date, window.today_history_data);
			}	
		} else {
			console.log("Swiper.js cannot be loaded, create Swiper(today_history) failed!");
		}
	} else {
		console.log('Swiper is undefined, waiting 1s(again) to init Swiper(today_history)');
		window.loadingTodayHistoryCounter += 1;
		if (window.loadingTodayHistoryCounter === 5) {
			console.log("Loading Swiper.js to create Swiper(today_history)...");
			loadDataPjaxScript("https://unpkg.com/swiper@9.3.2/swiper-bundle.min.js", function(){
				clearInterval(window.loadingTodayHistoryTimer);
				window.loadingTodayHistoryTimer = undefined;
				window.loadingTodayHistoryCounter = 0;
			});
		}
	}
	}, 1000);
}
