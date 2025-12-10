const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;


const stripe = require('stripe')(process.env.STRIPE_SECRET);



//middleware 
app.use(cors());
app.use(express.json())


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
    const donationCollection = db.collection('donation');
    const fundingCollection = db.collection('funding');
    

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

    app.post('/funding', async (req, res) => {
      const newFunding = req.body;
      const result = await fundingCollection.insertOne(newFunding);
      res.send(result);
    })



    app.post('/create-checkout-session', async (req, res) => {
      const fundInfo= req.body;
      const amount = parseInt(fundInfo.cost)*100
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        // Provide the exact Price ID (for example, price_1234) of the product you want to sell
        price_data: {
          currency:'USD',
          unit_amount: amount,
          product_data: {
            name: fundInfo.requesterEmail

          }
        },
        
        quantity: 1,
      },
    ],
    user_email: fundInfo.requesterEmail,
    mode: 'payment',
    metadata:{
      donationId: fundInfo.donationId
    },
    success_url: `${process.env.SITE_DOMAIN}?success`,
    cancel_url: `${process.env.SITE_DOMAIN}?canceled`,
  });
  console.log(session)
 res.redirect(303, session.url);
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