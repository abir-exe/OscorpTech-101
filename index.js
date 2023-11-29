const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

//abirmahmud221
//NaA6tJaiDjXvfCQq

//middleware
app.use(cors());
app.use(express.json());


//mongodb codes

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sb4ni5k.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();
    const userCollection = client.db("oscorpTech").collection("users");
    const assetCollection = client.db("oscorpTech").collection("assets");


    
    //user related api
    app.get("/users", async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });

    app.post("/users", async (req, res) => {
        const user = req.body;
        //insert email if user dosent exist
        // you can do this in many ways . 1. email unique, 2. upsert 3. simple checking
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "user already exists", insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      });

      app.patch(
        "/users/admin/:id",
        async (req, res) => {
          const id = req.params.id;
          const filter = { _id: new ObjectId(id) };
          const updatedDoc = {
            $set: {
              role: "admin",
            },
          };
          const result = await userCollection.updateOne(filter, updatedDoc);
          res.send(result);
        }
      );

      //asset related api
      app.get("/assets", async (req, res) => {
        const result = await assetCollection.find().toArray();
        res.send(result);
      });

      app.post("/assets", async (req, res) => {
        const item = req.body;
        const result = await assetCollection.insertOne(item);
        res.send(result);
      });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('oscorp tech is running')
})

app.listen(port, () => {
    console.log(`Oscorp tech is running on port ${port}`)
})