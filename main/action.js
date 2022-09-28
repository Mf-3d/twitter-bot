const fs = require("fs");

module.exports = {
  /**
   * 好感度を更新
   * @param {number} negaposi
   * @param {string} user
   */
  async updateFavoRate(negaposi, user) {
    // aaaaa
    let users = JSON.parse(fs.readFileSync(`${__dirname}/../users.db`));

    if (!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: negaposi,
        last_seen: new Date(),
      };
    }

    if (users.users[user].recentNegaposi.length > 10)
      users.users[user].recentNegaposi = [];
    users.users[user].recentNegaposi[users.users[user].recentNegaposi.length] =
      negaposi;

    let favoRate = users.users[user].recentNegaposi.reduce((sum, element) => {
      return sum + element;
    }, 0);

    users.users[user].favoRate =
      Math.round(favoRate * 100) /
      100 /
      users.users[user].recentNegaposi.length;
    users.users[user].last_seen = new Date();
    fs.writeFileSync(
      `${__dirname}/../users.db`,
      JSON.stringify(users, null, "\t")
    );
  },

  /**
   * 好感度を取得
   * @param {string} user
   * @return {Promise<number>}
   */
  async getFavoRate(user) {
    let users = JSON.parse(fs.readFileSync(`${__dirname}/../users.db`));
    if (!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: 0,
        last_seen: new Date(),
      };
    }

    return users.users[user].favoRate;
  },

  async isQuestions(text) {
    const reg01 = /なんですか|でしょうか|なんやろ/g;
    const reg005 = /か/g;

    let tokens = await require("./generate").tokenize(text);
    
    let probabilityOfQuestion = -0.01;
    tokens.forEach((token, i) => {
      if (token.surface_form === "？") probabilityOfQuestion += 0.05;
      if (token.surface_form === "!？") probabilityOfQuestion += 0.01;
      const t = tokens[i - 1];
      if (t) {
        if (token.surface_form === "？" && t.surface_form.includes("（"))
          probabilityOfQuestion -= 0.06;
        if (t.surface_form.includes("なん")) probabilityOfQuestion += 0.05;
        if (t.surface_form.includes("だい")) probabilityOfQuestion += 0.01;
        else if (t.surface_form.includes("なの")) probabilityOfQuestion += 0.05;
        if (reg01.test(token.surface_form)) probabilityOfQuestion += 0.1;
        if (reg005.test(token.surface_form)) probabilityOfQuestion += 0.05;
      }
    });

    return probabilityOfQuestion;
  },

  async saveQueue(type, data) {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));

    queues.queues[queues.queues.length] = {
      type,
      data,
      addedDate: new Date(),
    };

    fs.writeFileSync(
      `${__dirname}/../queues.json`,
      JSON.stringify(queues, null, "\t")
    );

    return queues.queues.length - 1;
  },

  async getQueue() {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));

    return queues;
  },

  async deleteQueue(number) {
    let queues = JSON.parse(fs.readFileSync(`${__dirname}/../queues.json`));
    console.log(number);
    queues.queues.splice(number, 1);
    fs.writeFileSync(
      `${__dirname}/../queues.json`,
      JSON.stringify(queues, null, "\t")
    );
  },

  async getCharacter() {
    return JSON.parse(fs.readFileSync(`${__dirname}/../character.json`));
  },
};
