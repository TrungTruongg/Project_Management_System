import client from "../config/database.js";
import { ObjectId } from "mongodb";

export const getTickets = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("support_tickets");
    const results = await collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createTicket = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("support_tickets");

    const { name, description, assignedBy, projectId, status, priority } = req.body;

    const newTicket = {
      name: name,
      description: description,
      assignedBy: assignedBy,
      projectId: projectId,
      status: status,
      priority: priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await collection.insertOne(newTicket);
    res.json({ _id: result.insertedId, ...newTicket });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update ticket
export const updateTicket = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("support_tickets");
    const { id } = req.params;
    const { name, description, assignedBy, projectId, status, priority } = req.body;

    const updateFields = {
      name: name,
      description: description,
      assignedBy: assignedBy,
      projectId: projectId,
      status: status,
      priority: priority,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateFields },
      { returnDocument: "after" }
    );

    if (!result) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    res.json({ success: true, ticket: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete ticket
export const deleteTicket = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("support_tickets");
    const ticketId = req.params.id;

    const result = await collection.deleteOne({
      _id: new ObjectId(ticketId),
    });

    if (result.deletedCount === 0) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this ticket" });
    }

    res.json({ success: true, message: "Ticket deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
