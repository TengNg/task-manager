export default function dateFormatter(miliseconds, withTime = true) {
    const date = new Date(miliseconds);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    return withTime ? `${year}-${month}-${day}, ${hours}:${minutes} ${ampm}` : `${year}-${month}-${day}`;
}
