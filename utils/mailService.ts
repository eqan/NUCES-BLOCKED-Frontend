import emailjs from 'emailjs-com'

export const sendMail = (
    userName: string,
    toEmail: string,
    toName: string,
    message: string
) => {
    emailjs
        .send(
            'service_j0q5w2d', // Replace with your service ID
            'template_cd8qn4s', // Replace with your template ID
            {
                from_name: userName,
                to_email: toEmail,
                to_name: toName,
                message: message,
            },
            'DgOS-LMG3_W6jujL0' // Replace with your user ID
        )
        .then(() => {
            console.log('Email sent successfully!')
        })
        .catch((error) => {
            console.error('Error sending email:', error)
        })
}
