document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task");
    const addButton = document.getElementById("add-button");
    const taskList = document.getElementById("taskList");
    const completedList = document.getElementById("completedList");
    const syncButton = document.getElementById("sync-button");

    // Load tasks from localStorage on page load
    loadTasks(taskList, completedList);

    addButton.addEventListener("click", function () {
        addTask(taskInput, taskList, completedList);
        syncTasksToGitHub();
    });

    taskInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            addTask(taskInput, taskList, completedList);
            syncTasksToGitHub();
        }
    });

    syncButton.addEventListener("click", function () {
        syncTasksFromGitHub(taskList, completedList);
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

        // Save tasks to localStorage when adding a task
        saveTasks(taskList, completedList);
    }
}

function removeTask(button, taskList, completedList) {
    const taskItem = button.parentElement;
    if (taskList.contains(taskItem)) {
        taskList.removeChild(taskItem);
    } else if (completedList.contains(taskItem)) {
        completedList.removeChild(taskItem);
    }

    // Save tasks to localStorage after removing a task
    saveTasks(taskList, completedList);
}

function moveTask(checkbox, taskList, completedList) {
    const taskItem = checkbox.parentElement;
    if (checkbox.checked) {
        completedList.appendChild(taskItem);
    } else {
        taskList.appendChild(taskItem);
    }

    // Save tasks to localStorage after moving a task
    saveTasks(taskList, completedList);
}

function syncTasksToGitHub() {
    const toDoTasks = Array.from(taskList.querySelectorAll("li span")).map((span) => span.textContent);
    const completedTasks = Array.from(completedList.querySelectorAll("li span")).map((span) => span.textContent);
    const storedTasks = { toDo: toDoTasks, completed: completedTasks };

    const token = "YOUR_GITHUB_TOKEN"; // Replace with your GitHub personal access token
    const username = "YOUR_GITHUB_USERNAME"; // Replace with your GitHub username
    const repoName = "YOUR_REPO_NAME"; // Replace with your GitHub repository name
    const filePath = "tasks.json"; // Replace with the path to your tasks file in the repository

    const content = JSON.stringify(storedTasks);

    fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const sha = data.sha;

            fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
                method: "PUT",
                headers: {
                    Authorization: `token ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "Update tasks",
                    sha: sha,
                    content: btoa(content),
                }),
            })
                .then((response) => response.json())
                .then((data) => console.log("Tasks synchronized with GitHub"))
                .catch((error) => console.error("Error synchronizing with GitHub: " + error));
        })
        .catch((error) => console.error("Error accessing GitHub: " + error));
}

function syncTasksFromGitHub(taskList, completedList) {
    const token = "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"; // Replace with your GitHub personal access token
    const username = "Arrieeee"; // Replace with your GitHub username
    const repoName = "arrieee.github.io"; // Replace with your GitHub repository name
    const filePath = "tasks.json"; // Replace with the path to your tasks file in the repository

    fetch(`https://api.github.com/repos/${username}/${repoName}/contents/${filePath}`, {
        method: "GET",
        headers: {
            Authorization: `token ${token}`,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const content = JSON.parse(atob(data.content));

            loadTasks(taskList, completedList);
            console.log("Tasks synchronized from GitHub");
        })
        .catch((error) => console.error("Error accessing GitHub: " + error));
}
