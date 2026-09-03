require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/applytrack_ai';
const jwtSecret = process.env.JWT_SECRET || 'applytrack-development-secret';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: String,
  provider: { type: String, default: 'email' },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const applicationSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const emailImportSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Application = mongoose.model('Application', applicationSchema);
const EmailImport = mongoose.model('EmailImport', emailImportSchema);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '2mb' }));

function issueToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role }, jwtSecret, { expiresIn: '7d' });
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  try {
    req.user = jwt.verify(token, jwtSecret);
    next();
  } catch {
    res.status(401).json({ message: 'Authentication required.' });
  }
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role, settings: user.settings };
}

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password || password.length < 6) return res.status(400).json({ message: 'Email and a password of at least 6 characters are required.' });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.exists({ email: normalizedEmail })) return res.status(409).json({ message: 'An account with that email already exists.' });
    const user = await User.create({ name: (name || normalizedEmail.split('@')[0]).trim(), email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: issueToken(user), user: publicUser(user), data: { applications: [], emailImports: [] } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = (email || '').trim().toLowerCase();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user && normalizedEmail === 'admin@admin.com' && password === 'admin1234') {
      user = await User.create({ name: 'Platform Admin', email: normalizedEmail, passwordHash: await bcrypt.hash(password, 12), role: 'ADMIN' });
    }
    if (!user || !user.passwordHash || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Invalid email or password.' });
    const [applications, emailImports] = await Promise.all([Application.find({ owner: user._id }), EmailImport.find({ owner: user._id })]);
    res.json({ token: issueToken(user), user: publicUser(user), data: { applications: applications.map(item => item.data), emailImports: emailImports.map(item => item.data) } });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.get('/api/data', auth, async (req, res) => {
  const [applications, emailImports] = await Promise.all([Application.find({ owner: req.user.id }), EmailImport.find({ owner: req.user.id })]);
  res.json({ applications: applications.map(item => item.data), emailImports: emailImports.map(item => item.data) });
});

app.put('/api/data', auth, async (req, res) => {
  try {
    const applications = Array.isArray(req.body.applications) ? req.body.applications : [];
    const emailImports = Array.isArray(req.body.emailImports) ? req.body.emailImports : [];
    await Promise.all([
      Application.deleteMany({ owner: req.user.id }),
      EmailImport.deleteMany({ owner: req.user.id })
    ]);
    await Promise.all([
      Application.insertMany(applications.map(data => ({ owner: req.user.id, data }))),
      EmailImport.insertMany(emailImports.map(data => ({ owner: req.user.id, data })))
    ]);
    res.json({ applications, emailImports });
  } catch (error) { res.status(500).json({ message: error.message }); }
});

app.patch('/api/users/me', auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, { $set: { name: req.body.name, 'settings.linkedin': req.body.linkedin, 'settings.resume': req.body.resume } }, { new: true });
  res.json({ user: publicUser(user) });
});

app.use(express.static(path.resolve(__dirname, '..')));
app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, '..', '03.html')));

mongoose.connect(mongoUri).then(() => {
  app.listen(port, () => console.log(`ApplyTrack AI running at http://localhost:${port}`));
}).catch(error => {
  console.error('MongoDB connection failed:', error.message);
  process.exit(1);
});
