const pluralizeString = (count, word, suffix = 's') => {
    if (count === 1) {
        return `${count} ${word}`;
    }
    return `${count} ${word}${suffix}`;
}

const pluralizeWord = (count, word, suffix = 's') => {
    if (count === 1) {
        return word;
    }
    return `${word}${suffix}`;
}

export { pluralizeString, pluralizeWord };
