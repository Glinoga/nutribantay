import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { useAppearance } from '@/hooks/use-appearance';
import { router, useForm, usePage } from '@inertiajs/react';
import {
    CalendarCheck,
    CheckCircle,
    ChevronDown,
    Clock,
    Eye,
    Globe,
    Heart,
    Home,
    type LucideIcon,
    Mail,
    MapPin,
    MessageSquare,
    Monitor,
    Phone,
    Save,
    Smartphone,
    TrendingUp,
    Upload,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Website Management', href: route('admin.website.index') },
];

type ContentItem = {
    id: number;
    page: string;
    section: string;
    key: string;
    label: string;
    description: string | null;
    value: string | null;
    type: string;
};

type GroupedContents = Record<string, ContentItem[]>;

type Props = {
    contents: GroupedContents;
};

const tabs = [
    { key: 'home' as const, label: 'Homepage', icon: Home },
    { key: 'contact' as const, label: 'Contact', icon: Phone },
    { key: 'footer' as const, label: 'Footer', icon: Globe },
];

type TabKey = (typeof tabs)[number]['key'];

const pageMeta: Record<string, { icon: LucideIcon; title: string; description: string; color: string }> = {
    home: { icon: Home, title: 'Homepage', description: 'Manage homepage hero text, statistics, and call-to-action sections.', color: 'from-teal-500 to-cyan-500' },
    contact: { icon: Phone, title: 'Contact Information', description: 'Update phone numbers, email addresses, location details, office hours, and FAQs.', color: 'from-rose-500 to-pink-500' },
    footer: { icon: Globe, title: 'Footer Content', description: 'Manage footer tagline, contact details, social media links, and copyright text.', color: 'from-sky-500 to-blue-500' },
};

const sectionLabels: Record<string, { icon: LucideIcon; label: string }> = {
    branding: { icon: Upload, label: 'Branding' },
    hero: { icon: Home, label: 'Hero Section' },
    stats: { icon: TrendingUp, label: 'Statistics' },
    cta: { icon: MessageSquare, label: 'Call to Action' },
    info: { icon: Phone, label: 'Contact Details' },
    hours: { icon: Clock, label: 'Office Hours' },
    map: { icon: MapPin, label: 'Map Location' },
    faq: { icon: MessageSquare, label: 'Frequently Asked Questions' },
    about: { icon: Smartphone, label: 'About' },
    social: { icon: Globe, label: 'Social Media' },
    legal: { icon: CheckCircle, label: 'Legal' },
};

const fieldIcons: Record<string, LucideIcon> = {
    tel: Phone,
    email: Mail,
    url: Globe,
    text: Smartphone,
    textarea: MessageSquare,
};

const guestVars = {
    light: {
        '--p': '#0891B2',
        '--s': '#be185d',
        '--t': '#164E63',
        '--tm': '#475569',
        '--bg': '#ECFEFF',
        '--bgl': '#F0FDFA',
        '--bgc': '#ffffff',
        '--b': '#E2E8F0',
        '--sc': '#059669',
    },
    dark: {
        '--p': '#22D3EE',
        '--s': '#fb7185',
        '--t': '#F1F5F9',
        '--tm': '#94A3B8',
        '--bg': '#0f172a',
        '--bgl': '#1e293b',
        '--bgc': '#1e293b',
        '--b': '#334155',
        '--sc': '#34d399',
    },
} as const;

const FAQ_COUNT = 6;

function SectionCard({
    section,
    items,
    data,
    setData,
}: {
    section: string;
    items: ContentItem[];
    data: Record<string, string>;
    setData: (key: string, value: string) => void;
}) {
    const sectionInfo = sectionLabels[section] ?? { icon: Smartphone, label: section };
    const SectionIcon = sectionInfo.icon;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                    <SectionIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                    {sectionInfo.label}
                </h3>
            </div>
            <div className="grid gap-5">
                {items.map((item) => {
                    const IconComponent = fieldIcons[item.type] ?? Smartphone;
                    return (
                        <div key={item.key} className="group">
                            <div className="mb-1.5 flex items-center gap-2">
                                <IconComponent className="h-3.5 w-3.5 text-gray-400" />
                                <Label htmlFor={item.key} className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {item.label}
                                </Label>
                            </div>
                            {item.description && (
                                <p className="mb-2 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                                    {item.description}
                                </p>
                            )}
                            {item.type === 'textarea' ? (
                                <Textarea
                                    id={item.key}
                                    value={data[item.key] ?? ''}
                                    onChange={(e) => setData(item.key, e.target.value)}
                                    className="min-h-[80px] border-gray-200 bg-white/70 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-gray-600 dark:focus:border-teal-500"
                                />
                            ) : (
                                <Input
                                    id={item.key}
                                    type={item.type === 'tel' ? 'tel' : item.type === 'email' ? 'email' : item.type === 'url' ? 'url' : 'text'}
                                    value={data[item.key] ?? ''}
                                    onChange={(e) => setData(item.key, e.target.value)}
                                    className="h-10 border-gray-200 bg-white/70 text-sm shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-gray-300 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20 dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-gray-600 dark:focus:border-teal-500"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function HomePreview({ data, previewMode }: { data: Record<string, string>; previewMode: 'desktop' | 'mobile' }) {
    const c = (key: string, fb = '') => data[key]?.trim() || fb;

    const logoUrl = c('logo_url') || '/NutriBantayLogo.svg';

    const stats = [
        { value: c('stat_1_value'), label: c('stat_1_label'), subtitle: c('stat_1_subtitle'), icon: TrendingUp, borderColor: 'var(--p)', iconBg: 'rgba(8,145,178,0.1)', iconColor: '#0891B2' },
        { value: c('stat_2_value'), label: c('stat_2_label'), subtitle: c('stat_2_subtitle'), icon: CalendarCheck, borderColor: 'var(--s)', iconBg: 'rgba(190,24,93,0.1)', iconColor: '#be185d' },
        { value: c('stat_3_value'), label: c('stat_3_label'), subtitle: c('stat_3_subtitle'), icon: Heart, borderColor: '#d97706', iconBg: '#fef3c7', iconColor: '#d97706' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <img src={logoUrl} alt="" className="h-8 w-8" />
                <span className="text-lg font-bold" style={{ color: 'var(--p)' }}>NutriBantay</span>
            </div>

            <h2 className="text-2xl font-bold leading-tight" style={{ color: 'var(--t)' }}>
                {c('hero_title') || 'Hero Title'}
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--tm)' }}>
                {c('hero_description') || 'Hero description text.'}
            </p>

            <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center rounded-md px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: '#008080' }}>
                    {c('cta_primary_label') || 'View Announcements'}
                </span>
                <span className="inline-flex items-center rounded-md border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: 'var(--p)', color: 'var(--p)' }}>
                    {c('cta_secondary_label') || 'Contact'}
                </span>
            </div>

            <div className={`grid gap-3 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-3'}`}>
                {stats.map((stat, i) => {
                    const StatIcon = stat.icon;
                    return (
                        <div key={i} className="rounded-md border p-4" style={{ borderColor: 'var(--b)', backgroundColor: 'var(--bgc)', borderTop: `4px solid ${stat.borderColor}` }}>
                            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md" style={{ backgroundColor: stat.iconBg, color: stat.iconColor }}>
                                <StatIcon className="h-4 w-4" />
                            </div>
                            <p className="text-xl font-bold" style={{ color: 'var(--t)' }}>{stat.value || '—'}</p>
                            <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--tm)' }}>{stat.label || 'Label'}</p>
                            {stat.subtitle && <p className="mt-0.5 text-[10px]" style={{ color: 'var(--tm)', opacity: 0.7 }}>{stat.subtitle}</p>}
                        </div>
                    );
                })}
            </div>

            <div className="rounded-md p-6 text-center" style={{ backgroundColor: '#006666' }}>
                <h3 className="text-lg font-bold text-white">{c('cta_heading') || 'CTA Heading'}</h3>
                <p className="mt-2 text-sm text-white/80">{c('cta_text') || 'CTA description text.'}</p>
                <span className="mt-4 inline-flex items-center rounded-md bg-white px-5 py-2 text-sm font-semibold" style={{ color: '#006666' }}>
                    {c('cta_button_label') || 'Contact Us'}
                </span>
            </div>
        </div>
    );
}

function ContactPreview({ data, previewMode }: { data: Record<string, string>; previewMode: 'desktop' | 'mobile' }) {
    const c = (key: string, fb = '') => data[key]?.trim() || fb;
    const logoUrl = c('logo_url') || '/NutriBantayLogo.svg';

    const contactCards = [
        { icon: Phone, label: 'Call Us', sub: c('hours_subtext'), value: c('phone'), border: 'border-l-4 border-teal-600', iconBg: 'bg-[var(--p)]/10 text-[var(--p)]' },
        { icon: Mail, label: 'Email Us', sub: "We'll respond within 24h", value: c('email'), border: 'border-l-4 border-rose-500', iconBg: 'bg-[var(--s)]/10 text-[var(--s)]' },
        { icon: MapPin, label: 'Visit Us', sub: c('location_name'), value: c('address'), border: 'border-l-4 border-emerald-500', iconBg: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
        { icon: Clock, label: 'Office Hours', sub: 'We are only available on:', value: c('office_hours'), border: 'border-l-4 border-sky-500', iconBg: 'bg-sky-50 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400' },
    ];

    const faqs = Array.from({ length: FAQ_COUNT }, (_, i) => ({
        question: c(`faq_${i + 1}_question`),
        answer: c(`faq_${i + 1}_answer`),
    }));

    const lat = parseFloat(c('latitude', '14.7695106'));
    const lng = parseFloat(c('longitude', '121.0489927'));
    const hasValidCoords = !isNaN(lat) && !isNaN(lng);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <img src={logoUrl} alt="" className="h-8 w-8" />
                <span className="text-lg font-bold" style={{ color: 'var(--p)' }}>NutriBantay</span>
            </div>

            <div className={`grid gap-3 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {contactCards.map((card, i) => {
                    const CardIcon = card.icon;
                    return (
                        <div key={i} className={`rounded-md bg-[var(--bgc)] p-4 shadow-sm ${card.border}`} style={{ borderColor: 'var(--b)' }}>
                            <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}>
                                <CardIcon className="h-5 w-5" />
                            </div>
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--t)' }}>{card.label}</h3>
                            {card.sub && <p className="mt-0.5 text-xs" style={{ color: 'var(--tm)' }}>{card.sub}</p>}
                            <p className="mt-1 break-all text-sm font-medium" style={{ color: 'var(--t)' }}>{card.value || '—'}</p>
                        </div>
                    );
                })}
            </div>

            {/* Map Preview */}
            <div>
                <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--t)' }}>Our Location</h3>
                {hasValidCoords ? (
                    <>
                        <div className="relative overflow-hidden rounded-md" style={{ border: '1px solid var(--b)', height: '200px' }}>
                            <iframe
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                title="Location Map"
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between rounded-md bg-[var(--bgc)]/50 px-3 py-2" style={{ border: '1px solid var(--b)' }}>
                            <span className="text-xs" style={{ color: 'var(--tm)' }}>{c('location_name') || 'Health Center'}</span>
                            <a
                                href={`https://maps.google.com/maps?q=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--p)' }}
                            >
                                <MapPin className="h-3 w-3" />
                                Get Directions
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center rounded-md border border-dashed bg-[var(--bgc)] p-6" style={{ borderColor: 'var(--b)' }}>
                        <p className="text-xs" style={{ color: 'var(--tm)' }}>Enter latitude and longitude to see the map</p>
                    </div>
                )}
            </div>

            <div>
                <h3 className="mb-3 text-sm font-bold" style={{ color: 'var(--t)' }}>Frequently Asked Questions</h3>
                <div className="space-y-2">
                    {faqs.map((faq, i) => (
                        <div key={i} className="overflow-hidden rounded-md border" style={{ borderColor: 'var(--b)' }}>
                            <div className="flex items-center justify-between px-4 py-3">
                                <span className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--t)' }}>
                                    <span className="inline-flex h-5 w-7 items-center justify-center rounded text-[10px] font-bold" style={{ backgroundColor: 'var(--p)', color: 'white' }}>
                                        {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {faq.question || <span className="italic opacity-50">Question {i + 1}</span>}
                                </span>
                                <ChevronDown className="h-4 w-4 shrink-0" style={{ color: 'var(--p)' }} />
                            </div>
                            {faq.answer && (
                                <div className="border-t px-4 py-3" style={{ borderColor: 'var(--b)' }}>
                                    <p className="text-xs leading-relaxed" style={{ color: 'var(--tm)' }}>{faq.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function FooterPreview({ data }: { data: Record<string, string> }) {
    const c = (key: string, fb = '') => data[key]?.trim() || fb;
    const logoUrl = c('logo_url') || '/NutriBantayLogo.svg';

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <img src={logoUrl} alt="" className="h-8 w-8" />
                <span className="text-lg font-bold" style={{ color: 'var(--p)' }}>NutriBantay</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--tm)' }}>
                {c('tagline') || 'Tagline text.'}
            </p>

            <div className="space-y-3">
                {[
                    { icon: MapPin, text: c('address') },
                    { icon: Phone, text: c('phone') },
                    { icon: Mail, text: c('email') },
                ].map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                        <div key={i} className="flex items-center gap-3 text-sm" style={{ color: 'var(--tm)' }}>
                            <ItemIcon className="h-4 w-4 shrink-0" style={{ color: 'var(--p)' }} />
                            <span className="break-all">{item.text || '—'}</span>
                        </div>
                    );
                })}
            </div>

            <div className="border-t pt-4 text-center text-xs" style={{ borderColor: 'var(--b)', color: 'var(--tm)' }}>
                &copy; 2026 {c('copyright_text') || 'NutriBantay. All rights reserved.'}
            </div>
        </div>
    );
}

function PreviewPanel({
    data,
    activeTab,
}: {
    data: Record<string, string>;
    activeTab: TabKey;
}) {
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    const { isDark } = useAppearance();
    const vars = guestVars[isDark ? 'dark' : 'light'];

    const PreviewComponent = useMemo(() => {
        switch (activeTab) {
            case 'home': return HomePreview;
            case 'contact': return ContactPreview;
            case 'footer': return FooterPreview;
        }
    }, [activeTab]);

    return (
        <div className="sticky top-6">
            <Card className="overflow-hidden border-0 bg-white/80 shadow-xl shadow-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:shadow-gray-900/50">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100/50 px-5 py-4 dark:from-gray-800 dark:to-gray-800/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Live Preview</span>
                        </div>
                        <div className="flex overflow-hidden rounded-md border bg-white p-0.5 shadow-sm dark:border-gray-600 dark:bg-gray-700">
                                <button
                                    onClick={() => setPreviewMode('desktop')}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        previewMode === 'desktop'
                                            ? 'bg-teal-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Monitor className="h-3.5 w-3.5" />
                                    Desktop
                                </button>
                                <button
                                    onClick={() => setPreviewMode('mobile')}
                                    className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                        previewMode === 'mobile'
                                            ? 'bg-teal-500 text-white shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                    }`}
                                >
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Mobile
                                </button>
                            </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div
                        className={`${previewMode === 'mobile' ? 'mx-auto max-w-[320px]' : ''} overflow-y-auto`}
                        style={{ maxHeight: 'calc(100vh - 16rem)' }}
                    >
                        <div
                            className="space-y-1 p-5"
                            style={{
                                backgroundColor: vars['--bg'],
                                fontFamily: "'Montserrat', sans-serif",
                                minHeight: previewMode === 'mobile' ? '500px' : '400px',
                            }}
                        >
                            <style>{`
                                .preview-root {
                                    --p: ${vars['--p']};
                                    --s: ${vars['--s']};
                                    --t: ${vars['--t']};
                                    --tm: ${vars['--tm']};
                                    --bg: ${vars['--bg']};
                                    --bgl: ${vars['--bgl']};
                                    --bgc: ${vars['--bgc']};
                                    --b: ${vars['--b']};
                                    --sc: ${vars['--sc']};
                                }
                                .preview-root * {
                                    font-family: 'Montserrat', sans-serif;
                                }
                            `}</style>
                            <div className="preview-root">
                                <PreviewComponent data={data} previewMode={previewMode} />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <div className="border-t bg-gray-50/50 px-5 py-3 text-center dark:border-gray-700 dark:bg-gray-800/50">
                    <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        Preview updates in real-time as you type
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default function WebsiteManagement() {
    const { contents } = usePage<Props>().props;
    const { flash } = usePage<{ flash: { success?: string; error?: string } }>().props;
    const [activeTab, setActiveTab] = useState<TabKey>('home');

    const allItems = useMemo(() => Object.values(contents).flat(), [contents]);
    const formDefaults: Record<string, string> = {};
    allItems.forEach((item) => {
        formDefaults[item.key] = item.value ?? '';
    });

    const { data, setData } = useForm(formDefaults);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (flash?.success) {
            smartToast.success(flash.success);
        } else if (flash?.error) {
            smartToast.error(flash.error);
        }
    }, [flash]);

    const handleSave = () => {
        const contentArray = Object.entries(data).map(([key, value]) => ({ key, value }));

        setIsSaving(true);
        router.put(route('admin.website.update'), {
            contents: contentArray,
        }, {
            preserveScroll: true,
            onFinish: () => setIsSaving(false),
        });
    };

    const visibleItems = contents[activeTab] ?? [];
    const groupedBySection: Record<string, ContentItem[]> = {};
    visibleItems.forEach((item) => {
        if (!groupedBySection[item.section]) {
            groupedBySection[item.section] = [];
        }
        groupedBySection[item.section].push(item);
    });

    const meta = pageMeta[activeTab];
    const PageIcon = meta.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="relative min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(8,145,178,0.06),transparent_50%)]" />

                <div className="relative px-4 pb-12 pt-6 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6 rounded-3xl border border-white/20 bg-white/80 p-5 shadow-xl shadow-gray-200/50 backdrop-blur-xl dark:border-gray-700/30 dark:bg-gray-800/80 dark:shadow-gray-900/50">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Website Management</h1>
                                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                                        Update content shown on public pages
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-10 cursor-pointer rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-5 text-sm font-medium text-white shadow-lg shadow-teal-200/50 transition-all duration-200 hover:from-teal-500 hover:to-cyan-500 hover:shadow-xl active:scale-[0.96] disabled:opacity-50"
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 lg:flex-row">
                        {/* Editor Panel */}
                        <div className="w-full lg:w-1/2">
                            <div className="space-y-6">
                                {/* Page Tabs */}
                                <div className="flex gap-1 rounded-xl border border-gray-100 bg-white/70 p-1 shadow-sm backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/70" role="tablist">
                                    {tabs.map((tab) => {
                                        const TabIcon = tab.icon;
                                        const isActive = activeTab === tab.key;
                                        return (
                                            <button
                                                key={tab.key}
                                                role="tab"
                                                aria-selected={isActive}
                                                aria-controls={`panel-${tab.key}`}
                                                onClick={() => setActiveTab(tab.key)}
                                                className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                    isActive
                                                        ? 'bg-white text-teal-700 shadow-sm dark:bg-gray-700 dark:text-teal-300'
                                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                }`}
                                            >
                                                <TabIcon className="h-4 w-4" />
                                                <span className="hidden sm:inline">{tab.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Form Fields */}
                                <div
                                    id={`panel-${activeTab}`}
                                    role="tabpanel"
                                    aria-labelledby={`tab-${activeTab}`}
                                    className="transition-opacity duration-200"
                                >
                                    <Card className="overflow-hidden border-0 bg-white/80 shadow-xl shadow-gray-200/50 backdrop-blur-xl dark:bg-gray-800/80 dark:shadow-gray-900/50">
                                        <CardHeader
                                            className={`bg-gradient-to-r ${meta.color} relative border-b border-white/10 pb-5`}
                                        >
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
                                            <div className="relative flex items-start gap-4 py-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm backdrop-blur-sm">
                                                    <PageIcon className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1">
                                                    <CardTitle className="text-lg text-white">{meta.title}</CardTitle>
                                                    <p className="mt-0.5 text-sm text-white/70">{meta.description}</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-8 p-5">
                                            {/* Branding Section — Logo Upload */}
                                            {activeTab === 'home' && (
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm dark:bg-gray-800">
                                                            <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                                        </div>
                                                        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">Branding</h3>
                                                    </div>
                                                    <div className="flex items-center gap-4 rounded-md border border-dashed p-4" style={{ borderColor: 'var(--b)' }}>
                                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white" style={{ borderColor: 'var(--b)' }}>
                                                            <img
                                                                src={data.logo_url || '/NutriBantayLogo.svg'}
                                                                alt="Logo preview"
                                                                className="h-full w-full object-contain p-1"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="mb-1 text-xs font-medium text-gray-700 dark:text-gray-200">Upload a new logo</p>
                                                            <p className="mb-2 text-[10px] text-gray-500">Accepts JPG, PNG, GIF, SVG (max 2MB)</p>
                                                            <div className="flex gap-2">
                                                                <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                                                                    <Upload className="h-3.5 w-3.5" />
                                                                    Choose File
                                                                    <input
                                                                        type="file"
                                                                        accept="image/jpeg,image/png,image/gif,image/svg+xml"
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (!file) return;
                                                                            const formData = new FormData();
                                                                            formData.append('logo', file);
                                                                            router.post(route('admin.website.upload-logo'), formData, {
                                                                                onSuccess: () => {
                                                                                    router.reload({ only: ['contents'] });
                                                                                },
                                                                            });
                                                                        }}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            {Object.entries(groupedBySection).map(([sectionKey, sectionItems]) => (
                                                <SectionCard
                                                    key={sectionKey}
                                                    section={sectionKey}
                                                    items={sectionItems}
                                                    data={data}
                                                    setData={setData}
                                                />
                                            ))}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Bottom Save */}
                                <div className="flex justify-center">
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="h-12 w-full cursor-pointer rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-8 text-sm font-medium text-white shadow-lg shadow-teal-200/50 transition-all duration-200 hover:from-teal-500 hover:to-cyan-500 hover:shadow-xl active:scale-[0.96] disabled:opacity-50"
                                    >
                                        <Save className="mr-2 h-5 w-5" />
                                        {isSaving ? 'Saving...' : 'Save All Changes'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className="w-full lg:w-1/2">
                            <PreviewPanel data={data} activeTab={activeTab} />
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
