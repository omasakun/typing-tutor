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



function App() {
	return <Fragment>
		<h1 class="head">Typing Tutor</h1>
		<p class="desc">タイピングを効率的に身につける</p>
	</Fragment>
}

export const InitialApp = <App />