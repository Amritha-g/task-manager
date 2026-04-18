const API_URL = window.location.origin;

// State
let token = localStorage.getItem('token') || null;
let isLoginMode = true;
let currentPage = 1;
const limit = 10;

// DOM Elements
const authView = document.getElementById('auth-view');
const dashboardView = document.getElementById('dashboard-view');
const authTitle = document.getElementById('auth-title');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const authSwitchText = document.getElementById('auth-switch-text');
const authSwitchBtn = document.getElementById('auth-switch-btn');
const authSubmitBtn = document.getElementById('auth-submit-btn');

const createTaskForm = document.getElementById('create-task-form');
const tasksContainer = document.getElementById('tasks-container');
const logoutBtn = document.getElementById('logout-btn');
const toast = document.getElementById('toast');

const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Init
function init() {
    if (token) {
        showDashboard();
    } else {
        showAuth();
    }
}

// UI Toggles
function showAuth() {
    authView.classList.remove('hidden');
    dashboardView.classList.add('hidden');
}

function showDashboard() {
    authView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    
    // Decode token to get email (simple base64 decode for demo purposes)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        document.getElementById('user-email-display').textContent = payload.sub;
    } catch(e) {}

    fetchTasks();
}

function showToast(message, isError = false) {
    toast.textContent = message;
    toast.style.color = isError ? "var(--error)" : "var(--success)";
    toast.style.borderColor = isError ? "var(--error)" : "var(--success)";
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}

// Auth Handlers
authSwitchBtn.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    authTitle.textContent = isLoginMode ? 'Log IN' : 'Sign UP';
    authSubmitBtn.textContent = isLoginMode ? 'Sign in' : 'Create account';
    authSwitchText.textContent = isLoginMode ? "Don't have an account?" : 'Already have an account?';
    authSwitchBtn.textContent = isLoginMode ? 'Sign up' : 'Log in';
    authError.classList.add('hidden');
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    authError.classList.add('hidden');
    authSubmitBtn.disabled = true;

    try {
        if (isLoginMode) {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Login failed');
            
            token = data.access_token;
            localStorage.setItem('token', token);
            showDashboard();
            showToast("Successfully logged in");
        } else {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || 'Registration failed');
            
            showToast("Account created! Please log in.");
            authSwitchBtn.click(); // Switch to login
        }
    } catch (err) {
        authError.textContent = err.message;
        authError.classList.remove('hidden');
    } finally {
        authSubmitBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', () => {
    token = null;
    localStorage.removeItem('token');
    showAuth();
});

// Tasks Actions
async function apiCall(endpoint, options = {}) {
    if (!token) return logoutBtn.click();
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    
    if (res.status === 401) {
        logoutBtn.click();
        throw new Error('Session expired');
    }
    
    if (res.status === 204) return null; // No content
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || 'API Error');
    return data;
}

// Fetch Tasks
async function fetchTasks() {
    try {
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: limit
        });

        const statusFilter = filterStatus.value;
        if (statusFilter === 'completed') queryParams.append('completed', true);
        if (statusFilter === 'pending') queryParams.append('completed', false);

        const priorityFilter = filterPriority.value;
        if (priorityFilter !== 'all') queryParams.append('priority', priorityFilter);

        const data = await apiCall(`/tasks/?${queryParams.toString()}`);
        renderTasks(data);
    } catch (err) {
        showToast(err.message, true);
    }
}

// Render Tasks
function renderTasks(data) {
    tasksContainer.innerHTML = '';
    
    if (data.tasks.length === 0) {
        tasksContainer.innerHTML = '<p style="color: var(--text-secondary); padding: 1rem 0;">No tasks found. Try adjusting filters or creating one above!</p>';
    }

    data.tasks.forEach(task => {
        const div = document.createElement('div');
        div.className = `task-item ${task.completed ? 'completed' : ''}`;
        
        let priorityClass = task.priority === 'high' ? 'priority-high' : 
                            task.priority === 'medium' ? 'priority-medium' : 'priority-low';
        
        const overdueBadge = task.is_overdue ? `<span class="badge overdue">Overdue!</span>` : '';
        const dueDateStr = task.due_date ? new Date(task.due_date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'No due date';

        div.innerHTML = `
            <div class="task-content">
                <div class="task-title">
                    <input type="checkbox" ${task.completed ? 'checked' : ''} onchange="toggleComplete(${task.id}, ${!task.completed})">
                    ${escapeHTML(task.title)}
                </div>
                ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="badge ${priorityClass}">${escapeHTML(task.priority)}</span>
                    <span style="color: var(--text-secondary); display: flex; align-items: center; gap: 4px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        ${dueDateStr}
                    </span>
                    ${overdueBadge}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon delete-btn" onclick="deleteTask(${task.id})" title="Delete Task">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        tasksContainer.appendChild(div);
    });

    // Pagination controls
    pageInfo.textContent = `Page ${data.page}`;
    prevPageBtn.disabled = data.page <= 1;
    // Calculate if we have more pages (total items > current page * limit)
    nextPageBtn.disabled = data.total <= (data.page * limit);
}

// Create Task
createTaskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = createTaskForm.querySelector('button');
    submitBtn.disabled = true;

    const payload = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-desc').value,
        priority: document.getElementById('task-priority').value,
    };
    
    let due = document.getElementById('task-due').value;
    if (due) {
        payload.due_date = new Date(due).toISOString();
    }

    try {
        await apiCall('/tasks/', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        createTaskForm.reset();
        document.getElementById('task-priority').value = 'medium'; // reset correctly
        fetchTasks();
        showToast("Task created!");
    } catch (err) {
        showToast(err.message, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// Update Task Completeness
window.toggleComplete = async function(id, completedObj) {
    try {
        await apiCall(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ completed: completedObj })
        });
        fetchTasks();
    } catch (err) {
        showToast(err.message, true);
    }
}

// Delete Task
window.deleteTask = async function(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        await apiCall(`/tasks/${id}`, { method: 'DELETE' });
        fetchTasks();
        showToast("Task deleted!");
    } catch (err) {
        showToast(err.message, true);
    }
}

// Filter listeners
filterStatus.addEventListener('change', () => { currentPage = 1; fetchTasks(); });
filterPriority.addEventListener('change', () => { currentPage = 1; fetchTasks(); });

// Pagination
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        fetchTasks();
    }
});

nextPageBtn.addEventListener('click', () => {
    currentPage++;
    fetchTasks();
});

// Helper
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.innerText = str;
    return div.innerHTML;
}

// Boot
init();
