const sha1 = require('sha1');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    if (!req.body.email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!req.body.password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const { email, password } = req.body;

    const user = await dbClient.users.findOne({ email });

    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const newUser = await dbClient.users.insertOne({ email, password: hashedPassword });

    return res.status(201).json({ email, id: newUser.insertedId });
  }
}

module.exports = UsersController;
