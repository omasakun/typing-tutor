import { h, Fragment } from "preact";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "preact/hooks";

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

function Prompt() {
	return <Fragment>
		<div class="done"></div>
		<div class="in_progress">
			<div class="row">
				{
					"type this line to find out how fast you can type.".split("").map(k => <div class="letter">{k}</div>)
				}
			</div>
			<div class="row stat"> 20wpm 100%</div>
		</div>
	</Fragment>
}
function KeyboardKey(props: { key_type: string }) {
	return <div class={`keyboard_key ${props.key_type === " " ? "space_key" : ""}`}>
		<span>{props.key_type}</span>
	</div >
}
function Keyboard() {
	return <div class="keyboard">
		<div class="row">{"QWERTYUIOP".split("").map(k => <KeyboardKey key_type={k} />)}</div>
		<div class="row">{"ASDFGHJKL".split("").map(k => <KeyboardKey key_type={k} />)}</div>
		<div class="row">{"ZXCVBNM,.".split("").map(k => <KeyboardKey key_type={k} />)}</div>
		<div class="row"><KeyboardKey key_type=" " /></div>
	</div>
}

export const App = <Fragment>
	<h1 class="header jumbo_text">あなたに合わせる、Typing Tutor</h1>
	<Prompt />
	<Keyboard />
</Fragment>