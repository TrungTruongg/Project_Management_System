import client from "../config/database.js";
import { ObjectId } from "mongodb";

export const getProjects = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("projects");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, description, startDate, endDate, leaderId, priority, members, completion } = req.body;
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("projects");

    const newProject = {
      name: name,
      description: description,
      startDate: startDate,
      endDate: endDate,
      leaderId: leaderId,
      members: members,
      priority,
      completion
    };
    const result = await collection.insertOne(newProject);
    res.json({ ...newProject , _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update project
export const updateProject = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("projects");
    const { id } = req.params;
    const {
      name,
      description,
      status,
      startDate,
      endDate,
      members,
      priority
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updateFields = {
      name,
      description: description,
      status: status,
      startDate,
      endDate,
      members: members,
      priority,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ success: true, project: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("projects");
    const projectId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(projectId),
    });

    // if (result.deletedCount === 0) {
    //   return res
    //     .status(403)
    //     .json({ error: "Not authorized to delete this project" });
    // }

    res.json({ success: true, message: "Project deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
