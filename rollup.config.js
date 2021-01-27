import { terser } from "rollup-plugin-terser";
import resolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import json from "@rollup/plugin-json";

const isProduction = process.env.NODE_ENV === "production";

export default {
	input: "src/app.js",
	plugins: [
		resolve(),
		serve(),
		livereload(),
		isProduction && terser(),
		json({ compact: true }),
	],
	output: {
		file: "build/bundle.js",
		format: "umd",
	},
};
