const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database')


dotenv.config({path:"config/config.env"})
connectDatabase();

app.get("/",(req,res,next)=>{
    res.send("<h1>Working</h1>")
})

const server = app.listen(process.env.PORT,()=>{
    console.log(`Server is running on http://localhost:${process.env.PORT}`)
})