const express = require("express");
const mysql = require("mysql2");
const app = express();
const PORT = 3000;

// MySQL database connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "AssMan",
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database: ", err);
    return;
  }
  console.log("Connected to MySQL database");
});

app.use(express.json());

// Get all assignments
app.get("/assignments", (req, res) => {
  db.query("SELECT * FROM assignments", (err, results) => {
    if (err) {
      console.error("Error fetching assignments: ", err);
      res.status(500).send("Error fetching assignments");
      return;
    }
    res.json(results);
  });
});

// Get a specific assignment by ID
app.get("/assignments/:id", (req, res) => {
  const id = req.params.id;
  db.query("SELECT * FROM assignments WHERE id = ?", [id], (err, results) => {
    if (err) {
      console.error("Error fetching assignment: ", err);
      res.status(500).send("Error fetching assignment");
      return;
    }
    if (results.length > 0) {
      res.json(results[0]);
    } else {
      res.status(404).send("Assignment not found");
    }
  });
});

// Add a new assignment
app.post("/assignments", (req, res) => {
  const { title, description, dueDateTime, status } = req.body;
  const query =
    "INSERT INTO assignments (title, description, due_date, status) VALUES (?, ?, ?, ?)";
  db.query(query, [title, description, dueDateTime, status], (err, result) => {
    if (err) {
      console.error("Error adding assignment: ", err);
      res.status(500).send("Error adding assignment");
      return;
    }
    res.json({
      id: result.insertId,
      title,
      description,
      due_date: dueDateTime,
      status,
    });
  });
});

// Update assignment status
app.patch("/assignments/:id/status", (req, res) => {
  const id = req.params.id;
  const query = "UPDATE assignments SET status = NOT status WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error updating status: ", err);
      res.status(500).send("Error updating status");
      return;
    }
    res.json({ id, status: result.affectedRows > 0 ? "Updated" : "Not Found" });
  });
});

// Edit an assignment
app.put("/assignments/:id", (req, res) => {
  const { title, description, dueDateTime } = req.body;
  const id = req.params.id;
  const query =
    "UPDATE assignments SET title = ?, description = ?, due_date = ? WHERE id = ?";
  db.query(query, [title, description, dueDateTime, id], (err, result) => {
    if (err) {
      console.error("Error updating assignment: ", err);
      res.status(500).send("Error updating assignment");
      return;
    }
    if (result.affectedRows > 0) {
      res.json({ id, title, description, due_date: dueDateTime });
    } else {
      res.status(404).send("Assignment not found");
    }
  });
});

// Delete an assignment
app.delete("/assignments/:id", (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM assignments WHERE id = ?";
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting assignment: ", err);
      res.status(500).send("Error deleting assignment");
      return;
    }
    if (result.affectedRows > 0) {
      res.status(204).end(); // No content
    } else {
      res.status(404).send("Assignment not found");
    }
  });
});

// Serve the static files (HTML, JS, CSS)
app.use(express.static("public"));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
