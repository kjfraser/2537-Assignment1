
const express = require("express");
const app = express();


express.get("/", (req, res) => {
    res.send("<form><input type='text' name='username'><button>Submit</button></form>");
});