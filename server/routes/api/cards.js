const express = require('express');
const router = express.Router();

const {
    getCard,
    addCard,
    updateTitle,
    updateDescription,
    updateHighlight,
    updatePriorityLevel,
    deleteCard,
    reorder,
    copyCard,
    updateOwner,
    toggleVerified,
} = require('../../controllers/cardsController');

let cardActionLocks = {};

const withLock = (action, fn) => async (req, res) => {
    const cardId = req.params.id;

     if (cardActionLocks[cardId] && cardActionLocks[cardId][action]) {
        res.status(503).send(`Service Unavailable: ${action}-action for list ${cardId} is being processed`);
        return;
    }

    // Acquire lock for the action
    if (!cardActionLocks[cardId]) {
        cardActionLocks[cardId] = {};
    }

    cardActionLocks[cardId][action] = true;

    try {
        // await new Promise(_ => setTimeout(_, 5000)); // for testing
        await fn(req, res);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error [Mutex]');
    } finally {
        // Release the lock after processing is complete
        delete cardActionLocks[cardId][action];
        if (Object.keys(cardActionLocks[cardId]).length === 0) {
            delete cardActionLocks[cardId];
        }
    }
};

router.route("/")
    .post(addCard)

router.route("/:id")
    .get(getCard)
    .delete(deleteCard)

router.route("/:id/reorder")
    .put(reorder)

router.route("/:id/new-title")
    .put(updateTitle)

router.route("/:id/new-description")
    .put(updateDescription)

router.route("/:id/new-highlight")
    .put(updateHighlight)

router.route("/:id/copy")
    .post(withLock("copy", copyCard))

router.route("/:id/member/update")
    .put(updateOwner)

router.route("/:id/priority/update")
    .put(updatePriorityLevel)

router.route("/:id/toggle-verified")
    .put(withLock("toggleVerified", toggleVerified))

module.exports = router;
