const { prompt, logMessage, rl } = require("./utils/logger");
const kaleidoReferral = require("./classes/kaleidoReferral");
const { getRandomProxy, loadProxies } = require("./classes/proxy");
const chalk = require("chalk");
const fs = require("fs");

async function main() {
  console.log(
    chalk.cyan(`
░█░█░█▀█░█░░░█▀▀░▀█▀░█▀▄░█▀█
░█▀▄░█▀█░█░░░█▀▀░░█░░█░█░█░█
░▀░▀░▀░▀░▀▀▀░▀▀▀░▀▀▀░▀▀░░▀▀▀
     By : El Puqus Airdrop
     github.com/ahlulmukh
  `)
  );

  const refCode = await prompt(chalk.yellow("Enter Referral Code: "));
  const count = parseInt(await prompt(chalk.yellow("How many do you want? ")));
  const proxiesLoaded = loadProxies();
  if (!proxiesLoaded) {
    logMessage(null, null, "No Proxy. Using default IP", "warning");
  }

  let successful = 0;
  const accountsKaleido = fs.createWriteStream("accounts.txt", { flags: "a" });
  let attempt = 1;

  try {
    while (successful < count) {
      console.log(chalk.white("-".repeat(85)));
      logMessage(
        successful + 1,
        count,
        `Processing register account`,
        "process"
      );

      const currentProxy = await getRandomProxy(successful + 1, count);
      const kaleido = new kaleidoReferral(
        refCode,
        currentProxy,
        successful + 1,
        count
      );

      try {
        const account = await kaleido.proccesingRegister();
        const wallet = kaleido.getWallet();

        if (account) {
          accountsKaleido.write(`Reff To: ${refCode}\n`);
          accountsKaleido.write(`Email: ${account.registration.email}\n`);
          accountsKaleido.write(`Address: ${wallet.address}\n`);
          accountsKaleido.write(`Private key: ${wallet.privateKey}\n`);
          accountsKaleido.write("-".repeat(85) + "\n");

          successful++;
          logMessage(
            successful,
            count,
            `Email : ${account.registration.email}`,
            "success"
          );
          logMessage(
            successful,
            count,
            `Address : ${wallet.address}`,
            "success"
          );
          logMessage(
            successful,
            count,
            `Private key : ${wallet.privateKey}`,
            "success"
          );
          logMessage(successful, count, `Reff To : ${refCode}`, "success");
          attempt = 1;
        } else {
          logMessage(
            successful + 1,
            count,
            "Register Account Failed, retrying...",
            "error"
          );
          attempt++;
        }
      } catch (error) {
        logMessage(
          successful + 1,
          count,
          `Error: ${error.message}, retrying...`,
          "error"
        );
        attempt++;
      }
    }
  } finally {
    accountsKaleido.end();

    console.log(chalk.magenta("\n[*] Dono bang!"));
    console.log(
      chalk.green(`[*] Account dono ${successful} dari ${count} akun`)
    );
    console.log(chalk.magenta("[*] Result in accounts.txt"));
    rl.close();
  }
}

main();
