import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// rollup.config.js
/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
	input: "src/index.ts",
	output: [
		{
			file: "dist/nitro-fs.js",
			format: "esm",
			sourcemap: true
		}
	],
	plugins: [
		typescript({ useTsconfigDeclarationDir: true, sourceMap: false }),
		nodeResolve()
	],
	cache: true
};

export default config;