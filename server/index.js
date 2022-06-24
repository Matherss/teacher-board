const express = require("express");
const app = express();
const cors = require("cors");
const WSServer = require("express-ws")(app);
const aWss = WSServer.getWss();
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    msg = JSON.parse(msg);
    switch (msg.method) {
      case "connection":
        connectionHandler(ws, msg);
        break;
      case "draw":
        broadcastConnection(ws, msg);
        break;
    }
  });
});

app.post("/image", (req, res) => {
  console.log(req);
  try {
    const data = req.body.img.replace("data:image/png;base64,", "");
    fs.writeFileSync(path.resolve(__dirname, "files", `${req.query.id}.jpg`), data, "base64");
    return res.status(200).json({ message: "Загружено" });
  } catch (error) {
    console.error(error);
    return res.status(500).json("error 500");
  }
});
app.get("/image", (req, res) => {
  try {
    const file = fs.readFileSync(path.resolve(__dirname, "files", `${req.query.id}.jpg`));
    const data = `data:image/png;base64,` + file.toString("base64");
    res.json(data);
  } catch (error) {
    console.error(error);
    return res.status(500).json("error 500");
  }
});
app.listen(PORT, () => console.log(`server started on port ${PORT}`));

const connectionHandler = (ws, msg) => {
  ws.id = msg.id;
  broadcastConnection(ws, msg);
};

const broadcastConnection = (ws, msg) => {
  aWss.clients.forEach((client) => {
    if (client.id === msg.id) {
      console.log(msg);
      client.send(JSON.stringify(msg));
    }
  });
};
