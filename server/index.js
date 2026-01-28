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

  // USER JOIN
  socket.on("join-user", (userId) => {
    socket.join(`user:${userId}`);
    console.log("User joined:", userId);
  });

  // DRIVER JOIN
  socket.on("join-driver", () => {
    socket.join("drivers");
    console.log("Driver joined");
  });

  // ADMIN JOIN
  socket.on("join-admin", () => {
    socket.join("admin");
    console.log("Admin joined");
  });

  // USER BOOKS RIDE
  socket.on("book-ride", (ride) => {
    ride.status = "Searching Driver";

    io.to("drivers").emit("new-ride", ride);
    io.to("admin").emit("admin-log", {
      type: "BOOK_RIDE",
      data: ride
    });
  });

  // DRIVER ACCEPTS
  socket.on("accept-ride", (ride) => {
    ride.status = "Driver Assigned";

    io.to(`user:${ride.userId}`).emit("ride-update", ride);
    io.to("admin").emit("admin-log", {
      type: "ACCEPT_RIDE",
      data: ride
    });
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log("Server running on", PORT);
});
