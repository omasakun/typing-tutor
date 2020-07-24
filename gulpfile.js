const path = require("path");
const { dest, parallel, series, src, watch } = require("gulp");
// const babel = require("gulp-babel"); // @babel/core, @babel/preset-env, gulp-babel
const bs = require("browser-sync").create();
const clean_css = require("gulp-clean-css");
const closure_compiler = require("google-closure-compiler").gulp();
const favicon = require("favicons").stream;
const fiber = require("fibers");
const filter = require('gulp-filter');
const image_min = require("gulp-imagemin");
const intermediate = require("gulp-intermediate");
const html_min = require("gulp-htmlmin");
const noop = require("through2").obj;
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const pug = require("gulp-pug");
const rollup = require("rollup").rollup;
const sass = require("gulp-sass");
const sourcemaps = require("gulp-sourcemaps");
const ts = require("gulp-typescript").createProject("tsconfig.json");
const trash = require("trash");
sass.compiler = require("sass")

/*
const browser_list = [
	"ios >= 8",
	"android >= 4.0",
	"> 3% in JP"
];
*/
const browser_list = ["defaults"];

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
const postcss_plugins = [
	require("postcss-assets")({ loadPaths: ["src/assets"] }), // TODO: optimizeされたリソースを使うべきかも
	require("css-declaration-sorter")({ order: "smacss" }),
	require("autoprefixer")({
		overrideBrowserslist: browser_list,
		cascade: false
	}),
];

const error2notify = () =>
	plumber({
		errorHandler: notify.onError("<%= error.message %>"),
	});
const bs_update = bs.stream;
const prod_only = (stream) => (is_prod ? stream : noop()); // 一部処理は、開発時には行わず、製品ビルドでのみ行う

const is_prod = process.argv.includes("--prod");
const dest_dir = ".tmp"; // output folder
const bs_port = 8137;
const bs_ui_port = 8138;


function task_copy() {
	return src(["src/**/*", "!src/**/*.+(ts|tsx|pug|sass|html|css)", "!src/favicon.*"], { base: "src" })
		.pipe(error2notify())
		.pipe(prod_only(image_min()))
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_html() {
	return src(["src/**/*.html"], { base: "src" })
		.pipe(error2notify())
		.pipe(prod_only(html_min({
			collapseWhitespace: true,
			caseSensitive: true,
		})))
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_css() {
	return src("src/**/*.css", { base: "src" })
		.pipe(error2notify())
		.pipe(postcss(postcss_plugins))
		.pipe(clean_css())
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_pug() {
	return src(["src/**/*.pug", "!**/_*.pug"], { base: "src" })
		.pipe(error2notify())
		.pipe(pug())
		.pipe(prod_only(html_min({
			collapseWhitespace: true,
			caseSensitive: true,
		})))
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_sass() {
	return src("src/**/*.sass", { base: "src" })
		.pipe(error2notify())
		.pipe(sass({ outputStyle: "compressed", fiber }))
		.pipe(postcss(postcss_plugins))
		.pipe(clean_css())
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
var rollup_cache;
function task_ts() {
	return src("src/**/*.+(ts|tsx)", { base: "src" })
		.pipe(error2notify())
		.pipe(sourcemaps.init())
		.pipe(ts())
		/*.pipe(prod_only(cache(
			babel({
				presets: [["@babel/preset-env", { "targets": { "browsers": browser_list } }]]
			}),
			{ name: "babel" }
		)))*/
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
									return path.relative(node_modules_dir, path.join(`${tempDir}/bundle`, relPath));
								} else {
									return path.join("src", path.relative("..", relPath));
								}
							},
						})
					)
					.then(() => done())
					.catch((err) => done(err));
			}
			)
		)
		.pipe(prod_only(
			sourcemaps.init({ loadMaps: true })
		))
		.pipe(prod_only(
			filter(["**", "!**/*.js.map"], { restore: false }) // remove sourcemap
		))
		.pipe(prod_only(
			closure_compiler({
				compilation_level: "SIMPLE", // ADVANCED
				language_in: "ECMASCRIPT_2019",
				language_out: "ECMASCRIPT_2017",
				js_output_file: './index.js',
				create_source_map: true,
				assume_function_wrapper: true,
			})
		))
		.pipe(prod_only(
			sourcemaps.write(".", { includeContent: true })
		))
		.pipe(dest(dest_dir))
		.pipe(bs_update());
}
function task_favicon() {
	return src("src/favicon.*")
		.pipe(error2notify())
		.pipe(
			favicon({
				logging: false,
				pipeHTML: false,
				replace: true,
				pixel_art: false,
				icons: {
					// Platform Options:
					// - offset - offset in percentage
					// - background:
					//   * false - use default
					//   * true - force use default, e.g. set background for Android icons
					//   * color - set background for the specified icons
					//   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
					//   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
					//   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
					android: true,
					appleIcon: true,
					appleStartup: true,
					coast: true,
					favicons: true,
					firefox: true,
					windows: true,
					yandex: true,
				},
			})
		)
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
	watch(["src/**/*", "!src/**/*.+(ts|tsx|pug|sass|html|css)", "!src/favicon.*"], task_copy);
	watch("src/**/*.html", task_html);
	watch("src/**/*.css", task_css);
	watch("src/**/*.pug", task_pug);
	watch("src/**/*.sass", task_sass);
	watch("src/**/*.+(ts|tsx)", task_ts);
	watch("src/favicon.*", task_favicon);
	done();
}

const task_build = series(
	task_clean,
	parallel(task_copy, task_html, task_css, task_pug, task_sass, task_ts, task_favicon)
);

exports.build = task_build;
exports.default = exports.watch = series(task_build, task_bs_start, task_watch);
