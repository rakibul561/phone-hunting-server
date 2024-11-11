const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000 ;

// midaleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_USER);


// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://<db_username>:<db_password>@cluster0.fmdvppd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const { MongoClient, ServerApiVersion, CURSOR_FLAGS, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fmdvppd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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


    const serviceCollection = client.db('phone').collection('services');
    const bookingCollection = client.db('phone').collection('bookings')

    // get data 
    app.get('/services', async (req, res) =>{
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    }) 


      // bookings
      app.get('/bookings', async (req, res) => {
        console.log(req.query.email);
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email }
        }
        const result = await bookingCollection.find(query).toArray();
        res.send(result)
      })





    // post data 
    app.post('/bookings', async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
      res.send(result)
    });


    
    // details page 
    app.get('/services/:id', async (req, res) => {
        try {
            const id = req.params.id;
    
            // চেক করুন যে আইডিটি সঠিক ObjectId ফরম্যাটে আছে কিনা
            if (!ObjectId.isValid(id)) {
                return res.status(400).send("Invalid ID format");
            }
    
            // সঠিক ফরম্যাট হলে ObjectId তে রূপান্তর করুন
            const result = await serviceCollection.findOne({ _id: new ObjectId(id) });
    
            if (result) {
                res.send(result);
            } else {
                res.status(404).send("Document not found");
            }
        } catch (error) {
            console.error("Error fetching document:", error);
            res.status(500).send("Server error");
        }
    });

  
    // email page 
    app.get('/serviecs/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const options = {
        projection: { description: 1, brand: 1, phone_name: 1, image: 1, },
      }
      const result = await serviceCollection.findOne(query, options);
      res.send(result)
    })


    





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);










app.get('/', (req, res) =>{
    res.send('phone is fire')
})


app.listen(port, ()=>{
    console.log(`phone server is running port: ${port}`);
    
})