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



const Tracking = require('./models/Tracking');

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
const axios = require('axios'); // Import axios for making API calls

app.get('/tracking/details/:orderId', verifyToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Step 1: Fetch tracking details from MongoDB
    const trackingDetails = await Tracking.findOne({ orderId });
    if (!trackingDetails) {
      return res.status(404).send('Tracking details not found for the given orderId');
    }

    // Step 2: Fetch order details from Order Microservice
    const orderResponse = await axios.get(`http://localhost:3001/api/orders/${orderId}`); // Update with actual Order Microservice URL
    const orderData = orderResponse.data;

    // Step 3: Fetch user details from User Microservice
    const userResponse = await axios.get(`http://localhost:3002/user/${orderData.userId}`); // Update with actual User Microservice URL
    const userData = userResponse.data;

    // Step 4: Fetch user address from User Microservice
    const addressResponse = await axios.get(
      `http://localhost:3002/user/${orderData.userId}/address/${orderData.addressId}`
    ); // Update with actual User Microservice URL
    const addressData = addressResponse.data;

    // Step 5: Fetch product details from Product Microservice
    const productResponse = await axios.get(
      `http://localhost:3003/products/${orderData.productId}`
    ); // Update with actual Product Microservice URL
    const productData = productResponse.data;

    // Step 6: Combine all details into one response
    const responseData = {
      trackingDetails,
      orderDetails: orderData,
      userDetails: userData,
      address: addressData,
      productDetails: productData,
    };

    // Send the combined data as response
    res.json(responseData);
  } catch (err) {
    console.error(err.message);

    // Handle specific errors
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
    } else {
      res.status(500).send('An error occurred while fetching tracking details');
    }
  }
});


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
  