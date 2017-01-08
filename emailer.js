'use strict';

const mailJet = require('node-mailjet');
const {logger} = require('./utilities/logger');
require('dotenv').config();


// stored in `.env` -- never store passwords, api keys
// etc. inside source code
const {MAILJET_KEY, MAILJET_SECRET, ALERT_FROM_EMAIL, ALERT_FROM_NAME} = process.env;

// we log some errors if these env vars aren't set
if (!(MAILJET_KEY && MAILJET_SECRET && ALERT_FROM_EMAIL && ALERT_FROM_NAME)) {
  logger.error('Missing required config var in `.env`');
  process.exit(1);
}

// send an email using Mailjet.
// `emailData` is an object
const sendEmail = (email, medication, callback) => {
  const mailer = mailJet.connect(MAILJET_KEY, MAILJET_SECRET);
  const emailData = {
      'FromEmail': ALERT_FROM_EMAIL,
      'FromName': ALERT_FROM_NAME,
      'Subject': `Medication Reminder`,
      'Text-part': `Remember to take your ${medication}`,
      'Recipients': [{'Email': email},]
    };
    // logger.info(emailData);
  mailer
    .post('send')
    .request(emailData)
    .then(() => logger.info(
      `SUCCESS: \`sendAlertEmail\` sent email`))
    .catch((e) => logger.error(`FAILURE: problem sending email. ${e.message}`));
};

module.exports = {sendEmail};