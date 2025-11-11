/**
 * Format a phone number to Philippine format: +63 XXX XXX XXXX
 * Accepts inputs like: 09171234567, 9171234567, 639171234567, +639171234567
 */
export function formatPhoneNumber(value: string): string {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');
    
    // If starts with 0, replace with 63
    let formatted = numbers;
    if (numbers.startsWith('0')) {
        formatted = '63' + numbers.slice(1);
    } else if (!numbers.startsWith('63')) {
        formatted = '63' + numbers;
    }
    
    // Limit to 12 digits (63 + 10 digits)
    formatted = formatted.slice(0, 12);
    
    // Format as +63 XXX XXX XXXX
    if (formatted.length >= 2) {
        let result = '+63';
        const rest = formatted.slice(2);
        
        if (rest.length > 0) {
            result += ' ' + rest.slice(0, 3);
        }
        if (rest.length > 3) {
            result += ' ' + rest.slice(3, 6);
        }
        if (rest.length > 6) {
            result += ' ' + rest.slice(6, 10);
        }
        
        return result;
    }
    
    return value;
}

/**
 * Display formatted phone number (for display purposes)
 * Returns formatted phone or '-' if empty
 */
export function displayPhoneNumber(phone: string | null | undefined): string {
    if (!phone) return '-';
    
    // If already formatted, return as is
    if (phone.startsWith('+63')) return phone;
    
    // Otherwise format it
    return formatPhoneNumber(phone);
}
