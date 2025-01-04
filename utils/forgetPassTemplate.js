const forgotPasswordEmailTemplate = (userName, resetLink) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: auto;
                background: white;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }
            h1 {
                color: #333;
            }
            p {
                font-size: 16px;
                line-height: 1.5;
                color: #555;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: #00FF00;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin-top: 20px;
            }
            .footer {
                margin-top: 20px;
                font-size: 12px;
                color: #aaa;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Hello, ${userName}</h1>
            <p>We received a request to reset your password. Click the button below to set a new password:</p>
            <a href="${resetLink}" class="button">Reset Password</a>
            <p>This link will expire in 3 hours.</p>
            <p>If you did not request this, please ignore this email.</p>
            <div class="footer">
                <p>Thank you,<br>Your Company Name</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = { forgotPasswordEmailTemplate };
