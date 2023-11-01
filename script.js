document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task");
    const addButton = document.getElementById("add-button");
    const taskList = document.getElementById("taskList");
    const completedList = document.getElementById("completedList");

    // Load tasks from localStorage on page load
    loadTasks(taskList, completedList);

    addButton.addEventListener("click", function () {
        addTask(taskInput, taskList, completedList);
    });

    taskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            addTask(taskInput, taskList, completedList);
        }
    });

    // Add event listener to a common parent element (taskList and completedList)
    const listsContainer = document.querySelector(".columns");
    listsContainer.addEventListener("click", function (e) {
        if (e.target.className === "remove-button") {
            removeTask(e.target, taskList, completedList);
        }
        if (e.target.type === "checkbox") {
            moveTask(e.target, taskList, completedList);
        }

        // Save tasks to localStorage when any action is performed
        saveTasks(taskList, completedList);
    });
});

function loadTasks(taskList, completedList) {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || { toDo: [], completed: [] };

    taskList.innerHTML = "";
    completedList.innerHTML = "";

    storedTasks.toDo.forEach((taskText) => {
        createTaskElement(taskList, taskText);
    });

    storedTasks.completed.forEach((taskText) => {
        createTaskElement(completedList, taskText, true);
    });
}

function saveTasks(taskList, completedList) {
    const toDoTasks = Array.from(taskList.querySelectorAll("li span")).map((span) => span.textContent);
    const completedTasks = Array.from(completedList.querySelectorAll("li span")).map((span) => span.textContent);
    const storedTasks = { toDo: toDoTasks, completed: completedTasks };
    localStorage.setItem("tasks", JSON.stringify(storedTasks));
}

function createTaskElement(list, taskText, checked = false) {
    const taskItem = document.createElement("li");
    taskItem.innerHTML = `
        <input type="checkbox" ${checked ? 'checked' : ''}>
        <span>${taskText}</span>
        <button class="remove-button">Remove</button>
    `;
    list.appendChild(taskItem);
}

function addTask(taskInput, taskList, completedList) {
    const taskText = taskInput.value;

    if (taskText) {
        createTaskElement(taskList, taskText);
        taskInput.value = "";
    }
}

function removeTask(button, taskList, completedList) {
    const taskItem = button.parentElement;
    if (taskList.contains(taskItem)) {
        taskList.removeChild(taskItem);
    } else if (completedList.contains(taskItem)) {
        completedList.removeChild(taskItem);
    }
}

function moveTask(checkbox, taskList, completedList) {
    const taskItem = checkbox.parentElement;
    if (checkbox.checked) {
        completedList.appendChild(taskItem);
    } else {
        taskList.appendChild(taskItem);
    }
}
