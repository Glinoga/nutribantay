<?php

namespace App\Http\Controllers;

use App\Mail\ContactFormMail;
use App\Models\SiteContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function showContactForm()
    {
        return Inertia::render('Guest/contact', [
            'siteContent' => SiteContent::getByPage('contact'),
            'footerContent' => SiteContent::getByPage('footer'),
        ]);
    }

    public function sendContactForm(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:50',
            'phone' => 'nullable|string|max:20',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:20',
            'privacy' => 'required|accepted',
        ]);

        $recipient = config('mail.contact_address') ?: config('mail.from.address');

        if (app()->isProduction() && (config('mail.default') === 'log' || ! config('mail.contact_address'))) {
            \Log::warning('Contact form submitted but production mail delivery is not configured.');

            return redirect()->route('guest.contact')->with('error', 'We could not send your message because email delivery is not configured. Please try again later.');
        }

        try {
            Mail::to($recipient)->send(new ContactFormMail($data));
        } catch (\Throwable $e) {
            \Log::error('Contact form delivery failed: '.$e->getMessage()."\n".$e->getTraceAsString());

            return redirect()->route('guest.contact')->with('error', 'We could not send your message. Please try again later.');
        }

        return redirect()->route('guest.contact')->with('success', 'Thank you for contacting us! We will get back to you soon.');
    }
}
