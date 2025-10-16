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
        
        /* .social-links {
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
            font-family: 'Montserrat', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 0.75rem;
            font-weight: bold;
            text-align: center;
            margin: .25rem;
            
        } */
        
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
               
                <div style="background-color: #020d0d; width: 120px; height: 40px; border-radius: 4px; color: white; text-align: center; line-height: 40px; font-weight: bold; margin: 0 auto 1rem;">NutriBantay</div>
                
                <p>This is an automated email from the NutriBantay contact form.</p>
                <p>Please respond to the sender directly by replying to their email address.</p>
<!--                 
                <div class="social-links">
                    <svg class="social-link" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Facebook</title><path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/></svg> 
                    <svg class="social-link" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>
                </div> -->
                
                <p>&copy; 2025 NutriBantay. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>