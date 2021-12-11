#!/usr/bin/env node
import { resolve, dirname } from "path";
import fs from "fs";
import path from "path";
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { killAll } from "./spawn";
import { LaunchConfig, RunConfig } from "./types";
import { run } from "./runner";

// Special care is needed to handle paths to various files (binaries, spec, config, etc...)
// The user passes the path to `config.json`, and we use that as the starting point for any other
// relative path. So the `config.json` file is what we will be our starting point.

yargs(hideBin(process.argv))
	.command('$0 [options] <config_file>', 'Launching Polkadot network locally', () => {}, argv => {
		const { verbose, config_file: configFile } = argv;
		const configPath = resolve(process.cwd(), configFile as string);
		const configDir = dirname(configPath);
		if (!fs.existsSync(configPath)) {
			console.error("Config file does not exist: ", configPath);
			process.exit();
		}

		const launchConfig: LaunchConfig = require(configPath);

		// runConfig initialization
		const runConfig: RunConfig = {
			verbose: verbose as number || 0,
			out: argv.out as string || process.cwd()
		};

		// folder creation. Creating the inner folder `./logs` also create the parent folder.
		const folderPath = path.resolve(runConfig.out, 'logs');
		try {
			createFolder(folderPath);
		} catch (err) {
			console.error(`Cannot create output folder at ${runConfig.out}. Err: ${(err as Error).toString()}`);
			process.exit();
		}

		// Run the main process
		run(configDir, launchConfig, runConfig);
	})
	.option('verbose', {
		alias: 'v',
		describe: 'Verbose logging',
		count: true
	})
	.option('out', {
		alias: 'o',
		describe: 'Folder that assets and logs output to',
		normalize: true
	})
	.option('help', {
		alias: 'h',
		describe: 'Show help',
		help: true
	})
	.argv;

// Kill all processes when exiting.
process.on("exit", function () {
	killAll();
});

// Handle ctrl+c to trigger `exit`.
process.on("SIGINT", function () {
	process.exit(2);
});

function createFolder(folderPath: string) {
	if (fs.existsSync(folderPath)) {
		// check if it is a directory
		if (!fs.lstatSync(folderPath).isDirectory()) {
			throw new Error(`\`${folderPath}\` exists but is not a folder.`);
		}
	} else {
		// Create the output folder
		fs.mkdirSync(folderPath, { recursive: true });
	}
}
