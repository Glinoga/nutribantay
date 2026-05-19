import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

function isDark(): boolean {
    return document.documentElement.classList.contains('dark');
}

export function swalTheme() {
    const dark = isDark();
    return {
        background: dark ? '#1f2937' : '#f0fdfa',
        color: dark ? '#f9fafb' : '#111827',
    };
}

export const MySwal = withReactContent(Swal);
