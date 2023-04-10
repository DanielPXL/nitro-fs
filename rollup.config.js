import typescript from "@rollup/plugin-typescript";
import { nodeResolve } from "@rollup/plugin-node-resolve";

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: "src/index.ts",
	output: [
		{
			file: "dist/nitro-fs.js",
			format: "esm"
		}
	],
	plugins: [
		typescript({ tsconfig: "./tsconfig.json" }),
		nodeResolve()
	],
	cache: true,
	watch: {
		include: "src/**"
	}
};

export default config;