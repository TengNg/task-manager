// roseAlert: "#d16179",
// darkBrownAlert: "#a34356",
// yellowAlert: "#e2a703",
// purpleAlert: "#a855f7",
// blueAlert: "#7274f3",
// lightTealAlert: "#2dd4bf",
// lightGreenAlert: "#12d393",
// tealAlert: "#0d9488",
// lighterShade: "#8d97a5",

const OPACITY = 0.25;

const highlightColors = Object.freeze({
    "#d16179": "#d16179",
    "#a34356": "#a34356",
    "#e2a703": "#e2a703",
    "#a855f7": "#a855f7",
    "#7274f3": "#7274f3",
    "#2dd4bf": "#2dd4bf",
    "#12d393": "#12d393",
    "#0d9488": "#0d9488",
    "#8d97a5": "#8d97a5",
});

export const highlightColorsRGBA = Object.freeze({
    "#d16179": `rgba(203, 77, 104, ${OPACITY})`,
    "#a34356": `rgba(163, 67, 86, ${OPACITY})`,
    "#e2a703": `rgba(226, 167, 3, ${OPACITY})`,
    "#a855f7": `rgba(168, 85, 247, ${OPACITY})`,
    "#7274f3": `rgba(114, 116, 243, ${OPACITY})`,
    "#2dd4bf": `rgba(45, 212, 191, ${OPACITY})`,
    "#12d393": `rgba(18, 211, 147, ${OPACITY})`,
    "#0d9488": `rgba(13, 148, 136, ${OPACITY})`,
    "#8d97a5": `rgba(141, 151, 165, ${OPACITY})`,
});

export default highlightColors;

