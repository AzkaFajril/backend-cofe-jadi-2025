// server/controllers/authController.js
const User = require('../models/User');

exports.loginWithGoogle = async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body; // data dari Google OAuth
    if (!googleId || !email) {
      return res.status(400).json({ error: 'googleId and email are required' });
    }
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, email, name, picture });
    }
    // Kirim user info lengkap ke frontend
    res.json({
      _id: user._id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      picture: user.picture,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUserAddress = async (req, res) => {
  const { userId } = req.params;
  const { fullAddress, coordinates } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { address: { fullAddress, coordinates } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
