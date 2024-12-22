const simplifyString = (str) => {
    return str.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
};

export default simplifyString;
