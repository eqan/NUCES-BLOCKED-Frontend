import emailjs from 'emailjs-com'
import {
    EMAIL_JS_SERVICE_ID,
    EMAIL_JS_TEMPLATE_ID,
    EMAIL_JS_USER_ID,
} from '../constants/env-variables'

export const sendMail = (
    userName: string,
    toEmail: string,
    toName: string,
    message: string
) => {
    emailjs
        .send(
            EMAIL_JS_SERVICE_ID, // Replace with your service ID
            EMAIL_JS_TEMPLATE_ID, // Replace with your template ID
            {
                from_name: userName,
                to_email: toEmail,
                to_name: toName,
                message: message,
            },
            EMAIL_JS_USER_ID
        )
        .then(() => {
            console.log('Email sent successfully!')
        })
        .catch((error) => {
            console.error('Error sending email:', error)
        })
}
