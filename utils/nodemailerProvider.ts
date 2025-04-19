import nodemailer from 'nodemailer'
const transport = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_TO_EMAIL,
    pass: process.env.SMTP_TO_PASSWORD
  }
}

const transporter = nodemailer.createTransport(transport)
transporter.verify((error, success) => {
  if (error) {
    console.error(error)
  } else {
    console.log('Ready to send mail!')
  }
})

async function sendMail(mailOptions: any) {
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        reject(error)
      } else {
        resolve(info)
      }
    })
  })
}
export const NodeMailerProvider = {
  sendMail
}
