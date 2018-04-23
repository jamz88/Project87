// Call Packages
const Discord = require('discord.js');
const db = require('quick.db');
const fs = require('fs'); // Make sure you call the fs package.
const tools = require('./functions.js');
const delay = require('delay');
const  ms = require('parse-ms');
// Load Chance
var Chance = require('chance');

// Instantiate Chance so it can be used
var chance = new Chance();
// Define client for Discord
const client = new Discord.Client();
// We have to define a moderator role, the name of a role you need to run certain commands
const modRole = 'Administrator';

//ping
const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);
//end ping

// JSON Files
//const items = JSON.parse(fs.readFileSync('items.json', 'utf8'));
// This will run when a message is recieved...
   client.on('message',async message => {

    // Variables
    let prefix = '~';
    let msg = message.content.toUpperCase();
    // Lets also add some new variables
    let cont = message.content.slice(prefix.length).split(" "); // This slices off the prefix, then stores everything after that in an array split by spaces.
    let args = cont.slice(1); // This removes the command part of the message, only leaving the words after it seperated by spaces

    // Commands

    // Buy Command - You can buy items with this.
    if (msg.startsWith(`${prefix}BUY`)) { // We need to make a JSON file that contains the items

        // Variables
        let categories = []; // Lets define categories as an empty array so we can add to it.

        // We want to make it so that if the item is not specified it shows a list of items
        if (!args.join(" ")) { // Run if no item specified...

            // First, we need to fetch all of the categories.
            for (var i in items) { // We can do this by creating a for loop.

                // Then, lets push the category to the array if it's not already in it.
                if (!categories.includes(items[i].type)) {
                    categories.push(items[i].type)
                }

            }

            // Now that we have the categories we can start the embed
            const embed = new Discord.RichEmbed()
                .setDescription(`Available Items`)
                .setColor(0xD4AF37)

            for (var i = 0; i < categories.length; i++) { // This runs off of how many categories there are. - MAKE SURE YOU DELETE THAT = IF YOU ADDED IT.

                var tempDesc = '';

                for (var c in items) { // This runs off of all commands
                    if (categories[i] === items[c].type) {

                        tempDesc += `${items[c].name} - $${items[c].price} - ${items[c].desc}\n`; // Remember that \n means newline

                    }

                }

                // Then after it adds all the items from that category, add it to the embed
                embed.addField(categories[i], tempDesc);

            }

            // Now we need to send the message, make sure it is out of the for loop.
            return message.channel.send({
                embed
            }); // Lets also return here.

            // Lets test it! x2

        }

        // Buying the item.

        // Item Info
        let itemName = '';
        let itemPrice = 0;
        let itemDesc = '';

        for (var i in items) { // Make sure you have the correct syntax for this.
            if (args.join(" ").trim().toUpperCase() === items[i].name.toUpperCase()) { // If item is found, run this...
                itemName = items[i].name;
                itemPrice = items[i].price;
                itemDesc = items[i].desc;
            }
        }

        // If the item wasn't found, itemName won't be defined
        if (itemName === '') {
            return message.channel.send(`**Item ${args.join(" ").trim()} not found.**`)
        }

        // Now, lets check if they have enough money.
        db.fetch(message.author.id + message.guild.id).then((i) => { // Lets fix a few errors - If you use the unique guild thing, do this.
            if (i.balance <= itemPrice) { // It's supposed to be like this instead...

                return message.channel.send(`**You don't have enough money for this item.**`);
            }

            // The broken item can be placed here

            // Variables - You want to set these up
            let breakChance = 15; // This is a precentage out of 100
            let refundAmount = 50; // This is a precentage out of 99 - You can't give a full refund because of the way the money is handled.
            let breakMessage = '**Your item was broken during transport!**';

            // These generate the scenario
            let broken = Math.floor(Math.random() * (100 - 1 + 1) + 1); // This generates a random number between 1 - 100

            if (broken <= breakChance) { // Run this if the item was broken...

                    db.set(message.author.id + message.guild.id, parseInt(`-${itemPrice}`) * `0.${refundAmount}`).then((i) => {  // This takes the item, multiples it by the refund amount percentage. So if an items was $100, 100 * .50 is 50.

                        // Send a message that their item was broken.
                        message.channel.send(breakMessage);

                    });

                    return; // Make sure we return when this is all over.

            }


            db.set(message.author.id + message.guild.id, parseInt(`-${itemPrice}`)).then((i) => {

                message.channel.send('**You bought ' + itemName + '!**');

                // You can have IF statements here to run something when they buy an item.
                if (itemName === 'Helper Role') {
                    message.guild.members.get(message.author.id).addRole(message.guild.roles.find("name", "Helper")); // For example, when they buy the helper role it will give them the helper role.
                }

            })

        })

    }

    // Ping - Let's create a quick command to make sure everything is working!
    if (message.content.toUpperCase() === `${prefix}PING`) {
        message.channel.send('Pong!');
    }

    if (msg.startsWith(`$GIVE`) && message.mentions.users.first().id === client.user.id)
    {
      let person = message.author;
      let str = JSON.stringify(message.content);
      let str2 = JSON.parse(str);
      let arr = str2.split(" ").map(function (val) {
      return String(val);
      });
      lastNum = arr[arr.length-1]
      console.log(lastNum);
      const filter = m => m.author.id === message.guild.members.find('id', '292953664492929025').user.id;
      message.channel.awaitMessages(filter, { max: 1, time: 60000, errors: ['time'] })
      .then(collected => {
        let botmessage = message.guild.members.find('id', '292953664492929025').user.lastMessage.embeds[0].description;
        console.log(botmessage);
        if(botmessage.indexOf(`<:check:338071972476878848>`) !== -1 && ('`[EcoBotto#7421]` has received your') !== -1 && botmessage.indexOf(lastNum) !== -1)
        {
          console.log(lastNum);
          message.channel.send(`$remove-money <@${client.user.id}> ${lastNum}`)
          db.add(`userBalance_${person.id}`, parseInt(lastNum));
        }
      })
      .catch(collected => console.log(`After a minute, no reply`));
      }


    /*if (msg.startsWith(`$GIVE`) && message.mentions.users.first().id === client.user.id)
    {
      const filter = m => m.content.indexOf('[EcoBotto#7421] has received your');
      channel.awaitMessages(filter, { max: 4, time: 60000, errors: ['time'] })
      .then(collected => console.log('done'))
      .catch(collected => console.log(`After a minute, no reply`));
    }*/

    if (msg.startsWith(`${prefix}TRANSFER`)) {

      if (!args[0]) {
          tools.embed(message.channel,`**You need to define an amount. Usage: ${prefix}transfer <amount> <currency>**`);
          return;
      }
      if (!args[1]) {
          tools.embed(message.channel,`**You need to input a currency. Usage: ${prefix}transfer <amount> <currency>**`);
          return;
      }
      if ((args[1]) == !`dollars` || !`crypto`) {
          tools.embed(message.channel,`**You need to input a currency. Usage: ${prefix}transfer <amount> <currency>**`);
          console.log((args[1]))
          return;
      }

      //make sure that args[0] is a number
      if (isNaN(args[0]) && (args[0]) != `all`) {
          tools.embed(message.channel,`**The amount has to be a number. Usage: ${prefix}transfer <amount> <currency>**`);
          return;
      }

    let currencySelection = `userBalance_`

    if ((args[1]) == `dollars`){
      currencySelection = `userBalance_`
    }

    if ((args[1]) == `crypto`){
      currencySelection = `userCrypto_`
    }

    let targetMember = message.author,
    amount = 0;

    if ((args[0]) != 'all') amount = parseInt(args[0]);

    let targetBalance = await db.fetch(`${currencySelection}${targetMember.id}`),
        startBalance = 0; // Starting Balance

    if ((args[0]) == 'all') amount = targetBalance;

    if (targetBalance === null) targetBalance = startBalance;

    if (amount > targetBalance) return tools.embed(message.channel, '**Sorry you don\'t have enough money.**');

    db.subtract(`${currencySelection}${message.author.id}`, amount);
    message.channel.send(`$add-money <@${message.author.id}> ${amount}`)


    tools.embed(message.channel, `**Successfully sent $${amount} to ${targetMember.username}!**`);


    }

    // Add / Remove Money For Admins
            if (msg.startsWith(`${prefix}ADDMONEY`)) {
            /*  if (!message.mentions.members.first()) return tools.embed(message.channel, '**Please mention a user!**');

        let targetMember = message.mentions.members.first(),
            amount = parseInt(args.join(' ').replace(targetMember, ''));

        if (isNaN(amount)) return tools.embed(message.channel, '**Please define an amount!**');

        db.set(`userBalance_${targetMember.id}`, amount);

        tools.embed(message.channel, `**Successfully credited $${amount} to ${targetMember.user.username}!**`);*/
        // Check if they have the modRole
        if (!message.member.roles.find("name", modRole)) { // Run if they dont have role...
            message.channel.send('**You need the role `' + modRole + '` to use this command...**');
            return;
        }

        // Check if they defined an amount
        if (!args[0]) {
            tools.embed(message.channel,`**You need to define an amount. Usage: ${prefix}addmoney <amount> <user>**`);
            return;
        }

        // We should also make sure that args[0] is a number
        if (isNaN(args[0])) {
            tools.embed(message.channel,`**The amount has to be a number. Usage: ${prefix}addmoney <amount> <user>**`);
            return; // Remember to return if you are sending an error message! So the rest of the code doesn't run.
        }

        // Check if they defined a user
        let defineduser = '';
        let definedusername = '';
        if (!args[1]) { // If they didn't define anyone, set it to their own.
            defineduser = message.author.id;
            definedusername = message.author;
        } else { // Run this if they did define someone...
            let firstMentioned = message.mentions.users.first();
            defineduser = firstMentioned.id;
            definedusername = firstMentioned;
        }

        // Finally, run this.. REMEMBER IF you are doing the guild-unique method, make sure you add the guild ID to the end,
        db.add(`userBalance_${defineduser}`, parseInt(args[0])).then((i) => { // AND MAKE SURE YOU ALWAYS PARSE THE NUMBER YOU ARE ADDING AS AN INTEGER
            tools.embed(message.channel,`**${definedusername} had ${args[0]} added/subtraction from their account.**`)
        });
    }

    if(client.on){
      let cooldown = 7.2e+6,
      amount = chance.floating({min: -0.11, max: 0.1})
      let globalCrypto = await db.fetch(`globalCrypto`);
      if (globalCrypto !== null && cooldown - (Date.now() - globalCrypto) > 0) {
      let timeObj = ms(cooldown - (Date.now() - globalCrypto));
      }
      else
      {
      db.set(`globalCrypto`, Date.now());
      db.add(`globalCryptoValue`, amount);
      if(await db.fetch(`globalCryptoValue`) < 0){
      db.set(`globalCryptoValue`, 0.01);
      }
      console.log(amount);
      message.guild.channels.get('436096749170327553').send(`**Current Crypto Multiplyer:** `+ await db.fetch(`globalCryptoValue`));
          }
      }

    if (msg.startsWith(`${prefix}CRYPTO`)){

      if (!(args[0])) {
          tools.embed(message.channel,`**You need to choose an operation. Usage: ${prefix}crypto [buy || sell || chkprice] <amount> {c}**`);
          return;
        }

      if ((args[0]) === !'chkprice' || !'buy' || !'sell') {
          tools.embed(message.channel,`**You need to choose an operation. Usage: ${prefix}crypto [buy || sell || chkprice] <amount> {c}**`);
          return;
        }

      if (!(args[1]) && (args[0]) !== 'chkprice') {
          tools.embed(message.channel,`**You need to define amount. Usage: ${prefix}crypto [buy || sell || chkprice] <amount> {c}**`);
          return;
        }

      if (isNaN(args[1]) && (args[0]) !== 'chkprice') {
          tools.embed(message.channel,`**Amount needs to be a number Usage: ${prefix}crypto [buy || sell || chkprice] <amount> {c}**`);
          return;
        }

        let targetMember = message.author,
        amount = parseFloat((args[1]));

        if(await db.fetch(`userCrypto_${targetMember.id}`) === null){
        db.set(`userCrypto_${targetMember.id}`, 0);
        }

        if(await db.fetch(`userBalance_${targetMember.id}`) === null){
        db.set(`userBalance_${targetMember.id}`, 0);
        }

        let userBalance = await db.fetch(`userBalance_${targetMember.id}`);

        let startBalance = 0, // Starting Balance
            cryptoMultiplyer = await db.fetch(`globalCryptoValue`)
            cryptoPrice = cryptoMultiplyer * 20000
            cost = cryptoPrice * amount

        switch (args[0])
        {
          case 'buy':
          if (userBalance === null) userBalance = startBalance;

          if (Math.ceil(cost) > userBalance) return tools.embed(message.channel, `**Sorry you don\'t have enough money. $: ${Math.ceil(cost)} required**`);

          db.subtract(`userBalance_${message.author.id}`,Math.ceil(cost));
          db.add(`userCrypto_${message.author.id}`, amount);


          tools.embed(message.channel, `**Successfully sent ${amount} to ${targetMember.username}!**`);

          break;
          case 'sell':
          if (userBalance === null) userBalance = startBalance;

          if (amount > userBalance) return tools.embed(message.channel, `**Sorry you don\'t have enough crypto. ${amount} required**`);

          db.subtract(`userCrypto_${message.author.id}`, amount);
          db.add(`userBalance_${message.author.id}`, Math.floor(cost));


          tools.embed(message.channel, `**Successfully sent $${cost} to ${targetMember.username}!**`);

          break;
          case 'chkprice':
          if((args[1]) && !(args[2]))
          {
            let amount2 = amount / cryptoPrice;
            tools.embed(message.channel, `**${targetMember.username} $${amount} = ${amount2} Crypto!**`)
          }
          else if ((args[1]) && (args[2]) === 'c')
          {
            let amount3 = amount * cryptoPrice;
            tools.embed(message.channel, `**${targetMember.username} ${amount} Crypto = $${amount3}!**`)
          }
          else
          {
            tools.embed(message.channel, `**${targetMember.username} 1 Crypto = $${cryptoPrice}!**`)
          }

          break;
        }

    }



    if (msg.startsWith(`${prefix}WORK`)){
            let cooldown = 420000, // 2 minutes
          amount = chance.integer({min: 20, max: 200});       // between 20 and 200

      let lastWork = await db.fetch(`lastWork_${message.author.id}`);
      if (lastWork !== null && cooldown - (Date.now() - lastWork) > 0) {
          let timeObj = ms(cooldown - (Date.now() - lastWork));

          const embed = new Discord.RichEmbed()
          .setTitle('ALREADY WORKED RECENTLY!')
          .setColor('#FFBA4A')
          .setDescription(`You've already Worked, come back in **${timeObj.minutes}m, ${timeObj.seconds}s**!`)
          message.channel.send(embed);

      } else {
          const embed = new Discord.RichEmbed()
          .addField('Work Collected', `You successfully collected \$${amount}!`)
          .setColor('#59FF4A')
          message.channel.send(embed);

          //VERIFY ACCOUNT OWNERSHIP
          if(await db.fetch(`userCrypto_${message.author.id}`) === null){
          db.set(`userCrypto_${message.author.id}`, 0);
          }

          if(await db.fetch(`userBalance_${message.author.id}`) === null){
          db.set(`userBalance_${message.author.id}`, 0);
          }
          //DONE VERIFICATION

          db.set(`lastWork_${message.author.id}`, Date.now());
          db.add(`userBalance_${message.author.id}`, amount);
              }
    }

    if (msg.startsWith(`${prefix}LYNCH`)){
            let cooldown = 120000, // 2 minutes
          amount = Math.floor(Math.random()*20+1);       // between 1 and 20

      let lastLynch = await db.fetch(`lastLynch_${message.author.id}`);
      if (lastLynch !== null && cooldown - (Date.now() - lastLynch) > 0) {
          let timeObj = ms(cooldown - (Date.now() - lastLynch));

          const embed = new Discord.RichEmbed()
          .setTitle('ALREADY LYNCHED AN APE RECENTLY!')
          .setColor('#FFBA4A')
          .setDescription(`You've already lynched an ape, come back in **${timeObj.minutes}m, ${timeObj.seconds}s**!`)
          message.channel.send(embed);

      } else {
          const embed = new Discord.RichEmbed()
          .addField('Lynch Collected', `You successfully collected \$${amount}!`)
          .setColor('#59FF4A')
          message.channel.send(embed);

          //VERIFY ACCOUNT OWNERSHIP
          if(await db.fetch(`userCrypto_${message.author.id}`) === null){
          db.set(`userCrypto_${message.author.id}`, 0);
          }

          if(await db.fetch(`userBalance_${message.author.id}`) === null){
          db.set(`userBalance_${message.author.id}`, 0);
          }
          //DONE VERIFICATION

          db.set(`lastLynch_${message.author.id}`, Date.now());
          db.add(`userBalance_${message.author.id}`, amount);
              }
    }

    if (msg.startsWith(`${prefix}ROBBANK`)){
            let cooldown = 6.048e+8, // 1 week
          amount = chance.integer({min: 10000, max: 100000}),  //between 10000 and 100000
          risk = chance.integer({min: 1, max: 70}); //between 1 and 70

      let lastRobbank = await db.fetch(`lastRobbank_${message.author.id}`);
      if (lastRobbank !== null && cooldown - (Date.now() - lastRobbank) > 0) {
          let timeObj = ms(cooldown - (Date.now() - lastRobbank));

          const embed = new Discord.RichEmbed()
          .setTitle('ALREADY COMITTED A ROBBERY RECENTLY!')
          .setColor('#FFBA4A')
          .setDescription(`You've already robbed a bank, come back in **${timeObj.days}d, ${timeObj.hours}h, ${timeObj.minutes}m, ${timeObj.seconds}s**!`)
          message.channel.send(embed);

      } else {
        if(risk === 5)
        {
          const embed = new Discord.RichEmbed()
          .addField('Bank Robbery Successful!', `You have collected \$${amount}!`)
          .setColor('#59FF4A')
          message.channel.send(embed);

          //VERIFY ACCOUNT OWNERSHIP
          if(await db.fetch(`userCrypto_${message.author.id}`) === null){
          db.set(`userCrypto_${message.author.id}`, 0);
          }

          if(await db.fetch(`userBalance_${message.author.id}`) === null){
          db.set(`userBalance_${message.author.id}`, 0);
          }
          //DONE VERIFICATION

          db.set(`lastRobbank_${message.author.id}`, Date.now());
          db.add(`userBalance_${message.author.id}`, amount);
        }
        else
        {
          let bal = await db.fetch(`userBalance_${message.author.id}`)
          let fine = Math.ceil(bal*chance.floating({min: 0.1, max: 0.2}));
          const embed = new Discord.RichEmbed()
          .addField('Bank Robbery Unsuccessful!', `You have been captured and charged $${fine}`)
          .setColor('#FF1616')
          message.channel.send(embed);

          db.subtract(`userBalance_${message.author.id}`, fine);
          db.set(`lastRobbank_${message.author.id}`, Date.now());
        }
      }
    }

    // Balance & Money
        if (msg.startsWith(`${prefix}MONEY`) || msg.startsWith(`${prefix}BAL`)) { // This will run if the message is either ~BALANCE or ~MONEY or ~BAL
          let user = message.mentions.users.first() || message.author;
          let balance = await db.fetch(`userBalance_${user.id}`);
          let crypto = await db.fetch(`userCrypto_${user.id}`);
          if (balance === null) balance = 0; // Starting Balance
          if (crypto === null) crypto = 0; // Starting Balance
          const embed = new Discord.RichEmbed()
          .setTitle('Bank')
          .setColor('#4AFF5F')
          .addField('Username', user.username, true)
          .addField('Dollars','$' + balance, true)
          .addField('Crypto', crypto, true)
          message.channel.send(embed)
          }

        if (msg.startsWith(`${prefix}PAY`))
        {
          if (!message.mentions.members.first()) return tools.embed(message.channel, '**Please mention a user!**');

          let targetMember = message.mentions.members.first(),
              amount = parseInt(args.join(' ').replace(targetMember, ''));

          if (isNaN(amount)) return tools.embed(message.channel, '**Please define an amount!**');

          let targetBalance = await db.fetch(`userBalance_${targetMember.id}`),
              selfBalance = await db.fetch(`userBalance_${message.author.id}`),
              startBalance = 0; // Starting Balance

          if (targetBalance === null) targetBalance = startBalance;
          if (selfBalance === null) selfBalance = startBalance;

          if (amount > selfBalance) return tools.embed(message.channel, '**Sorry you don\'t have enough money.**');

          //VERIFY ACCOUNT OWNERSHIP
          if(await db.fetch(`userCrypto_${message.author.id}`) === null){
          db.set(`userCrypto_${message.author.id}`, 0);
          }

          if(await db.fetch(`userBalance_${message.author.id}`) === null){
          db.set(`userBalance_${message.author.id}`, 0);
          }

          if(await db.fetch(`userCrypto_${targetMember.id}`) === null){
          db.set(`userCrypto_${message.author.id}`, 0);
          }

          if(await db.fetch(`userBalance_${targetMember.id}`) === null){
          db.set(`userBalance_${message.author.id}`, 0);
          }
          //DONE VERIFICATION

          db.add(`userBalance_${targetMember.id}`, amount);
          db.subtract(`userBalance_${message.author.id}`, amount);

          tools.embed(message.channel, `**Successfully sent $${amount} to ${targetMember.user.username}!**`);
          }

});

client.login(process.env.DISCORD_BOT_TOKEN);