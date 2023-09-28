const endsWithPattern = (str, pat) => {
    const pattern = new RegExp(pat);
    return pattern.test(str);
}

export default endsWithPattern;
