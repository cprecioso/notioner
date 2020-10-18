// @ts-check

import nodeResolve from "@rollup/plugin-node-resolve"
import ts from "@wessberg/rollup-plugin-ts"
import path from "path"
import pkg from "./package.json"

/** @type {typeof String.raw} */
const r = (...args) => path.resolve(__dirname, String.raw(...args))

const deps = [
  ...require("module").builtinModules,
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
]

export default /** @type {import("rollup").RollupOptions} */ ({
  input: r`src/index.ts`,
  output: [
    {
      dir: "dist",
      format: "esm",
      entryFileNames: "[name].mjs",
      sourcemap: true,
    },
    {
      dir: "dist",
      format: "cjs",
      entryFileNames: "[name].js",
      sourcemap: true,
    },
  ],
  plugins: [
    nodeResolve({ modulesOnly: true }),
    ts({ typescript: require("typescript") }),
  ],
  external: (id) => deps.some((dep) => id === dep || id.startsWith(id + "/")),
})
