<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
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
        Mail::to('manaloedjerome@gmail.com')->send(new ContactFormMail($data));
        return redirect()->route('guest.contact')->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}
