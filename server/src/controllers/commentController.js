import client from "../config/database.js";
import { ObjectId } from "mongodb";

export const getComments = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("comments");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createComment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("comments");

    const { taskId, userId, content } = req.body;

    const newComment = {
      taskId: taskId,
      userId: userId,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(newComment);
    res.json({ _id: result.insertedId, ...newComment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
export const updateComment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("comments");
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
      return res.status(404).json({ error: "Comment not found" });
    }

    res.json({ success: true, comment: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
export const deleteComment = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("comments");
    const commentId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(commentId),
    });

    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this comment" });
    }

    res.json({ success: true, message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
