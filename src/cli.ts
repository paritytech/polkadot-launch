#!/usr/bin/env node

import { killAll } from "./spawn";
import { resolve, dirname } from "path";
import fs from "fs";
import { LaunchConfig } from "./types";
import { run } from "./runner";

function get_config(config_path: string): LaunchConfig {
	let config: LaunchConfig;
	if (config_path.endsWith('json') || config_path.endsWith('js') ) {
		config = require(config_path);
		return config;
	} else {
		console.error("Unsupported config extension...");
		process.exit();
	}
}

// Special care is needed to handle paths to various files (binaries, spec, config, etc...)
// The user passes the path to `config.json`, and we use that as the starting point for any other
// relative path. So the `config.json` file is what we will be our starting point.
const { argv } = require("yargs");

const config_file = argv._[0] ? argv._[0] : null;
if (!config_file) {
	console.error("Missing config file argument...");
	process.exit();
}
let config_path = resolve(process.cwd(), config_file);
let config_dir = dirname(config_path);
if (!fs.existsSync(config_path)) {
	console.error("Config file does not exist: ", config_path);
	process.exit();
}

let config: LaunchConfig = get_config(config_path);

// Kill all processes when exiting.
process.on("exit", function () {
	killAll();
});

// Handle ctrl+c to trigger `exit`.
process.on("SIGINT", function () {
	process.exit(2);
});

run(config_dir, config);
