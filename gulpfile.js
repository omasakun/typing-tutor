const path = require("path");
const { dest, parallel, series, src, watch } = require("gulp");
const bs = require("browser-sync").create();
const intermediate = require("gulp-intermediate");
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const sourcemaps = require("gulp-sourcemaps");
const rollup = require("rollup").rollup;
const ts = require("gulp-typescript").createProject("tsconfig.json");
const trash = require("trash");

const node_modules_dir = __dirname;
const rollup_plugins = [
	require("@rollup/plugin-node-resolve").default({
		customResolveOptions: {
			basedir: node_modules_dir
		}
	}),
	require("@rollup/plugin-commonjs")(),
	require("rollup-plugin-sourcemaps")(),
];

const error2notify = () =>
	plumber({ errorHandler: notify.onError("<%= error.message %>") });
const bs_update = bs.stream;

// const is_prod = process.argv.includes("--prod");
const dest_dir = ".tmp"; // output folder
const bs_port = 8137;
const bs_ui_port = 8138;

var rollup_cache;
function task_ts() {
	return src("src/**/*.+(ts|tsx)", { base: "src" })
		.pipe(error2notify())
		.pipe(sourcemaps.init())
		.pipe(ts())
		.pipe(sourcemaps.write({ includeContent: true }))
		.pipe(
			intermediate({ output: "bundle" }, (tempDir, done) => {
				rollup({
					input: `${tempDir}/index.js`,
					treeshake: true,
					plugins: rollup_plugins,
					cache: rollup_cache,
				})
					.then((bundle) =>
						bundle.write({
							file: `${tempDir}/bundle/index.js`,
							format: "iife",
							name: "index_js",
							sourcemap: true, // "inline",
							sourcemapPathTransform: relPath => {
								if (relPath.startsWith("../../")) { // "../index.ts" がエントリーポイント。その上位階層へのパスということは、srcの外部のファイル
									return path.relative(node_modules_dir, path.join(`${tempDir}/bundle`, relPath))
								} else {
									return path.join("src", path.relative("..", relPath))
								}
							},
						})
					)
					.then(() => done())
					.catch((err) => done(err));
			})
		)
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_copy() {
	return src(["src/**/*", "!src/**/*.+(ts|tsx)"], { base: "src" })
		.pipe(error2notify())
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_clean() {
	return trash([dest_dir, ".tmp"]);
}
function task_bs_start(done) {
	bs.init({
		server: dest_dir,
		port: bs_port,
		ui: { port: bs_ui_port },
		// https: true,
		logPrefix: "BrowserSync",
		logFileChanges: false,
		cors: false,
		notify: false,
		open: false,
		reloadDebounce: 300, // TODO: ちゃんとした値にする
	});
	done();
}
function task_watch(done) {
	watch("src/**/*.+(ts|tsx)", task_ts);
	watch(["src/**/*", "!src/**/*.+(ts|tsx)"], task_copy);
	done();
}
const task_build = series(task_clean, parallel(task_ts, task_copy));

exports.build = task_build;
exports.default = exports.watch = series(task_build, task_bs_start, task_watch);
