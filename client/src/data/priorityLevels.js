const OPACITY = 0.8;

const PRIORITY_LEVELS = Object.freeze({
    low: {
        title: "low",
        color:  {
            rgba: `rgba(168, 125, 247, ${OPACITY})`,
        }
    },

    medium: {
        title: "medium",
        color: {
            rgba: `rgba(191, 155, 64, ${OPACITY})`,
        }
    },

    high: {
        title: "high",
        color: {
            rgba: `rgba(209, 97, 121, ${OPACITY})`,
        }
    },

    critical: {
        title: "critical",
        color: {
            rgba: `rgba(204, 51, 84, ${OPACITY})`,
        }
    }
});

export default PRIORITY_LEVELS;
