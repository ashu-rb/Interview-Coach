// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejs
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey('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')

const fs = require("fs");

const attachment = fs.readFileSync("FeedbackReport-AayushPatel.pdf").toString("base64");

const msg = {
  to: 'aaryan2134@gmail.com', // Change to your recipient
  from: 'aaryan2134@gmail.com', // Change to your verified sender
  subject: 'Your Interview Feedback Report',
  text: 'Hi, Please find the attached report of your interview feedback.\n Name: Aayush Patel \n Role: Software Engineer\n Interview Date: 09/10/2022\n \n Regards, \n Your Interview Coach \n interview-coach.tech\n',
  attachments: [
    {
      content: attachment,
      filename: "FeedbackReport-AayushPatel.pdf",
      type: "application/pdf",
      disposition: "attachment"
    }
  ]
}
sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })