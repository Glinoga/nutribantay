<!DOCTYPE html>
<html>
<head>
    <title>Message From NutriBantay</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        /* Base styles */
        body {
            font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #020d0d;
            background-color: #e4f6f5;
            margin: 0;
            padding: 0;
        }
        
        .wrapper {
            width: 100%;
            max-width: 650px;
            margin: 0 auto;
            padding: 2rem;
        }
        
        .email-container {
            background-color: #f9ffff;
            border-radius: 0.938rem;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            overflow: hidden;
        }
        
        /* Header */
        .header {
            background-color: #020d0d;
            color: white;
            padding: 2rem 4rem;
            text-align: center;
            border-bottom: 1px solid #598784;
        }
        
        .header h1 {
            margin: 0;
            font-size: 1.75rem;
            font-weight: 600;
            letter-spacing: -0.5px;
        }
        
        .header p {
            margin: 0.5rem 0 0;
            opacity: 0.9;
            font-size: 0.9rem;
        }
        
        /* Content */
        .content {
            padding: 4rem;
        }
        
        /* Info card */
        .info-card {
            margin-bottom: 2rem;
            border-bottom: 1px solid #598784;
            padding-bottom: 2rem;
        }
        
        .info-item {
            margin-bottom: 1rem;
        }
        
        .label {
            display: block;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #1e4b4a;
            margin-bottom: 0.125rem;
            font-weight: 600;
        }
        
        .value {
            font-size: 1rem;
            color: #020d0d;
        }
        
        /* Message box */
        .message-box {
            background-color: #d1e6e4;
            padding: 2rem;
            border-radius: 0.625rem;
            border-left: 4px solid #020d0d;
            position: relative;
        }
        
        .message-box .label {
            margin-bottom: 0.5rem;
            color: #020d0d;
        }
        
        .message-content {
            white-space: pre-line;
            line-height: 1.6;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 1rem 4rem 2rem;
            color: #1e4b4a;
            font-size: 0.813rem;
            background-color: #f2fcfa;
            border-top: 1px solid #598784;
        }
        
        .footer-logo {
            max-width: 120px;
            margin-bottom: 1rem;
        }
        
        .social-links {
            margin: 1rem 1rem;
            display: flex;
            justify-content: center;
            gap: 0.25rem;
        }
        
        .social-link {
            display: inline-block;
            width: 32px;
            height: 32px;
            line-height: 32px;
            background-color: #020d0d;
            border-radius: 100%;
            color: white;
            text-decoration: none;
            font-size: 0.75rem;
            font-weight: bold;
            text-align: center;
        }
        
        /* Responsive */
        @media screen and (max-width: 600px) {
            .header, .content, .footer {
                padding: 1rem;
            }
            
            .wrapper {
                padding: 0.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="email-container">
            <!-- Header -->
            <div class="header">
                <h1>New Contact Form Submission</h1>
                <p>Someone has reached out through the website contact form</p>
            </div>
            
            <!-- Content -->
            <div class="content">
                <div class="info-card">
                    <div class="info-item">
                        <span class="label">From</span>
                        <div class="value">{{ $name }}</div>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">Email Address</span>
                        <div class="value">{{ $email }}</div>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">Phone Number</span>
                        <div class="value">{{ $phone }}</div>
                    </div>
                    
                    <div class="info-item">
                        <span class="label">Subject</span>
                        <div class="value">{{ $subject }}</div>
                    </div>
                </div>
                
                <div class="message-box">
                    <div class="label">Message</div>
                    <div class="message-content">{{ $messageContent }}</div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <!-- Logo replacement with direct styling -->
                <div style="background-color: #020d0d; width: 120px; height: 40px; border-radius: 4px; color: white; text-align: center; line-height: 40px; font-weight: bold; margin: 0 auto 1rem;">NutriBantay</div>
                
                <p>This is an automated email from the NutriBantay contact form.</p>
                <p>Please respond to the sender directly by replying to their email address.</p>
                
                <div class="social-links">
                    <!-- Social media links -->
                    <a href="#" class="social-link">FB</a>
                    <a href="#" class="social-link">IG</a>
                    <a href="#" class="social-link">TW</a>
                </div>
                
                <p>&copy; 2025 NutriBantay. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>