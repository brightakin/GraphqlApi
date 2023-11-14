const express = require("express");
const router = express.Router();
const feedController = require("../controllers/feeds");
const isAuth = require("../middleware/is-auth");
const { body } = require("express-validator");

router.get("/posts", isAuth, feedController.getPosts);
router.post(
  "/post",
  [
    body("title").trim().isLength({ min: 7 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPosts
);
router.get("/post/:postId", feedController.getPost);
router.delete("/post/:postId");

module.exports = router;
