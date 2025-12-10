const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;


const stripe = require('stripe')('');


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



app.get('/',(req,res)=>{
    res.send('my eleventh server is runningggggg!!!')
})


async function run() {
  try {
    await client.connect()

    const db = client.db('eleventh_db');
    const donationCollection = db.collection('donation');


    app.get('/donation', async(req, res) => {
      const query = {}
      const {email} = req.query;

      if(email){
        query.requesterEmail = email
      }

      const cursor = donationCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)

    })


    app.get('/donation/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await donationCollection.findOne(query)
      res.send(result)
    })

    app.post('/donation', async(req,res) =>{
        const newDonation = req.body;
        const result = await donationCollection.insertOne(newDonation);
        res.send(result);
    })


    app.patch('/donation/:id', async(req, res) => {
      const id = req.params.id;
      const donationUpdate = req.body;
      const query = {_id: new ObjectId(id)}
      const update = {
        $set:{
          name: donationUpdate.name,
          price: donationUpdate.price
        }
      }
      const result = await donationCollection.updateOne(query, update)
      res.send(result);

    })




    app.delete('/donation/:id', async(req, res) => {

      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await donationCollection.deleteOne(query);
      res.send(result)

    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    
  }
}
run().catch(console.dir);



app.listen(port, () =>{
    console.log(`my eleventh server is running on port: ${port}`)
})