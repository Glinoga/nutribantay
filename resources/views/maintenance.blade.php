<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>System Maintenance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            background: white;
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            text-align: center;
            animation: fadeIn 0.5s ease-in;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .icon {
            font-size: 80px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        
        h1 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 28px;
            font-weight: 600;
        }
        
        p {
            color: #666;
            line-height: 1.8;
            margin-bottom: 15px;
            font-size: 16px;
        }
        
        .alert {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 25px 0;
            color: #856404;
        }
        
        .alert strong {
            display: block;
            margin-bottom: 5px;
            font-size: 18px;
        }
        
        hr {
            margin: 30px 0;
            border: none;
            border-top: 1px solid #eee;
        }
        
        .footer {
            font-size: 14px;
            color: #999;
            margin-top: 20px;
        }
        
        .login-button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 30px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .login-button:hover {
            background: #5568d3;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔧</div>
        <h1>System Under Maintenance</h1>
        
        @if(session('maintenance_message'))
            <div class="alert">
                <strong>⚠️ Session Logged Out</strong>
                {{ session('maintenance_message') }}
            </div>
        @else
            <div class="alert">
                <strong>⚠️ Notice</strong>
                NutriBantay is currently undergoing scheduled maintenance to improve your experience.
            </div>
        @endif
        
        <p>We're making updates to provide you with better service. This should only take a short while.</p>
        <p><strong>Your session has been logged out for security purposes.</strong></p>
        <p>Please check back later. We apologize for any inconvenience.</p>
        
        <a href="/" class="login-button">Return to Home</a>
        
        <hr>
        
        <div class="footer">
            <p>For urgent matters, please contact your system administrator.</p>
            <p style="margin-top: 10px; font-size: 12px;">
                NutriBantay &copy; {{ date('Y') }}
            </p>
        </div>
    </div>
</body>
</html>
