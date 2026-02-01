import express from "express";

import {
    getFlashCards,
    getAllFlashCardsSets,
    reviewFlashCards,
    toggleStarFlashcard,
    deleteFlashCardSet,
} from "../controllers/flashcardController.js";

import protect from "../middlewares/auth.js";

const router = express.Router();
router.use(protect);


router.get('/',getAllFlashCardsSets);
router.get('/:documentId',getFlashCards);
router.post('/:cardId/review',reviewFlashCards);
router.put('/:cardId/star',toggleStarFlashcard);
router.delete('/:id',deleteFlashCardSet);

export default router;

