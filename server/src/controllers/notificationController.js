import client from "../config/database.js";
import { ObjectId } from "mongodb";

export const getNotifications = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("notifications");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createNotification = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("notifications");

    const { userId, type, title, description, createdBy } = req.body;
    const newNotification = {
      title: title,
      description: description,
      type: type,
      userId: userId,
      createdBy: createdBy,
      createdAt: new Date()
    };
    const result = await collection.insertOne(newNotification);
    res.json({ ...newNotification, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete 
export const deleteNotification = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("notifications");
    const taskId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(taskId),
    });

    // if (result.deletedCount === 0) {
    //   return res
    //     .status(403)
    //     .json({ error: "Not authorized to delete this task" });
    // }

    res.json({ success: true, message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
