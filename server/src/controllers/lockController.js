import { ObjectId } from 'mongodb';
import client from '../config/database.js';

// lock user account
export const lockUser = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('db_pms');
    const collection = db.collection('users');

    const { userId } = req.params;

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    if (user.isLocked) {
      return res.status(400).json({
        success: false,
        message: 'User is already locked',
      });
    }

    const updateFields = {
      isLocked: true,
      lockedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Account has been locked successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// unlock user account
export const unlockUser = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('db_pms');
    const collection = db.collection('users');

    const { userId } = req.params;

    const user = await collection.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const updateFields = {
      isLocked: false,
      lockedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    res.json({
      success: true,
      message: 'Account has been unlocked successfully',
      data: result,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLockedUser = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const results = await collection
      .find({ isLocked: true })
      .toArray();

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
