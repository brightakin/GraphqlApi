const { validationResult } = require("express-validator");
const Posts = require("../models/Posts");
const User = require("../models/user");
const io = require("../socket");

exports.getPosts = (req, res, next) => {
  Posts.find()
    .populate("creator")
    .then((posts) => {
      res
        .status(200)
        .json({ message: "Posts fetched successfully", posts: posts });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPosts = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Incorrect field");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("No image found");
    error.statusCode = 422;
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Posts({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    const result = await post.save();
    const user = await User.findById(req.userId);
    creator = user;
    user.posts.push(post);
    const resultUser = await user.save();
    io.getIO().emit("posts", { action: "create", post: post });
    res.status(201).json({
      message: "Post created Successfully",
      post: post,
      creator: {
        _id: creator._id,
        name: creator.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

  // post
  //   .save()
  //   .then((result) => {
  //     return User.findById(req.userId);
  //   })
  //   .then((user) => {
  //     creator = user;
  //     user.posts.push(post);
  //     return user.save();
  //   })
  //   .then((result) => {
  //     res.status(201).json({
  //       message: "Post created Successfully",
  //       post: post,
  //       creator: {
  //         _id: creator._id,
  //         name: creator.name,
  //       },
  //     });
  //   })
  //   .catch((err) => {
  //     if (!err.statusCode) {
  //       err.statusCode = 500;
  //     }
  //     next(err);
  //   });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Posts.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error;
      }
      res
        .status(200)
        .json({ message: "Post fetched successfully", post: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
