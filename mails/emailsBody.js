
export const verifAccountEmailBody = (username, secretCode) => {
  
    let verifyBody =
    `<body>
                <h1>Hi ${username},</h1>
                <p>your verification code is <h1>${secretCode}</h1></p>
    </body>`
    return verifyBody;
}
