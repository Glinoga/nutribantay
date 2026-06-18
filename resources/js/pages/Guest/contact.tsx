import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { useForm } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CheckCircle, ChevronDown, Clock, Mail, MapPin, MessageSquare, Phone, Send, User } from 'lucide-react';
import { useState } from 'react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: () => string })._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const FAQs = [
    {
        id: 1,
        question: 'What services does NutriBantay offer?',
        answer: "NutriBantay offers nutrition monitoring for children, health education programs, community wellness initiatives, and regular health assessments for families in our barangay. Our services are designed to improve the overall health and well-being of our community members, with a special focus on children's nutrition.",
    },
    {
        id: 2,
        question: 'How can I register my child for nutrition monitoring?',
        answer: "You can visit the Barangay Health Center during office hours with your child's birth certificate and proof of residence to register for our nutrition monitoring program. Our staff will guide you through the registration process and schedule your child's first assessment.",
    },
    {
        id: 3,
        question: 'Are the services free?',
        answer: 'Yes, most of our basic services are provided free of charge to residents of our barangay through government funding and community partnerships. Some specialized services or programs may have minimal fees, but we always ensure that cost is not a barrier to accessing essential nutrition and health services.',
    },
    {
        id: 4,
        question: 'How often should my child be monitored?',
        answer: " We recommend monthly monitoring for children under 2 years old and quarterly monitoring for children aged 2-5 years. However, this may vary based on your child's specific health needs. Our healthcare professionals will provide personalized recommendations for your child's monitoring schedule.",
    },
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
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.6s ease-out forwards;
                }
                .glass-card {
                    background: color-mix(in srgb, var(--bg-light) 70%, transparent);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid color-mix(in srgb, var(--border) 30%, transparent);
                }
            `}</style>
            {/* Hero Section */}
            <section
                className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] py-24 md:py-28"
                style={{ animationDelay: '0.1s' }}
            >
                <div className="absolute top-20 right-20 -z-10 h-64 w-64 rounded-full bg-[var(--primary)] opacity-10 blur-3xl"></div>
                <div className="absolute bottom-10 left-10 -z-10 h-48 w-48 rounded-full bg-[var(--secondary)] opacity-10 blur-3xl"></div>
                <div className="absolute -top-10 -left-10 -z-10 h-40 w-40 rounded-full border border-[var(--primary)] opacity-20"></div>
                <div className="absolute -right-10 -bottom-10 -z-10 h-60 w-60 rounded-full border border-[var(--secondary)] opacity-20"></div>

                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        {/* Hero Content */}
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                                GET IN TOUCH WITH US
                            </div>
                            <h1 className="mt-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                                <span className="gradient-text">We'd Love to</span>
                                <br />
                                <span className="text-[var(--text)]">Hear From You</span>
                            </h1>
                            <p className="mt-6 text-lg text-[var(--text-muted)]">
                                Have questions about our nutrition programs or want to get involved? Our team is ready to assist you with any
                                inquiries.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4 md:justify-start">
                                <a
                                    href="#contact-form"
                                    className="group flex cursor-pointer items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-white transition-all hover:shadow-lg"
                                >
                                    <Send className="mr-2 h-5 w-5" />
                                    <span>Send a Message</span>
                                </a>
                                <a
                                    href="#faq"
                                    className="group flex cursor-pointer items-center justify-center rounded-full border-2 border-[var(--secondary)] px-6 py-3 text-[var(--secondary)] transition-all hover:bg-[var(--secondary)] hover:text-white hover:shadow-lg"
                                >
                                    <MessageSquare className="mr-2 h-5 w-5" />
                                    <span>View FAQs</span>
                                </a>
                            </div>
                        </div>

                        {/* Contact Cards */}
                        <div className="relative">
                            <div className="relative z-10 overflow-hidden rounded-2xl bg-white/70 p-1 shadow-xl backdrop-blur-sm dark:bg-[var(--bg)]/70">
                                <div className="grid gap-px rounded-xl bg-[var(--border)] sm:grid-cols-2">
                                    {/* Call Us Card */}
                                    <div className="cursor-pointer bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Call Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">Mon-Fri, 8am-5pm</p>
                                        <a href="tel:+09123456789" className="inline-block text-lg font-medium text-[var(--text)]">
                                            0966 822 1878
                                        </a>
                                    </div>

                                    {/* Email Us Card */}
                                    <div className="cursor-pointer bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--secondary)] text-[var(--secondary)]">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Email Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">We'll respond within 24h</p>
                                        <a href="mailto:barangay176b@gmail.com" className="inline-block text-lg font-medium text-[var(--text)]">
                                            barangay176b@gmail.com
                                        </a>
                                    </div>

                                    {/* Visit Us Card */}
                                    <div className="cursor-pointer bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--success)]">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Visit Us</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">Bagong Silang Phase 3 Health Center</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">Q29X+VJC, Caloocan, Metro Manila</span>
                                    </div>

                                    {/* Office Hours Card */}
                                    <div className="cursor-pointer bg-white p-6 transition-all hover:bg-[var(--bg-light)] dark:bg-[var(--bg-light)] dark:hover:bg-[var(--bg)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--info)]">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Office Hours</h3>
                                        <p className="mb-3 text-[var(--text-muted)]">We are only available on:</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">Mon-Fri: 8AM - 5PM</span>
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
            <section id="contact-form" className="animate-fade-in-up bg-white py-20 dark:bg-[var(--bg)]" style={{ animationDelay: '0.2s' }}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-16 md:grid-cols-5">
                            {/* Form Info */}
                            <div className="md:col-span-2">
                                <div className="sticky top-8">
                                    <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                                        CONTACT FORM
                                    </span>
                                    <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">Send us a Message!</h2>
                                    <p className="mt-4 text-[var(--text-muted)]">
                                        Fill out the form and our team will get back to you as soon as possible. We're looking forward to hearing from
                                        you!
                                    </p>

                                    <div className="mt-8 space-y-6">
                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 border-[var(--primary)] text-[var(--primary)]">
                                                <Phone className="h-5 w-5" />
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
                                                <Mail className="h-5 w-5" />
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
                                                <User className="h-5 w-5" />
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
                                <div className="glass-card overflow-hidden rounded-2xl p-8 shadow-sm">
                                    {submitted && (
                                        <div className="mb-6 rounded-xl bg-green-50 p-6 text-center animate-in slide-in-from-top-2 dark:bg-green-900/30">
                                            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
                                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Message Sent!</h3>
                                            <p className="mt-1 text-green-700 dark:text-green-300">
                                                Thank you for reaching out. We will get back to you soon.
                                            </p>
                                        </div>
                                    )}
                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="first_name" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                    First Name <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="first_name"
                                                    maxLength={50}
                                                    value={data.first_name}
                                                    onChange={(e) => setData('first_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="last_name" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                    Last Name <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <Input
                                                    type="text"
                                                    id="last_name"
                                                    maxLength={50}
                                                    value={data.last_name}
                                                    onChange={(e) => setData('last_name', e.target.value.replace(/[^a-zA-ZñÑ\s'-.]/g, ''))}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-5 md:grid-cols-2">
                                            <div>
                                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                    Email Address <span className="text-[var(--danger)]">*</span>
                                                </label>
                                                <Input
                                                    type="email"
                                                    id="email"
                                                    maxLength={50}
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                    Phone Number
                                                </label>
                                                <Input
                                                    type="tel"
                                                    id="phone"
                                                    maxLength={15}
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                Subject <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                id="subject"
                                                maxLength={100}
                                                value={data.subject}
                                                onChange={(e) => setData('subject', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                Message <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <Textarea
                                                id="message"
                                                rows={5}
                                                minLength={20}
                                                value={data.message}
                                                onChange={(e) => setData('message', e.target.value)}
                                                required
                                                className="bg-transparent"
                                            />
                                        </div>

                                        <div className="flex items-start">
                                            <div className="flex h-5 items-center">
                                                <input
                                                    id="privacy"
                                                    name="privacy"
                                                    type="checkbox"
                                                    checked={data.privacy}
                                                    onChange={(e) => setData('privacy', e.target.checked)}
                                                    className="h-4 w-4 rounded-xs border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                    required
                                                />
                                            </div>
                                            <div className="ml-3 text-sm">
                                                <label htmlFor="privacy" className="text-[var(--text-muted)]">
                                                    I agree to the{' '}
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <button type="button" className="cursor-pointer text-[var(--primary)] hover:underline">
                                                                privacy policy
                                                            </button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 sm:max-w-lg lg:max-w-xl dark:bg-gray-800">
                                                            <DialogHeader>
                                                                <DialogTitle className="text-xl font-bold text-teal-800 dark:text-teal-300">
                                                                    Privacy Policy
                                                                </DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    1. Information We Collect
                                                                </h3>
                                                                <p>
                                                                    We collect personal information that you voluntarily provide to us when you use
                                                                    the NutriBantay contact form, including your name, email address, phone number,
                                                                    and the content of your message. We also collect information about your child's
                                                                    nutrition and health data if you register for our monitoring program.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    2. How We Use Your Information
                                                                </h3>
                                                                <p>
                                                                    The information we collect is used to respond to your inquiries, provide nutrition
                                                                    monitoring services, improve our community health programs, and comply with legal
                                                                    obligations. Your data is used solely for the intended purpose of barangay health
                                                                    tracking and community wellness initiatives.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">3. Data Protection</h3>
                                                                <p>
                                                                    We implement appropriate technical and organizational measures to protect your
                                                                    personal data against unauthorized access, alteration, disclosure, or destruction.
                                                                    Access to personal data is restricted to authorized personnel only and is
                                                                    protected under applicable data privacy laws.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">4. Data Sharing</h3>
                                                                <p>
                                                                    We do not sell, trade, or rent your personal information to third parties. We may
                                                                    share information with authorized barangay health personnel and government
                                                                    agencies as required by law or with your explicit consent.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">5. Data Retention</h3>
                                                                <p>
                                                                    We retain your personal data only for as long as necessary to fulfill the purposes
                                                                    for which it was collected, or as required by applicable laws and regulations.
                                                                    When data is no longer needed, it is securely disposed of.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">6. Your Rights</h3>
                                                                <p>
                                                                    You have the right to access, correct, update, or request deletion of your
                                                                    personal data. You may also withdraw your consent to data processing at any time.
                                                                    To exercise these rights, please contact our data protection officer through the
                                                                    barangay health center.
                                                                </p>

                                                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                                                    7. Updates to This Policy
                                                                </h3>
                                                                <p>
                                                                    We may update this Privacy Policy from time to time. Any changes will be posted on
                                                                    this page, and we encourage you to review this policy periodically for any
                                                                    updates.
                                                                </p>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>{' '}
                                                    and consent to the processing of my personal data.
                                                </label>
                                                {errors.privacy && <p className="mt-1 text-sm text-[var(--danger)]">{errors.privacy}</p>}
                                            </div>
                                        </div>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="group inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-white transition-all hover:opacity-90 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none sm:w-auto"
                                            >
                                                <span className="mr-2">{processing ? 'Sending...' : 'Send Message'}</span>
                                                <Send className="h-5 w-5 transition-transform group-hover:translate-x-1" />
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
            <section className="animate-fade-in-up bg-[var(--bg-light)] py-16 dark:bg-[var(--bg)]" style={{ animationDelay: '0.3s' }}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
                            OUR LOCATION
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">Visit Us Today</h2>
                        <p className="mt-4 text-[var(--text-muted)]">
                            Our health center is located at Bagong Silang, Caloocan City. Feel free to visit us during our business hours.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg dark:bg-[var(--bg-light)]">
                        {/* Leaflet Map */}
                        <div className="relative h-[36rem] w-full">
                            <MapContainer
                                center={[14.7695106, 121.0489927]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                                className="rounded-2xl"
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[14.7695106, 121.0489927]}>
                                    <Popup>
                                        <div className="p-2 text-center">
                                            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">
                                                Bagong Silang Phase 3 Health Center
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">
                                                Q29X+VJC, Caloocan
                                                <br />
                                                Metro Manila, Philippines
                                            </p>
                                            <p className="mt-2 text-sm text-gray-600">
                                                <strong>Hours:</strong> Mon-Fri: 8AM - 5PM
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            {/* Location information overlay */}
                            <div className="pointer-events-auto absolute right-6 bottom-6 left-6 z-[1000] rounded-xl bg-white/90 p-5 shadow-lg backdrop-blur-sm dark:bg-[var(--bg-light)]/90">
                                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                                    <div className="flex items-start gap-3">
                                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" />
                                        <div>
                                            <h3 className="text-lg font-semibold text-[var(--text)]">Bagong Silang Phase 3 Health Center</h3>
                                            <p className="mt-0.5 text-sm text-[var(--text-muted)]">Bagong Silang Phase 3, Caloocan, Metro Manila</p>
                                        </div>
                                    </div>
                                    <a
                                        href="https://maps.google.com/maps?q=14.7695106,121.0489927"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex shrink-0 cursor-pointer items-center rounded-full bg-gradient-to-r from-teal-700 to-cyan-600 px-4 py-2 text-sm text-white transition-all hover:opacity-90 hover:shadow-lg"
                                    >
                                        <MapPin className="mr-2 h-4 w-4" />
                                        <span>Get Directions</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="animate-fade-in-up bg-white py-20 dark:bg-[var(--bg)]" style={{ animationDelay: '0.4s' }}>
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--secondary)]/10 px-3 py-1 text-xs font-medium text-[var(--secondary)]">
                            HELPFUL INFORMATION
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">Frequently Asked Questions</h2>
                        <p className="mt-4 text-[var(--text-muted)]">Find answers to commonly asked questions about our services and programs.</p>
                    </div>

                    <div className="mx-auto grid max-w-4xl gap-6">
                        {FAQs.map((faq) => (
                            <div
                                key={faq.id}
                                className="overflow-hidden rounded-xl border border-[var(--border)] bg-white shadow-sm transition-all hover:shadow-md dark:bg-[var(--bg-light)]"
                            >
                                <details className="group">
                                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-[var(--text)] outline-none">
                                        <span>{faq.question}</span>
                                        <span className="ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 transition-transform duration-500 ease-in-out group-open:rotate-180 dark:from-[var(--bg)] dark:to-[var(--bg)] dark:text-[var(--primary)]">
                                            <ChevronDown className="h-5 w-5" />
                                        </span>
                                    </summary>
                                    <div className="overflow-hidden transition-all duration-500 ease-in-out">
                                        <div className="border-t border-[var(--border)] px-6 pt-4 pb-6">
                                            <p className="text-[var(--text-muted)]">{faq.answer}</p>
                                        </div>
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 text-center">
                        <p className="text-[var(--text-muted)]">
                            Still have questions?{' '}
                            <a href="#contact-form" className="font-medium text-[var(--primary)] hover:underline">
                                Contact our support team
                            </a>{' '}
                            for more information.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section
                className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--primary)] to-teal-900 py-16 text-white"
                style={{ animationDelay: '0.5s' }}
            >
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-teal-600 opacity-20" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-cyan-600 opacity-20" />

                <div className="relative z-10 container mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-4 text-3xl font-bold md:text-4xl">Join Our Mission for a Healthier Community</h2>
                    <p className="mx-auto mb-8 max-w-2xl text-lg text-white/80">
                        Help us make a difference in the lives of children and families in our barangay.
                    </p>
                    <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
                        <a
                            href="#contact-form"
                            className="inline-flex cursor-pointer items-center rounded-full border-2 border-white/60 px-8 py-3 font-medium text-white transition-all hover:border-white hover:bg-white/10"
                        >
                            <Send className="mr-2 h-5 w-5" />
                            Send a Message
                        </a>
                    </div>
                </div>
            </section>
        </GuestLayout>
    );
}
