// 상태 관리
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";
function isValidTask(text) {
  // Returns true if text is not empty after trimming whitespace
  return typeof text === "string" && text.trim().length > 0;
}
// DOM 요소
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const filterButtons = document.querySelectorAll(".btn-filter");
const clearCompletedBtn = document.getElementById("clear-completed");
const totalCountSpan = document.getElementById("total-count");
const completedCountSpan = document.getElementById("completed-count");

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  renderTasks();
  updateTasksCount();
});

// 테마 관리
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";

  html.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
  const themeToggle = document.querySelector(".theme-toggle");
  const icon = themeToggle.querySelector(".material-icons");
  const text = themeToggle.querySelector("span:not(.material-icons)");

  if (theme === "dark") {
    icon.textContent = "light_mode";
    text.textContent = "라이트 모드";
  } else {
    icon.textContent = "dark_mode";
    text.textContent = "다크 모드";
  }
}

// 작업 관리
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  if (!taskText) return;

  addTask(taskText);
  taskInput.value = "";
  taskInput.focus();
});

function addTask(text) {
  const task = {
    id: Date.now().toString(),
    text: text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();
}

function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasks();
  renderTasks();
}

// 필터링
filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    renderTasks();
  });
});

// 렌더링
function renderTasks() {
  const filteredTasks = filterTasks();
  taskList.innerHTML = filteredTasks
    .map((task) => createTaskElement(task))
    .join("");
  updateTasksCount();
  updateClearCompletedButton();
}

function filterTasks() {
  switch (currentFilter) {
    case "active":
      return tasks.filter((task) => !task.completed);
    case "completed":
      return tasks.filter((task) => task.completed);
    default:
      return tasks;
  }
}

function createTaskElement(task) {
  return `
        <li class="task-item ${task.completed ? "completed" : ""}" data-id="${
    task.id
  }">
      <input type="checkbox"
           class="task-checkbox"
           ${task.completed ? "checked" : ""}
           aria-label="작업 완료 표시">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <button class="btn-delete" data-id="${task.id}"
          aria-label="작업 삭제">
        <span class="material-icons">delete</span>
      </button>
        </li>
    `;
}

// 유틸리티 함수
function updateTasksCount() {
  const completedCount = tasks.filter((task) => task.completed).length;
  totalCountSpan.textContent = tasks.length;
  completedCountSpan.textContent = completedCount;
}

function updateClearCompletedButton() {
  const hasCompleted = tasks.some((task) => task.completed);
  clearCompletedBtn.disabled = !hasCompleted;
}

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// 이벤트 리스너
clearCompletedBtn.addEventListener("click", clearCompletedTasks);

// 이벤트 위임: 동적으로 생성되는 작업 아이템의 이벤트를 중앙에서 처리
taskList.addEventListener("click", (e) => {
  const del = e.target.closest(".btn-delete");
  if (del) {
    const li = del.closest(".task-item");
    if (li && li.dataset.id) deleteTask(li.dataset.id);
  }
});

taskList.addEventListener("change", (e) => {
  if (e.target.classList && e.target.classList.contains("task-checkbox")) {
    const li = e.target.closest(".task-item");
    if (li && li.dataset.id) toggleTask(li.dataset.id);
  }
});
