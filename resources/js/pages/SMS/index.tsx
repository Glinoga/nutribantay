import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { displayPhoneNumber } from '@/lib/phoneUtils';
import { route } from '@/lib/routes';
import { type BreadcrumbItem } from '@/types';
import { smartToast } from '@/utils/smartToast';
import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Mail, MessageSquare, Phone, Search, Send, Sparkles, Users, X, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface User {
    id: number;
    name: string;
    phone: string;
}

interface SMSPageProps {
    users: User[];
    credits: number;
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'SMS', href: route('sms.index') }];

export default function SMSIndex({ users, credits }: SMSPageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [recipientType, setRecipientType] = useState<'single' | 'multiple' | 'all'>('multiple');
    const [characterCount, setCharacterCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [lastFormData, setLastFormData] = useState<{ recipientType: string; recipients: number[]; message: string } | null>(null);
    const maxCharacters = 1600;

    useEffect(() => {
        if (flash?.success) {
            smartToast.success(flash.success as string);
        } else if (flash?.error) {
            smartToast.error(flash.error as string);
        } else if (flash?.warning) {
            smartToast.info(flash.warning as string);
        }
    }, [flash]);

    const handleRecipientTypeChange = (value: 'single' | 'multiple' | 'all') => {
        setRecipientType(value);
        setSelectedUsers([]);
    };

    const handleUserSelect = (userId: number) => {
        let newSelection: number[];

        if (recipientType === 'single') {
            newSelection = [userId];
        } else {
            if (selectedUsers.includes(userId)) {
                newSelection = selectedUsers.filter((id) => id !== userId);
            } else {
                newSelection = [...selectedUsers, userId];
            }
        }

        setSelectedUsers(newSelection);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const messageText = e.target.value;
        setCharacterCount(messageText.length);
        setMessage(messageText);
        setIsTyping(true);

        setTimeout(() => setIsTyping(false), 2000);
    };

    const getRecipientCount = () => {
        if (recipientType === 'all') {
            return users.length;
        }
        return selectedUsers.length;
    };

    const filteredUsers = useMemo(
        () => users.filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery)),
        [users, searchQuery],
    );

    const selectAllFiltered = () => {
        const filteredIds = filteredUsers.map((u) => u.id);
        setSelectedUsers(filteredIds);
    };

    const deselectAll = () => {
        setSelectedUsers([]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!message.trim()) {
            smartToast.error('Please enter a message');
            return;
        }

        if (recipientType !== 'all' && selectedUsers.length === 0) {
            smartToast.error('Please select at least one recipient');
            return;
        }

        // Store form data for potential retry
        setLastFormData({
            recipientType,
            recipients: selectedUsers,
            message,
        });

        // Show confirmation dialog
        setShowConfirmDialog(true);
    };

    const confirmSend = () => {
        setShowConfirmDialog(false);
        setIsSending(true);

        const loadingToast = smartToast.loading('Sending SMS...');

        router.post(
            route('sms.send'),
            {
                recipient_type: recipientType,
                recipients: selectedUsers,
                message: message,
            },
            {
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                    setIsSending(false);
                    setMessage('');
                    setSelectedUsers([]);
                    setCharacterCount(0);
                    setLastFormData(null);
                },
                onError: () => {
                    smartToast.dismiss(loadingToast);
                    setIsSending(false);
                    // Keep form data for retry - show retry option
                    smartToast.error('Failed to send SMS. Please try again.');
                },
            },
        );
    };

    const handleRetry = () => {
        if (lastFormData) {
            setRecipientType(lastFormData.recipientType as 'single' | 'multiple' | 'all');
            setSelectedUsers(lastFormData.recipients);
            setMessage(lastFormData.message);
            setCharacterCount(lastFormData.message.length);
            // Trigger send again
            setTimeout(() => {
                const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
                handleSubmit(fakeEvent);
            }, 100);
        }
    };

    const cancelSend = () => {
        setShowConfirmDialog(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Send SMS" />

            <div className="min-h-screen bg-gradient-to-br from-teal-50/50 via-white to-cyan-50/50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(13,148,136,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.12),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_left,rgba(8,145,178,0.25),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(34,211,238,0.25),transparent_50%)]" />

                <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Pill Badge */}
                    <div className="mb-6 pt-8 text-center">
                        <div className="mb-4 inline-flex items-center gap-3 rounded-full border border-teal-100/50 bg-white/90 px-6 py-3 shadow-lg backdrop-blur-sm dark:border-teal-800/50 dark:bg-gray-800/90">
                            <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                            <span className="text-sm font-semibold text-teal-700 dark:text-teal-400">SMS Management</span>
                        </div>
                    </div>

                    {/* Glassmorphic Header Card */}
                    <div className="relative mb-8 text-center">
                        <div className="relative mx-auto max-w-2xl rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 opacity-50 blur-lg"></div>
                                    <div className="relative rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-4 shadow-lg">
                                        <MessageSquare className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-teal-600 via-cyan-600 to-teal-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-teal-300 dark:via-cyan-300 dark:to-teal-300">
                                        SMS Messenger
                                    </h1>
                                    <p className="mt-1 flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Sparkles className="h-4 w-4" />
                                        Send messages to guardians instantly
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:border-teal-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Users</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600 dark:text-teal-400">{users.length}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <Users className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card cursor-pointer rounded-xl border border-cyan-100/50 bg-white p-4 shadow-md transition-all hover:border-cyan-200 hover:shadow-lg dark:border-cyan-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Selected</p>
                                    <p className="mt-1 text-2xl font-bold text-cyan-600 dark:text-cyan-400">{getRecipientCount()}</p>
                                </div>
                                <div className="rounded-full bg-cyan-50 p-2.5 dark:bg-cyan-900/30">
                                    <CheckCircle2 className="h-5 w-5 text-cyan-500 dark:text-cyan-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card cursor-pointer rounded-xl border border-green-100/50 bg-white p-4 shadow-md transition-all hover:border-green-200 hover:shadow-lg dark:border-green-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">SMS Credits</p>
                                    <p className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{credits}</p>
                                </div>
                                <div className="rounded-full bg-green-50 p-2.5 dark:bg-green-900/30">
                                    <Zap className="h-5 w-5 text-green-500 dark:text-green-400" />
                                </div>
                            </div>
                        </div>
                        <div className="stat-card cursor-pointer rounded-xl border border-teal-100/50 bg-white p-4 shadow-md transition-all hover:border-teal-200 hover:shadow-lg dark:border-teal-800/50 dark:bg-gray-800/80">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Send Mode</p>
                                    <p className="mt-1 text-2xl font-bold text-teal-600 capitalize dark:text-teal-400">{recipientType}</p>
                                </div>
                                <div className="rounded-full bg-teal-50 p-2.5 dark:bg-teal-900/30">
                                    <MessageSquare className="h-5 w-5 text-teal-500 dark:text-teal-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        {/* Recipients Panel */}
                        <div className="space-y-4 lg:col-span-1">
                            <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                                <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 py-4 dark:from-teal-900/20 dark:to-cyan-900/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                                Recipients
                                            </CardTitle>
                                            <CardDescription className="dark:text-gray-400">Select who receives your message</CardDescription>
                                        </div>
                                        <div className="rounded-full bg-teal-600 px-3 py-1 text-sm font-semibold text-white">
                                            {getRecipientCount()}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 p-4">
                                    {/* Recipient Type Selector */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium dark:text-gray-300">Send Mode</Label>
                                        <Select value={recipientType} onValueChange={handleRecipientTypeChange}>
                                            <SelectTrigger className="border transition-colors hover:border-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="single">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4" />
                                                        Single Recipient
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="multiple">
                                                    <div className="flex items-center gap-2">
                                                        <Users className="h-4 w-4" />
                                                        Multiple Recipients
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="all">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4" />
                                                        Broadcast to All
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {recipientType === 'all' ? (
                                        <div className="rounded-xl border border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 p-4 dark:border-teal-800 dark:from-teal-900/20 dark:to-cyan-900/20">
                                            <div className="flex items-start gap-3">
                                                <div className="rounded-md bg-teal-600 p-2">
                                                    <Zap className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-teal-900 dark:text-teal-100">Broadcast Mode</p>
                                                    <p className="mt-1 text-sm text-teal-700 dark:text-teal-300">
                                                        Your message will reach all {users.length} guardians with registered numbers
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Search Bar */}
                                            <div className="relative">
                                                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                                                <input
                                                    type="text"
                                                    placeholder="Search children/guardian..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    className="w-full rounded-md border py-2.5 pr-10 pl-10 transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                                />
                                                {searchQuery && (
                                                    <button
                                                        onClick={() => setSearchQuery('')}
                                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick Actions */}
                                            {recipientType === 'multiple' && filteredUsers.length > 0 && (
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={selectAllFiltered}
                                                        className="flex-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        Select All
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={deselectAll}
                                                        className="flex-1 text-xs dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                                    >
                                                        Clear All
                                                    </Button>
                                                </div>
                                            )}

                                            {/* User List */}
                                            <div className="custom-scrollbar max-h-96 space-y-2 overflow-y-auto pr-2">
                                                {filteredUsers.length > 0 ? (
                                                    filteredUsers.map((user, index) => (
                                                        <div
                                                            key={user.id}
                                                            className={`group relative cursor-pointer overflow-hidden rounded-xl transition-all duration-300 ${
                                                                selectedUsers.includes(user.id)
                                                                    ? 'scale-[1.02] bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                                                                    : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
                                                            }`}
                                                            onClick={() => handleUserSelect(user.id)}
                                                            style={{
                                                                animationDelay: `${index * 50}ms`,
                                                                animation: 'fadeInUp 0.3s ease-out forwards',
                                                            }}
                                                        >
                                                            <div className="flex items-center gap-3 p-3">
                                                                {/* Checkbox */}
                                                                <div
                                                                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition-all duration-300 ${
                                                                        selectedUsers.includes(user.id)
                                                                            ? 'scale-110 border-white bg-white dark:border-gray-200 dark:bg-gray-200'
                                                                            : 'border-gray-300 group-hover:border-teal-500 dark:border-gray-600'
                                                                    }`}
                                                                >
                                                                    {selectedUsers.includes(user.id) && (
                                                                        <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-500" />
                                                                    )}
                                                                </div>

                                                                {/* Avatar */}
                                                                <div
                                                                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold ${
                                                                        selectedUsers.includes(user.id)
                                                                            ? 'bg-white text-teal-600 dark:bg-gray-800 dark:text-teal-400'
                                                                            : 'bg-gradient-to-br from-teal-400 to-cyan-500 text-white'
                                                                    }`}
                                                                >
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </div>

                                                                {/* User Info */}
                                                                <div className="min-w-0 flex-1">
                                                                    <p
                                                                        className={`truncate font-medium ${selectedUsers.includes(user.id) ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                                                                    >
                                                                        {user.name}
                                                                    </p>
                                                                    <p
                                                                        className={`truncate text-sm ${selectedUsers.includes(user.id) ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'}`}
                                                                    >
                                                                        {displayPhoneNumber(user.phone)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl p-12">
                                                        <div className="mb-6 rounded-full bg-gradient-to-br from-teal-100 to-cyan-100 p-8 dark:from-teal-900/30 dark:to-cyan-900/30">
                                                            <Users className="h-16 w-16 text-teal-600 dark:text-teal-400" />
                                                        </div>
                                                        <h3 className="mb-2 text-xl font-bold text-gray-900 dark:text-gray-50">
                                                            {searchQuery ? 'No matching guardians found' : 'No guardians available'}
                                                        </h3>
                                                        <p className="max-w-md text-center text-gray-600 dark:text-gray-300">
                                                            {searchQuery
                                                                ? "Try adjusting your search to find what you're looking for."
                                                                : 'There are no guardians with registered phone numbers yet.'}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Message Composer & Summary */}
                        <div className="space-y-4 lg:col-span-2">
                            {/* Message Composer */}
                            <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                                <CardHeader className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 py-4 dark:from-teal-900/20 dark:to-cyan-900/20">
                                    <CardTitle className="flex items-center gap-2">
                                        <Mail className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                                        Compose Message
                                    </CardTitle>
                                    <CardDescription className="dark:text-gray-400">Write your message below</CardDescription>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Message Textarea */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label className="flex items-center gap-2 text-sm font-medium dark:text-gray-300">
                                                    Your Message
                                                    {isTyping && (
                                                        <span className="flex items-center gap-1 text-xs text-teal-600 dark:text-teal-400">
                                                            <span className="animate-pulse">●</span>
                                                            typing...
                                                        </span>
                                                    )}
                                                </Label>
                                                <span
                                                    className={`text-sm font-medium transition-colors ${
                                                        characterCount > maxCharacters
                                                            ? 'animate-pulse text-red-500 dark:text-red-400'
                                                            : characterCount > maxCharacters * 0.9
                                                              ? 'text-orange-500 dark:text-orange-400'
                                                              : 'text-gray-500 dark:text-gray-400'
                                                    }`}
                                                >
                                                    {characterCount} / {maxCharacters}
                                                </span>
                                            </div>

                                            <Textarea
                                                placeholder="Type your message here..."
                                                value={message}
                                                onChange={handleMessageChange}
                                                rows={8}
                                                className="resize-none border text-base transition-all focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-400"
                                            />

                                            <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                                <Sparkles className="h-3 w-3" />
                                                Messages over 160 characters split into multiple SMS
                                            </p>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3">
                                            <Button
                                                type="submit"
                                                disabled={
                                                    isSending ||
                                                    !message.trim() ||
                                                    (recipientType !== 'all' && selectedUsers.length === 0) ||
                                                    characterCount > maxCharacters
                                                }
                                                className="group flex-1 bg-gradient-to-r from-teal-500 to-cyan-500 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:from-teal-600 hover:to-cyan-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {isSending ? (
                                                    <>
                                                        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                                        Send Message
                                                    </>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setMessage('');
                                                    setSelectedUsers([]);
                                                    setCharacterCount(0);
                                                    setSearchQuery('');
                                                }}
                                                disabled={isSending}
                                                className="border px-6 py-6 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                                            >
                                                <X className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            {/* Retry Section - shown when last send failed */}
                            {lastFormData && !showConfirmDialog && (
                                <Card className="border border-red-200 bg-red-50 shadow-lg dark:border-red-800 dark:bg-red-900/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                                                <div>
                                                    <p className="font-semibold text-red-900 dark:text-red-100">Last send failed</p>
                                                    <p className="text-sm text-red-700 dark:text-red-300">
                                                        Your message and recipients are still available
                                                    </p>
                                                </div>
                                            </div>
                                            <Button onClick={handleRetry} variant="destructive" size="sm">
                                                Retry Send
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Summary Card */}
                            <Card className="overflow-hidden border-0 bg-gradient-to-br from-teal-50 to-cyan-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                        <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                            <div className="mb-1 flex items-center gap-2 text-teal-600 dark:text-teal-400">
                                                <Users className="h-4 w-4" />
                                                <span className="text-xs font-medium dark:text-gray-400">Recipients</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{getRecipientCount()}</div>
                                        </div>

                                        <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                            <div className="mb-1 flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                                                <Mail className="h-4 w-4" />
                                                <span className="text-xs font-medium">Characters</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">{characterCount}</div>
                                        </div>

                                        <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                            <div className="mb-1 flex items-center gap-2 text-teal-600 dark:text-teal-400">
                                                <MessageSquare className="h-4 w-4" />
                                                <span className="text-xs font-medium">SMS Parts</span>
                                            </div>
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {Math.ceil(characterCount / 160) || 0}
                                            </div>
                                        </div>

                                        <div className="rounded-xl bg-gradient-to-br from-teal-600 to-cyan-600 p-4 shadow-md transition-shadow hover:shadow-lg">
                                            <div className="mb-1 flex items-center gap-2 text-white">
                                                <Zap className="h-4 w-4" />
                                                <span className="text-xs font-medium">Total SMS</span>
                                            </div>
                                            <div className="text-2xl font-bold text-white">
                                                {getRecipientCount() * (Math.ceil(characterCount / 160) || 0)}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            Confirm SMS Send
                        </AlertDialogTitle>
                        <AlertDialogDescription>Please review the details before sending:</AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-3 py-4">
                        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Recipients</p>
                            <p className="text-sm text-gray-900 dark:text-white">
                                {recipientType === 'all' ? (
                                    <span className="font-semibold text-teal-600 dark:text-teal-400">{users.length} recipients (Broadcast)</span>
                                ) : (
                                    <span className="font-semibold text-teal-600 dark:text-teal-400">
                                        {selectedUsers.length} recipient(s) selected
                                    </span>
                                )}
                            </p>
                        </div>

                        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                            <p className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Message</p>
                            <p className="line-clamp-3 text-sm text-gray-900 dark:text-white">{message}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-md bg-teal-50 p-3 dark:bg-teal-900/20">
                                <p className="text-xs text-gray-600 dark:text-gray-400">SMS Parts</p>
                                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{Math.ceil(characterCount / 160) || 0}</p>
                            </div>
                            <div className="rounded-md bg-cyan-50 p-3 dark:bg-cyan-900/20">
                                <p className="text-xs text-gray-600 dark:text-gray-400">Total SMS</p>
                                <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                    {getRecipientCount() * (Math.ceil(characterCount / 160) || 0)}
                                </p>
                            </div>
                        </div>

                        {credits > 0 && getRecipientCount() * (Math.ceil(characterCount / 160) || 0) > credits && (
                            <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                <p className="text-sm text-amber-800 dark:text-amber-200">
                                    Warning: You may not have enough credits. Required: {getRecipientCount() * (Math.ceil(characterCount / 160) || 0)}
                                    , Available: {credits}
                                </p>
                            </div>
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={cancelSend}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmSend}
                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                        >
                            <Send className="mr-2 h-4 w-4" />
                            Confirm Send
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                .announcement-card {
                    animation: fadeInUp 0.4s ease-out forwards;
                    opacity: 0;
                }

                .stat-card {
                    animation: fadeInUp 0.5s ease-out forwards;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .stat-card:nth-child(1) { animation-delay: 0.1s; }
                .stat-card:nth-child(2) { animation-delay: 0.2s; }
                .stat-card:nth-child(3) { animation-delay: 0.3s; }
                .stat-card:nth-child(4) { animation-delay: 0.4s; }
                .stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #14b8a6, #06b6d4);
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #0d9488, #0891b2);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </AppLayout>
    );
}
