import client from "../config/database.js";

export const getUsers = async (req, res) => {
  try {
    await client.connect();
    const db = client.db("db_pms");
    const collection = db.collection("users");
    const results = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();
    // const processedResults = results.map((user) => ({
    //   ...user,
    //   role: user.roles,
    // }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

