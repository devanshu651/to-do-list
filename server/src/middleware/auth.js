import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

export async function requireAuth(req, _res, next) {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7) : null;
    if (!token) throw new ApiError(401, 'UNAUTHORIZED', 'A bearer token is required');
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { throw new ApiError(401, 'INVALID_TOKEN', 'The access token is invalid or expired'); }
    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, 'INVALID_TOKEN', 'The account for this token no longer exists');
    req.user = user;
    next();
  } catch (err) { next(err); }
}
