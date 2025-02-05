const axios = require("axios");
const { logMessage } = require("../utils/logger");
const { getProxyAgent } = require("./proxy");
const Web3 = require("web3");
const UserAgent = require("user-agents");
const { generateEmail, generatorUsername } = require("../utils/generator");
const https = require("https");

class kaleidoReferral {
  constructor(refCode, proxy = null, currentNum, total) {
    this.refCode = refCode;
    this.proxy = proxy;
    this.axiosConfig = {
      ...(this.proxy && { httpsAgent: getProxyAgent(this.proxy) }),
      timeout: 120000,
      httpsAgent: new https.Agent({
        keepAlive: true,
        minVersion: "TLSv1.2",
        maxVersion: "TLSv1.3",
      }),
    };
    this.currentNum = currentNum;
    this.total = total;
    this.wallet = Web3.eth.accounts.create();
  }

  getWallet() {
    return this.wallet;
  }

  async makeRequest(method, url, config = {}, retries = 5) {
    for (let i = 0; i < retries; i++) {
      try {
        const userAgent = new UserAgent().toString();
        const headers = {
          "User-Agent": userAgent,
          "Content-Type": "application/json",
          Connection: "keep-alive",
          ...config.headers,
        };
        const response = await axios({
          method,
          url,
          ...this.axiosConfig,
          ...config,
          headers,
        });
        return response;
      } catch (error) {
        logMessage(
          this.currentNum,
          this.total,
          `Request failed: ${error.message}`,
          "error"
        );
        logMessage(
          this.currentNum,
          this.total,
          `Retrying... (${i + 1}/${retries})`,
          "warning"
        );
        await new Promise((resolve) => setTimeout(resolve, 12000));
      }
    }
    return null;
  }

  async checkRegister() {
    logMessage(
      this.currentNum,
      this.total,
      `Checking wallet: ${this.wallet.address}`,
      "process"
    );
    try {
      const response = await this.makeRequest(
        "GET",
        `https://kaleidofinance.xyz/api/testnet/check-registration?wallet=${this.wallet.address}`
      );

      if (response && response.data.isRegistered === false) {
        logMessage(
          this.currentNum,
          this.total,
          `Wallet available for registration`,
          "success"
        );
        return true;
      } else {
        return false;
      }
    } catch (error) {
      logMessage(this.currentNum, this.total, error.message, "error");
    }
  }

  async registerUser(email, xusername) {
    logMessage(this.currentNum, this.total, `Proccesing Register`, "process");
    const sendData = {
      email: email,
      walletAddress: this.wallet.address,
      socialTasks: {
        twitter: true,
        telegram: true,
        discord: true,
      },
      agreedToTerms: true,
      referralCode: "",
      referralCount: 0,
      referralBonus: 0,
      xUsername: xusername,
      referredBy: this.refCode,
    };

    try {
      const response = await this.makeRequest(
        "POST",
        `https://kaleidofinance.xyz/api/testnet/register`,
        {
          data: sendData,
        }
      );

      if (response && response.data.message === "Registration successful") {
        return response.data;
      }
      return false;
    } catch (error) {
      logMessage(this.currentNum, this.total, error, "error");
    }
  }

  async proccesingRegister() {
    try {
      const email = generateEmail();
      const xusername = generatorUsername();
      const checkFirst = await this.checkRegister();
      if (!checkFirst) {
        return false;
      }
      const register = await this.registerUser(email, xusername);
      if (!register) {
        return false;
      }
      return register;
    } catch (error) {
      logMessage(this.currentNum, this.total, error.message, "error");
      return false;
    }
  }
}

module.exports = kaleidoReferral;
