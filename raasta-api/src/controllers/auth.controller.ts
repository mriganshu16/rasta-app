import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User';
import { generateToken } from '../common/utils/jwt';

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

    if (user) {
      res.status(201).json({
        _id: user.id,
        username: user.username,
        email: user.email,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
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
        res.json({
          _id: user.id,
          username: user.username,
          email: user.email,
          token: generateToken(user.id),
        });
        return;
      }
    }

    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserProfile = async (req: any, res: Response) => {
  const user = await User.findById(req.user.id).select('-auth.passwordHash');
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};
