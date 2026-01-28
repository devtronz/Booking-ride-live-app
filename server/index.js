const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.get("/", (req, res) => {
  res.send("🚕 Booking Ride Server is LIVE");
});

io.on("connection", (socket) => {
  console.log("Connected:", socket.id);

  socket.on("join-user", (userId) => {
    socket.join(`user:${userId}`);
    console.log("User joined:", userId);
  });

  socket.on("join-driver", () => {
    socket.join("drivers");
    console.log("Driver joined");
  });

  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("Admin joined");
  });

  socket.on("book-ride", (ride) => {
    if (!ride.userId) return;

    ride.status = "Searching Driver";
    io.to("drivers").emit("new-ride", ride);
    io.to("admin").emit("admin-log", {
      type: "BOOK_RIDE",
      data: ride
    });
  });

  socket.on("accept-ride", (ride) => {
    ride.status = "Driver Assigned";

    io.to(`user:${ride.userId}`).emit("ride-update", ride);
    io.to("admin").emit("admin-log", {
      type: "ACCEPT_RIDE",
      data: ride
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on", PORT);
});
