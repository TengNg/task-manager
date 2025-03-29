function validUrl(str) {
    try {
        new URL(str);
        return true;
    } catch (err) {
        return false;
    }
}

export default validUrl;
