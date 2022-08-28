const emotion = require('./emotion');
const generate = require('./generate');
const fs = require('fs');

module.exports = {
  /** 
  * 好感度を更新
  * @param {number} negaposi
  * @param {string} user
  */
  async updateFavoRate(negaposi, user) {
    // aaaaa
    let users = (JSON.parse(fs.readFileSync(`${__dirname}/../users.db`)));

    if(!users.users[user]) {
      users.users[user] = {
        id: user,
        interested: [],
        recentNegaposi: [],
        favoRate: negaposi,
        last_seen: new Date()
      }
    }

    if( users.users[user].recentNegaposi.length > 10) users.users[user].recentNegaposi = [];
    users.users[user].recentNegaposi[users.users[user].recentNegaposi.length] = negaposi;

    let favoRate = users.users[user].recentNegaposi.reduce((sum, element) => {
      return sum + element;
    }, 0);


    users.users[user].favoRate = (Math.round(favoRate * 100) / 100) / users.users[user].recentNegaposi.length;
    users.users[user].last_seen = new Date();
    fs.writeFileSync(`${__dirname}/../users.db`, JSON.stringify(users, null, "\t"));
  },
  
  /** 
  * 好感度を取得
  * @param {string} user
  * @return {Promise<number>}
  */
  async getFavoRate(user) {
    let users = (JSON.parse(fs.readFileSync(`${__dirname}/../users.db`)));
    if(!users.users[user]) users.users[user].favoRate = 0;
    
    return users.users[user].favoRate;
  },
  
  async isQuestions(text) {
    let tokens = await generate.tokenize(text);
    let probabilityOfQuestion = -0.01;
    tokens.forEach((token, i) => {
      if(token.surface_form === '？') probabilityOfQuestion += 0.05;
      if(token.surface_form === '!？') probabilityOfQuestion += 0.01;
      if(tokens[i - 1]) {
        if(tokens[i - 1].surface_form.includes('なん')) probabilityOfQuestion += 0.05;
          if(tokens[i - 1].surface_form.includes('だい')) probabilityOfQuestion += 0.01;
        else if(tokens[i - 1].surface_form.includes('なの')) probabilityOfQuestion += 0.05;
        if(token.surface_form.includes('なんですか') && tokens[i - 1]) probabilityOfQuestion += 0.1;
        if(token.surface_form.includes('でしょうか') && tokens[i - 1]) probabilityOfQuestion += 0.1;
        if(token.surface_form.includes('なんやろ') && tokens[i - 1]) probabilityOfQuestion += 0.1;
      }
    });

    return probabilityOfQuestion;
  }
}