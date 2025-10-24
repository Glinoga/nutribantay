import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Megaphone, TriangleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { route } from '@/lib/routes';
import { toast } from 'react-hot-toast';
import { smartToast } from '@/utils/smartToast';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Announcements', href: '/admin/announcements' },
];

// Initialize SweetAlert2 with React content
const MySwal = withReactContent(Swal);

// Define types for Category
interface Category {
    id: number;
    name: string;
    slug: string;
    color: string;
    description?: string;
}

// Define types for our announcement
interface Announcement {
    id: number;
    title: string;
    category_id: number;
    category: Category;
    date: string;
    end_date?: string;
    author?: string;
    summary: string;
    content: string;
    image?: string;
    created_at: string;
    updated_at: string;
}

export default function Index({ announcements, categories }: { 
    announcements: Announcement[];
    categories: Category[];
}) {
    const { delete: deleteForm, processing } = useForm();
    
    // State for create form
    const { data, setData, post, processing: createProcessing, errors, reset } = useForm({
        title: '',
        date: '',
        end_date: '',
        category_id: '',
        author: '',
        summary: '',
        content: '',
        image: null as File | null,
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleDelete = (announcement: Announcement) => {
        MySwal.fire({
            title: 'Delete Announcement',
            html: (
                <div className="text-left" style={{
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: '1.6'
                }}>
                    <div style={{
                        marginBottom: '1rem',
                        padding: '1rem',
                        borderRadius: '0.75rem',
                        backgroundColor: 'hsl(9 21% 96%)',
                        border: '1px solid hsl(9 21% 85%)',
                        position: 'relative'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                fontSize: '1rem',
                                marginTop: '0.125rem'
                            }}><TriangleAlert /></div>
                            <div style={{ flex: 1 }}>
                                <p style={{
                                    color: 'hsl(181 100% 2%)',
                                    fontSize: '0.875rem',
                                    fontWeight: '500',
                                    marginBottom: '0.5rem',
                                    margin: '0 0 0.5rem 0'
                                }}>
                                    You are about to permanently delete:
                                </p>
                                <p style={{
                                    color: 'hsl(180 100% 8%)',
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    marginBottom: '0.5rem',
                                    wordBreak: 'break-word',
                                    margin: '0 0 0.5rem 0',
                                    padding: '0.375rem 0.5rem',
                                    backgroundColor: 'hsl(178 100% 98%)',
                                    borderRadius: '0.375rem',
                                    border: '1px solid hsl(178 21% 57%)'
                                }}>
                                    "{announcement.title}"
                                </p>
                                <p style={{
                                    color: 'hsl(9 21% 41%)',
                                    fontSize: '0.75rem',
                                    fontWeight: '500',
                                    margin: '0',
                                    fontStyle: 'italic'
                                }}>
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: 'hsl(9 21% 41%)',
            cancelButtonColor: 'hsl(179 20% 45%)',
            cancelButtonText: 'Cancel',
            confirmButtonText: 'Delete',
            reverseButtons: false,
            focusCancel: true,
            background: 'hsl(178 100% 98%)',
            color: 'hsl(181 100% 2%)',
            customClass: {
                popup: 'modern-swal-popup',
                title: 'modern-swal-title',
                confirmButton: 'modern-swal-danger-btn',
                cancelButton: 'modern-swal-safe-btn',
                actions: 'modern-swal-actions',
                icon: 'modern-swal-warning-icon',
                htmlContainer: 'modern-swal-content'
            },
            didOpen: () => {
                const style = document.createElement('style');
                style.textContent = `
                    .modern-swal-popup {
                        border-radius: 1rem !important;
                        background: hsl(178 100% 98%) !important;
                        border-top: 0px;
                        border-right: 2px solid hsl(178 21% 57%) !important;
                        border-bottom: 2px solid hsl(178 21% 57%) !important;
                        border-left: 2px solid hsl(178 21% 57%) !important;
                        box-shadow: 
                            0 20px 40px -10px rgba(0, 0, 0, 0.12),
                            0 4px 20px rgba(0, 0, 0, 0.06),
                            0 0 0 1px hsl(178 100% 95%) !important;
                        font-family: 'Montserrat', sans-serif !important;
                        backdrop-filter: blur(16px) !important;
                        padding: 1.5rem !important;
                        min-width: 320px !important;
                        max-width: 420px !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .modern-swal-popup::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 4px;
                        background: linear-gradient(90deg, hsl(9 21% 41%), hsl(52 23% 34%));
                        border-radius: 1rem 1rem 0 0;
                    }
                    .modern-swal-title {
                        color: hsl(181 100% 2%) !important;
                        font-size: 1.5rem !important;
                        font-weight: 700 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        margin-bottom: 1.5rem !important;
                        text-align: center !important;
                        position: relative !important;
                    }
                    .modern-swal-content {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .modern-swal-danger-btn {
                        background: linear-gradient(135deg, hsl(9 21% 41%) 0%, hsl(9 25% 35%) 100%) !important;
                        border: none !important;
                        border-radius: 0.75rem !important;
                        padding: 0.75rem 1.5rem !important;
                        font-weight: 600 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        font-size: 0.875rem !important;
                        color: white !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        box-shadow: 0 3px 10px rgba(156, 39, 39, 0.3) !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .modern-swal-danger-btn:hover {
                        background: linear-gradient(135deg, hsl(9 25% 35%) 0%, hsl(9 30% 30%) 100%) !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 6px 20px rgba(156, 39, 39, 0.4) !important;
                    }
                    .modern-swal-danger-btn:active {
                        transform: translateY(0) !important;
                    }
                    .modern-swal-safe-btn {
                        background: hsl(178 100% 98%) !important;
                        color: hsl(179 40% 22%) !important;
                        border: 2px solid hsl(179 20% 45%) !important;
                        border-radius: 0.75rem !important;
                        padding: 0.75rem 1.5rem !important;
                        font-weight: 600 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        font-size: 0.875rem !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
                    }
                    .modern-swal-safe-btn:hover {
                        background: hsl(178 100% 95%) !important;
                        border-color: hsl(180 100% 8%) !important;
                        color: hsl(180 100% 8%) !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15) !important;
                    }
                    .modern-swal-safe-btn:active {
                        transform: translateY(0) !important;
                    }
                    .modern-swal-actions {
                        gap: 0.75rem !important;
                        margin-top: 1.5rem !important;
                        justify-content: center !important;
                    }
                    .modern-swal-warning-icon {
                        color: hsl(52 23% 34%) !important;
                        border-color: hsl(52 23% 34%) !important;
                        font-size: 1rem !important;
                        margin-bottom: 0.75rem !important;
                        animation: pulse 2s infinite !important;
                    }
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); }
                        50% { transform: scale(1.05); }
                    }
                `;
                document.head.appendChild(style);
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Show loading toast
                const loadingToast = smartToast.loading('Deleting announcement...');

                deleteForm(`/admin/announcements/${announcement.id}`, {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Dismiss loading toast
                        toast.dismiss(loadingToast);

                        // Show success toast with dynamic duration
                        smartToast.success(
                            `"${announcement.title}" has been deleted successfully!`
                        );

                        // Show SweetAlert success message
                        MySwal.fire({
                            title: 'Successfully Deleted!',
                            html: (
                                <div style={{
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat, sans-serif'
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        backgroundColor: 'hsl(147 19% 36%)',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{ fontSize: '2rem', color: 'white' }}>✓</span>
                                    </div>
                                    <p style={{
                                        color: 'hsl(181 100% 2%)',
                                        fontSize: '1rem',
                                        lineHeight: '1.5',
                                        margin: '0'
                                    }}>
                                        The announcement has been permanently removed from your system.
                                    </p>
                                </div>
                            ),
                            timer: 2500,
                            showConfirmButton: false,
                            background: 'hsl(178 100% 98%)',
                            color: 'hsl(181 100% 2%)',
                            customClass: {
                                popup: 'modern-swal-success-popup',
                                title: 'modern-swal-success-title',
                                htmlContainer: 'modern-swal-success-content'
                            },
                            didOpen: () => {
                                const style = document.createElement('style');
                                style.textContent = `
                                    .modern-swal-success-popup {
                                        border-radius: 1.25rem !important;
                                        background: hsl(178 100% 98%) !important;
                                        border: 2px solid hsl(147 19% 36%) !important;
                                        box-shadow: 
                                            0 25px 50px -12px rgba(0, 128, 0, 0.15),
                                            0 4px 25px rgba(0, 128, 0, 0.08) !important;
                                        font-family: 'Montserrat', sans-serif !important;
                                        padding: 2rem !important;
                                        min-width: 360px !important;
                                        position: relative !important;
                                        overflow: hidden !important;
                                    }
                                    .modern-swal-success-popup::before {
                                        content: '';
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        right: 0;
                                        height: 4px;
                                        background: linear-gradient(90deg, hsl(147 19% 36%), hsl(147 25% 30%));
                                        border-radius: 1.25rem 1.25rem 0 0;
                                    }
                                    .modern-swal-success-title {
                                        color: hsl(147 19% 36%) !important;
                                        font-size: 1.5rem !important;
                                        font-weight: 700 !important;
                                        font-family: 'Montserrat', sans-serif !important;
                                        margin-bottom: 1.5rem !important;
                                        text-align: center !important;
                                    }
                                    .modern-swal-success-content {
                                        margin: 0 !important;
                                        padding: 0 !important;
                                    }
                                    @keyframes successSlideIn {
                                        from {
                                            transform: translateY(-20px) scale(0.95);
                                            opacity: 0;
                                        }
                                        to {
                                            transform: translateY(0) scale(1);
                                            opacity: 1;
                                        }
                                    }
                                `;
                                document.head.appendChild(style);
                            }
                        });
                    },
                    onError: (errors) => {
                        // Dismiss loading toast
                        toast.dismiss(loadingToast);

                        // Show error toast with dynamic duration
                        smartToast.error(
                            'Failed to delete announcement. Please try again.'
                        );

                        // Show SweetAlert error message
                        MySwal.fire({
                            title: 'Deletion Failed',
                            html: (
                                <div style={{
                                    textAlign: 'center',
                                    fontFamily: 'Montserrat, sans-serif'
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '50%',
                                        backgroundColor: 'hsl(9 21% 41%)',
                                        marginBottom: '1rem'
                                    }}>
                                        <span style={{ fontSize: '2rem', color: 'white' }}>✕</span>
                                    </div>
                                    <p style={{
                                        color: 'hsl(181 100% 2%)',
                                        fontSize: '1rem',
                                        lineHeight: '1.5',
                                        margin: '0 0 1rem 0'
                                    }}>
                                        Something went wrong while trying to delete the announcement.
                                    </p>
                                    <p style={{
                                        color: 'hsl(179 40% 22%)',
                                        fontSize: '0.875rem',
                                        margin: '0'
                                    }}>
                                        Please try again or contact support if the problem persists.
                                    </p>
                                </div>
                            ),
                            icon: 'error',
                            confirmButtonColor: 'hsl(9 21% 41%)',
                            confirmButtonText: 'Try Again',
                            background: 'hsl(178 100% 98%)',
                            color: 'hsl(181 100% 2%)',
                            customClass: {
                                popup: 'modern-swal-error-popup',
                                title: 'modern-swal-error-title',
                                confirmButton: 'modern-swal-error-btn',
                                icon: 'modern-swal-error-icon',
                                htmlContainer: 'modern-swal-error-content'
                            },
                            didOpen: () => {
                                const style = document.createElement('style');
                                style.textContent = `
                                    .custom-swal-error-popup {
                                        border-radius: 15px !important;
                                        background: #ffffff !important;
                                        border: 2px solid #dc2626 !important;
                                        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                                        font-family: 'Montserrat', sans-serif !important;
                                        opacity: 1 !important;
                                    }
                                    .custom-swal-error-title {
                                        color: hsl(351 44% 31%) !important;
                                        font-size: 1.5rem !important;
                                        font-weight: 700 !important;
                                        font-family: 'Montserrat', sans-serif !important;
                                    }
                                    .custom-swal-error-btn {
                                        background-color: hsl(351 44% 31%)   !important;
                                        border: none !important;
                                        border-radius: 10px !important;
                                        padding: 0.5rem 2rem !important;
                                        font-weight: 600 !important;
                                        font-family: 'Montserrat', sans-serif !important;
                                        font-size: 1.125rem !important;
                                        transition: all 0.2s ease !important;
                                        color: white !important;
                                    }
                                    .custom-swal-error-btn:hover {
                                        background-color: hsl(351 44% 31%) !important;
                                        transform: translateY(-1px) !important;
                                    }
                                    .custom-swal-error-icon {
                                        color: hsl(351 44% 31%) !important;
                                        border-color: hsl(351 44% 31%) !important;
                                    }
                                `;
                                document.head.appendChild(style);
                            }
                        });
                    }
                });
            }
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setData('image', file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleFormSubmit = () => {
        // Validation is now handled in preConfirm, so we can proceed directly
        const loadingToast = smartToast.loading('Creating announcement...');

        post(route('announcements.store'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.dismiss(loadingToast);
                smartToast.success('Announcement created successfully!');
                
                // Reset form and close modal
                reset();
                setImagePreview(null);
                
                // Close SweetAlert
                MySwal.close();
            },
            onError: (errors) => {
                toast.dismiss(loadingToast);
                const errorMessage = Object.values(errors).flat().join(', ');
                smartToast.error(`Failed to create announcement: ${errorMessage}`);
            }
        });
    };

    const handleCreateNew = () => {
        // Reset form when opening modal
        reset();
        setImagePreview(null);

        MySwal.fire({
            title: 'Create New Announcement',
            html: `
                <div style="font-family: 'Montserrat', sans-serif; text-align: left; max-height: 60vh; overflow-y: auto; padding: 0.5rem;">
                    <!-- Title Section -->
                    <div style="margin-bottom: 1rem; padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                        <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Announcement Title *
                        </label>
                        <input id="swal-title" type="text" placeholder="Enter announcement title" 
                               style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                               onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'">
                    </div>
                    
                    <!-- Category & Author Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                            <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                                Category *
                            </label>
                            <select id="swal-category" 
                                    style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                                    onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                    onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'">
                                <option value="">Select category</option>
                                ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div style="padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                            <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                                Author
                            </label>
                            <input id="swal-author" type="text" placeholder="Enter author name"
                                   style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                                   onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                   onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- Dates Grid -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                        <div style="padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                            <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                                Publication Date
                            </label>
                            <input id="swal-date" type="date" value="${new Date().toISOString().split('T')[0]}"
                                   style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                                   onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                   onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'"
                                   min="${new Date().toISOString().split('T')[0]}">
                            <p style="margin-top: 0.5rem; font-size: 0.75rem; color: hsl(147 19% 50%); font-family: 'Montserrat', sans-serif;">💡 Select today to publish immediately, or choose a future date to schedule the announcement</p>
                        </div>
                        
                        <div style="padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                            <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                                End Date (Optional)
                            </label>
                            <input id="swal-end-date" type="date"
                                   style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                                   onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                   onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'">
                        </div>
                    </div>
                    
                    <!-- Summary Section -->
                    <div style="margin-bottom: 1rem; padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                        <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Summary *
                        </label>
                        <textarea id="swal-summary" placeholder="Enter a brief summary of the announcement" rows="3"
                                  style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; resize: vertical; transition: all 0.2s ease;"
                                  onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                  onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'"></textarea>
                    </div>
                    
                    <!-- Content Section -->
                    <div style="margin-bottom: 1rem; padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                        <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Content *
                        </label>
                        <textarea id="swal-content" placeholder="Enter the full content of the announcement" rows="4"
                                  style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; resize: vertical; transition: all 0.2s ease;"
                                  onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                                  onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'"></textarea>
                    </div>
                    
                    <!-- Image Upload Section -->
                    <div style="margin-bottom: 1rem; padding: 1rem; border: 2px solid hsl(178 21% 57%); border-radius: 0.75rem; background: hsl(178 100% 99%);">
                        <label style="display: block; font-weight: 600; color: hsl(181 100% 2%); margin-bottom: 0.5rem; font-size: 0.875rem;">
                            Image (Optional)
                        </label>
                        <input id="swal-image" type="file" accept="image/*"
                               style="width: 100%; padding: 0.75rem; border: 2px solid hsl(178 21% 85%); border-radius: 0.5rem; font-family: 'Montserrat', sans-serif; font-size: 0.875rem; background: white; transition: all 0.2s ease;"
                               onfocus="this.style.borderColor='hsl(147 19% 36%)'; this.style.boxShadow='0 0 0 3px rgba(34, 197, 94, 0.1)'"
                               onblur="this.style.borderColor='hsl(178 21% 85%)'; this.style.boxShadow='none'"
                               onchange="handleImagePreview(this)">
                        <div id="image-preview" style="margin-top: 0.5rem;"></div>
                    </div>
                    
                    <div style="padding: 0.75rem; background: hsl(147 19% 96%); border: 1px solid hsl(147 19% 85%); border-radius: 0.5rem; margin-top: 1rem;">
                        <p style="color: hsl(147 25% 30%); font-size: 0.75rem; margin: 0; text-align: center; font-weight: 500;">
                            Fields marked with * are required
                        </p>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonColor: 'hsl(180 100% 8%)',
            cancelButtonColor: 'hsl(179 20% 45%)',
            confirmButtonText: 'Create Announcement',
            cancelButtonText: 'Cancel',
            background: 'hsl(178 100% 98%)',
            color: 'hsl(181 100% 2%)',
            width: 'min(90vw, 800px)',
            allowOutsideClick: false,
            allowEscapeKey: true,
            customClass: {
                popup: 'modern-swal-create-popup',
                title: 'modern-swal-create-title',
                confirmButton: 'modern-swal-create-confirm-btn',
                cancelButton: 'modern-swal-create-cancel-btn',
                actions: 'modern-swal-create-actions',
                htmlContainer: 'modern-swal-create-content'
            },
            didOpen: () => {
                // Add global image preview handler
                (window as any).handleImagePreview = (input: HTMLInputElement) => {
                    const previewDiv = document.getElementById('image-preview');
                    if (input.files && input.files[0] && previewDiv) {
                        const file = input.files[0];
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            previewDiv.innerHTML = `
                                <img src="${e.target?.result}" alt="Preview" 
                                     style="max-width: 100%; max-height: 150px; border-radius: 0.5rem; border: 2px solid hsl(178 21% 85%); margin-top: 0.5rem; object-fit: cover;">
                            `;
                        };
                        reader.readAsDataURL(file);
                    }
                };

                const style = document.createElement('style');
                style.textContent = `
                    .modern-swal-create-popup {
                        border-radius: 1.5rem !important;
                        background: hsl(178 100% 98%) !important;
                        border-top: 0px !important;
                        border-right: 3px solid hsl(147 19% 36%) !important;
                        border-bottom: 3px solid hsl(147 19% 36%) !important;
                        border-left: 3px solid hsl(147 19% 36%) !important;
                        box-shadow: 
                            0 25px 50px -12px rgba(34, 197, 94, 0.25),
                            0 10px 30px rgba(34, 197, 94, 0.1) !important;
                        font-family: 'Montserrat', sans-serif !important;
                        padding: 2rem !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .modern-swal-create-popup::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 6px;
                        background: linear-gradient(90deg, hsl(147 19% 36%), hsl(147 25% 30%), hsl(217 22% 41%));
                        border-radius: 1.5rem 1.5rem 0 0;
                    }
                    .modern-swal-create-title {
                        color: hsl(147 19% 36%) !important;
                        font-size: 1.75rem !important;
                        font-weight: 700 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        margin-bottom: 1.5rem !important;
                        text-align: center !important;
                        position: relative !important;
                    }
                    .modern-swal-create-content {
                        margin: 0 !important;
                        padding: 0 !important;
                        text-align: left !important;
                    }
                    .modern-swal-create-confirm-btn {
                        background: hsl(180 100% 8%) !important;
                        border: none !important;
                        border-radius: 1rem !important;
                        padding: 1rem 2.5rem !important;
                        font-weight: 700 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        font-size: 1rem !important;
                        color: white !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        box-shadow: 0 6px 20px rgba(34, 197, 94, 0.3) !important;
                        cursor: pointer !important;
                        position: relative !important;
                        overflow: hidden !important;
                    }
                    .modern-swal-create-confirm-btn:hover {
                        background: hsl(180 100% 12%) !important;
                        transform: translateY(-3px) !important;
                        box-shadow: 0 10px 30px rgba(34, 197, 94, 0.4) !important;
                    }
                    .modern-swal-create-confirm-btn:active {
                        transform: translateY(-1px) !important;
                    }
                    .modern-swal-create-cancel-btn {
                        background: hsl(178 100% 98%) !important;
                        color: hsl(179 40% 22%) !important;
                        border: 2px solid hsl(179 20% 45%) !important;
                        border-radius: 1rem !important;
                        padding: 1rem 2rem !important;
                        font-weight: 600 !important;
                        font-family: 'Montserrat', sans-serif !important;
                        font-size: 1rem !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                        cursor: pointer !important;
                    }
                    .modern-swal-create-cancel-btn:hover {
                        background: hsl(178 100% 95%) !important;
                        border-color: hsl(180 100% 8%) !important;
                        color: hsl(180 100% 8%) !important;
                        transform: translateY(-2px) !important;
                        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15) !important;
                    }
                    .modern-swal-create-actions {
                        gap: 1.5rem !important;
                        margin-top: 2rem !important;
                        justify-content: center !important;
                    }
                `;
                document.head.appendChild(style);
            },
            preConfirm: () => {
                // Get form values
                const title = (document.getElementById('swal-title') as HTMLInputElement)?.value;
                const category_id = (document.getElementById('swal-category') as HTMLSelectElement)?.value;
                const author = (document.getElementById('swal-author') as HTMLInputElement)?.value;
                const date = (document.getElementById('swal-date') as HTMLInputElement)?.value;
                const end_date = (document.getElementById('swal-end-date') as HTMLInputElement)?.value;
                const summary = (document.getElementById('swal-summary') as HTMLTextAreaElement)?.value;
                const content = (document.getElementById('swal-content') as HTMLTextAreaElement)?.value;
                const imageFile = (document.getElementById('swal-image') as HTMLInputElement)?.files?.[0];
                
                // Validate required fields
                if (!title?.trim()) {
                    smartToast.error('Please enter an announcement title');
                    return false; // Keep modal open
                }
                if (!category_id) {
                    smartToast.error('Please select a category');
                    return false; // Keep modal open
                }

                if (!date) {
                    smartToast.error('The date field is required');
                    return false; // Keep modal open
                }

                const selectedDate = new Date(date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    smartToast.error('Please enter a valid start date (cannot be in the past)');
                    return false; // Keep modal open
                }

                if (!summary?.trim()) {
                    smartToast.error('Please enter a summary');
                    return false; // Keep modal open
                }
                if (!content?.trim()) {
                    smartToast.error('Please enter content');
                    return false; // Keep modal open
                }
                
                // Update form data only if validation passes
                setData({
                    title: title || '',
                    category_id: category_id || '',
                    author: author || '',
                    date: date || '',
                    end_date: end_date || '',
                    summary: summary || '',
                    content: content || '',
                    image: imageFile || null
                });
                
                return true; // Allow modal to close and proceed
            }
        }).then((result) => {
            if (result.isConfirmed) {
                handleFormSubmit();
            } else if (result.isDismissed) {
                console.log('Create modal cancelled');
                reset();
                setImagePreview(null);
            }
        }).catch((error) => {
            console.error('SweetAlert2 error:', error);
        });
    };

    const handleEdit = (announcement: Announcement) => {
        smartToast.success(
            `Opening "${announcement.title}" for editing...`
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Announcements" />
            <div className="m-4">
                {/* Create Button with SweetAlert */}
                <Button onClick={handleCreateNew}>
                    + New Announcement
                </Button>

                <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {announcements.map((a) => (
                        <div
                            key={a.id}
                            className="group relative overflow-hidden rounded-2xl bg-white shadow-md transition-all hover:shadow-xl dark:bg-[var(--bg-light)]"
                        >
                            <div className="absolute inset-x-0 top-0 h-2" style={{
                                backgroundColor: `var(--${a.category.color || 'primary'})`
                            }}></div>

                            <div className="">
                                {a.image ? (
                                    <img
                                        src={`/storage/${a.image}`}
                                        alt="Announcement"
                                        className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="flex h-48 w-full items-center justify-center bg-[var(--border)] text-[var(--text-muted)]">
                                        <Megaphone size={48} />
                                    </div>
                                )}
                            </div>

                            <div className="p-6 pt-8">
                                {/* Category Badge */}
                                <Badge className="mb-3" style={{
                                    backgroundColor: `var(--${a.category.color || 'primary'})`,
                                    color: 'white'
                                }}>
                                    {a.category.name}
                                </Badge>

                                <h3 className="mb-2 text-xl font-semibold text-[var(--text)] group-hover:text-[var(--primary)]">
                                    {a.title}
                                </h3>

                                <div className="flex gap-2 mb-3 text-sm text-[var(--text-muted)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 inline-block h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {a.date}

                                    {a.author && (
                                        <span className="ml-2">
                                            by {a.author}
                                        </span>
                                    )}
                                </div>

                                <div className="mb-4 h-0.5 w-16 rounded-full bg-[var(--border-muted)]"></div>

                                <p className="mb-6 text-[var(--text)] line-clamp-4">
                                    {a.summary}
                                </p>

                                <div className="flex items-end justify-end gap-2">
                                    <Link
                                        href={route('announcements.edit', { announcement: a.id })}
                                        onClick={() => handleEdit(a)}
                                    >
                                        <Button
                                            className='px-8 bg-[var(--blue)] text-white border-[var(--info)] hover:text-[var(--card)] hover:bg-[var(--blue)]/90 focus-visible:ring-[var(--info)]/20 dark:focus-visible:ring-[var(--blue)]/40'
                                            size="sm"
                                        >
                                            Edit
                                        </Button>
                                    </Link>

                                    <Button
                                        className='px-8 bg-[var(--red)] text-white border-[var(--info)] hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40'
                                        size="sm"
                                        onClick={() => handleDelete(a)}
                                        disabled={processing}
                                    >
                                        {processing ? 'Deleting...' : 'Delete'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {announcements.length === 0 && (
                    <div className="mt-6 text-center">
                        <p className="text-gray-500 mb-4">No announcements available.</p>
                        <Button onClick={handleCreateNew} variant="outline">
                            Create your first announcement
                        </Button>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}