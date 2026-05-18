const express = require("express");
const cors = require("cors");
const emailVerifyRoutes = require("./emailVerifier/routes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", emailVerifyRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
