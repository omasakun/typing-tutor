// メインスレッドで実行される処理を書きます。全てはここから実行されます。

import { render } from "preact";
import * as preact_devtools from "preact/debug";
import { App } from "./app";
import { isChrome, onDomLoad } from "./util";

// console.log(preact_devtools);

showConsoleBanner();
if (preact_devtools) console.log("preact devtools enabled"); // prevent tree shaking
render(App, document.getElementById("app")!);

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

