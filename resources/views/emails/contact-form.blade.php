<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f0fdfb;
            color: #164E63;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f0fdfb;
            padding: 24px 16px;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .header {
            background-color: #164E63;
            padding: 32px 40px 28px;
            text-align: center;
        }
        .header-logo {
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: -0.3px;
            margin-bottom: 4px;
        }
        .header-sub {
            font-size: 13px;
            color: #99f6e4;
            font-weight: 400;
        }
        .header h1 {
            font-size: 20px;
            font-weight: 600;
            color: #ffffff;
            margin-top: 16px;
            letter-spacing: -0.2px;
        }
        .header p {
            font-size: 14px;
            color: #cffafe;
            margin-top: 4px;
        }
        .body-content {
            padding: 32px 40px;
        }
        .section-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #94a3b8;
            margin-bottom: 16px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
        }
        .info-table td {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
        }
        .info-table .label {
            width: 100px;
            font-size: 13px;
            font-weight: 600;
            color: #64748b;
            padding-right: 16px;
        }
        .info-table .value {
            font-size: 15px;
            color: #164E63;
        }
        .info-table tr:last-child td {
            border-bottom: none;
        }
        .message-section {
            margin-top: 28px;
            background-color: #f0fdfb;
            border-left: 4px solid #0891B2;
            border-radius: 0 10px 10px 0;
            padding: 20px 24px;
        }
        .message-label {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #0891B2;
            margin-bottom: 8px;
        }
        .message-content {
            font-size: 15px;
            line-height: 1.7;
            color: #164E63;
            white-space: pre-line;
        }
        .reply-section {
            margin-top: 28px;
            padding: 20px 24px;
            background-color: #f8fafc;
            border-radius: 10px;
            text-align: center;
        }
        .reply-section p {
            font-size: 14px;
            color: #475569;
        }
        .reply-section strong {
            color: #0891B2;
        }
        .footer {
            padding: 24px 40px 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer-logo {
            font-size: 16px;
            font-weight: 700;
            color: #164E63;
            letter-spacing: -0.2px;
            margin-bottom: 4px;
        }
        .footer p {
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.8;
        }
        .footer a {
            color: #0891B2;
            text-decoration: none;
        }
        .phone-missing {
            color: #94a3b8;
            font-style: italic;
        }
        @media screen and (max-width: 600px) {
            .wrapper { padding: 12px 8px; }
            .container { border-radius: 12px; }
            .header { padding: 24px 20px 20px; }
            .header h1 { font-size: 18px; }
            .body-content { padding: 24px 20px; }
            .info-table .label { width: 80px; font-size: 12px; }
            .info-table .value { font-size: 14px; }
            .message-section { padding: 16px 18px; }
            .reply-section { padding: 16px 18px; }
            .footer { padding: 20px 20px 24px; }
        }
        @media (prefers-reduced-motion: reduce) {
            * { animation: none !important; transition: none !important; }
        }
    </style>
</head>
<body>
    <table class="wrapper" role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
            <td align="center">
                <table class="container" role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <div class="header-logo">NutriBantay</div>
                            <div class="header-sub">Barangay Health Center</div>
                            <h1>New Contact Form Submission</h1>
                            <p>Someone has reached out through the website contact form</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td class="body-content">
                            <div class="section-label">Sender Information</div>

                            <table class="info-table" role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                                <tr>
                                    <td class="label">From</td>
                                    <td class="value">{{ $name }}</td>
                                </tr>
                                <tr>
                                    <td class="label">Email</td>
                                    <td class="value"><a href="mailto:{{ $email }}" style="color:#0891B2;text-decoration:none;font-weight:500;">{{ $email }}</a></td>
                                </tr>
                                <tr>
                                    <td class="label">Phone</td>
                                    <td class="value">
                                        @if($phone && $phone !== 'Not provided')
                                            <a href="tel:{{ $phone }}" style="color:#0891B2;text-decoration:none;font-weight:500;">{{ $phone }}</a>
                                        @else
                                            <span class="phone-missing">Not provided</span>
                                        @endif
                                    </td>
                                </tr>
                            </table>

                            <!-- Message -->
                            <div class="message-section">
                                <div class="message-label">Message</div>
                                <div class="message-content">{{ $messageContent }}</div>
                            </div>

                            <!-- Reply CTA -->
                            <div class="reply-section">
                                <p>Reply to <strong>{{ $email }}</strong> directly to respond to this sender.</p>
                            </div>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <div class="footer-logo">NutriBantay</div>
                            <p>Barangay Health Center &middot; This is an automated message from the contact form.</p>
                            <p style="margin-top:4px;">&copy; {{ date('Y') }} NutriBantay. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
