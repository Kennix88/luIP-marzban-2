const crypto = require("crypto-js");
const { File } = require("../utils");
const { join } = require("path");
const fs = require("fs");
const { response } = require("./utils");
const DBSqlite3 = require("../db/DBSqlite3");

class Model {
  constructor() {
    this.usersCsvPath = join(__dirname, "../", "users.csv");
    this.usersJsonPath = join(__dirname, "../", "users.json");
  }

  token() {
    const expireAt =
      Date.now() + 1000 * 60 * 60 * 24 * +process.env.API_EXPIRE_TOKEN_AT;

    const token = crypto.AES.encrypt(
      JSON.stringify({
        expireAt,
      }),
      process.env.API_SECRET,
    ).toString();

    return response({
      data: { api_key: token },
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   * @property {string} limit
   *
   * @param {ApiAddDataType} data
   */

  add(data) {
    let file = new File().GetJsonFile(this.usersJsonPath);

    // file = file.split("\r\n").map((item) => item.split(","));

    console.log('add:file: ', file)

    if (file.some((item) => item[0] === data.email) === true)
      return response({
        error: {
          type: "DUPLICATE",
          reason: "This email already exists",
        },
      });

    // const dataToCsv = `${data.email},${data.limit}\r\n`;

    file.push([data.email, data.limit]);

    fs.writeFileSync(this.usersJsonPath, file);

    return response({
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   * @property {string} limit
   *
   * @param {ApiAddDataType} data
   */

  update(data) {
    let file = new File().GetJsonFile(this.usersJsonPath);

    // let emails = file
    //   .split("\r\n")
    //   .filter((item) => item.trim())
    //   .map((item) => [item.split(",")[0], item.split(",")[1]]);

    let check = false;
    for (const el of file) {
      if (el.includes(data.email))
      {check = true};
    }

    if (check === false)
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });

    file = file.map( el => {
      if (el.includes(data.email)) {
        return [data.email, data.limit]
      } else return el
    })

    fs.writeFileSync(this.usersJsonPath, file);

    return response({
      status: 1,
    });
  }

  /**
   * @typedef {Object} ApiAddDataType
   * @property {string} email
   *
   * @param {ApiAddDataType} data
   */
  delete(data) {
    let file = new File().GetCsvFile(this.usersJsonPath);

    // let emails = file.split("\r\n").filter((item) => item.trim());

    let check = false;
    for (const el of file) {
      if (el.includes(data.email))
      {check = true};
    }

    if (check === false)
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });

    file = file.filter( el => {
      if (el.includes(data.email))
      {
        return false;
      } else {return true}
    })

    fs.writeFileSync(this.usersJsonPath, file);

    return response({
      status: 1,
    });
  }

  async getUser(email) {
    const db = new DBSqlite3();

    let user = null;

    try {
      user = await db.read(email);
    } catch (e) {
      // console.error(e)
      return response({
        error: {
          type: "NOT_FOUND",
          reason: "This email does not exist",
        },
      });
    }

    return response({
      data: {
        email,
        ips: user.ips,
        connections: user.ips.length,
      },
      status: 1,
    });
  }

  clear() {
    fs.writeFileSync(this.usersJsonPath, "");

    return response({
      status: 1,
    });
  }
}

module.exports = Model;