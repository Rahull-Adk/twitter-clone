import { User } from "../models/user.model.js";
import { Post } from "../models/post.model.js";
import { v2 as cloudinary } from "cloudinary";
import { Notification } from "../models/notification.model.js";
import { response } from "express";
export const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (!text && !img) {
      return res.status(400).json({ error: "Post must have text or image" });
    }

    if (img) {
      const uploadedResponse = await cloudinary.uploader.upload(img);
      img = uploadedResponse.secure_url;
    }

    const newPost = await Post.create({
      user: userId,
      text,
      img,
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.log(`Error in createPost controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this post" });
    }

    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.log(`Error in deletePost controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ error: "Text field is required" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ error: "Post not found" });
    }
    const comment = { user: userId, text };
    // add comment to comments model (array)
    post.comments.push(comment);
    await post.save();
    const newNotification = await Notification.create({
      from: userId,
      to: post.user,
      type: "comment",
    });
    return res.status(200).json(post);
  } catch (error) {
    console.log(`Error in commentOnPost controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const likeUnLikePost = async (req, res) => {
  try {
    const userId = req.user._id;
    const postId = req.params.id;

    // check if the post is already like by the user or not

    const post = await Post.findById(postId);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
    }
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ error: "No user found" });
    }
    const userLikePost = post.likes.includes(userId);
    if (userLikePost) {
      //unlike post
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: postId }, { $pull: { likedPosts: postId } });
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
      return res
        .status(200)
        .json({ message: "Post unliked successfully", updatedLikes });
    } else {
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();
      const updatedLikes = post.likes;
      const newNotification = await Notification.create({
        from: userId,
        to: post.user,
        type: "like",
      });
      return res
        .status(200)
        .json({ message: "Post liked successfully", updatedLikes });
    }
  } catch (error) {
    console.log(`Error in likeUnLikePost controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    if (posts.lenght === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json({ posts, message: "All posts fetched successfully" });
  } catch (error) {
    console.log(`Error in getAllPost controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getLikedPosts = async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // userLikedPost array mar di post id par yin likedPost
    const likedPosts = await Post.find({
      _id: { $in: user.likedPosts },
    })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    return res.status(200).json(likedPosts);
  } catch (error) {
    console.log(`Error in getLikedPosts controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getFollowingPosts = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const following = user.following;
    // if the user the post's doc (the author of the post) is in the user doc's following array give that posts
    const followingPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" });

    res.status(200).json(followingPosts);
  } catch (error) {
    console.log(`Error in getFollowingPosts controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
