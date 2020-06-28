import { h, Fragment } from "preact";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "preact/hooks";
import { produce } from "immer";

/*
function Greetings(props: { name: string }) {
	return <Fragment>
		<p>Hello, {props.name}</p>
		<ol>
			{
				[1, 2, 3, 4, 5].map(v => <li>line {v}</li>)
			}
		</ol>
	</Fragment>
}

function Content() {
	const [value, setValue] = useState("omasakun");
	const inputE = useRef<HTMLInputElement>();
	const changeName = useCallback(() => {
		setValue(value + "-");
	}, [value]);
	const setName = useCallback(() => {
		setValue(inputE.current?.value || "");
	}, [])

	return <div>
		<h1>Header</h1>
		<input ref={inputE} value={value} onInput={setName} />
		<button onClick={changeName}>Modify</button>
		<Greetings name={value} />
		<Greetings name={value} />
		<Greetings name={value} />
	</div>
}
*/

function Letter(props: { letter: string, error: boolean, fade: number, y: number }) {
	const fade = Math.min(6, Math.max(0, 8 - props.fade));
	const fadeClass = fade === 6 ? "hidden" : fade === 0 ? "" : "fade-" + fade;
	const errorClass = props.error ? "error" : "";
	return <div class={`letter ${fadeClass} ${errorClass}`} style={`transform: translateY(${-1.8 * props.y}em)`}>{props.letter}</div>
}
function CursorRow(props: { pos: number }) {
	return <div class="row">
		<div class={`letter cursor`} style={`transform: translateX(${0.6 * props.pos}em)`}></div>
	</div>
}
function DoneBackground(props: { hidden: boolean }) {
	return <div class={`done ${props.hidden ? "hidden" : ""}`}></div>
}
const MAX_LETTERS_IN_ONE_PROMPT = 50;
function padding(s: string, pad: string, l: number) {
	const t = (pad.repeat(l) + s);
	return t.substr(t.length - l);
}
interface PromptLine {
	y: number,
	uuid: string,
	letters: {
		letter: string,
		error: boolean,
		time: number,
	}[],
	stats: { wpm: number, acc: number } | undefined,
}
interface PromptRowProps extends PromptLine {
	cursor: number
}
function PromptRow(props: PromptRowProps) {
	return <Fragment>
		<div class="row" key={"1" + props.uuid}>
			{
				props.letters.map((k, i) => {
					const tmp = props.cursor - i + (props.y + 1) * MAX_LETTERS_IN_ONE_PROMPT;
					return <Letter
						letter={k.letter}
						error={k.error}
						fade={tmp}
						y={Math.max(0, props.y) + (tmp > MAX_LETTERS_IN_ONE_PROMPT ? 1 : 0)} />
				})
			}
		</div>
		<div
			class={`row stat ${props.stats === undefined ? "hidden" : ""}`}
			style={`transform: translateY(${-1.8 * Math.max(0, props.y)}em)`}
			key={"2" + props.uuid}>
			<span>{props.stats === undefined ? "" : padding(props.stats.wpm.toFixed(0), " ", 3) + "wpm " + padding((props.stats.acc * 100).toFixed(0), " ", 3) + "%"}</span>
		</div>
	</Fragment>
}
function Prompt(props: { lines: PromptLine[], pos: number }) {
	return <div class="in_progress">
		<CursorRow pos={props.pos} />
		{
			props.lines.map(line => <PromptRow cursor={props.pos} letters={line.letters} stats={line.stats} y={line.y} uuid={line.uuid} />)
		}
	</div>
}
function Stats(props: { running: boolean, wpm: number | undefined, time: string, acc: number | undefined }) {
	const wpmClass = props.wpm === undefined ? "hidden" : "";
	const accClass = props.acc === undefined ? "hidden" : "";
	const wpm = props.wpm === undefined ? "" : padding(props.wpm.toFixed(0), " ", 3) + "wpm";
	const acc = props.acc === undefined ? "" : padding((props.acc * 100).toFixed(0), " ", 3) + "%";
	return <div class="stats">
		<div class={wpmClass}>{wpm}</div>
		<div class={props.running ? "running" : "resting"}>{props.time}</div>
		<div class={accClass}>{acc}</div>
	</div>
}
function KeyboardKey(props: { key_type: string, active: boolean }) {
	return <div class={`keyboard_key ${props.key_type === " " ? "space_key" : ""} ${props.active ? "active" : ""}`}>
		<span>{props.key_type}</span>
	</div >
}
function Keyboard(props: { active?: string, hidden: boolean }) {
	const active = props.active?.toUpperCase() || "";
	return <div class={`keyboard ${props.hidden ? "hidden" : ""}`}>
		<div class="row">{"QWERTYUIOP".split("").map(k => <KeyboardKey key_type={k} active={k === active} />)}</div>
		<div class="row">{"ASDFGHJKL".split("").map(k => <KeyboardKey key_type={k} active={k === active} />)}</div>
		<div class="row">{"ZXCVBNM,.".split("").map(k => <KeyboardKey key_type={k} active={k === active} />)}</div>
		<div class="row"><KeyboardKey key_type=" " active={" " === props.active} /></div>
	</div>
}
function JumboText(props: { hidden: boolean }) {
	// "Your Personalized Typing Tutor" をそれっぽく訳した。
	return <h1 class={`header jumbo_text ${props.hidden ? "hidden" : ""}`}>あなたに合わせる、Typing&nbsp;Tutor</h1>
}
enum AppState {
	before_playing,
	playing,
	resting,
}
interface AppProps {
	state: AppState,
	stats: { acc: number, wpm: number, time: string } | undefined,
	showKeyboard: boolean,
	pos: number,
	lines: PromptLine[],
}
function App(props: AppProps) {
	const stats = props.stats || { acc: undefined, wpm: undefined, time: "00:00" };
	return <Fragment>
		<JumboText hidden={props.state !== AppState.before_playing} />
		<DoneBackground hidden={props.state === AppState.before_playing} />
		<Prompt pos={props.pos} lines={props.lines} />
		<Stats running={props.state === AppState.playing} acc={stats.acc} time={props.state === AppState.before_playing ? "" : stats.time} wpm={stats.wpm} />
		<Keyboard active={props.lines[1].letters[props.pos].letter} hidden={!props.showKeyboard} />
		<div id="status"></div>
	</Fragment>
}
const initAppProps: AppProps = {
	pos: 0,
	showKeyboard: true,
	state: AppState.before_playing,
	stats: undefined,
	lines: [
		{
			letters: [],
			stats: undefined,
			y: -1,
			uuid: Math.random() + "",
		},
		{
			letters: string2letters("Type this line to find out how fast you can type."),
			stats: undefined,
			y: 0,
			uuid: Math.random() + "",
		}
	]
}
interface AppAction {
	key: string
}

function nextLine() {
	return makePracticeText();
}
function string2letters(text: string) {
	return text.split("").map(c => ({
		error: false,
		letter: c,
		time: 0,
	}))
}
const time_to_text = num => {
	if (num >= 0) {
		const zero_pad = str => {
			return `0${str}`.slice(-2)
		}
		const m = zero_pad(Math.floor(num % 36e5 / 6e4))
		const s = zero_pad(Math.floor(num % 6e4 / 1000))
		return `${m}:${s}`;
	} else
		return "-" + time_to_text(1000 - num); // TODO: time_to_text(-1000) が -00:00:02 になるけど誤差程度だからヨシ！
}

const texts = ["API", "CI", "CLI", "CPU", "CSS", "DNS", "DOM", "HTML", "HTTP", "HTTPS", "IDE", "IE", "IO", "IP", "JSON", "NFC", "OS", "RE", "RGB", "SDK", "SQL", "SSH", "SSL", "TLS", "UI", "URI", "URL", "VM", "WIP", "WWW", "XML", "abstract", "accept", "access", "accessibility", "accessible", "account", "activate", "active", "additional", "addr", "adjust", "admin", "administrator", "aggregate", "algorithm", "alias", "allocation", "allow", "alternative", "annotation", "anonymous", "app", "append", "applicable", "application", "apply", "archive", "argument", "array", "assert", "asset", "assign", "assignment", "associate", "async", "attach", "attribute", "audio", "auth", "authentication", "author", "authorize", "auto", "automatic", "automatically", "availability", "available", "avoid", "backup", "base", "batch", "binary", "bind", "bit", "blank", "block", "boolean", "boot", "brace", "bracket", "branch", "breakpoint", "browse", "browser", "buffer", "bug", "bump", "bundle", "byte", "cache", "calc", "calculate", "callback", "cancel", "capability", "capacity", "capture", "caret", "case", "cast", "cert", "certificate", "char", "character", "checkbox", "checkout", "choice", "clarify", "cleanup", "clear", "click", "client", "clipboard", "clone", "cloud", "cluster", "cmd", "code", "collapse", "collection", "column", "command", "commit", "communication", "compatibility", "compile", "completion", "component", "compress", "compute", "condition", "conditional", "config", "configuration", "configure", "confirm", "conflict", "conn", "connect", "connection", "console", "constant", "constraint", "construct", "constructor", "contact", "contain", "container", "content", "context", "continue", "contribute", "control", "convert", "cookie", "coordinate", "copyright", "core", "correctly", "count", "crash", "credential", "ctrl", "cur", "current", "cursor", "custom", "customize", "damage", "dashboard", "data", "database", "db", "debug", "default", "define", "delete", "deps", "dest", "destroy", "determine", "dev", "develop", "developer", "development", "device", "dialog", "dict", "diff", "dir", "directory", "disk", "dist", "document", "documentation", "domain", "download", "driver", "dropdown", "edit", "editor", "element", "empty", "enter", "entry", "enum", "env", "environment", "equal", "err", "error", "except", "exception", "exec", "exist", "exit", "expand", "expected", "export", "express", "expression", "fail", "feature", "field", "file", "filter", "fix", "flag", "fn", "folder", "following", "font", "force", "format", "function", "gen", "general", "generate", "global", "graphic", "guide", "hardware", "height", "hide", "highlight", "host", "icon", "id", "idx", "ignore", "image", "impl", "import", "include", "index", "indicate", "info", "init", "input", "install", "installer", "instance", "instruction", "int", "integer", "interface", "issue", "item", "join", "key", "label", "latest", "layer", "layout", "length", "level", "lib", "library", "license", "limit", "link", "local", "location", "lock", "log", "login", "loop", "manage", "manager", "max", "media", "memory", "merge", "method", "min", "missing", "mode", "module", "network", "node", "none", "normal", "note", "notice", "null", "num", "obj", "op", "pos", "prev", "query", "queue", "regex", "req", "ret", "spec", "src", "str", "sync", "usr", "val", "visit", "zip"];

const nGram = 3;
var chars: {
	text: string;
	fail: number;
	pass: number;
	time: {
		count: number;
		time: number;
	};
	wordID: [number, number][];
	count: number;
	freq: number;
	score: undefined | number;
}[] = [];
{
	let tmp = new Map<string, Map<number, number>>();
	texts.forEach((word, index) => {
		for (var i = 0; i < word.length; i++) {
			for (var j = 1; j <= nGram; j++) {
				if (i + j - 1 >= word.length) break; // Out of array
				let text = word.substr(i, j);
				let item = tmp.get(text);
				if (!item) { // undefined
					tmp.set(text, new Map([
						[index, 1]
					]));
				} else {
					item.set(index, (item.get(index) || 0) + 1);
				}
			}
		}
	});
	let maxFreq = 0;
	tmp.forEach((item, key) => {
		let count = 0;
		let wordID: [number, number][] = [];
		item.forEach((value, key) => {
			wordID.push([key, value]);
			count += value;
		});
		let freq = Math.pow(count, key.length); //TODO
		maxFreq = Math.max(maxFreq, freq);
		chars.push({
			text: key,
			fail: 0,
			pass: 0,
			time: {
				count: 0,
				time: 0
			},
			wordID: wordID,
			count: count,
			freq: freq,
			score: undefined
		});
	});
	chars.forEach((item) => item.freq = item.freq / maxFreq);
}
function loadTypeResult(queue) {
	for (var i = Math.max(0, queue.length - nGram); i < queue.length; i++) {
		var items = queue.slice(i, queue.length);
		var text = items.map((v) => v.key).join("");
		var ID = chars.findIndex((v) => v.text == text);
		if (ID < 0) continue;
		if (items.findIndex((v) => !v.time || v.time <= 0) < 0) {
			chars[ID].time.count++;
			chars[ID].time.time += items.reduce((pv, v) => pv + v.time, 0);
		}
		if (items.findIndex((v) => !v.correct) < 0) chars[ID].pass++;
		else chars[ID].fail++;
		chars[ID].score = undefined;
	}
}
function loadTypeResults(queue) {
	let tmp: any[] = [];
	for (var i = 0; i < queue.length; i++) {
		tmp.push(queue[i]);
		loadTypeResult(tmp);
	}
}
function makeQuestions(resultCount) {
	chars.forEach((item) => {
		var acc = item.pass / (item.fail + item.pass + 1);
		var time = ((item.time.time + 1) / item.time.count);
		item.score = time / acc; // 大きいと、やるべき (TODO: freqを無視している)
	});
	chars.sort((a, b) => b.score != a.score ? b.score! - a.score! : b.freq - a.freq); // やるべきものが、先頭に来る
	return chars.slice(0, resultCount).map((v) => {
		var index = (v.wordID.reduce((pv, v) => pv + v[1], 0) * Math.random()) << 0;
		return texts[v.wordID[v.wordID.findIndex((vv) => {
			index -= vv[1];
			return index < 0;
		})][0]];
	});
}
function makePracticeText() {
	var len = 50;
	let k = makeQuestions(len).sort();
	return shuffle(sliceLength(k.filter((v, i) => i === k.findIndex(vv => v === vv)), len)).join(" ");
}
function sliceLength(texts, len) {
	const t: any[] = [];
	for (let i = 0; i < texts.length; i++) {
		if (len > texts[i].length + 1) {
			t.push(texts[i]);
			len -= texts[i].length + 1;
		}
	}
	return t;
}
function shuffle(array) {
	var n = array.length, t, i;

	while (n) {
		i = (Math.random() * n--) << 0;
		t = array[n];
		array[n] = array[i];
		array[i] = t;
	}

	return array;
}
const statusCount = 5;
function status() {
	var completeCounts: number[] = [];
	for (i = 0; i < statusCount; i++) completeCounts.push(0);
	chars.forEach((v) => {
		if (v.pass != 0 && v.time.count != 0) {
			if (v.pass - 1 < completeCounts.length)
				completeCounts[v.pass - 1]++;
			else
				completeCounts[completeCounts.length - 1]++;
		}
	});
	var status = "";
	for (var i = completeCounts.length - 1; i >= 0; i--) {
		if (i > 0) completeCounts[i - 1] += completeCounts[i];
		if (completeCounts[i] != chars.length)
			status = ((completeCounts[i] / chars.length * 1000) << 0) / 10 + "% " + status;
		else
			status = "Fin " + status;
	}
	return status;
}

var pvTime = -Infinity; // TODO: ちゃんとやる
var startTime = -Infinity;
var pvKeyTime = -Infinity;
var latestErrors: boolean[] = [];
var latestTimes: number[] = [];
var queue2Analysis: {
	key: string;
	correct: boolean;
	time: number | undefined;
}[] = [];
const MAX_INTERVAL = 5000;

function reducer(props: AppProps, action: AppAction) {
	return produce(props, props => {
		if (action.key === "") {
			if (props.state !== AppState.before_playing) {
				if (props.stats && props.state === AppState.playing) props.stats.time = time_to_text((performance.now() - startTime));
				if (performance.now() - pvKeyTime > MAX_INTERVAL || props.state === AppState.resting) {
					props.state = AppState.resting;
					pvKeyTime = performance.now();
					startTime = performance.now();
				}
			} else {
				startTime = performance.now();
			}
		} else {
			props.state = AppState.playing;
			pvKeyTime = performance.now();
			if (action.key !== props.lines[1].letters[props.pos].letter) {
				props.lines[1].letters[props.pos].error = true;
				pvTime = -Infinity;
			} else {
				const letter = props.lines[1].letters[props.pos];
				letter.time = performance.now() - pvTime;
				pvTime = performance.now();
				latestErrors.push(letter.error);
				latestTimes.push(letter.time);


				const item = {
					key: action.key.toLowerCase(),
					correct: !letter.error,
					time: isFinite(letter.time) ? letter.time : undefined,
				};
				queue2Analysis.push(item);
				loadTypeResult(queue2Analysis);

				if (latestErrors.length > 100) {
					latestErrors.shift();
					latestTimes.shift();
				}
				props.stats = {
					acc: latestErrors.filter(v => !v).length / latestErrors.length,
					wpm: 60000 / latestTimes.reduce((pv, cv) => pv + (Number.isFinite(cv) ? cv : 0), 0) * latestTimes.filter(v => Number.isFinite(v)).length,
					time: time_to_text((performance.now() - startTime)),
				}
				props.pos++;
				if (props.lines[0].letters.length === 0) {
					props.lines[0] = {
						letters: string2letters(nextLine()),
						stats: undefined,
						y: -1,
						uuid: Math.random() + "",
					}
				}
				if (props.pos >= props.lines[1].letters.length) {
					props.pos = 0;
					props.lines.forEach(line => line.y++);
					const l1 = props.lines[1];
					l1.stats = {
						acc: l1.letters.filter(v => !v.error).length / l1.letters.length,
						wpm: 60000 / l1.letters.reduce((pv, cv) => pv + (Number.isFinite(cv.time) ? cv.time : 0), 0) * l1.letters.filter(v => Number.isFinite(v.time)).length,
					}
					props.lines.unshift({
						letters: string2letters(nextLine()),
						stats: undefined,
						y: -1,
						uuid: Math.random() + "",
					})
					props.lines = props.lines.filter(l => l.y < 10);
					queue2Analysis = [];
					document.getElementById("status")!.textContent = (status());
				}
			}
		}
	})
}
function AppContainer() {
	const [props, dispatch] = useReducer<AppProps, AppAction>(reducer, initAppProps);

	const onKey = (e: KeyboardEvent) => {
		if (e.key.length > 1) return;
		dispatch({ key: e.key });
		e.preventDefault();
	}
	const onTime = () => {
		dispatch({ key: "" });
	}

	useEffect(() => {
		window.addEventListener('keypress', onKey);
		return () => window.removeEventListener('keypress', onKey);
	}, [props.pos]);

	useEffect(() => {
		setInterval(onTime, 100);
	}, [props.pos]);

	return <App lines={props.lines} pos={props.pos} showKeyboard={props.showKeyboard} state={props.state} stats={props.stats} />
}

export const InitialApp = <AppContainer />