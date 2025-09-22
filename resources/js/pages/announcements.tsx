import GuestLayout from '@/layouts/guest-layout';

// Sample announcement data 
const announcements = [
    {
        id: 1,
        title: 'Free Nutrition Assessment for Children',
        category: 'Nutrition Program',
        categoryColor: 'info',
        date: 'September 24, 2025',
        summary: 'Join us for free nutrition assessments for children ages 0-5 this coming weekend.',
        content: 'We are pleased to announce that our health team will be conducting free nutrition assessments for children ages 0-5 this coming weekend. The assessment will include height and weight measurements, BMI calculation, and nutritional advice from our registered nutritionists. Each family will receive a personalized nutrition plan based on their child\'s assessment results. The event will take place at the Barangay Health Center from 8:00 AM to 5:00 PM on Saturday and Sunday.'
    },
    {
        id: 2,
        title: 'Parent\'s Workshop on Child Nutrition',
        category: 'Workshop',
        categoryColor: 'warning',
        date: 'October 5, 2025',
        summary: 'Learn effective strategies for ensuring your child receives proper nutrition at all development stages.',
        content: 'We invite all parents to join our comprehensive workshop on child nutrition. This workshop will cover essential topics such as age-appropriate food choices, meal planning on a budget, and addressing picky eating habits. Our expert speakers will share practical tips and answer your questions about your child\'s nutritional needs. The workshop will be held at the Community Center from 9:00 AM to 12:00 PM. Registration is free but limited to 50 participants, so please sign up early!'
    },
    {
        id: 3,
        title: 'Barangay Health Fair',
        category: 'Community',
        categoryColor: 'success',
        date: 'October 15, 2025',
        summary: 'Annual health fair featuring free checkups, nutritional counseling, and activities for the whole family.',
        content: 'Mark your calendars for our Annual Barangay Health Fair! This event brings together health professionals from various fields to provide free services to our community. Services include basic health checkups, dental examinations, vision screening, nutritional counseling, and vaccination updates. There will also be fun activities for children and educational booths for adults. The Health Fair will run from 8:00 AM to 4:00 PM at the Barangay Plaza. All residents are encouraged to attend this important community health event.'
    },
    {
        id: 4,
        title: 'Nutrition Feeding Program Launch',
        category: 'Program',
        categoryColor: 'primary',
        date: 'October 30, 2025',
        summary: 'New weekly feeding program for undernourished children in our barangay.',
        content: 'We are excited to announce the launch of our new weekly Nutrition Feeding Program aimed at addressing undernourishment among children in our barangay. The program will provide nutritious meals every Wednesday and Friday to identified children with nutrition concerns. In addition to meals, families will receive education on preparing balanced, affordable meals at home. The program is made possible through the generous support of local businesses and volunteers. If you wish to contribute or volunteer for this program, please contact the Barangay Health Office.'
    },
    {
        id: 5,
        title: 'Mother and Child Health Seminar',
        category: 'Education',
        categoryColor: 'secondary',
        date: 'November 10, 2025',
        summary: 'Educational seminar focusing on maternal nutrition and its impact on child development.',
        content: 'The Barangay Health Office, in partnership with the Municipal Health Department, is organizing a Mother and Child Health Seminar. This educational event will focus on the importance of maternal nutrition before, during, and after pregnancy, and its impact on child development. Topics include proper prenatal nutrition, breastfeeding benefits and techniques, and introducing solid foods to infants. The seminar will feature speakers from the regional hospital and nutrition experts. It will be held at the Barangay Multipurpose Hall from 1:00 PM to 5:00 PM. Light refreshments will be provided.'
    },
    {
        id: 6,
        title: 'Vegetable Gardening for Nutrition Workshop',
        category: 'Workshop',
        categoryColor: 'warning',
        date: 'November 20, 2025',
        summary: 'Learn how to grow nutritious vegetables in limited spaces to improve family nutrition.',
        content: 'Join our practical workshop on vegetable gardening in limited spaces. This hands-on session will teach participants how to grow nutritious vegetables even in small areas using container gardening, vertical gardening, and other space-saving techniques. Participants will learn about soil preparation, plant selection for maximum nutrition, organic pest control, and harvesting tips. Each participant will receive starter seeds and a small gardening kit. The workshop will be conducted at the Barangay Community Garden from 8:00 AM to 11:00 AM. Registration is required as spaces are limited to 30 participants.'
    },
];

// get color class based on category
function getCategoryColorClass(categoryColor: string) {
    const colorMap: Record<string, string> = {
        'primary': 'bg-[var(--primary)]',
        'secondary': 'bg-[var(--secondary)]',
        'success': 'bg-[var(--success)]',
        'danger': 'bg-[var(--danger)]',
        'warning': 'bg-[var(--warning)]',
        'info': 'bg-[var(--info)]',
    };
    
    return colorMap[categoryColor] || 'bg-[var(--primary)]';
}

export default function Announcements() {
    return (
        <GuestLayout title="Announcements">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] pt-24 pb-20 md:pt-28 md:pb-20">
                <div className="absolute top-0 left-0 -z-10 h-full w-1/2 opacity-20 md:opacity-30">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="var(--secondary)" d="M42.8,-73.2C55.9,-67.3,67.2,-56.9,74.3,-44C81.5,-31,84.5,-15.5,83.8,-0.4C83.2,14.8,78.8,29.5,71.6,42.9C64.3,56.3,54.2,68.2,41.5,75.8C28.8,83.3,14.4,86.3,-0.3,86.9C-15.1,87.5,-30.2,85.6,-41.7,78C-53.3,70.4,-61.3,57.1,-66.6,43.7C-72,30.3,-74.7,15.1,-76.3,-0.9C-78,-16.9,-78.6,-33.8,-72,-47.2C-65.4,-60.6,-51.6,-70.4,-37.4,-75.5C-23.3,-80.6,-8.8,-80.9,3.1,-76.5C15,-72,29.8,-79.1,42.8,-73.2Z" transform="translate(100 100)" />
                    </svg>
                </div>
                
                <div className="container mx-auto px-6 text-center lg:px-8">
                    <span className="mb-2 inline-block rounded-full bg-[var(--bg)] px-4 py-1 text-sm font-medium text-[var(--secondary)]">
                        COMMUNITY UPDATES
                    </span>
                    <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                        <span className="gradient-text">Latest Announcements</span>
                    </h1>
                    <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--text-muted)] md:text-xl">
                        Stay informed about upcoming events, programs, and initiatives in our community
                    </p>
                    
                    <div className="relative z-10 mx-auto mt-8 flex max-w-md items-center rounded-full border border-[var(--border)] bg-white/80 p-1 shadow-lg backdrop-blur-sm dark:bg-[var(--bg)]/80">
                        <svg xmlns="http://www.w3.org/2000/svg" className="ml-3 h-5 w-5 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text" 
                            placeholder="Search announcements..." 
                            className="w-full bg-transparent px-4 py-3 text-[var(--text)] focus:outline-none" 
                        />
                    </div>
                </div>
            </section>

            {/* Announcements List */}
            <section className="py-16 bg-white dark:bg-[var(--bg)]">
                <div className="container mx-auto px-6 lg:px-8">
                    <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="mb-2 inline-block rounded-full bg-[var(--bg-light)] px-4 py-1 text-sm font-medium text-[var(--primary)]">
                                EVENTS & PROGRAMS
                            </span>
                            <h2 className="text-3xl font-bold text-[var(--text)]">
                                Upcoming Activities
                            </h2>
                        </div>
                        
                        <div className="mt-4 flex space-x-2 md:mt-0">
                            <button className="rounded-full border-2 border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white">
                                All
                            </button>
                            <button className="rounded-full border-2 border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]">
                                Workshops
                            </button>
                            <button className="rounded-full border-2 border-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary)]">
                                Programs
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {announcements.map((announcement) => (
                            <div 
                                key={announcement.id} 
                                className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-[var(--bg-light)]"
                            >
                                <div className="absolute inset-x-0 top-0 h-2" style={{
                                    backgroundColor: `var(--${announcement.categoryColor})`
                                }}></div>
                                
                                <div className="p-6 pt-8">
                                    <span className={`mb-3 inline-block rounded-full ${getCategoryColorClass(announcement.categoryColor)} px-3 py-1 text-xs font-medium text-white`}>
                                        {announcement.category}
                                    </span>
                                    <h3 className="mb-2 text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                        {announcement.title}
                                    </h3>
                                    <p className="mb-3 text-sm text-[var(--text-muted)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {announcement.date}
                                    </p>
                                    <div className="mb-4 h-0.5 w-16 rounded-full bg-[var(--border-muted)]"></div>
                                    <p className="mb-6 text-[var(--text)] line-clamp-4">
                                        {announcement.content}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <button 
                                            className="rounded-full bg-[var(--bg-light)] px-4 py-2 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)] hover:text-white"
                                        >
                                            Read More
                                        </button>
                                        
                                        <button 
                                            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition-colors hover:border-[var(--primary)] hover:text-[var,--primary)]"
                                            title="Share"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="mt-16 flex justify-center">
                        <div className="inline-flex rounded-md shadow">
                            <button className="inline-flex items-center justify-center rounded-l-md border border-r-0 border-[var(--border)] bg-white px-4 py-2 text-[var(--text-muted)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button className="border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-white">1</button>
                            <button className="border border-[var(--border)] bg-white px-4 py-2 text-[var(--text)]">2</button>
                            <button className="border border-[var(--border)] bg-white px-4 py-2 text-[var(--text)]">3</button>
                            <button className="inline-flex items-center justify-center rounded-r-md border border-[var(--border)] bg-white px-4 py-2 text-[var(--text-muted)]">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter Section */}
            <section className="relative overflow-hidden bg-[var(--primary)] py-16">
                <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[var(--secondary)] opacity-20"></div>
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[var(--secondary)] opacity-20"></div>
                
                <div className="container relative mx-auto px-6 text-center lg:px-8">
                    <h2 className="mb-auto text-3xl font-bold text-white md:text-4xl">
                        Stay Informed, Stay Healthy
                    </h2>
                </div>
            </section>
        </GuestLayout>
    );
}