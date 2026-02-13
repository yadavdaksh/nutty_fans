
export function getOtpEmailTemplate(otp: string) {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify your Email</title>
    <!--[if mso]>
    <noscript>
    <xml>
    <o:OfficeDocumentSettings>
    <o:PixelsPerInch>96</o:PixelsPerInch>
    </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    </style>
    <style>
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f3f4f6; }
        a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
        div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
</head>
<body style="background-color: #f3f4f6; margin: 0; padding: 0;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" style="padding: 40px 10px 40px 10px;">
                <!-- Main Card -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    
                    <!-- Header with Gradient -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #9333ea 0%, #db2777 100%); padding: 40px 0;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                                        NuttyFans
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: rgba(255,255,255,0.9); font-size: 16px; margin-top: 5px;">
                                        Connect. Create. Earn.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td align="center" style="padding: 40px 40px 20px 40px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <div style="background-color: #f0fdf4; border-radius: 50%; width: 64px; height: 64px; text-align: center; line-height: 64px; display: inline-block;">
                                             <span style="font-size: 32px;">🛡️</span>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: #111827; font-size: 24px; font-weight: 700; margin: 0; padding-bottom: 16px;">
                                        Verification Code
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: #4b5563; font-size: 16px; line-height: 24px; padding-bottom: 32px;">
                                        Please use the verification code below to sign in. <br>
                                        This code is secure and expires in 10 minutes.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-bottom: 32px;">
                                        <table border="0" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px 40px;">
                                                    <span style="color: #9333ea; font-family: monospace; font-size: 42px; font-weight: 700; letter-spacing: 8px;">${otp}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="color: #6b7280; font-size: 14px; line-height: 20px; padding-bottom: 20px;">
                                        If you didn't request this email, you can safely ignore it. <br>
                                        Your account security is our priority.
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Divider -->
                    <tr>
                        <td align="center" style="padding: 0 40px;">
                            <div style="height: 1px; background-color: #e5e7eb; width: 100%;"></div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 30px 40px; background-color: #ffffff;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                <tr>
                                    <td align="center" style="color: #9ca3af; font-size: 12px; line-height: 18px;">
                                        &copy; ${currentYear} NuttyFans. All rights reserved.
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" style="padding-top: 10px;">
                                        <a href="#" style="color: #9333ea; font-size: 12px; text-decoration: none; font-weight: 500;">Privacy Policy</a>
                                        <span style="color: #d1d5db; margin: 0 10px;">|</span>
                                        <a href="#" style="color: #9333ea; font-size: 12px; text-decoration: none; font-weight: 500;">Terms of Service</a>
                                        <span style="color: #d1d5db; margin: 0 10px;">|</span>
                                        <a href="#" style="color: #9333ea; font-size: 12px; text-decoration: none; font-weight: 500;">Help Center</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <!-- Tagline Footer -->
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                    <tr>
                        <td align="center" style="padding: 20px 0; color: #9ca3af; font-size: 12px;">
                            Sent directly from the NuttyFans Platform.
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>
</html>
  `;
}
