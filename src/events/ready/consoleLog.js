module.exports = (client) => {
  client.user.setActivity("I'm soulless");
  console.log(`${client.user.tag} is running!`);
};