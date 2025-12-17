const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;
const crypto = require('crypto');
const admin = require("firebase-admin");

const admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}




const stripe = require('stripe')(process.env.STRIPE_SECRET);



//middleware 
app.use(cors({
  origin: ['http://localhost:5173', 'https://my-server-eleventh.vercel.app/']
}));
app.use(express.json())

const verifyFBToken = async( req, res, next) =>{

  const token = req.headers.authorization;

  if(!token){
    return res.status(401).send({message: 'unauthorized access'})
  }
  try{
    const idToken = token.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken)
    console.log('decoded token', decoded)
    req.decoded_email = decoded.email;
    next();
  }
  catch(error){
    return res.status(401).send({message: 'unauthorized access'})
  }

  

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ro9lg2o.mongodb.net/?appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



app.get('/', (req, res) => {
  res.send('my eleventh server is runningggggg!!!')
})


async function run() {
  try {
    await client.connect()

    const db = client.db('eleventh_db');
    const userCollection = db.collection('users');
    const donorsCollection = db.collection('donors');
    const donationCollection = db.collection('donation');
    const fundingDetails = db.collection('fund-details');
    const allFundings = db.collection('allFundings');


    //User related Apis

    app.post('/users', async(req, res) =>{
      const user = req.body;
      user.role = 'user';
      user.createdAt = new Date();
      const email = user.email;
      const userExist = await userCollection.findOne({email})


      if(userExist){
        return res.send({message: 'user exists'})
      }
      
      const result = await userCollection.insertOne(user);
      res.send(result);

    })
    

    //------------------------------- 


    //Donors related apis
    app.post('/donors', async(req, res) =>{
      const donor = req.body;
      donor.status = 'pending';
      donor.createdAt = new Date();

      const result = await donorsCollection.insertOne(donor);

      res.send(result);
    })

    app.get('/donors', async(req, res) => {
      const query = {}
      if(req.query.status){
        query.status = req.query.status;
      }
      const cursor = donorsCollection.find(query)
      const result = await cursor.toArray();
      res.send(result);
    })


    //--------------------------------
    app.get('/donation', async (req, res) => {
      const query = {}
      const { email } = req.query;

      if (email) {
        query.requesterEmail = email
      }

      const cursor = donationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)

    })


    app.get('/donation/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donationCollection.findOne(query)
      res.send(result)
    })

    app.post('/donation', async (req, res) => {
      const newDonation = req.body;
      const result = await donationCollection.insertOne(newDonation);
      res.send(result);
    })


    app.patch('/donation/:id', async (req, res) => {
      const id = req.params.id;
      const donationUpdate = req.body;
      const query = { _id: new ObjectId(id) }
      const update = {
        $set: {
          name: donationUpdate.name,
          price: donationUpdate.price
        }
      }
      const result = await donationCollection.updateOne(query, update)
      res.send(result);

    })




    app.delete('/donation/:id', async (req, res) => {

      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await donationCollection.deleteOne(query);
      res.send(result)

    })


    // Payment method

    app.get('/fund-details', async (req, res) => {
      const query = {}
      const { email } = req.query;

      if (email) {
        query.requesterEmail = email
      }

      const cursor = fundingDetails.find(query);
      const result = await cursor.toArray();
      res.send(result)

    })




app.post('/create-checkout-session', async (req, res) => {
  const paymentInfo= req.body;
  const amount = parseInt(paymentInfo.cost)*100


      const fundingData = {
      fundName: paymentInfo.fundName,
      fundingId: paymentInfo.fundingId,
      amount: paymentInfo.cost,
      email: paymentInfo.customerEmail,
      status: 'pending',
      date: new Date()
       };

      await allFundings.insertOne(fundingData);


    const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency:'USD',
          unit_amount: amount,
          product_data: {
            name: paymentInfo.fundName

          }
        },
        
        quantity: 1,
      },
    ],
    
    mode: 'payment',
    metadata:{
      fundingId: paymentInfo.fundingId,
    },
   customer_email: paymentInfo.customerEmail,
    success_url: `${process.env.SITE_DOMAIN}/payment-success`,
    cancel_url: `${process.env.SITE_DOMAIN}/payment-canceled`,
  });
  console.log(session)
 res.send({url: session.url})
});





app.get('/allFundings', verifyFBToken, async (req, res) => {
      const query = {};
      const { email } = req.query;

      // console.log('I want to see headers', req.headers)

      if (email) {
        query.email = email;

        if(email !==req.decoded_email){
          return res.status(403).send({message: 'forbidden access'})
        }
      }

      const result = await allFundings.find(query).toArray();
      res.send(result);
    });

//------------------------------------------------------


      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } finally {

    }
  }
run().catch(console.dir);



  app.listen(port, () => {
    console.log(`my eleventh server is running on port: ${port}`)
  })