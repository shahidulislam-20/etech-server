const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zgm5tdq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollection = client.db("etechDB").collection("etech");
    const addToCartCollection = client.db("etechDB").collection("addtocart");

    app.get('/products', async (req, res) => {
      const cursor = productCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/:brandName', async (req, res) => {
      const brandName = req.params.brandName;
      const query = { brandName: brandName };
      const doc = productCollection.find(query);
      const result = await doc.toArray();
      res.send(result);
    })

    app.get('/products/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    })

    app.get('/addtocart', async (req, res) => {
      const cursor = addToCartCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/products', async (req, res) => {
      const products = req.body;
      console.log(products);
      const result = await productCollection.insertOne(products);
      res.send(result);
    })

    app.post('/addtocart', async (req, res) => {
      const addtocart = req.body;
      console.log(addtocart);
      const result = await addToCartCollection.insertOne(addtocart);
      res.send(result)
    })

    app.put('/products/product/:id', async(req, res) => {
      const id = req.params.id;
      console.log(id);
      const product = req.body;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateDoc = {
        $set: {
          name: product.name, 
          brandName: product.brandName, 
          type: product.type, 
          price: product.price, 
          rating: product.rating, 
          photo: product.photo, 
          shortDescription: product.shortDescription
        }
      }
      const result = await productCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    })

    app.delete('/addtocart/:id', async(req, res) => {
      const id = req.params.id;
      const query = {id:id};
      const result = await addToCartCollection.deleteMany(query);
      res.send(result);
    })

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Etech server is Running...')
})

app.listen(port, () => {
  console.log('Etech running port : ', port)
})