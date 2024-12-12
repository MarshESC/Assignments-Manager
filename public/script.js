const assignmentList = document
  .getElementById("assignment-list")
  .getElementsByTagName("tbody")[0];
let editingAssignmentId = null; // To track the assignment being edited

// Function to load assignments from the server
// Function to load assignments from the server
function loadAssignments() {
  fetch("/assignments")
    .then((response) => response.json())
    .then((assignments) => {
      assignmentList.innerHTML = ""; // Clear existing assignments
      assignments.forEach((assignment) => {
        const row = assignmentList.insertRow();
        row.setAttribute("data-id", assignment.id);

        // Format the due date and time for display
        const dueDateTime = new Date(assignment.due_date);
        const dueDateString = dueDateTime.toLocaleString();

        row.innerHTML = `
                    <td>${assignment.title}</td>
                    <td>${assignment.description}</td>
                    <td>${dueDateString}</td>
                    <td>
                      <button 
                        id="status-button-${assignment.id}" 
                        class="${
                          assignment.status ? "completed" : "unfinished"
                        }"
                        onclick="toggleStatus(${assignment.id})">
                        ${assignment.status ? "Completed" : "Unfinished"}
                      </button>
                    </td>
                    <td>
                        <button onclick="editAssignment(${
                          assignment.id
                        })">Edit</button>
                        <button onclick="deleteAssignment(${
                          assignment.id
                        })">Delete</button>
                    </td>
                `;
      });
    });
}

// Function to add a new assignment
// Function to add a new assignment
function addAssignment() {
  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const dueDate = document.getElementById("due-date").value;
  const dueTime = document.getElementById("due-time").value;

  if (!dueDate || !dueTime) {
    alert("Please select both due date and due time.");
    return; // Don't submit if any required field is missing
  }

  const dueDateTime = `${dueDate} ${dueTime}`; // Combine date and time

  fetch("/assignments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, dueDateTime, status: false }),
  })
    .then((response) => response.json())
    .then(() => {
      loadAssignments(); // Reload assignments after adding
    })
    .catch((err) => {
      console.error("Error adding assignment: ", err);
    });
}

// Function to toggle the completion status of an assignment
// Toggle status function to change color
// Function to toggle the completion status of an assignment
// Function to toggle the completion status of an assignment
function toggleStatus(assignmentId) {
  const statusButton = document.getElementById("status-button-" + assignmentId);

  // Get current status from the button text or data attribute
  const isCompleted = statusButton.classList.contains("completed");

  // Toggle status (completed <-> unfinished)
  const newStatus = !isCompleted;

  // Update the button text and color based on the new status
  if (newStatus) {
    statusButton.innerText = "Completed"; // Update text to 'Completed'
    statusButton.classList.add("completed");
    statusButton.classList.remove("unfinished");
    statusButton.style.backgroundColor = "#4CAF50"; // Green for Completed
  } else {
    statusButton.innerText = "Unfinished"; // Update text to 'Unfinished'
    statusButton.classList.add("unfinished");
    statusButton.classList.remove("completed");
    statusButton.style.backgroundColor = "#FF0000"; // Red for Unfinished
  }

  // Optionally, update the status in the backend
  fetch(`/update-status/${assignmentId}?status=${newStatus}`)
    .then((response) => response.json())
    .then((data) => {
      console.log("Status updated:", data);
    })
    .catch((error) => {
      console.error("Error updating status:", error);
    });
}

// Function to edit an assignment
function editAssignment(id) {
  // Fetch the assignment details from the server
  fetch(`/assignments/${id}`)
    .then((response) => response.json())
    .then((assignment) => {
      // Fill the edit form with the current assignment data
      document.getElementById("edit-title").value = assignment.title;
      document.getElementById("edit-description").value =
        assignment.description;
      document.getElementById("edit-due-date").value = assignment.due_date;

      // Show the edit form and hide the add form
      document.getElementById("assignment-form").style.display = "none";
      document.getElementById("edit-form").style.display = "block";

      editingAssignmentId = id; // Set the assignment being edited
    });
}

// Function to update an assignment after editing
function updateAssignment() {
  const title = document.getElementById("edit-title").value;
  const description = document.getElementById("edit-description").value;
  const dueDate = document.getElementById("edit-due-date").value;
  const dueTime = document.getElementById("edit-due-time").value;
  const dueDateTime = `${dueDate} ${dueTime}`; // Combine date and time

  fetch(`/assignments/${editingAssignmentId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description, dueDateTime }),
  }).then(() => {
    loadAssignments(); // Reload assignments after updating
    cancelEdit(); // Hide the edit form
  });
}

// Function to cancel editing and return to the add form
function cancelEdit() {
  document.getElementById("assignment-form").style.display = "block";
  document.getElementById("edit-form").style.display = "none";
  editingAssignmentId = null; // Reset the editing state
}

// Load assignments on page load
document.addEventListener("DOMContentLoaded", loadAssignments);
