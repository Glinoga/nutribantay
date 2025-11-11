import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { MessageSquare, Users, Send, CheckCircle2, AlertCircle, Sparkles, Mail, Phone, Zap, Search, X } from 'lucide-react';
import { smartToast } from '@/utils/smartToast';
import { displayPhoneNumber } from '@/lib/phoneUtils';

interface User {
    id: number;
    name: string;
    phone: string;
}

interface SMSPageProps {
    users: User[];
}

export default function SMSIndex({ users }: SMSPageProps) {
    const { flash } = usePage<{ flash: { success?: string; error?: string; warning?: string } }>().props;
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [recipientType, setRecipientType] = useState<'single' | 'multiple' | 'all'>('multiple');
    const [characterCount, setCharacterCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const maxCharacters = 1600;

    const { data, setData, post, processing, errors, reset } = useForm({
        recipient_type: 'multiple',
        recipients: [] as number[],
        message: '',
    });

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
        setData('recipient_type', value);
        setSelectedUsers([]);
        setData('recipients', []);
    };

    const handleUserSelect = (userId: number) => {
        let newSelection: number[];
        
        if (recipientType === 'single') {
            newSelection = [userId];
        } else {
            if (selectedUsers.includes(userId)) {
                newSelection = selectedUsers.filter(id => id !== userId);
            } else {
                newSelection = [...selectedUsers, userId];
            }
        }
        
        setSelectedUsers(newSelection);
        setData('recipients', newSelection);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const message = e.target.value;
        setCharacterCount(message.length);
        setData('message', message);
        setIsTyping(true);
        
        // Reset typing indicator after 1 second
        setTimeout(() => setIsTyping(false), 1000);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.message.trim()) {
            smartToast.error('Please enter a message');
            return;
        }

        if (recipientType !== 'all' && selectedUsers.length === 0) {
            smartToast.error('Please select at least one recipient');
            return;
        }

        const loadingToast = smartToast.loading('Sending SMS...');
        
        post('/admin/sendsms', {
            onSuccess: () => {
                smartToast.dismiss(loadingToast);
                reset('message');
                setSelectedUsers([]);
                setCharacterCount(0);
            },
            onError: () => {
                smartToast.dismiss(loadingToast);
            }
        });
    };

    const getRecipientCount = () => {
        if (recipientType === 'all') {
            return users.length;
        }
        return selectedUsers.length;
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery)
    );

    const selectAllFiltered = () => {
        const filteredIds = filteredUsers.map(u => u.id);
        setSelectedUsers(filteredIds);
        setData('recipients', filteredIds);
    };

    const deselectAll = () => {
        setSelectedUsers([]);
        setData('recipients', []);
    };

    return (
        <AppLayout>
            <Head title="Send SMS" />

            <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
                {/* Animated Header with Gradient */}
                <div className="mb-8 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl blur-3xl -z-10 animate-pulse"></div>
                    
                    <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
                                    <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
                                        <MessageSquare className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                        SMS Messenger
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-300 flex items-center gap-2 mt-1">
                                        <Sparkles className="h-4 w-4" />
                                        Send messages to guardians instantly
                                    </p>
                                </div>
                            </div>
                            
                            {/* Quick Stats */}
                            <div className="hidden lg:flex items-center gap-4">
                                <div className="text-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{users.length}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Total Users</div>
                                </div>
                                <div className="text-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{getRecipientCount()}</div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400">Selected</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recipients Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            Recipients
                                        </CardTitle>
                                        <CardDescription>Select who receives your message</CardDescription>
                                    </div>
                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {getRecipientCount()}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 space-y-4">
                                {/* Recipient Type Selector */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium">Send Mode</Label>
                                    <Select value={recipientType} onValueChange={handleRecipientTypeChange}>
                                        <SelectTrigger className="border-2 hover:border-blue-500 transition-colors">
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
                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 animate-pulse">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-blue-600 p-2 rounded-lg">
                                                <Zap className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-blue-900 dark:text-blue-100">Broadcast Mode</p>
                                                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                                    Your message will reach all {users.length} guardians with registered numbers
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {/* Search Bar */}
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search guardians..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full pl-10 pr-10 py-2 border-2 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
                                            />
                                            {searchQuery && (
                                                <button
                                                    onClick={() => setSearchQuery('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={deselectAll}
                                                    className="flex-1 text-xs"
                                                >
                                                    Clear All
                                                </Button>
                                            </div>
                                        )}

                                        {/* User List */}
                                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                                            {filteredUsers.length > 0 ? (
                                                filteredUsers.map((user, index) => (
                                                    <div
                                                        key={user.id}
                                                        className={`group relative overflow-hidden cursor-pointer rounded-xl transition-all duration-300 ${
                                                            selectedUsers.includes(user.id)
                                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg scale-[1.02]'
                                                                : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                        }`}
                                                        onClick={() => handleUserSelect(user.id)}
                                                        style={{
                                                            animationDelay: `${index * 50}ms`,
                                                            animation: 'slideIn 0.3s ease-out forwards'
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3 p-3">
                                                            {/* Checkbox */}
                                                            <div className={`flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                                                                selectedUsers.includes(user.id)
                                                                    ? 'bg-white border-white scale-110'
                                                                    : 'border-gray-300 dark:border-gray-600 group-hover:border-blue-500'
                                                            }`}>
                                                                {selectedUsers.includes(user.id) && (
                                                                    <CheckCircle2 className="h-4 w-4 text-blue-600 animate-bounce" />
                                                                )}
                                                            </div>

                                                            {/* Avatar */}
                                                            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-lg transition-all duration-300 ${
                                                                selectedUsers.includes(user.id)
                                                                    ? 'bg-white text-blue-600'
                                                                    : 'bg-gradient-to-br from-blue-400 to-purple-500 text-white'
                                                            }`}>
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </div>

                                                            {/* User Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-medium truncate ${
                                                                    selectedUsers.includes(user.id)
                                                                        ? 'text-white'
                                                                        : 'text-gray-900 dark:text-white'
                                                                }`}>
                                                                    {user.name}
                                                                </p>
                                                                <p className={`text-sm truncate ${
                                                                    selectedUsers.includes(user.id)
                                                                        ? 'text-blue-100'
                                                                        : 'text-gray-500 dark:text-gray-400'
                                                                }`}>
                                                                    {displayPhoneNumber(user.phone)}
                                                                </p>
                                                            </div>

                                                            {/* Selection Indicator */}
                                                            {selectedUsers.includes(user.id) && (
                                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-12">
                                                    <Users className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
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
                    <div className="lg:col-span-2 space-y-4">
                        {/* Message Composer */}
                        <Card className="overflow-hidden border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
                            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10">
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
                                            <Label className="text-sm font-medium flex items-center gap-2">
                                                Your Message
                                                {isTyping && (
                                                    <span className="flex items-center gap-1 text-xs text-blue-600">
                                                        <span className="animate-pulse">●</span>
                                                        typing...
                                                    </span>
                                                )}
                                            </Label>
                                            <span className={`text-sm font-medium transition-colors ${
                                                characterCount > maxCharacters 
                                                    ? 'text-red-500 animate-pulse' 
                                                    : characterCount > maxCharacters * 0.9
                                                    ? 'text-orange-500'
                                                    : 'text-gray-500'
                                            }`}>
                                                {characterCount} / {maxCharacters}
                                            </span>
                                        </div>
                                        
                                        <div className="relative">
                                            <Textarea
                                                placeholder="Type your message here... 📱"
                                                value={data.message}
                                                onChange={handleMessageChange}
                                                rows={8}
                                                className="resize-none border-2 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-base"
                                            />
                                            
                                            {/* Character Progress Bar */}
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full transition-all duration-300 rounded-full ${
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

                                        {errors.message && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-4 w-4" />
                                                {errors.message}
                                            </p>
                                        )}

                                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Sparkles className="h-3 w-3" />
                                            Messages over 160 characters split into multiple SMS
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.message.trim() || (recipientType !== 'all' && selectedUsers.length === 0) || characterCount > maxCharacters}
                                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="animate-spin">⏳</span>
                                                    Sending...
                                                </span>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => {
                                                reset();
                                                setSelectedUsers([]);
                                                setCharacterCount(0);
                                                setSearchQuery('');
                                            }}
                                            className="px-6 py-6 border-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Summary Card */}
                        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                            <Users className="h-4 w-4" />
                                            <span className="text-xs font-medium">Recipients</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {getRecipientCount()}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                            <Mail className="h-4 w-4" />
                                            <span className="text-xs font-medium">Characters</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {characterCount}
                                        </div>
                                    </div>

                                    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400 mb-1">
                                            <MessageSquare className="h-4 w-4" />
                                            <span className="text-xs font-medium">SMS Parts</span>
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {Math.ceil(characterCount / 160) || 0}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                                        <div className="flex items-center gap-2 text-white mb-1">
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
