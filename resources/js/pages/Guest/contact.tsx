import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});


const FAQs = [
    {
        id: 1,
        question: "What services does NutriBantay offer?",
        answer: "NutriBantay offers nutrition monitoring for children, health education programs, community wellness initiatives, and regular health assessments for families in our barangay. Our services are designed to improve the overall health and well-being of our community members, with a special focus on children's nutrition."
    },
    {
        id: 2,
        question: "How can I register my child for nutrition monitoring?",
        answer: "You can visit the Barangay Health Center during office hours with your child's birth certificate and proof of residence to register for our nutrition monitoring program. Our staff will guide you through the registration process and schedule your child's first assessment."
    },
    {
        id: 3,
        question: "Are the services free?",
        answer: "Yes, most of our basic services are provided free of charge to residents of our barangay through government funding and community partnerships. Some specialized services or programs may have minimal fees, but we always ensure that cost is not a barrier to accessing essential nutrition and health services."
    },
    {
        id: 4,
        question: "How often should my child be monitored?",
        answer: " We recommend monthly monitoring for children under 2 years old and quarterly monitoring for children aged 2-5 years. However, this may vary based on your child's specific health needs. Our healthcare professionals will provide personalized recommendations for your child's monitoring schedule."
    }
];




export default function Contact() {

    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        privacy: false,
    });

    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('guest.contact.send'), {
            onSuccess: () => {
                reset();
                setSubmitted(true);
            },
        });
    };

    return (
        <GuestLayout title="Contact Us">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] py-24 md:py-28">
                <div className="absolute top-20 right-20 -z-10 h-64 w-64 rounded-full bg-[var(--primary)] opacity-10 blur-3xl"></div>
                <div className="absolute bottom-10 left-10 -z-10 h-48 w-48 rounded-full bg-[var(--secondary)] opacity-10 blur-3xl"></div>
                <div className="absolute -top-10 -left-10 -z-10 h-40 w-40 rounded-full border border-[var(--primary)] opacity-20"></div>
                <div className="absolute -bottom-10 -right-10 -z-10 h-60 w-60 rounded-full border border-[var(--secondary)] opacity-20"></div>

                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        {/* Hero Content */}
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center rounded-full bg-[var(--primary)] bg-opacity-10 px-4 py-1 text-sm font-medium text-white">
                                <span className="mr-2 flex h-2 w-2 rounded-full bg-white"></span>
                                GET IN TOUCH WITH US
                            </div>
                            <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                                <span className="gradient-text">We'd Love to</span>
                                <br />
                                <span className="text-[var(--text)]">Hear From You</span>
                            </h1>
                            <p className="mt-6 text-lg text-[var(--text-muted)]">
                                Have questions about our nutrition programs or want to get involved?
                                Our team is ready to assist you with any inquiries.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4 md:justify-start">
                                <a
                                    href="#contact-form"
                                    className="group flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-white transition-all hover:shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                    </svg>
                                    <span>Send a Message</span>
                                </a>
                                <a
                                    href="#faq"
                                    className="group flex items-center justify-center rounded-full border-2 border-[var(--secondary)] px-6 py-3 text-[var(--secondary)] transition-all hover:bg-[var(--secondary)] hover:text-white hover:shadow-lg"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                    </svg>
                                    <span>View FAQs</span>
                                </a>
                            </div>
                        </div>

                        {/* Contact Cards */}
                        <div className="relative">
                            <div className="relative z-10 overflow-hidden rounded-2xl bg-white p-1 shadow-xl dark:bg-[var(--bg-light)]">
                                <div className="grid gap-px rounded-xl bg-[var(--border)] sm:grid-cols-2">
                                    {/* Call Us Card */}
                                    <div className="bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Call Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">Mon-Fri, 8am-5pm</p>
                                        <a href="tel:+09123456789" className="inline-block text-lg font-medium text-[var(--text)]">
                                            0912 345 6789
                                        </a>
                                    </div>

                                    {/* Email Us Card */}
                                    <div className="bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)]text-[var(--secondary)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Email Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">We'll respond within 24h</p>
                                        <a href="mailto:info@nutribantay.com" className="inline-block text-lg font-medium text-[var(--text)]">
                                            info@nutribantay.com
                                        </a>
                                    </div>

                                    {/* Visit Us Card */}
                                    <div className="bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--success)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Visit Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">Barangay Hall</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">
                                            123 Main St, Caloocan City
                                        </span>
                                    </div>

                                    {/* Office Hours Card */}
                                    <div className="bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--info)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Office Hours</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">Mon-Fri: 8AM - 5PM</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">
                                            Saturday: 8AM - 12PM
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-[var(--primary)] opacity-20 blur-xl"></div>
                            <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-[var(--secondary)] opacity-20 blur-xl"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form" className="py-20 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-16 md:grid-cols-5">
                            {/* Form Info */}
                            <div className="md:col-span-2">
                                <div className="sticky top-8">
                                    <span className="inline-flex items-center rounded-full bg-[var(--primary)] bg-opacity-10 px-3 py-1 text-xs font-medium text-white">
                                        CONTACT FORM
                                    </span>
                                    <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">
                                        Send us a Message!
                                    </h2>
                                    <p className="mt-4 text-[var(--text-muted)]">
                                        Fill out the form and our team will get back to you as soon as possible. We're looking forward to hearing from you!
                                    </p>

                                    <div className="mt-8 space-y-6">
                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">Phone Support</h3>
                                                <p className="mt-1 text-[var(--text-muted)]">
                                                    Our support team is available during office hours to assist you with any questions.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">Email Response</h3>
                                                <p className="mt-1 text-[var(--text-muted)]">
                                                    We typically respond to emails within 24 hours on business days.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">In-Person Support</h3>
                                                <p className="mt-1 text-[var(--text-muted)]">
                                                    Visit our office during business hours for face-to-face assistance.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="md:col-span-3">
                                <div className="overflow-hidden rounded-2xl bg-[var(--bg-light)] p-8 shadow-sm">
                                    {submitted && (
                                        <div className="mb-6 rounded-md bg-green-50 p-4 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                            <p>Thank you for your message! We will get back to you soon.</p>
                                        </div>
                                    )}
                                    <form className="space-y-6" onSubmit={handleSubmit}>
                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="first_name" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                    First Name <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="first_name"
                                                    maxLength={50}
                                                    value={data.first_name}
                                                    onChange={e => setData('first_name', e.target.value)}
                                                    className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last_name" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                    Last Name <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="last_name"
                                                    maxLength={50}
                                                    value={data.last_name}
                                                    onChange={e => setData('last_name', e.target.value)}
                                                    className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-6 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="email" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                    Email Address <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    maxLength={50}
                                                    value={data.email}
                                                    onChange={e => setData('email', e.target.value)}
                                                    className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                    Phone Number
                                                </label>
                                                <input
                                                    type="tel"
                                                    id="phone"
                                                    maxLength={15}
                                                    value={data.phone}
                                                    onChange={e => setData('phone', e.target.value)}
                                                    className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                Subject <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                maxLength={100}
                                                value={data.subject}
                                                onChange={e => setData('subject', e.target.value)}
                                                className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="mb-2 block text-sm font-medium text-[var(--text)]">
                                                Message <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                rows={5}
                                                minLength={20}
                                                value={data.message}
                                                onChange={e => setData('message', e.target.value)}
                                                className="w-full rounded-xs border-0 bg-white px-4 py-3 text-[var(--text)] shadow-sm ring-1 ring-inset ring-[var(--border)] transition-all focus:ring-2 focus:ring-inset focus:ring-[var(--primary)]"
                                                required
                                            ></textarea>
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex h-5 items-center">
                                                <input
                                                    id="privacy"
                                                    name="privacy"
                                                    type="checkbox"
                                                    checked={data.privacy}
                                                    onChange={e => setData('privacy', e.target.checked)}
                                                    className="h-4 w-4 rounded-xs border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                    required
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="privacy" className="text-[var(--text-muted)]">
                                                    I agree to the <a href="#" className="text-[var(--primary)] hover:underline">privacy policy</a> and consent to the processing of my personal data.
                                                </label>
                                                {errors.privacy && <p className="mt-1 text-sm text-[var(--danger)]">{errors.privacy}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="group inline-flex w-full items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-white transition-all hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 sm:w-auto"
                                            >
                                                <span className="mr-2">{processing ? 'Sending...' : 'Send Message'}</span>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Section */}
            <section className="py-16 bg-[var(--bg-light)] dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--success)] bg-opacity-10 px-3 py-1 text-xs font-medium text-white">
                            OUR LOCATION
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">
                            Visit Us Today
                        </h2>
                        <p className="mt-4 text-[var(--text-muted)]">
                            Our office is conveniently located in the heart of Caloocan City. Feel free to stop by during our business hours.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[var(--bg-light)]">
                        {/* Leaflet Map */}
                        <div className="relative h-[36rem] w-full">
                            <MapContainer
                                center={[14.6507, 120.9630]} // Caloocan City coordinates
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                                className="rounded-2xl"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[14.6507, 120.9630]}>
                                    <Popup>
                                        <div className="text-center p-2">
                                            <h3 className="font-bold text-lg text-gray-800">NutriBantay Office</h3>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Barangay Hall, 123 Main Street<br />
                                                Caloocan City, Metro Manila
                                            </p>
                                            <p className="text-sm text-gray-600 mt-2">
                                                <strong>Hours:</strong> Mon-Fri: 8AM - 5PM
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            {/* Location information overlay */}
                            <div className="absolute bottom-4 left-8 right-8 rounded-xl bg-white p-6 shadow-lg dark:bg-[var(--bg-light)] pointer-events-auto z-[1000]">
                                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold text-[var(--text)]">NutriBantay Office</h3>
                                        <p className="mt-1 text-[var(--text-muted)]">
                                            Barangay Hall, 123 Main Street, Caloocan City, Metro Manila
                                        </p>
                                    </div>
                                    <a
                                        href="https://maps.google.com/maps?q=14.6507,120.9630"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center rounded-full bg-[var(--success)] px-4 py-2 text-white transition-all hover:bg-opacity-90 hover:shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707L15 4m0 13V4m0 0L9 7" clipRule="evenodd" />
                                        </svg>
                                        <span>Get Directions</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--secondary)] bg-opacity-10 px-3 py-1 text-xs font-medium text-white">
                            HELPFUL INFORMATION
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">
                            Frequently Asked Questions
                        </h2>
                        <p className="mt-4 text-[var(--text-muted)]">
                            Find answers to commonly asked questions about our services and programs.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6">
                        {/* FAQ Item 1 */}
                        {FAQs.map((faq) => (
                            <div key={faq.id} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition-all hover:shadow-md dark:bg-[var(--bg-light)]">
                                <details className="group">
                                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-[var(--text)] outline-none">
                                        <span>{faq.question}</span>
                                        <span className="ml-6 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--bg-light)] text-[var(--primary)] transition-transform duration-500 ease-in-out group-open:rotate-180 dark:bg-[var(--bg)]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <div className="overflow-hidden transition-all duration-500 ease-in-out">
                                        <div className="border-t border-[var(--border)] px-6 pb-6 pt-4">
                                            <p className="text-[var(--text-muted)]">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>


                    <div className="mt-10 text-center">
                        <p className="text-[var(--text-muted)]">
                            Still have questions? <a href="#contact-form" className="font-medium text-[var(--primary)] hover:underline">Contact our support team</a> for more information.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative overflow-hidden bg-[var(--primary)] py-16 text-white">
                <div className="absolute inset-0 z-0">
                    <svg className="absolute left-full top-0 h-full w-1/2 -translate-x-1/2 transform" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0, 0)">
                            <path d="M125,-160.4C159.9,-137.3,184.8,-98.2,188.9,-59C193.1,-19.8,176.6,19.6,153.8,52.6C131.1,85.5,102,112,69.1,135.7C36.2,159.4,-0.6,180.3,-41.3,180.5C-82,180.7,-126.7,160.3,-151.2,126.8C-175.7,93.3,-180,46.7,-174.8,4C-169.7,-38.7,-155.1,-77.3,-127.5,-100.5C-100,-123.7,-59.5,-131.3,-17.8,-146.7C23.9,-162,90.1,-183.4,125,-160.4Z" fill="var(--primary-dark)" opacity="0.1" />
                        </g>
                    </svg>
                    <svg className="absolute right-full top-0 h-full w-1/2 translate-x-1/2 transform" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(0, 0)">
                            <path d="M137.1,-191.3C173.1,-154.1,194.2,-105.5,208.5,-55.8C222.7,-6.1,230.1,44.7,214.4,88.7C198.7,132.7,160,170,114.6,191C69.2,212,17.1,216.6,-35.5,209.7C-88.2,202.8,-141.5,184.4,-181.8,148.2C-222.1,112,-249.5,58,-245.1,7.2C-240.7,-43.6,-204.5,-91.2,-164.1,-129.6C-123.7,-168,-61.9,-197.2,-3.7,-192.9C54.5,-188.5,101.1,-228.5,137.1,-191.3Z" fill="var(--primary-light)" opacity="0.05" />
                        </g>
                    </svg>
                </div>

                <div className="container relative z-10 mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-4xl text-center">
                        <h2 className="text-3xl font-bold md:text-4xl">
                            Join Our Mission for a Healthier Community
                        </h2>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}