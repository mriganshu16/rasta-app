import { Request, Response } from 'express';
import Ride from '../models/Ride';

// Start a new ride
export const startRide = async (req: any, res: Response) => {
  try {
    const { sessionId } = req.body;
    
    const newRide = await Ride.create({
      userId: req.user.id,
      sessionId,
      status: 'Active',
      metrics: { distanceKm: 0, durationMs: 0, avgSpeedKmh: 0, maxSpeedKmh: 0, elevationGainM: 0 },
      route: { type: 'LineString', coordinates: [] },
      startTime: new Date(),
    });

    res.status(201).json(newRide);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update an active ride (called periodically via batch from client or redis flush)
export const updateRide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    const { coordinates, metrics } = req.body; // coordinates array [[lng, lat]]

    const ride = await Ride.findById(id);

    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.userId.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    if (coordinates && coordinates.length > 0) {
      ride.route.coordinates.push(...coordinates);
    }

    if (metrics) {
      ride.metrics = metrics;
    }

    const updatedRide = await ride.save();
    res.json(updatedRide);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Complete a ride
export const completeRide = async (req: any, res: Response) => {
  try {
    const { id } = req.params;
    
    const ride = await Ride.findById(id);

    if (!ride) {
      res.status(404).json({ message: 'Ride not found' });
      return;
    }

    if (ride.userId.toString() !== req.user.id) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    ride.status = 'Completed';
    ride.endTime = new Date();

    const savedRide = await ride.save();
    res.json(savedRide);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get User's ride history
export const getMyRides = async (req: any, res: Response) => {
  try {
    // Only return completed rides, descending by start time
    const rides = await Ride.find({ userId: req.user.id, status: 'Completed' }).sort({ startTime: -1 });
    res.json(rides);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
