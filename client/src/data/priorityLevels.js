const OPACITY = 0.8;

const PRIORITY_LEVELS = Object.freeze({
    low: {
        value: "low",
        title: "LOW",
        icon: "🟣",
        color:  {
            rgba: `rgba(168, 125, 247, ${OPACITY})`,
        }
    },

    medium: {
        value: "medium",
        title: "MEDIUM",
        icon: "🟡",
        color: {
            rgba: `rgba(191, 155, 64, ${OPACITY})`,
        }
    },

    high: {
        value: "high",
        title: "HIGH",
        icon: "🔴",
        color: {
            rgba: `rgba(209, 97, 121, ${OPACITY})`,
        }
    },

    critical: {
        value: "critical",
        title: "CRITICAL",
        icon: "⭕",
        color: {
            rgba: `rgba(204, 51, 84, ${OPACITY})`,
        }
    }
});

export default PRIORITY_LEVELS;
