// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card with color coding based on the deadline
function createTaskCard(task) {
  const currentDate = dayjs();
  const deadlineDate = dayjs(task.deadline);
  let cardColorClass = "";

  // Apply color coding based on the deadline
  if (deadlineDate.isBefore(currentDate, 'day')) {
    cardColorClass = "bg-danger text-white"; // Overdue
  } else if (deadlineDate.diff(currentDate, 'day') <= 3) {
    cardColorClass = "bg-warning"; // Nearing deadline
  }

  return `
    <div class="card mb-3 ${cardColorClass}" id="task-${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text"><small class="text-muted">Due: ${task.deadline}</small></p>
        <button class="btn btn-danger btn-sm" onclick="handleDeleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  // Clear the current task lanes
  $('#todo-cards').empty();
  $('#in-progress-cards').empty();
  $('#done-cards').empty();

  // Render tasks in the appropriate lane
  taskList.forEach(task => {
    const taskCard = createTaskCard(task);
    if (task.category === 'to-do') {
      $('#todo-cards').append(taskCard);
    } else if (task.category === 'in-progress') {
      $('#in-progress-cards').append(taskCard);
    } else if (task.category === 'done') {
      $('#done-cards').append(taskCard);
    }
  });

  // Make cards draggable
  $(".card").draggable({
    revert: "invalid",  // Revert to the original position if not dropped in a valid lane
    helper: "clone",    // Clone the element while dragging
    cursor: "move",     // Change the cursor to indicate dragging
    opacity: 0.7,       // Make the dragged element slightly transparent
  });

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".card",  // Only accept elements with the class "card"
    hoverClass: "bg-light",  // Highlight the lane when a draggable is hovered over it
    drop: handleDrop,  // Handle the drop event
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  // Get task details from the form
  const title = $('#taskTitle').val();
  const description = $('#taskDescription').val();
  const deadline = $('#taskDeadline').val();
  const category = "to-do"; // New tasks start in the "To Do" category

  // Generate a unique ID for the task
  const id = generateTaskId();

  // Create a new task object
  const newTask = {
    id,
    title,
    description,
    deadline,
    category,
  };

  // Add the task to the taskList
  taskList.push(newTask);

  // Save the updated task list and nextId to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));

  // Render the updated task list
  renderTaskList();

  // Reset the form and close the modal
  $('#taskForm')[0].reset();
  $('#formModal').modal('hide');
}

// Function to handle deleting a task
function handleDeleteTask(taskId) {
  // Filter out the task with the specified ID
  taskList = taskList.filter(task => task.id !== taskId);

  // Save the updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render the updated task list
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = parseInt(ui.helper.attr("id").replace("task-", ""));
  const newCategory = $(this).attr("id").replace('-cards', '');

  // Update the task's category
  taskList = taskList.map(task => {
    if (task.id === taskId) {
      task.category = newCategory;
    }
    return task;
  });

  // Save the updated task list to localStorage
  localStorage.setItem("tasks", JSON.stringify(taskList));

  // Render the updated task list
  renderTaskList();
}

// When the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  // Render the task list
  renderTaskList();

  // Add event listener for adding tasks
  $('#taskForm').on('submit', handleAddTask);

  // Initialize date picker for due date field
  $('#taskDeadline').datepicker({
    dateFormat: 'yy-mm-dd'
  });
});
