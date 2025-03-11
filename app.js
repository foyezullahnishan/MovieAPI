//import express library
import express from 'express'
//set up express and configure to use JSON when dealing with requests
const app = express()
app.use(express.json());
//set up the port number. Defaults to 3000 when we are not using a cloud platform
const PORT = process.env.PORT || 3000
//start listening for connections
app.listen(PORT, () => {
console.log("Server Listening on PORT:", PORT);
});
//configure how to deal with someone visiting /status
app.get("/status", (request, response) => {
const status = {
"Status": "Running"
};
response.send(status);
});