const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    try {
      // Coba hapus index pada sizes.id
      await mongoose.connection.db.collection('products').dropIndex('sizes.id_1');
      console.log('Index sizes.id_1 berhasil dihapus');
    } catch (e) {
      console.log('Index sizes.id_1 tidak ditemukan atau sudah dihapus');
    }
    try {
      // Coba hapus index pada id (jika ada)
      await mongoose.connection.db.collection('products').dropIndex('id_1');
      console.log('Index id_1 berhasil dihapus');
    } catch (e) {
      console.log('Index id_1 tidak ditemukan atau sudah dihapus');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  }); 