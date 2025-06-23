import "dotenv/config";
import cors from "cors";
import express from "express";
import type { RequestHandler } from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json())
app.use(express.urlencoded({ extended: true }));

// Vehicle type for reference
interface Vehicle {
  id: number;
  model: string;
  vehicleName: string;
  price: number;
  image: string;
  desc: string;
  brand: string;
}

// In-memory storage for vehicles
let vehicles: Vehicle[] = [];
let nextId = 1;

// ES module __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set EJS as the view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Create a new vehicle
const createVehicle: RequestHandler = (req, res) => {
  const { model, vehicleName, price, image, desc, brand } = req.body;
  if (!model || !vehicleName || !price || !image || !desc || !brand) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  const vehicle: Vehicle = { id: nextId++, model, vehicleName, price, image, desc, brand };
  vehicles.push(vehicle);
  res.status(201).json(vehicle);
};
app.post("/vehicles", createVehicle);

// Get all vehicles
const getAllVehicles: RequestHandler = (_req, res) => {
  res.json(vehicles);
};
app.get("/vehicles", getAllVehicles);

// Get a vehicle by id
const getVehicleById: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const vehicle = vehicles.find(v => v.id === id);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found." });
    return;
  }
  res.json(vehicle);
};
app.get("/vehicles/:id", getVehicleById);

// Update a vehicle by id
const updateVehicle: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const vehicle = vehicles.find(v => v.id === id);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found." });
    return;
  }
  const { model, vehicleName, price, image, desc, brand } = req.body;
  if (!model || !vehicleName || !price || !image || !desc || !brand) {
    res.status(400).json({ error: "All fields are required." });
    return;
  }
  vehicle.model = model;
  vehicle.vehicleName = vehicleName;
  vehicle.price = price;
  vehicle.image = image;
  vehicle.desc = desc;
  vehicle.brand = brand;
  res.json(vehicle);
};
app.put("/vehicles/:id", updateVehicle);

// Delete a vehicle by id
const deleteVehicle: RequestHandler = (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Vehicle not found." });
    return;
  }
  vehicles.splice(index, 1);
  res.status(204).send();
};
app.delete("/vehicles/:id", deleteVehicle);

// UI route to render vehicles
app.get("/ui/vehicles", (_req, res) => {
  res.render("vehicles", { vehicles });
});

// UI route to render create vehicle form
app.get("/ui/vehicles/create", (_req, res) => {
  res.render("create-vehicle");
});

// UI route to handle create vehicle form submission
app.post("/ui/vehicles/create", (req, res) => {
  const { model, vehicleName, price, image, desc, brand } = req.body;
  if (!model || !vehicleName || !price || !image || !desc || !brand) {
    res.status(400).send("All fields are required.");
    return;
  }
  const vehicle = {
    id: nextId++,
    model,
    vehicleName,
    price: Number(price),
    image,
    desc,
    brand
  };
  vehicles.push(vehicle);
  res.redirect("/ui/vehicles");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
