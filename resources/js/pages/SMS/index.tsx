import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { displayPhoneNumber } from '@/lib/phoneUtils';
import { smartToast } from '@/utils/smartToast';
import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, Mail, MessageSquare, Phone, Search, Send, Sparkles, Users, X, Zap } from 'lucide-react';
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

export default function SMSIndex({ users, credits }: SMSPageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [recipientType, setRecipientType] = useState<'single' | 'multiple' | 'all'>('multiple');
    const [characterCount, setCharacterCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [message, setMessage] = useState('');
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

        // Reset typing indicator after 2 seconds
        setTimeout(() => setIsTyping(false), 2000);
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

        const loadingToast = smartToast.loading('Sending SMS...');

        router.post(
            '/admin/sendsms',
            {
                recipient_type: recipientType,
                recipients: selectedUsers,
                message: message,
            },
            {
                onSuccess: () => {
                    smartToast.dismiss(loadingToast);
                    setMessage('');
                    setSelectedUsers([]);
                    setCharacterCount(0);
                },
                onError: () => {
                    smartToast.dismiss(loadingToast);
                },
            },
        );
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

    return (
        <AppLayout>
            <Head title="Send SMS" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 p-4 sm:p-6 lg:p-8 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                {/* Animated Header with Gradient */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 -z-10 animate-pulse rounded-3xl bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 blur-3xl"></div>

                    <div className="relative rounded-3xl border border-white/20 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-50 blur-lg"></div>
                                    <div className="relative transform rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 p-4 shadow-lg transition-transform duration-300 hover:scale-110">
                                        <MessageSquare className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                        SMS Messenger
                                    </h1>
                                    <p className="mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                        <Sparkles className="h-4 w-4" />
                                        Send messages to guardians instantly
                                    </p>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="hidden items-center gap-4 lg:flex">
                                <div className="rounded-xl bg-blue-50 px-4 py-2 text-center dark:bg-blue-900/20">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Users</div>
                                </div>
                                <div className="rounded-xl bg-purple-50 px-4 py-2 text-center dark:bg-purple-900/20">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getRecipientCount()}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Selected</div>
                                </div>
                                <div className="rounded-xl bg-green-50 px-4 py-2 text-center dark:bg-green-900/20">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{credits}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">SMS Credits</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Recipients Panel */}
                    <div className="space-y-4 lg:col-span-1">
                        <Card className="overflow-hidden border-0 bg-white/80 shadow-xl backdrop-blur-xl dark:bg-gray-800/80">
                            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 py-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Recipients
                                        </CardTitle>
                                        <CardDescription>Select who receives your message</CardDescription>
                                    </div>
                                    <div className="rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">{getRecipientCount()}</div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 p-4">
                                {/* Recipient Type Selector */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Send Mode</Label>
                                    <Select value={recipientType} onValueChange={handleRecipientTypeChange}>
                                        <SelectTrigger className="border-2 transition-colors hover:border-blue-500">
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
                                    <div className="animate-pulse rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-900/20 dark:to-purple-900/20">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-blue-600 p-2">
                                                <Zap className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-blue-900 dark:text-blue-100">Broadcast Mode</p>
                                                <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                                                    Your message will reach all {users.length} guardians with registered numbers
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Bar */}
                                        <div className="relative">
                                            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search children/guardian..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full rounded-lg border-2 py-2 pr-10 pl-10 transition-all outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                                    className="flex-1 text-xs"
                                                >
                                                    Select All
                                                </Button>
                                                <Button type="button" size="sm" variant="outline" onClick={deselectAll} className="flex-1 text-xs">
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
                                                                ? 'scale-[1.02] bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                                                                : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-700/50 dark:hover:bg-gray-700'
                                                        }`}
                                                        onClick={() => handleUserSelect(user.id)}
                                                        style={{
                                                            animationDelay: `${index * 50}ms`,
                                                            animation: 'slideIn 0.3s ease-out forwards',
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 p-3">
                                                            {/* Checkbox */}
                                                            <div
                                                                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                                                                    selectedUsers.includes(user.id)
                                                                        ? 'scale-110 border-white bg-white'
                                                                        : 'border-gray-300 group-hover:border-blue-500 dark:border-gray-600'
                                                                }`}
                                                            >
                                                                {selectedUsers.includes(user.id) && (
                                                                    <CheckCircle2 className="h-4 w-4 animate-bounce text-blue-600" />
                                                                )}
                                                            </div>

                                                            {/* Avatar */}
                                                            <div
                                                                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg font-semibold transition-all duration-300 ${
                                                                    selectedUsers.includes(user.id)
                                                                        ? 'bg-white text-blue-600'
                                                                        : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                                                                }`}
                                                            >
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>

                                                            {/* User Info */}
                                                            <div className="min-w-0 flex-1">
                                                                <p
                                                                    className={`truncate font-medium ${
                                                                        selectedUsers.includes(user.id)
                                                                            ? 'text-white'
                                                                            : 'text-gray-900 dark:text-white'
                                                                    }`}
                                                                >
                                                                    {user.name}
                                                                </p>
                                                                <p
                                                                    className={`truncate text-sm ${
                                                                        selectedUsers.includes(user.id)
                                                                            ? 'text-blue-100'
                                                                            : 'text-gray-500 dark:text-gray-400'
                                                                    }`}
                                                                >
                                                                    {displayPhoneNumber(user.phone)}
                                                                </p>
                                                            </div>

                                                            {/* Selection Indicator */}
                                                            {selectedUsers.includes(user.id) && (
                                                                <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <Users className="mx-auto mb-3 h-16 w-16 text-gray-300 dark:text-gray-600" />
                                                    <p className="text-gray-500 dark:text-gray-400">
                                                        {searchQuery ? 'No guardians found' : 'No guardians available'}
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
                            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 py-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5 text-purple-600" />
                                    Compose Message
                                </CardTitle>
                                <CardDescription>Write your message below</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Message Textarea */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="flex items-center gap-2 text-sm font-medium">
                                                Your Message
                                                {isTyping && (
                                                    <span className="flex items-center gap-1 text-xs text-blue-600">
                                                        <span className="animate-pulse">●</span>
                                                        typing...
                                                    </span>
                                                )}
                                            </Label>
                                            <span
                                                className={`text-sm font-medium transition-colors ${
                                                    characterCount > maxCharacters
                                                        ? 'animate-pulse text-red-500'
                                                        : characterCount > maxCharacters * 0.9
                                                          ? 'text-orange-500'
                                                          : 'text-gray-500'
                                                }`}
                                            >
                                                {characterCount} / {maxCharacters}
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <Textarea
                                                placeholder="Type your message here..."
                                                value={message}
                                                onChange={handleMessageChange}
                                                rows={8}
                                                className="resize-none border-2 text-base transition-all focus:border-purple-500 focus:ring-4 focus:ring-purple-200"
                                            />

                                            {/* Character Progress Bar */}
                                            <div className="absolute right-2 bottom-2 left-2">
                                                <div className="h-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-300 ${
                                                            characterCount > maxCharacters
                                                                ? 'bg-red-500'
                                                                : characterCount > maxCharacters * 0.9
                                                                  ? 'bg-orange-500'
                                                                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                                                        }`}
                                                        style={{ width: `${Math.min((characterCount / maxCharacters) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>

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
                                                !message.trim() ||
                                                (recipientType !== 'all' && selectedUsers.length === 0) ||
                                                characterCount > maxCharacters
                                            }
                                            className="group flex-1 bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <Send className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                            {'Send Message'}
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
                                            className="border-2 px-6 py-6 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                    <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-1 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium">Recipients</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{getRecipientCount()}</div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-1 flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-xs font-medium">Characters</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{characterCount}</div>
                                    </div>

                                    <div className="rounded-xl bg-white p-4 shadow-md transition-shadow hover:shadow-lg dark:bg-gray-800">
                                        <div className="mb-1 flex items-center gap-2 text-pink-600 dark:text-pink-400">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-xs font-medium">SMS Parts</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.ceil(characterCount / 160) || 0}</div>
                                    </div>

                                    <div className="rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 p-4 shadow-md transition-shadow hover:shadow-lg">
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

            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }

                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
                    border-radius: 3px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(to bottom, #2563eb, #7c3aed);
                }
            `}</style>
        </AppLayout>
    );
}
