const { faker } = require("@faker-js/faker");

function generateEmail() {
  const firstName = faker.person.firstName().toLowerCase();
  const lastName = faker.person.lastName().toLowerCase();
  const randomNumber = Math.floor(Math.random() * 1000);
  return `${firstName}.${lastName}${randomNumber}@gmail.com`;
}

function generatorUsername() {
  const randomText = faker.string
    .alpha({ length: Math.floor(Math.random() * 4) + 4 })
    .toLowerCase();
  const randomNumber = Math.floor(Math.random() * 900) + 10;

  return `${randomText}${randomNumber}`;
}

module.exports = { generateEmail, generatorUsername };
