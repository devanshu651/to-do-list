import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

function makeToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
}

export async function register(req, res) {
  const { name, email, password } = req.body;
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ name, email, password: passwordHash });
  res.status(201).json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, token: makeToken(user) } });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new ApiError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect');
  }
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email }, token: makeToken(user) } });
}

export function me(req, res) {
  res.json({ success: true, data: { user: { id: req.user.id, name: req.user.name, email: req.user.email } } });
}
