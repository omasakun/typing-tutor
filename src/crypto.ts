import * as cry from "crypto-js"
const PBKDF2_ITERATION_COUNT = 4096;
export function newSecret(): string {
	return cry.lib.WordArray.random(16).toString(cry.enc.Base64)
}
export function encrypt(secret: string, plain: string) {
	const salt = cry.lib.WordArray.random(16);
	const key = cry.PBKDF2(cry.enc.Base64.parse(secret), salt, { keySize: 32, iterations: PBKDF2_ITERATION_COUNT });
	const iv = cry.lib.WordArray.random(16);
	const initial_iv = cry.enc.Base64.stringify(iv);
	const options = { iv: iv, mode: cry.mode.CBC, padding: cry.pad.Pkcs7 };
	const enc_message = cry.AES.encrypt(cry.enc.Utf8.parse(plain), key, options);
	return [
		PBKDF2_ITERATION_COUNT,
		cry.enc.Base64.stringify(salt),
		initial_iv,
		enc_message.toString(),
	].join(":");
}
export function decrypt(secret: string, encrypted: string) {
	const [iterations, salt, iv, enc_message] = encrypted.split(":").map((v, i) => i == 0 ? v : cry.enc.Base64.parse(v));
	const options = { iv: iv, mode: cry.mode.CBC, padding: cry.pad.Pkcs7 };
	const key = cry.PBKDF2(cry.enc.Base64.parse(secret), salt, { keySize: 32, iterations });
	//@ts-ignore
	return cry.AES.decrypt({ ciphertext: enc_message }, key, options).toString(cry.enc.Utf8);
}