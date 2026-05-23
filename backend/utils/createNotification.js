import Notification from "../models/notification.js";

const createNotification = async ({
  recipient,
  sender = null,
  type,
  title,
  message,
  meta = {},
}) => {
  return await Notification.create({
    recipient,
    sender,
    type,
    title,
    message,
    meta,
  });
};

export default createNotification;