const Address = require('../models/Address');

// Simpan atau update alamat user
exports.saveAddress = async (req, res) => {
  try {
    const { userId, fullAddress, coordinates } = req.body;
    if (!userId || !fullAddress || !coordinates || typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
      return res.status(400).json({ message: 'userId, fullAddress, and coordinates (lat, lng) are required' });
    }
    // Upsert address
    const address = await Address.findOneAndUpdate(
      { userId },
      { fullAddress, coordinates },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Ambil alamat user berdasarkan userId
exports.getAddressByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: 'userId required' });
    const address = await Address.findOne({ userId });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 