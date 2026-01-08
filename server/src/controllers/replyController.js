import client from "../config/database.js";
import { ObjectId } from "mongodb";

export const getReplies = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("replies");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createReply = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("replies");

    const { taskId, userId, commentId, content, } = req.body;

    const newReply = {
      taskId: taskId,
      userId: userId,
      commentId: commentId,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(newReply);
    res.json({ _id: result.insertedId, ...newReply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
export const updateReply = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("replies");
    const { id } = req.params;
    const { content } = req.body;

    const updateFields = {
      content: content,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Reply not found" });
    }

    res.json({ success: true, reply: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
export const deleteReply = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("replies");
    const replyId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(replyId),
    });

    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this reply" });
    }

    res.json({ success: true, message: "Reply deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
