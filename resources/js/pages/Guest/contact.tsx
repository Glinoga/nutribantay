import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import GuestLayout from '@/layouts/guest-layout';
import { route } from '@/lib/routes';
import { useForm } from '@inertiajs/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, CheckCircle, ChevronDown, Clock, Mail, MapPin, Phone, Send, User } from 'lucide-react';
import { useEffect, useState } from 'react';
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
    {
        id: 5,
        question: 'What age group does NutriBantay monitor?',
        answer: 'NutriBantay primarily monitors children from birth to 5 years old (under 5). This is the critical window for growth and development where proper nutrition has the greatest lifelong impact. We also provide guidance to parents and caregivers on nutrition for older children and family members.',
    },
    {
        id: 6,
        question: 'How do I enroll my child?',
        answer: "To enroll your child, visit the Bagong Silang Phase 3 Health Center during office hours with your child's birth certificate and proof of residency. Our staff will register your child, explain the monitoring process, and schedule the first health assessment. There is no cost for enrollment.",
    },
];

export default function Contact() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        subject: 'Contact Form Submission',
        message: '',
        privacy: '1' as string | boolean,
    });

    const [fullName, setFullName] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [mapReady, setMapReady] = useState(false);

    const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFullName(value);
        const parts = value.trim().split(' ');
        setData('first_name', parts[0] || '');
        setData('last_name', parts.slice(1).join(' ') || '');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('guest.contact.send'), {
            onSuccess: () => {
                reset();
                setFullName('');
                setSubmitted(true);
            },
        });
    };

    useEffect(() => {
        const timer = setTimeout(() => setMapReady(true), 800);
        return () => clearTimeout(timer);
    }, []);

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
                @media (prefers-reduced-motion: reduce) {
                    .animate-fade-in-up {
                        animation: none;
                        opacity: 1;
                    }
                }
            `}</style>

            {/* Hero Section */}
            <section className="animate-fade-in-up relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] py-24 md:py-28">
                <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[var(--primary)] opacity-[0.04]" />

                <div className="container mx-auto px-6 lg:px-8">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        {/* Hero Content */}
                        <div className="text-center md:text-left">
                            <div className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                <span className="mr-2 flex h-2 w-2 rounded-full bg-[var(--primary)]"></span>
                                GET IN TOUCH WITH US
                            </div>
                            <h1 className="mt-6 text-4xl leading-tight font-bold text-[var(--text)] md:text-5xl lg:text-6xl">
                                We'd Love to Hear From You
                            </h1>
                            <p className="mt-6 text-lg text-[var(--text-muted)]">
                                Have questions about our nutrition programs or want to get involved? Our team is ready to assist you with any
                                inquiries.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-4 md:justify-start">
                                <a
                                    href="#contact-form"
                                    className="group flex cursor-pointer items-center justify-center rounded-md bg-[var(--primary)] px-6 py-3 text-white transition-all hover:opacity-90 hover:shadow-md"
                                >
                                    <Send className="mr-2 h-5 w-5" />
                                    <span>Send a Message</span>
                                </a>
                                <a
                                    href="#faq"
                                    className="group flex cursor-pointer items-center justify-center rounded-md border-2 border-[var(--secondary)] px-6 py-3 text-[var(--secondary)] transition-all hover:bg-[var(--secondary)] hover:text-white hover:shadow-md"
                                >
                                    <ChevronDown className="mr-2 h-5 w-5" />
                                    <span>View FAQs</span>
                                </a>
                            </div>
                        </div>

                        {/* Contact Cards */}
                        <div className="relative">
                            <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-[var(--border)] dark:bg-[var(--bg-card)]">
                                <div className="grid sm:grid-cols-2">
                                    {/* Call Us Card */}
                                    <div className="cursor-pointer border-l-4 border-teal-600 bg-white p-6 transition-all hover:bg-gray-50 dark:bg-[var(--bg-card)] dark:hover:bg-[var(--bg-light)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Call Us</h3>
                                        <p className="mb-3 text-sm text-[var(--text-muted)]">Mon-Fri, 8am-5pm</p>
                                        <a href="tel:+639668221878" className="inline-block text-lg font-medium text-[var(--text)]">
                                            0966 822 1878
                                        </a>
                                    </div>

                                    {/* Email Us Card */}
                                    <div className="cursor-pointer border-l-4 border-rose-500 bg-white p-6 transition-all hover:bg-gray-50 dark:bg-[var(--bg-card)] dark:hover:bg-[var(--bg-light)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--secondary)]/10 text-[var(--secondary)]">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Email Us</h3>
                                        <p className="mb-3 text-sm text-[var(--text-muted)]">We'll respond within 24h</p>
                                        <a href="mailto:barangay176b@gmail.com" className="inline-block text-lg font-medium text-[var(--text)]">
                                            barangay176b@gmail.com
                                        </a>
                                    </div>

                                    {/* Visit Us Card */}
                                    <div className="cursor-pointer border-l-4 border-emerald-500 bg-white p-6 transition-all hover:bg-gray-50 dark:bg-[var(--bg-card)] dark:hover:bg-[var(--bg-light)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Visit Us</h3>
                                        <p className="mb-3 text-sm text-[var(--text-muted)]">Bagong Silang Phase 3 Health Center</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">Q29X+VJC, Caloocan, Metro Manila</span>
                                    </div>

                                    {/* Office Hours Card */}
                                    <div className="cursor-pointer border-l-4 border-sky-500 bg-white p-6 transition-all hover:bg-gray-50 dark:bg-[var(--bg-card)] dark:hover:bg-[var(--bg-light)]">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
                                            <Clock className="h-6 w-6" />
                                        </div>
                                        <h3 className="mb-1 text-lg font-semibold text-[var(--text)]">Office Hours</h3>
                                        <p className="mb-3 text-sm text-[var(--text-muted)]">We are only available on:</p>
                                        <span className="inline-block text-lg font-medium text-[var(--text)]">Mon-Fri: 8AM - 5PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Form Section */}
            <section id="contact-form" className="animate-fade-in-up bg-white py-20 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto max-w-6xl">
                        <div className="grid gap-16 md:grid-cols-5">
                            {/* Form Info */}
                            <div className="md:col-span-2">
                                <div className="sticky top-8">
                                    <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-3 py-1 text-xs font-medium text-[var(--primary)]">
                                        CONTACT FORM
                                    </span>
                                    <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">Send us a Message</h2>
                                    <p className="mt-4 text-[var(--text-muted)]">
                                        Fill out the form and our team will get back to you as soon as possible.
                                    </p>

                                    <div className="mt-8 space-y-6">
                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">Phone Support</h3>
                                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                    Available during office hours to assist you with any questions.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <Mail className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">Email Response</h3>
                                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                    We typically respond within 24 hours on business days.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex">
                                            <div className="mr-4 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-[var(--text)]">In-Person Support</h3>
                                                <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                    Visit our office during business hours for face-to-face assistance.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Form */}
                            <div className="md:col-span-3">
                                <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-[var(--border)] dark:bg-[var(--bg-card)]">
                                    {submitted && (
                                        <div className="mb-6 rounded-xl bg-green-50 p-6 text-center dark:bg-green-900/30">
                                            <CheckCircle className="mx-auto mb-3 h-12 w-12 text-green-500" />
                                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Message Sent!</h3>
                                            <p className="mt-1 text-green-700 dark:text-green-300">
                                                Thank you for reaching out. We will get back to you within 24 hours.
                                            </p>
                                            <button
                                                onClick={() => setSubmitted(false)}
                                                className="mt-4 cursor-pointer rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[var(--primary)]/90"
                                            >
                                                Send another message
                                            </button>
                                        </div>
                                    )}
                                    <form className="space-y-5" onSubmit={handleSubmit}>
                                        <div>
                                            <label htmlFor="full_name" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                Full Name <span className="text-[var(--danger)]">*</span>
                                            </label>
                                            <Input
                                                type="text"
                                                id="full_name"
                                                maxLength={50}
                                                value={fullName}
                                                onChange={handleFullNameChange}
                                                className={`dark:border-[var(--border)] dark:bg-[var(--bg)] ${errors.first_name || errors.last_name ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                required
                                            />
                                            {(errors.first_name || errors.last_name) && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                    <AlertTriangle size={14} />
                                                    {errors.first_name || errors.last_name}
                                                </p>
                                            )}
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
                                                    className={`dark:border-[var(--border)] dark:bg-[var(--bg)] ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                    required
                                                />
                                                {errors.email && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                        <AlertTriangle size={14} />
                                                        {errors.email}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[var(--text)]">
                                                    Phone Number <span className="text-[var(--text-muted)]">(optional)</span>
                                                </label>
                                                <Input
                                                    type="tel"
                                                    id="phone"
                                                    maxLength={11}
                                                    value={data.phone}
                                                    onChange={(e) => setData('phone', e.target.value.replace(/\D/g, ''))}
                                                    className={`dark:border-[var(--border)] dark:bg-[var(--bg)] ${errors.phone ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                />
                                                {errors.phone && (
                                                    <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                        <AlertTriangle size={14} />
                                                        {errors.phone}
                                                    </p>
                                                )}
                                            </div>
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
                                                className={`dark:border-[var(--border)] dark:bg-[var(--bg)] ${errors.message ? 'border-red-500 focus:ring-red-500' : ''}`}
                                                required
                                                placeholder="Write your message here. Include any relevant details about your inquiry."
                                            />
                                            {errors.message && (
                                                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                                                    <AlertTriangle size={14} />
                                                    {errors.message}
                                                </p>
                                            )}
                                        </div>

                                        <p className="text-sm text-[var(--text-muted)]">
                                            By submitting, you agree to our{' '}
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <button type="button" className="cursor-pointer text-[var(--primary)] hover:underline">
                                                        Privacy Policy
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className="max-h-[80vh] overflow-y-auto rounded-xl bg-white p-6 sm:max-w-lg lg:max-w-xl dark:bg-[var(--bg-card)]">
                                                    <DialogHeader>
                                                        <DialogTitle className="text-xl font-bold text-[var(--text)]">Privacy Policy</DialogTitle>
                                                    </DialogHeader>
                                                    <div className="space-y-4 text-sm text-[var(--text-muted)]">
                                                        <h3 className="font-semibold text-[var(--text)]">1. Information We Collect</h3>
                                                        <p>
                                                            We collect personal information that you voluntarily provide to us when you use the
                                                            NutriBantay contact form, including your name, email address, phone number, and the
                                                            content of your message. We also collect information about your child's nutrition and
                                                            health data if you register for our monitoring program.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">2. How We Use Your Information</h3>
                                                        <p>
                                                            The information we collect is used to respond to your inquiries, provide nutrition
                                                            monitoring services, improve our community health programs, and comply with legal
                                                            obligations. Your data is used solely for the intended purpose of barangay health tracking
                                                            and community wellness initiatives.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">3. Data Protection</h3>
                                                        <p>
                                                            We implement appropriate technical and organizational measures to protect your personal
                                                            data against unauthorized access, alteration, disclosure, or destruction. Access to
                                                            personal data is restricted to authorized personnel only and is protected under applicable
                                                            data privacy laws.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">4. Data Sharing</h3>
                                                        <p>
                                                            We do not sell, trade, or rent your personal information to third parties. We may share
                                                            information with authorized barangay health personnel and government agencies as required
                                                            by law or with your explicit consent.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">5. Data Retention</h3>
                                                        <p>
                                                            We retain your personal data only for as long as necessary to fulfill the purposes for
                                                            which it was collected, or as required by applicable laws and regulations. When data is no
                                                            longer needed, it is securely disposed of.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">6. Your Rights</h3>
                                                        <p>
                                                            You have the right to access, correct, update, or request deletion of your personal data.
                                                            You may also withdraw your consent to data processing at any time. To exercise these
                                                            rights, please contact our data protection officer through the barangay health center.
                                                        </p>

                                                        <h3 className="font-semibold text-[var(--text)]">7. Updates to This Policy</h3>
                                                        <p>
                                                            We may update this Privacy Policy from time to time. Any changes will be posted on this
                                                            page, and we encourage you to review this policy periodically for any updates.
                                                        </p>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            .
                                        </p>

                                        <div>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="group inline-flex w-full cursor-pointer items-center justify-center rounded-md bg-[var(--primary)] px-6 py-3 text-white transition-all hover:opacity-90 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:outline-none sm:w-auto"
                                            >
                                                <span className="mr-2">{processing ? 'Sending...' : 'Send Message to Health Center'}</span>
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
            <section className="animate-fade-in-up bg-[var(--bg-light)] py-16 dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mx-auto mb-12 max-w-3xl text-center">
                        <span className="inline-flex items-center rounded-full bg-[var(--success)]/10 px-3 py-1 text-xs font-medium text-[var(--success)]">
                            OUR LOCATION
                        </span>
                        <h2 className="mt-4 text-3xl font-bold text-[var(--text)]">Visit Us Today</h2>
                        <p className="mt-4 text-[var(--text-muted)]">
                            Bagong Silang Phase 3 Health Center — we are located at Bagong Silang, Caloocan City.
                        </p>
                    </div>

                    <div className="relative overflow-hidden rounded-xl bg-white shadow-sm dark:bg-[var(--bg-light)]">
                        {/* Leaflet Map */}
                        <div className="relative h-[36rem] w-full">
                            {!mapReady && <div className="absolute inset-0 z-[999] animate-pulse rounded-xl bg-gray-100 dark:bg-[var(--bg-card)]" />}
                            <MapContainer
                                center={[14.7695106, 121.0489927]}
                                zoom={16}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={true}
                                className="rounded-xl"
                                whenReady={() => setMapReady(true)}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[14.7695106, 121.0489927]}>
                                    <Popup>
                                        <div className="p-2 text-center">
                                            <h3 className="text-lg font-bold text-[var(--text)]">Bagong Silang Phase 3 Health Center</h3>
                                            <p className="mt-1 text-sm text-[var(--text-muted)]">
                                                Q29X+VJC, Caloocan
                                                <br />
                                                Metro Manila, Philippines
                                            </p>
                                            <p className="mt-2 text-sm text-[var(--text-muted)]">
                                                <strong>Hours:</strong> Mon-Fri: 8AM - 5PM
                                            </p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>

                            {/* Location information overlay */}
                            <div className="pointer-events-auto absolute right-6 bottom-6 left-6 z-[1000] rounded-xl bg-white/90 p-5 shadow-md backdrop-blur-sm dark:bg-[var(--bg-light)]/90">
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
                                        className="inline-flex shrink-0 cursor-pointer items-center rounded-md bg-[#006666] px-4 py-2 text-sm text-white transition-all hover:bg-[#005555] hover:shadow-md"
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
            <section id="faq" className="animate-fade-in-up bg-white py-20 dark:bg-[var(--bg)]">
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
                                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-[var(--border)] dark:bg-[var(--bg-light)]"
                            >
                                <details className="group">
                                    <summary className="flex cursor-pointer items-center justify-between p-6 text-lg font-semibold text-[var(--text)] outline-none">
                                        <span className="flex items-center gap-3">
                                            <span className="inline-flex h-6 w-8 shrink-0 items-center justify-center rounded-md bg-[var(--primary)]/10 text-xs font-bold text-[var(--primary)]">
                                                {String(faq.id).padStart(2, '0')}
                                            </span>
                                            {faq.question}
                                        </span>
                                        <span className="ml-6 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-700 transition-transform duration-300 group-open:rotate-180 dark:bg-[var(--bg)] dark:text-[var(--primary)]">
                                            <ChevronDown className="h-5 w-5" />
                                        </span>
                                    </summary>
                                    <div className="overflow-hidden transition-all duration-300 ease-in-out">
                                        <div className="border-t border-gray-200 px-6 pt-4 pb-6 dark:border-[var(--border)]">
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
        </GuestLayout>
    );
}
