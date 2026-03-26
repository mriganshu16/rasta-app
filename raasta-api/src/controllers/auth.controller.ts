import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User, { IUser } from '../models/User';
import { generateToken } from '../common/utils/jwt';
import { AuthRequest } from '../common/middlewares/auth.middleware';

// Shared helper — builds the consistent auth response for both register & login.
// Returns the full profile so the client is fully signed-in with a single call,
// with no follow-up GET /profile request needed.
const buildAuthResponse = (user: IUser) => ({
  _id: user._id.toString(),
  username: user.username,
  email: user.email,
  profile: user.profile,
  stats: user.stats,
  settings: user.settings,
  token: generateToken(user._id.toString()),
});

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      email,
      auth: { provider: 'local', passwordHash },
      profile: { fullName, skillLevel: 'Beginner', achievements: [] },
    });

    res.status(201).json(buildAuthResponse(user));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && user.auth.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.auth.passwordHash);
      if (isMatch) {
        res.json(buildAuthResponse(user));
        return;
      }
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-auth');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
