require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const { generateToken, verifyToken } = require('./utils/jwt');

//login to generate jwt token
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'testuser' && password === 'password') {
    const token = generateToken({ username, role: 'user' });
    res.json({ token });
  } else {
    res.status(401).send('Invalid credentials');
  }
});

//track order based on order id
app.get('/tracking/:orderId',  async (req, res) => {
    try {
      const { orderId } = req.params;
      const trackingData = await Tracking.findOne({ orderId });
  
      if (!trackingData) {
        return res.status(404).send('Tracking data not found');
      }
  
      res.json(trackingData);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error fetching tracking data');
    }
  });

  const Tracking = require('./models/Tracking');

  //create tracking data
  app.post('/tracking',  async (req, res) => {
    const { orderId, status, location } = req.body;
    if (!orderId || !status || !location) {
      return res.status(400).send('Missing required fields');
    }
  
    const trackingData = new Tracking({ orderId, status, location });
    await trackingData.save();
    res.status(201).send('Tracking data created');
  });

  //update tracking data
  app.put('/tracking/:orderId',  async (req, res) => {
    try {
      const { orderId } = req.params;
      const { status, location } = req.body;
      if (!status && !location) {
        return res.status(400).send('At least one field (status or location) must be provided to update.');
      }
      const updatedTracking = await Tracking.findOneAndUpdate(
        { orderId },
        { ...(status && { status }), ...(location && { location }), lastUpdated: Date.now() },
        { new: true }
      );
  
      if (!updatedTracking) {
        return res.status(404).send('Tracking data not found for the given orderId.');
      }
  
      res.json(updatedTracking);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error updating tracking data');
    }
  });

  //get all tracking data
  app.get('/tracking',  async (req, res) => {
    try {
      const trackingRecords = await Tracking.find();
      res.json(trackingRecords);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error fetching tracking data');
    }
  });

  //delete tracking data for order id
  app.delete('/tracking/:orderId',  async (req, res) => {
    try {
      const { orderId } = req.params;
      const deletedRecord = await Tracking.findOneAndDelete({ orderId });
  
      if (!deletedRecord) {
        return res.status(404).send('Tracking data not found for the given orderId');
      }
  
      res.send('Tracking data deleted successfully');
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error deleting tracking data');
    }
  });

  //get tracking data by status
  app.get('/tracking/status/:status',  async (req, res) => {
    try {
      const { status } = req.params;
      const records = await Tracking.find({ status });
  
      if (!records.length) {
        return res.status(404).send('No tracking data found for the given status');
      }
  
      res.json(records);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error fetching tracking data');
    }
  });
  
    //get tracking data by location
  app.get('/tracking/location/:location',  async (req, res) => {
    try {
      const { location } = req.params;
      const records = await Tracking.find({ location });
  
      if (!records.length) {
        return res.status(404).send('No tracking data found for the given location');
      }
  
      res.json(records);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error fetching tracking data');
    }
  });
  
  //batch update tracking data
  app.put('/tracking',  async (req, res) => {
    try {
      const updates = req.body;
  
      const updatePromises = updates.map(({ orderId, ...fields }) =>
        Tracking.findOneAndUpdate({ orderId }, { ...fields, lastUpdated: Date.now() }, { new: true })
      );
  
      const results = await Promise.all(updatePromises);
  
      res.json(results);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Error updating tracking data');
    }
  });
  