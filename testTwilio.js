require("dotenv").config();

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.api.accounts(process.env.TWILIO_ACCOUNT_SID)
.fetch()
.then(account => {
    console.log("Connected");
    console.log(account.friendlyName);
})
.catch(err => {
    console.log(err.code);
    console.log(err.message);
});