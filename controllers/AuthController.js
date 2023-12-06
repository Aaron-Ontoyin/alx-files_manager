const uuid = require('uuid');
const crypto = require('crypto');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const { authorization } = req.headers;
    if (!authorization) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(authorization.split(' ')[1], 'base64').toString().split(':');
    const sha1password = crypto.createHash('sha1').update(password).digest('hex');

    const user = await dbClient.client.db().collection('users').findOne({
      email,
      password: sha1password,
    });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuid.v4();
    const key = `auth_${token}`;
    await redisClient.set(key, user._id.toString(), 24 * 60 * 60);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(key);

    return res.status(204).json();
  }
}

module.exports = AuthController;