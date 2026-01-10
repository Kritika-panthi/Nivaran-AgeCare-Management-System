import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
dotenv.config();

app.use(express.json());

app.get('/api', (req, res) => {
    res.send('Server is ready');
});

const port = process.env.PORT || 3000;

const MONGOURI = process.env.MONGO_URI;

mongoose.connect(MONGOURI).then(()=>{
    console.log("Databse id connected sccessfully")
}) .catch((error) => console.log(error))

app.listen(port, () => {
    console.log('Serve at http://localhost:${port}');
});