// メインスレッドで実行される処理を書きます。全てはここから実行されます。
import { PREVENT_TREESHAKING } from "./workaround-immer";
import { render } from "preact";
import * as preact_devtools from "preact/debug";
import { InitialApp } from "./app";
import { isChrome, onLoad, onDomLoad } from "./util";

if (PREVENT_TREESHAKING) console.log();

showConsoleBanner();
if (preact_devtools) console.log("preact devtools enabled"); // prevent tree shaking

onDomLoad(() => {
	hideLoadingView();
	// setTimeout(()=>hideLoadingView(), 10000) // for debug
	document.getElementById("about")?.classList.remove("none"); // TODO: index.css が読み込まれたあとじゃないと良くない
	render(InitialApp, document.getElementById("app")!);
});

function hideLoadingView() {
	window["on_app_loaded"] && window["on_app_loaded"]();
}

// Banner
function showConsoleBanner() {
	if (isChrome()) {
		console.log(
			"\n" +
			`%c %c Typing Tutor \n` +
			"%c %c GitHub: https://github.com/omasakun/typing-tutor\n" +
			"%c %c Enjoy!\n",
			"color: #130f40; background-color: #a799ef; line-height: 2;",
			"color: #ddd6ff; background-color: #524983; line-height: 2;",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"",
			"color: #130f40; background-color: #a799ef; line-height: 1.5;",
			"font-weight: bold"
		);
	} else {
		console.log(
			"\n" +
			`┃ ### Typing Tutor ### \n` +
			"┃ \n" +
			"┃ GitHub: https://github.com/omasakun/typing-tutor\n" +
			"┃ Enjoy!\n"
		);
	}
}

