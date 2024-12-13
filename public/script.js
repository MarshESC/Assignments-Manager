const assignmentList = document
  .getElementById("assignment-list")
  .getElementsByTagName("tbody")[0];
let editingAssignmentId = null;

// Function to load assignments from the server
function loadAssignments() {
  fetch("/assignments")
    .then((response) => response.json())
    .then((assignments) => {
      assignmentList.innerHTML = ""; // Clear existing assignments
      assignments.forEach((assignment) => {
        const row = assignmentList.insertRow();
        row.setAttribute("data-id", assignment.id);

        const dueDateTime = new Date(assignment.due_date);
        const dueDateString = dueDateTime.toLocaleString();

        row.innerHTML = `
          <td>${assignment.title}</td>
          <td>${assignment.description}</td>
          <td>${dueDateString}</td>
          <td>
            <button 
              id="status-button-${assignment.id}" 
              class="${assignment.status ? "completed" : "unfinished"}"
              onclick="toggleStatus(${assignment.id})"
              style="background-color: ${
                assignment.status ? "#4CAF50" : "#FF0000"
              }">
              ${assignment.status ? "Completed" : "Unfinished"}
            </button>
          </td>
          <td>
            <button onclick="startEditAssignment(${assignment.id}, '${
          assignment.title
        }', '${assignment.description}', '${
          assignment.due_date
        }')">Edit</button>
            <button onclick="deleteAssignment(${assignment.id})">Delete</button>
          </td>
        `;
      });
    })
    .catch((error) => console.error("Error loading assignments:", error));
}

// Function to toggle assignment status
function toggleStatus(assignmentId) {
  fetch(`/assignments/${assignmentId}/status`, { method: "PATCH" })
    .then((response) => {
      if (response.ok) {
        loadAssignments();
      } else {
        alert("Failed to update status.");
      }
    })
    .catch((error) => console.error("Error updating status:", error));
}

// Function to delete an assignment
function deleteAssignment(id) {
  if (confirm("Are you sure you want to delete this assignment?")) {
    fetch(`/assignments/${id}`, { method: "DELETE" })
      .then((response) => {
        if (response.ok) {
          loadAssignments();
        } else {
          alert("Failed to delete assignment.");
        }
      })
      .catch((error) => console.error("Error deleting assignment:", error));
  }
}

// Function to add a new assignment
function addAssignment() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const dueDate = document.getElementById("due-date").value;
  const dueTime = document.getElementById("due-time").value;

  if (!title || !description || !dueDate || !dueTime) {
    alert("All fields are required.");
    return;
  }

  const dueDateTime = `${dueDate}T${dueTime}`;

  fetch("/assignments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, dueDateTime, status: false }),
  })
    .then((response) => response.json())
    .then(() => {
      loadAssignments();
      alert("Assignment added successfully!");
    })
    .catch((error) => console.error("Error adding assignment:", error));

  // Clear the add form
  document.getElementById("assignment-form").reset();
}

// Function to start editing an assignment
function startEditAssignment(id, title, description, dueDate) {
  editingAssignmentId = id;

  // Populate the edit form
  document.getElementById("edit-title").value = title;
  document.getElementById("edit-description").value = description;
  const [date, time] = dueDate.split("T");
  document.getElementById("edit-due-date").value = date;
  document.getElementById("edit-due-time").value = time;

  // Show the edit form and hide the add form
  document.getElementById("assignment-form").style.display = "none";
  document.getElementById("edit-form").style.display = "block";
}

// Function to cancel editing
function cancelEdit() {
  editingAssignmentId = null;

  // Hide the edit form and show the add form
  document.getElementById("edit-form").style.display = "none";
  document.getElementById("assignment-form").style.display = "block";

  // Clear the edit form
  document.getElementById("edit-form").reset();
}

// Function to update an assignment
function updateAssignment() {
  const title = document.getElementById("edit-title").value;
  const description = document.getElementById("edit-description").value;
  const dueDate = document.getElementById("edit-due-date").value;
  const dueTime = document.getElementById("edit-due-time").value;

  if (!title || !description || !dueDate || !dueTime) {
    alert("All fields are required.");
    return;
  }

  const dueDateTime = `${dueDate}T${dueTime}`;

  fetch(`/assignments/${editingAssignmentId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, description, dueDateTime }),
  })
    .then((response) => {
      if (response.ok) {
        loadAssignments();
        alert("Assignment updated successfully!");
      } else {
        alert("Failed to update assignment.");
      }
    })
    .catch((error) => console.error("Error updating assignment:", error));

  // Reset and hide the edit form
  cancelEdit();
}

// Load assignments on page load
document.addEventListener("DOMContentLoaded", loadAssignments);
