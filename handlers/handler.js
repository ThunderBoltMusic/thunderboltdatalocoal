const { glob } = require("glob");
const { promisify } = require("util");
const globPromise = promisify(glob);
const thunder = require("./Client");


module.exports = async (client) => {
 
  try {
    let arrayOfcommands = [];
    const commandFiles = await globPromise(
      `${process.cwd()}/Commands/Slash/**/*.js`
    );
    commandFiles.map((value) => {
      const file = require(value);
      const splitted = value.split("/");
      const directory = splitted[splitted.length - 2];
      const properties = { directory, ...file };
      client.commands.set(file.name, properties);
      arrayOfcommands.push(file);
    });

    client.on("ready", async () => {
      await client.application.commands.set(arrayOfcommands);
      
    });

    console.log(`${client.commands.size} Slash Commands Loaded`);
  } catch (e) {
    console.log(e);
  }

  
  try {
    const MessageCommadsFiles = await globPromise(
      `${process.cwd()}/Commands/Message/**/*.js`
    );
    MessageCommadsFiles.map((value) => {
      const file = require(value);
      const splitted = value.split("/");
      const directory = splitted[splitted.length - 2];
      const properties = { directory, ...file };
      client.mcommands.set(file.name, properties);
      if (file.aliases && Array.isArray(file.aliases))
        file.aliases.forEach((a) => client.aliases.set(a, file.name));
    });

    console.log(`${client.mcommands.size} Message Commands Loaded`);
  } catch (e) {
    console.log(e);
  }
 
  try {
    const eventFiles = await globPromise(`${process.cwd()}/events/*.js`);
    eventFiles.map((value) => require(value));
    console.log(`${eventFiles.length} Events Loaded`);
  } catch (e) {
    console.log(e);
  }
};
