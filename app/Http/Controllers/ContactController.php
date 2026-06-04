<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    private $emailUsername;

    public function __construct()
    {
        $this->emailUsername = config('mail.mailers.smtp.username');
    }

    public function showContactForm()
    {
        return Inertia::render('Guest/contact');
    }

    public function sendContactForm(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:50',
            'phone' => 'required|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:20',
            'privacy' => 'required|accepted',
        ]);

        if (! $this->emailUsername) {
            \Log::warning('Contact form submitted but mail is not configured (MAIL_MAILER=log or no SMTP username).');

            return redirect()->route('guest.contact')->with('success', 'Thank you for contacting us! We will get back to you soon.');
        }

        Mail::to($this->emailUsername)->send(new ContactFormMail($data));

        return redirect()->route('guest.contact')->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}
