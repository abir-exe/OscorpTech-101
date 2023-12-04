const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");
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
    const customRequestsCollection = client.db("oscorpTech").collection("customRequests");
    const allRequestsCollection = client.db("oscorpTech").collection("allRequests");

    // jwt related api
    app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1hr",
        });
        res.send({ token });
      });

    // middlewares
    const verifyToken = (req, res, next) => {
        console.log("inside verify token", req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send({ message: "forbidden access" });
        }
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: "forbidden access" });
          }
          req.decoded = decoded;
          next();
        });
      };

      //use verify admin after verify token
    const verifyAdmin = async (req, res, next) => {
      const email = req.decoded.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      const isAdmin = user?.role === "admin";
      if (!isAdmin) {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    
    //user related api
    app.get("/users", verifyToken, async (req, res) => {
        const result = await userCollection.find().toArray();
        res.send(result);
      });

      // jwt admin related work
    app.get("/users/admin/:email", verifyToken, async (req, res) => {
        const email = req.params.email;
        if (email !== req.decoded.email) {
          return res.status(403).send({ message: "unauthorized access" });
        }
        const query = { email: email };
        const user = await userCollection.findOne(query);
        let admin = false;
        if (user) {
          admin = user?.role === "admin";
        }
        res.send({ admin });
      });


    app.post("/users", async (req, res) => {
        const user = req.body;
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

      //custom request related api

      // app.get("/customRequests", async (req, res) => {
      //   const email = req.query.email;
      //   const query = { email: email };
      //   const result = await customRequestsCollection.find(query).toArray();
      //   res.send(result);
      // });

      app.get("/customRequests", async (req, res) => {
        const result = await customRequestsCollection.find().toArray();
        res.send(result);
      });

      app.post("/customRequests", async (req, res) => {
        const item = req.body;
        const result = await customRequestsCollection.insertOne(item);
        res.send(result);
      });

      //All Requested related api

      app.post("/allRequests", async (req, res) => {
        const item = req.body;
        const result = await allRequestsCollection.insertOne(item);
        res.send(result);
      });

      app.get("/allRequests", async (req, res) => {
        const result = await allRequestsCollection.find().toArray();
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