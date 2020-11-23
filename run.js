#!/usr/bin/env node

const ping = require('ping');
const chalk = require("chalk");

const hosts = ['1.1.1.1', '8.8.8.8'];
/**
 * @type {{[key: string]: Date}}
 */
let outages = {};

console.log(chalk.green("Starting"), chalk.blue((new Date()).toLocaleTimeString()));
console.log(...hosts.map(host => chalk.blue(host)));
console.log("");

setInterval(async () => {

    let line = "";


    for (const host of hosts) {

        try {

            const result = await ping.promise.probe(host, {
                timeout: 0.450
            });

            line += chalk.blue.bold(host) + chalk.grey(" - ") + chalk.green(result.time + "ms");

            if (outages[host]) {
                // calculate the outage time
                let elapsed = (new Date()).getTime() - outages[host].getTime();

                console.log("");
                console.log(chalk.blue(host), chalk.grey("out for"), chalk.red(Math.round(elapsed / 1000)), chalk.grey("seconds"));
                outages[host] = null;
            }

        } catch (err) {
            // ping failed
            if (!outages[host]) {
                outages[host] = new Date();
            }

            line += chalk.blue.bold(host) + chalk.grey(" - ") + chalk.red("Outage Started") + chalk.grey(" - ") + chalk.red(outages[host].toLocaleTimeString());

        }

        line += "  ";
    }

    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(line);
}, 1000);