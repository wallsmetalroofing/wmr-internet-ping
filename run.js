#!/usr/bin/env node

const ping = require('ping');
const chalk = require("chalk");

const myArgs = process.argv.slice(2);
if (myArgs[0] === "update") {

    const command = "npm i -g git+https://github.com/wallsmetalroofing/wmr-internet-ping";
    console.log(chalk.grey("> " + command));

    const {
        exec
    } = require("child_process");

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(stderr);
            return;
        }

        console.log(chalk.green("Updated"));
    });

} else {
    const hosts = myArgs.length ? myArgs : ['1.1.1.1', '8.8.8.8'];
    /**
     * @type {{[key: string]: Date}}
     */
    let outages = {};

    console.log(chalk.green("Starting"), chalk.blue((new Date()).toLocaleTimeString()));
    console.log(...hosts.map(host => chalk.blue(host)));
    console.log("");

    setInterval(async () => {

        const results = await Promise.all(hosts.map(async host => {
            try {

                const result = await ping.promise.probe(host, {
                    timeout: 0.8
                });

                if (!result.alive) {
                    throw new Error("Down");
                }


                if (outages[host]) {
                    // calculate the outage time
                    let elapsed = (new Date()).getTime() - outages[host].getTime();

                    console.log("");
                    console.log(chalk.blue(host), chalk.grey("out for"), chalk.red(Math.round(elapsed / 1000)), chalk.grey("seconds"));
                    outages[host] = null;
                }

                return chalk.blue.bold(host) + chalk.grey(" - ") + chalk.green(result.time + "ms");

            } catch (err) {
                // ping failed
                if (!outages[host]) {
                    outages[host] = new Date();
                }

                return chalk.blue.bold(host) + chalk.grey(" - ") + chalk.red("Outage Started") + chalk.grey(" - ") + chalk.red(outages[host].toLocaleTimeString());
            }
        }));

        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(results.join(" | "));
    }, 1000);

}