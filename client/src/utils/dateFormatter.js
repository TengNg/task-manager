export default function dateFormatter(miliseconds, option = { weekdayFormat: false, withTime: true }) {
    if (!miliseconds) return '';

    const date = new Date(miliseconds);

    if (option.weekdayFormat) {
        const options = {
            weekday: 'short',
            month: 'short',
            day: '2-digit'
        };
        const formattedDate = date.toLocaleDateString('en-US', options);
        const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} ${time}`;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return option.withTime ? `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}` : `${year}-${month}-${day}`;
}

export const formatDateToYYYYMMDD = (miliseconds) => {
    if (!miliseconds) return '';

    const date = new Date(miliseconds);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export const dateToCompare = (miliseconds) => {
    if (!miliseconds) return '';

    const date = new Date(miliseconds);
    const today = new Date();

    return date.getTime() <= today.getTime();
};
