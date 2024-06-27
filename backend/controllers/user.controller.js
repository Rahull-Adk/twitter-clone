import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcrypt";
export const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getUserProfile controller: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

export const followUnFollowUser = async (req, res) => {
  try {
    // get the currentUser
    const currentUser = await User.findById(req.user._id);
    // get the user from params that you wanna follow/unfollow
    const { id } = req.params;
    const userToModify = await User.findById(id);

    //check if both user exists
    if (!currentUser || !userToModify) {
      return res.status(404).json({ error: "User not found" });
    }
    // you can't follow/unfollow yourself

    if (currentUser._id.toString() === userToModify._id.toString()) {
      return res
        .status(400)
        .json({ error: "You can't follow/unfollow yourself" });
    }

    // check in the currentUser's following array that if that "wanna follow/unfollow" user exists.
    const isFollowed = currentUser.following.includes(userToModify._id);
    // if that dude exists, then unfollow logic
    if (isFollowed) {
      await User.findByIdAndUpdate(currentUser._id.toString(), {
        $pull: {
          following: userToModify._id.toString(),
        },
      });
      await User.findByIdAndUpdate(userToModify._id.toString(), {
        $pull: {
          followers: currentUser._id.toString(),
        },
      });
      return res.status(200).json({ message: "User unfollowed successfully" });
      // if not exist, follow logic
    } else {
      await User.findByIdAndUpdate(currentUser._id.toString(), {
        $push: {
          following: userToModify._id.toString(),
        },
      });
      await User.findByIdAndUpdate(userToModify._id.toString(), {
        $push: {
          followers: currentUser._id.toString(),
        },
      });
      const newNotification = await Notification.create({
        type: "follow",
        from: req.user._id,
        to: userToModify._id,
      });
      return res.status(200).json({ message: "User followed successfully" });
    }
  } catch (error) {
    console.log("Error at follow/unfollow controller", error);
    return res.status(500).json({ error: error.message });
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    // get current User
    const currentUserId = req.user._id;
    // get users that current User followed
    const userFollowedByMe = await User.findById(currentUserId).select(
      "following"
    );
    //get 10 users excluding the current user.
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // filter the users that the current user already followed.

    const filteredUsers = users.filter(
      // check if user._id (10 users excerpt me) is in my following's array
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    console.log(filteredUsers);
    // get top 4 users from the remaining list.
    const suggestUser = filteredUsers.slice(0, 4);

    // remove their passwords
    suggestUser.forEach((user) => (user.password = null));
    // suggest them
    return res.status(200).json(suggestUser);
  } catch (error) {
    console.log("Error at suggestedUse controller", error);
    return res.status(500).json({ error: error.message });
  }
};
export const updateUserProfile = async (req, res) => {
  const { fullName, username, email, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;

  try {
    console.log("Request Body:", req.body); // Log the request body to debug

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if username already exists
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) {
        return res.status(400).json({ error: "Username already exists" });
      }
    }

    // Check if email already exists
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email already exists" });
      }
    }
    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please provide both current password and new password",
      });
    }
    if (currentPassword && newPassword) {
      const passwordCheck = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!passwordCheck) {
        return res.status(400).json({ error: "Current password is incorrect" });
      } else if (currentPassword === newPassword) {
        return res
          .status(400)
          .json({ error: "New password can not be same as old" });
      } else if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (profileImg) {
      if (user.profileImg) {
        // delete old image to free up storage
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.coverImg = coverImg || user.coverImg;
    user.profileImg = profileImg || user.profileImg;
    await user.save();

    user.password = null;
    return res.status(200).json(user);
  } catch (error) {
    console.log("Error at update controller", error);
    return res.status(500).json({ error: error.message });
  }
};
