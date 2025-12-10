const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 3000;

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
    const productsCollection = db.collection('products');


    app.get('/products', async(req, res) => {

      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result)

    })


    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productsCollection.findOne(query)
      res.send(result)
    })

    app.post('/products', async(req,res) =>{
        const newProducts = req.body;
        const result = await productsCollection.insertOne(newProducts);
        res.send(result);
    })


    app.patch('/products/:id', async(req, res) => {
      const id = req.params.id;
      const productUpdate = req.body;
      const query = {_id: new ObjectId(id)}
      const update = {
        $set:{
          name: productUpdate.name,
          price: productUpdate.price
        }
      }
      const result = await productsCollection.updateOne(query, update)
      res.send(result);

    })




    app.delete('/products/:id', async(req, res) => {

      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await productsCollection.deleteOne(query);
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