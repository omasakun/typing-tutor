// わざわざファイルに分けるまでもない関数群

export function isChrome() {
	return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
}

export function onLoad(fn: () => any) {
	window.addEventListener("load", fn);
}
export function onDomLoad(fn: () => any) {
	window.addEventListener("DOMContentLoaded", fn);
}
export function onResize(fn: () => any) {
	window.addEventListener("resize", fn);
}
export function onAnim(fn: () => { continue: boolean }) {
	requestAnimationFrame(function tmp() {
		if (fn().continue) requestAnimationFrame(tmp);
	});
}

/** 静的型チェックでも実行時チェックでもエラーが出てくれるやつ */
export function neverHere(_: never) {
	throw "BUG!!!";
}

// 任意引数を実現する。例: (len?) => opt(10, len) と (len=10) => len がほぼ同じ
export function opt<T>(defaultValue: T, value?: T | undefined) {
	if (value === undefined) return defaultValue;
	return value;
}

/* https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types
Likewise, multiple candidates for the same type variable in contra-variant positions causes an intersection type to be inferred:

type Bar<T> = T extends { a: (x: infer U) => void, b: (x: infer U) => void } ? U : never;
type T20 = Bar<{ a: (x: string) => void, b: (x: string) => void }>;  // string
type T21 = Bar<{ a: (x: string) => void, b: (x: number) => void }>;  // string & number
*/
/** 複数の型のUnionをそれらのIntersectionを表す型へと変換する */
export type Union2Intersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// Nominal Typing
class BrandClass<Brand> {
	// @ts-ignore
	private brand: Brand;
}
/** Nominal Typing を実現するための型 */
export type Brand<T, Brand> = T & BrandClass<Brand>;

/** 任意個数の引数を受け取ってなにか値を返すかもしれない関数であって、何もしないやつ。イベントハンドラの初期値などに。 */
export function anyFn(...args: any[]): any {
	/* Do nothing */
}

export type DeepReadonly<T> =
	T extends (undefined | null | boolean | string | number | Function) ? T :
	T extends Map<infer K, infer V> ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>> :
	T extends Set<infer U> ? ReadonlySet<DeepReadonly<U>> :
	// T extends Array<infer U> ? ReadonlyArray<DeepReadonly<U>> : // (*1)
	{ readonly [P in keyof T]: DeepReadonly<T[P]>; };
/* (*1)
TS3.4 "Improvements for ReadonlyArray and readonly tuples" によって不要になった。むしろこれをなくしたおかげで、tupleをそのままreadonlyできるようになった。
ところで、Caveatsのところに、

> Despite its appearance, the readonly type modifier can only be used for syntax on array types and tuple types. It is not a general-purpose type operator.
> `let err2: readonly Array<boolean>; // error!`

って書いてあったんだが、`DeepReadonly<Array<boolean>>`が`readonly boolean[]`になったのは魔法（バグ/意図しない挙動）かな？自分にとっては嬉しい挙動だけど。
*/
