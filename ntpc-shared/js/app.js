let selectedYear = null;
let selectedMonth = null;
let selectedCategoryModern = '';

function getYearsModern() {
    const years = new Set();
    currentClippings.forEach(c => years.add(new Date(c.date).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
}

function getMonthsModern(year) {
    const months = new Set();
    currentClippings.forEach(c => {
        const d = new Date(c.date);
        if (d.getFullYear() === year) months.add(d.getMonth());
    });
    return Array.from(months).sort((a, b) => b - a);
}

function getMonthNameModern(idx) {
    return ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][idx];
}

function populateCategoryFilterModern() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    // Get unique categories
    const cats = Array.from(new Set(currentClippings.map(c => c.category))).sort();
    select.innerHTML = '<option value="">All Categories</option>' + cats.map(cat => `<option value="${cat}">${cat}</option>`).join('');
}

function setupCategoryFilterListenerModern() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;
    select.addEventListener('change', function() {
        selectedCategoryModern = this.value;
        renderModernClippings();
    });
}

function renderYearNav() {
    const years = getYearsModern();
    const yearNav = document.getElementById('yearNav');
    yearNav.innerHTML = '';
    years.forEach(y => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--primary btn--sm' + (selectedYear === y ? ' active' : '');
        btn.textContent = y + ' Clippings';
        btn.onclick = () => {
            selectedYear = y;
            selectedMonth = null;
            renderYearNav();
            renderMonthNav();
            renderModernClippings();
        };
        yearNav.appendChild(btn);
    });
    // Auto-select latest year on load
    if (!selectedYear && years.length) {
        selectedYear = years[0];
        renderYearNav();
        renderMonthNav();
        renderModernClippings();
    }
}

function renderMonthNav() {
    const monthNav = document.getElementById('monthNav');
    monthNav.innerHTML = '';
    if (!selectedYear) return;
    const months = getMonthsModern(selectedYear);
    months.forEach(m => {
        const btn = document.createElement('button');
        btn.className = 'btn btn--secondary btn--sm' + (selectedMonth === m ? ' active' : '');
        btn.textContent = getMonthNameModern(m);
        btn.onclick = () => {
            selectedMonth = m;
            renderMonthNav();
            renderModernClippings();
        };
        monthNav.appendChild(btn);
    });
    // Auto-select latest month on year select
    if (!selectedMonth && months.length) {
        selectedMonth = months[0];
        renderMonthNav();
        renderModernClippings();
    }
}

function renderModernClippings() {
    const grid = document.getElementById('modernClippingsGrid');
    if (!selectedYear || selectedMonth === null) {
        grid.innerHTML = '<p class="text-center">Select a year and month to view clippings.</p>';
        return;
    }
    
    // Get current search term from filters
    const searchTerm = currentFilters.search || document.getElementById('searchInput')?.value.toLowerCase() || '';
    
    let filtered = currentClippings.filter(c => {
        const d = new Date(c.date);
        // Filter by year and month
        if (d.getFullYear() !== selectedYear || d.getMonth() !== selectedMonth) {
            return false;
        }
        
        // Filter by search term if provided
        if (searchTerm && !c.title.toLowerCase().includes(searchTerm) && 
            !c.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        return true;
    });
    
    // Additional category filter
    if (selectedCategoryModern) {
        filtered = filtered.filter(c => c.category === selectedCategoryModern);
    }
    
    if (!filtered.length) {
        grid.innerHTML = '<p class="text-center">No clippings found matching your criteria.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(c => `
        <div class="clipping-card fade-in" data-category="${c.category}">
            <div class="clipping-header">
                <span class="clipping-category">${c.category}</span>
                <div class="clipping-title">${c.title}</div>
                <div class="clipping-date">${new Date(c.date).toLocaleDateString()}</div>
            </div>
            <div class="clipping-body">
                <div class="clipping-description">${c.description}</div>
                <div class="clipping-actions">
                    <a href="${c.url}" target="_blank" class="view-btn">View PDF <i class="fas fa-external-link-alt"></i></a>
                </div>
            </div>
        </div>
    `).join('');
}
// NTPC Press Clippings Portal - JavaScript

// Application State
let currentUser = null;
let currentPage = 'loginPage';
let currentClippings = [];
let filteredClippings = [];
let currentFilters = {
    search: '',
    category: '',
    dateFrom: '',
    dateTo: ''
};
let currentPageNumber = 1;
const itemsPerPage = 9;

// Application Data
const appData = {
    credentials: {
        username: "ntpc",
        password: "admin123"
    },
    categories: [
        "Financial",
        "Projects",
        "Safety",
        "Green Energy",
        "Environment",
        "HR",
        "Technology",
        "CSR",
        "Operations",
        "Research",
        "Corporate Governance",
        "Sustainability"
    ]
};

// Math Captcha
let captchaAnswer = 0;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Check for existing session
    const savedUser = localStorage.getItem('ntpc_user');
    
    // Initialize components
    setupEventListeners();
    // Restore password toggle and captcha event listeners
    const passwordToggleBtn = document.querySelector('.password-toggle');
    if (passwordToggleBtn) {
        passwordToggleBtn.addEventListener('click', togglePassword);
    }
    const captchaRefreshBtn = document.querySelector('.captcha-refresh');
    if (captchaRefreshBtn) {
        captchaRefreshBtn.addEventListener('click', generateCaptcha);
    }
    generateCaptcha();
    
    // Load clippings data first, then proceed
    loadClippings().then(() => {
        // Now show appropriate page based on login status
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showPage('dashboardPage');
        } else {
            showPage('loginPage');
        }
        // Always populate categories after page is shown and DOM is ready
        setTimeout(populateCategories, 100);
    }).catch(error => {
        console.error('Failed to load clippings:', error);
        showToast('Failed to load clippings data', 'error');
        showPage('loginPage');
        setTimeout(populateCategories, 100);
    });
}

function setupEventListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', handleUpload);
    }
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Filter functionality
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    const dateFromFilter = document.getElementById('dateFromFilter');
    if (dateFromFilter) {
        dateFromFilter.addEventListener('change', applyFilters);
    }
    
    const dateToFilter = document.getElementById('dateToFilter');
    if (dateToFilter) {
        dateToFilter.addEventListener('change', applyFilters);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    if (event.ctrlKey || event.metaKey) {
        switch(event.key) {
            case '/':
                event.preventDefault();
                if (currentPage === 'viewPage') {
                    document.getElementById('searchInput').focus();
                }
                break;
            case 'h':
                event.preventDefault();
                showPage('dashboardPage');
                break;
        }
    }
    
    if (event.key === 'Escape') {
        // Close any modals or return to dashboard
        showPage('dashboardPage');
    }
}

// Authentication Functions
function generateCaptcha() {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    captchaAnswer = num1 + num2;
    document.getElementById('captchaQuestion').textContent = `${num1} + ${num2} = ?`;
}

function togglePassword() {
    const passwordField = document.getElementById('password');
    const toggleButton = document.querySelector('.password-toggle i');
    
    if (!passwordField) {
        console.error('Password field not found');
        return;
    }
    
    if (!toggleButton) {
        console.error('Password toggle button not found');
        return;
    }
    
    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        toggleButton.className = 'fas fa-eye-slash';
        toggleButton.setAttribute('aria-label', 'Hide password');
    } else {
        passwordField.type = 'password';
        toggleButton.className = 'fas fa-eye';
        toggleButton.setAttribute('aria-label', 'Show password');
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const username = formData.get('username');
    const password = formData.get('password');
    const captchaValue = parseInt(formData.get('captcha'));
    
    const loginBtn = document.querySelector('.login-btn');
    const btnText = loginBtn.querySelector('.btn-text');
    const btnLoader = loginBtn.querySelector('.btn-loader');
    
    // Show loading state
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    loginBtn.disabled = true;
    
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Validate credentials
        if (username !== appData.credentials.username) {
            throw new Error('Invalid User ID');
        }
        
        if (password !== appData.credentials.password) {
            throw new Error('Invalid Password');
        }
        
        if (captchaValue !== captchaAnswer) {
            throw new Error('Incorrect security check. Please try again.');
        }
        
        // Successful login
        currentUser = {
            username: username,
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('ntpc_user', JSON.stringify(currentUser));
        showToast('Login successful! Welcome to NTPC Press Clippings Portal.', 'success');
        
        setTimeout(() => {
            showPage('dashboardPage');
        }, 1000);
        
    } catch (error) {
        showToast(error.message, 'error');
        generateCaptcha(); // Generate new captcha on error
        document.getElementById('captcha').value = '';
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        loginBtn.disabled = false;
    }
}

function logout() {
    localStorage.removeItem('ntpc_user');
    currentUser = null;
    showToast('Logged out successfully', 'success');
    showPage('loginPage');
}

// Page Navigation
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.classList.add('hidden');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    targetPage.classList.add('active');
    targetPage.classList.remove('hidden');
    
    currentPage = pageId;
    
    // Page-specific initialization
    switch(pageId) {
        case 'dashboardPage':
            initializeDashboard();
            break;
        case 'viewPage':
            initializeViewPage();
            break;
        case 'uploadPage':
            initializeUploadPage();
            break;
    }
    
    // Add fade-in animation
    targetPage.classList.add('fade-in');
    setTimeout(() => {
        targetPage.classList.remove('fade-in');
    }, 300);
}

// Dashboard Functions
function initializeDashboard() {
    updateDashboardStats();
}

function updateDashboardStats() {
    try {
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Update total clippings
        const totalClippingsElement = document.getElementById('totalClippings');
        if (totalClippingsElement) {
            totalClippingsElement.textContent = currentClippings.length;
        }
        
        // Use static categories from appData
        const totalCategoriesElement = document.getElementById('totalCategories');
        if (totalCategoriesElement) {
            totalCategoriesElement.textContent = appData.categories.length;
        }
        
        // Update "This Month" count
        const thisMonthElement = document.getElementById('thisMonth');
        if (thisMonthElement) {
            const thisMonthClippings = currentClippings.filter(clipping => {
                try {
                    const clippingDate = new Date(clipping.date);
                    return clippingDate.getMonth() === currentMonth && 
                           clippingDate.getFullYear() === currentYear;
                } catch (error) {
                    console.warn('Invalid date format in clipping:', clipping.date);
                    return false;
                }
            }).length;
            thisMonthElement.textContent = thisMonthClippings;
        }
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
    }
}


// View Page Functions
function initializeViewPage() {
    // Always refresh year/month/category navigation and listeners
    selectedYear = null;
    selectedMonth = null;
    selectedCategoryModern = '';
    renderYearNav();
    renderMonthNav();
    renderModernClippings();
    // Remove previous listeners to avoid duplicates
    const catSelect = document.getElementById('categoryFilter');
    if (catSelect) {
        const newCatSelect = catSelect.cloneNode(true);
        catSelect.parentNode.replaceChild(newCatSelect, catSelect);
        newCatSelect.addEventListener('change', function() {
            selectedCategoryModern = this.value;
            renderModernClippings();
        });
    }
    
    // Update search input to trigger renderModernClippings instead of applyFilters
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Remove existing listener
        searchInput.removeEventListener('input', handleSearch);
        // Add new listener that triggers renderModernClippings
        searchInput.addEventListener('input', debounce(function(event) {
            currentFilters.search = event.target.value.toLowerCase();
            renderModernClippings();
        }, 300));
        searchInput.value = currentFilters.search;
    }
}

function initializeUploadPage() {
    // Ensure categories are populated in the upload form
    populateCategories();
    
    // Set today's date as default for the date field
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('clippingDate');
    if (dateField && !dateField.value) {
        dateField.value = today;
    }
    
    // Setup file upload functionality
    setupFileUpload();
}

function setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.querySelector('.file-preview');
    const fileName = document.querySelector('.file-name');
    const fileSize = document.querySelector('.file-size');
    const fileRemove = document.querySelector('.file-remove');
    const dropBrowse = document.querySelector('.drop-browse');
    
    if (!dropZone || !fileInput) return;
    
    // Click to select file
    dropBrowse?.addEventListener('click', () => fileInput.click());
    dropZone?.addEventListener('click', (e) => {
        if (e.target === dropZone || e.target.classList.contains('drop-zone-content')) {
            fileInput.click();
        }
    });
    
    // File input change
    fileInput.addEventListener('change', handleFileSelect);
    
    // Drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });
    
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Remove file
    fileRemove?.addEventListener('click', resetFileInput);
}

function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        updateFilePreview(files[0]);
    }
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    if (files.length > 0) {
        updateFilePreview(files[0]);
    }
}

function updateFilePreview(file) {
    if (file.type !== 'application/pdf') {
        showToast('Please select a PDF file only', 'error');
        resetFileInput();
        return;
    }
    
    const fileName = document.querySelector('.file-name');
    const fileSize = document.querySelector('.file-size');
    const filePreview = document.querySelector('.file-preview');
    
    if (fileName && fileSize && filePreview) {
        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);
        filePreview.classList.remove('hidden');
    }
}

function resetFileInput() {
    const fileInput = document.getElementById('fileInput');
    const filePreview = document.querySelector('.file-preview');
    
    if (fileInput) fileInput.value = '';
    if (filePreview) filePreview.classList.add('hidden');
}

function resetUploadForm() {
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.reset();
    }
    resetFileInput();
    
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    const dateField = document.getElementById('clippingDate');
    if (dateField) {
        dateField.value = today;
    }
}

async function handleUpload(event) {
    event.preventDefault();
    
    const fileInput = document.getElementById('fileInput');
    
    if (!fileInput.files.length) {
        showToast('Please select a PDF file to upload', 'error');
        return;
    }
    
    const uploadBtn = document.querySelector('.upload-btn');
    const btnText = uploadBtn.querySelector('.btn-text');
    const btnLoader = uploadBtn.querySelector('.btn-loader');
    
    // Show loading state
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    uploadBtn.disabled = true;
    
    try {
        // Create FormData manually to ensure all fields are included
        const formData = new FormData();
        
        // Add form fields
        const title = document.getElementById('clippingTitle').value;
        const date = document.getElementById('clippingDate').value;
        const category = document.getElementById('clippingCategory').value;
        const description = document.getElementById('clippingDescription').value;
        
        formData.append('title', title);
        formData.append('date', date);
        formData.append('category', category);
        formData.append('description', description);
        
        // Add the file manually
        formData.append('file', fileInput.files[0]);
        
        const response = await fetch('http://localhost:3001/api/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
        
        const result = await response.json();
        
        if (result.success) {
            // Fetch current clippings
            const clippingsResponse = await fetch('http://localhost:3001/api/clippings');
            if (!clippingsResponse.ok) {
                throw new Error('Failed to fetch clippings');
            }
            const clippings = await clippingsResponse.json();
            
            // Create new clipping metadata
            const newClipping = {
                id: clippings.length ? Math.max(...clippings.map(c => c.id)) + 1 : 1,
                title: title,
                date: date,
                category: category,
                description: description,
                url: result.filePath
            };
            
            // Append new clipping
            clippings.push(newClipping);
            
            // Save updated clippings list
            const saveResponse = await fetch('http://localhost:3001/api/clippings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(clippings)
            });
            
            if (!saveResponse.ok) {
                throw new Error('Failed to save clipping metadata');
            }
            
            showToast('Clipping uploaded and saved successfully!', 'success');
            resetUploadForm();
            
            // Refresh clippings data
            await refreshClippingsFromServer();
        } else {
            throw new Error(result.message || 'Upload failed');
        }
        
    } catch (error) {
        showToast(error.message || 'Upload failed. Please try again.', 'error');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        uploadBtn.disabled = false;
    }
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight(e) {
    document.getElementById('dropZone').classList.add('highlight');
}

function unhighlight(e) {
    document.getElementById('dropZone').classList.remove('highlight');
}

function populateCategories() {
    try {
        const categorySelects = ['categoryFilter', 'clippingCategory'];

        categorySelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // For filter dropdown, keep the first option ("All Categories" or "Select Category")
                let firstOption = null;
                if (selectId === 'categoryFilter') {
                    firstOption = select.querySelector('option');
                } else if (selectId === 'clippingCategory') {
                    firstOption = select.querySelector('option');
                }
                select.innerHTML = '';
                if (firstOption) {
                    select.appendChild(firstOption);
                } else if (selectId === 'categoryFilter') {
                    // If not present, add default for filter
                    const allOpt = document.createElement('option');
                    allOpt.value = '';
                    allOpt.textContent = 'All Categories';
                    select.appendChild(allOpt);
                } else if (selectId === 'clippingCategory') {
                    // If not present, add default for upload form
                    const selectOpt = document.createElement('option');
                    selectOpt.value = '';
                    selectOpt.textContent = 'Select Category';
                    select.appendChild(selectOpt);
                }
                // Add all categories
                appData.categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
            } else {
                console.warn(`Category select element '${selectId}' not found`);
            }
        });
    } catch (error) {
        console.error('Error populating categories:', error);
    }
}

function handleSearch(event) {
    currentFilters.search = event.target.value.toLowerCase();
    applyFilters();
}

function applyFilters() {
    const searchTerm = currentFilters.search || document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const dateFromFilter = document.getElementById('dateFromFilter').value;
    const dateToFilter = document.getElementById('dateToFilter').value;
    
    currentFilters = {
        search: searchTerm,
        category: categoryFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter
    };
    
    filteredClippings = currentClippings.filter(clipping => {
        // Search filter
        if (searchTerm && !clipping.title.toLowerCase().includes(searchTerm) && 
            !clipping.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        // Category filter
        if (categoryFilter && clipping.category !== categoryFilter) {
            return false;
        }
        
        // Date filters
        const clippingDate = new Date(clipping.date);
        if (dateFromFilter && clippingDate < new Date(dateFromFilter)) {
            return false;
        }
        if (dateToFilter && clippingDate > new Date(dateToFilter)) {
            return false;
        }
        
        return true;
    });
    
    currentPageNumber = 1;
    displayClippings();
    updateResultsInfo();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('dateFromFilter').value = '';
    document.getElementById('dateToFilter').value = '';
    
    currentFilters = {
        search: '',
        category: '',
        dateFrom: '',
        dateTo: ''
    };
    
    filteredClippings = [...currentClippings];
    currentPageNumber = 1;
    displayClippings();
    updateResultsInfo();
}

function displayClippings() {
    const startIndex = (currentPageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const clippingsToShow = filteredClippings.slice(startIndex, endIndex);
    
    const grid = document.getElementById('clippingsGrid');
    grid.innerHTML = clippingsToShow.map(clipping => `
        <div class="clipping-card" data-category="${clipping.category}">
            <div class="clipping-header">
                <span class="clipping-category">${clipping.category}</span>
                <h4 class="clipping-title">${clipping.title}</h4>
                <p class="clipping-date">${formatDate(clipping.date)}</p>
            </div>
            <div class="clipping-body">
                <p class="clipping-description">${clipping.description}</p>
                <div class="clipping-actions">
                    <button class="view-btn" onclick="viewClipping(${clipping.id})">
                        <i class="fas fa-external-link-alt"></i> View PDF
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    displayPagination();
}

function updateResultsInfo() {
    const resultsInfo = document.getElementById('resultsCount');
    const total = filteredClippings.length;
    const showing = Math.min(itemsPerPage, total - (currentPageNumber - 1) * itemsPerPage);
    const start = total > 0 ? (currentPageNumber - 1) * itemsPerPage + 1 : 0;
    const end = start + showing - 1;
    
    if (total > 0) {
        resultsInfo.textContent = `Showing ${start}-${end} of ${total} clippings`;
    } else {
        resultsInfo.textContent = 'No clippings found matching your criteria';
    }
}

function displayPagination() {
    const totalPages = Math.ceil(filteredClippings.length / itemsPerPage);
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <button onclick="changePage(${currentPageNumber - 1})" 
                ${currentPageNumber === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPageNumber - 2 && i <= currentPageNumber + 2)) {
            paginationHTML += `
                <button onclick="changePage(${i})" 
                        ${i === currentPageNumber ? 'class="active"' : ''}>
                    ${i}
                </button>
            `;
        } else if (i === currentPageNumber - 3 || i === currentPageNumber + 3) {
            paginationHTML += '<span>...</span>';
        }
    }
    
    // Next button
    paginationHTML += `
        <button onclick="changePage(${currentPageNumber + 1})" 
                ${currentPageNumber === totalPages ? 'disabled' : ''}>
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    pagination.innerHTML = paginationHTML;
}

function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredClippings.length / itemsPerPage)) {
        return;
    }
    currentPageNumber = page;
    displayClippings();
    updateResultsInfo();
    
    // Scroll to top of results
    document.getElementById('clippingsGrid').scrollIntoView({ behavior: 'smooth' });
}

function viewClipping(clippingId) {
    const clipping = currentClippings.find(c => c.id === clippingId);
    if (clipping) {
        window.open(clipping.url, '_blank');
        showToast('Opening press clipping...', 'success');
    }
}


// Utility Functions

// Function to refresh clippings from server
async function refreshClippingsFromServer() {
    try {
        showLoading();
        console.log('🔄 Refreshing clippings from server...');
        
        const response = await fetch('http://localhost:3001/api/refresh');
        if (!response.ok) {
            throw new Error('Failed to refresh clippings');
        }
        
        const result = await response.json();
        if (result.success) {
            const previousCount = currentClippings.length;
            currentClippings = result.clippings;
            filteredClippings = [...result.clippings];
            
            // Update dashboard stats
            updateDashboardStats();
            populateCategories();
            
            // Show success message with details
            if (result.stats && result.stats.newFilesAdded > 0) {
                showToast(`✅ Refresh completed! ${result.stats.newFilesAdded} new PDFs detected and added.`, 'success');
                console.log(`🆕 New PDFs detected: ${result.stats.newFilesAdded}`);
                console.log(`📊 Total PDFs: ${result.stats.totalFiles}`);
                console.log(`📋 Total clippings: ${result.stats.totalClippings}`);
            } else {
                showToast('✅ Refresh completed! No new PDFs found.', 'success');
                console.log('📋 No new PDFs detected during refresh');
            }
            
            // Update view if currently on view-clipping page
            if (currentPage === 'viewPage' && selectedYear && selectedMonth !== null) {
                renderYearNav();
                renderMonthNav();
                renderModernClippings();
            }
            
            // Update category filter if on view page
            if (currentPage === 'viewPage') {
                populateCategoryFilterModern();
                setupCategoryFilterListenerModern();
            }
            
            return result.clippings;
        } else {
            throw new Error(result.message || 'Refresh failed');
        }
    } catch (error) {
        console.error('Error refreshing clippings:', error);
        showToast(`❌ Refresh failed: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

// Function to manually scan data folder for new PDFs
async function manualScanDataFolder() {
    try {
        showLoading();
        console.log('🔍 Manual scan of data folder initiated...');
        
        const response = await fetch('http://localhost:3001/api/scan', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to scan data folder');
        }
        
        const result = await response.json();
        if (result.success) {
            // Update local data
            currentClippings = result.clippings;
            filteredClippings = [...result.clippings];
            
            // Update dashboard stats
            updateDashboardStats();
            populateCategories();
            
            // Show success message with details
            if (result.stats && result.stats.newFilesAdded > 0) {
                showToast(`🔍 Manual scan completed! ${result.stats.newFilesAdded} new PDFs detected and added.`, 'success');
                console.log(`🆕 New PDFs detected during manual scan: ${result.stats.newFilesAdded}`);
                console.log(`📊 Total PDFs: ${result.stats.totalFiles}`);
                console.log(`📋 Total clippings: ${result.stats.totalClippings}`);
            } else {
                showToast('🔍 Manual scan completed! No new PDFs found.', 'success');
                console.log('📋 No new PDFs detected during manual scan');
            }
            
            // Update view if currently on view-clipping page
            if (currentPage === 'viewPage' && selectedYear && selectedMonth !== null) {
                renderYearNav();
                renderMonthNav();
                renderModernClippings();
            }
            
            // Update category filter if on view page
            if (currentPage === 'viewPage') {
                populateCategoryFilterModern();
                setupCategoryFilterListenerModern();
            }
            
            return result.clippings;
        } else {
            throw new Error(result.message || 'Manual scan failed');
        }
    } catch (error) {
        console.error('Error during manual scan:', error);
        showToast(`❌ Manual scan failed: ${error.message}`, 'error');
        return [];
    } finally {
        hideLoading();
    }
}

// Function to list uploaded files
async function listUploadedFiles() {
    try {
        const response = await fetch('http://localhost:3001/api/files');
        if (!response.ok) {
            throw new Error('Failed to fetch files');
        }
        const files = await response.json();
        console.log('Uploaded files:', files);
        return files;
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.querySelector('.toast-message');
    const toastIcon = document.querySelector('.toast-icon');
    
    // Set message and type
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    
    // Set icon based on type
    switch(type) {
        case 'success':
            toastIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            toastIcon.innerHTML = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            toastIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            toastIcon.innerHTML = '<i class="fas fa-info-circle"></i>';
    }
    
    // Show toast
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Hide toast after 4 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}

function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Loading States
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

async function loadClippings() {
    try {
        const response = await fetch('http://localhost:3001/api/clippings');
        if (!response.ok) {
            throw new Error('Failed to fetch clippings');
        }
        const data = await response.json();
        currentClippings = data;
        filteredClippings = [...currentClippings];
        return data; // Return the data for promise chaining
    } catch (error) {
        console.error('Error loading clippings:', error);
        showToast('Failed to load clippings data', 'error');
        throw error; // Re-throw the error for proper error handling
    }
}
// Call this in initializeApp instead of hardcoding sampleClippings
