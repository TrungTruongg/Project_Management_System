import client from "../config/database.js";
import { ObjectId } from "mongodb";

const getDB = () => client.db("db_pms");

export const getTasks = async (req, res) => {
  try {
    const collection = getDB().collection("tasks");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const collection = getDB().collection("tasks");

    const { name, description, startDate, endDate, status, assignedTo, priority, completion, leaderId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
 
    if (!priority) {
      return res.status(400).json({ error: "Priority is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const newTask = {
      name: name,
      description: description,
      startDate: startDate,
      endDate: endDate,
      assignedTo: assignedTo,
      priority: priority,
      status: status || "to-do",
      completion: completion || 0,
      leaderId: leaderId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(newTask);
    res.json({ _id: result.insertedId, ...newTask });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const collection = getDB().collection("tasks");
    const { id } = req.params;
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      assignedTo,
      priority,
      completion
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!priority) {
      return res.status(400).json({ error: "Priority is required" });
    }
    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const updateFields = {
      name,
      description: description,
      status: status,
      startDate,
      endDate,
      assignedTo: assignedTo,
      priority: priority,
      completion,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ success: true, task: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const collection = getDB().collection("tasks");
    const taskId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(taskId),
    });

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
