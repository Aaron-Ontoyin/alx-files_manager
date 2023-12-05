import sha1 from 'sha1';

const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.client.db().collection('users');

    const user = await usersCollection.findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const newUser = await usersCollection.insertOne({ email, password: sha1(password) });

    return res.status(201).json({ email, id: newUser.insertedId.toString() });
  }
}

module.exports = UsersController;
