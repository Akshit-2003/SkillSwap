const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDatabase } = require('./config/db');
const { uploadDir } = require('./middleware/upload');
const adminRoutes = require('./routes/adminRoutes');
const authRoutes = require('./routes/authRoutes');
const platformRoutes = require('./routes/platformRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const userRoutes = require('./routes/userRoutes');
const verifierRoutes = require('./routes/verifierRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skillswapp';

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(uploadDir)));

app.get('/', (_req, res) => {
  res.send('SkillSwap backend is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/platform', platformRoutes);
app.use('/api/verifier', verifierRoutes);
app.use('/api/messages', messageRoutes);

connectDatabase(MONGODB_URI).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
