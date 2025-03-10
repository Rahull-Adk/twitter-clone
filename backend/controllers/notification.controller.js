import { Notification } from "../models/notification.model.js";
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notifications = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.log(`Error in getNotification controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log(`Error in deleteNotifications controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteOneNotification = async (req, res) => {
  try {
    const noti = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById(noti);
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    if (notification.to.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this notification" });
    }
    await Notification.findByIdAndDelete(noti);
    return res
      .status(200)
      .json({ message: "Notificaton deleted successfully" });
  } catch (error) {
    console.log(`Error in deleteOneNotifications controller`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
