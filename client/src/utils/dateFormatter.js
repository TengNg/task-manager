export default function dateFormatter(miliseconds, option = { withTime: true }) {
    const date = new Date(miliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return option.withTime ? `${year}-${month}-${day}, ${hours}:${minutes}:${seconds} ${ampm}` : `${year}-${month}-${day}`;
}
