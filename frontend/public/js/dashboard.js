document.addEventListener('DOMContentLoaded', async () => {
  // Get the actual port from the server
  let dynamicPort = 3002; // Default fallback port
  try {
    const portResponse = await fetch('/api/port');
    if (portResponse.ok) {
      const portData = await portResponse.json();
      dynamicPort = portData.port;
      console.log('Using dynamic port:', dynamicPort);
    }
  } catch (err) {
    console.warn('Could not fetch port information, using default port:', dynamicPort);
  }

  // API base URL - always connect to port 5000 for backend
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api'
    : 'https://expense-tracker-tdxm.onrender.com/api';
  
  console.log('Using API URL:', API_URL);
  
  // Show connection status indicator
  const connectionStatus = document.createElement('div');
  connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 z-50';
  connectionStatus.innerHTML = 'Connecting to server...';
  document.body.appendChild(connectionStatus);
  
  // Get DOM elements
  const addExpenseBtn = document.getElementById('add-expense-btn');
  const expenseModal = document.getElementById('expense-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');
  const expenseForm = document.getElementById('expense-form');
  const modalTitle = document.getElementById('modal-title');
  const expenseTableBody = document.getElementById('expense-table-body');
  const noExpensesMessage = document.getElementById('no-expenses-message');
  const deleteModal = document.getElementById('delete-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const totalAmountEl = document.getElementById('total-amount');
  const monthAmountEl = document.getElementById('month-amount');
  const todayAmountEl = document.getElementById('today-amount');
  const currentMonthNameEl = document.getElementById('current-month-name');
  const currentDateEl = document.getElementById('current-date');
  const categoryFilter = document.getElementById('category-filter');
  const dateFilter = document.getElementById('date-filter');
  
  // Set current month name and date
  const now = new Date();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
  if (currentMonthNameEl) {
    currentMonthNameEl.textContent = monthNames[now.getMonth()] + ' ' + now.getFullYear();
  }
  if (currentDateEl) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    currentDateEl.textContent = now.toLocaleDateString('en-US', options);
  }
  
  // Get user token from localStorage
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No authentication token found');
    window.location.href = '../views/login.html';
    return;
  }
  
  let currentExpenseId = null;
  let expenses = [];
  let isConnectedToServer = false;
  
  // Test API connection first
  const testConnection = async () => {
    try {
      connectionStatus.innerHTML = 'Connecting to server...';
      connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500 text-white z-50';
      
      // Simple request to check if server is running
      const response = await fetch(`${API_URL.replace('/api', '')}/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('Successfully connected to server');
        connectionStatus.innerHTML = 'Connected to server';
        connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-green-500 text-white z-50';
        isConnectedToServer = true;
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
          connectionStatus.style.display = 'none';
        }, 3000);
        
        // If connected, fetch expenses
        await fetchExpenses();
      } else {
        throw new Error('Server is running but returned an error');
      }
    } catch (error) {
      console.error('Failed to connect to server:', error);
      connectionStatus.innerHTML = 'Server connection failed';
      connectionStatus.className = 'fixed bottom-4 right-4 px-3 py-1 rounded-full text-xs font-medium bg-red-500 text-white z-50';
      
      // Show detailed connection error message
      showNotification(`Cannot connect to the server. Make sure the backend is running on port 5000. Error: ${error.message}`, true);
    }
  };
  
  // Initialize date input with current date
  document.getElementById('date').valueAsDate = new Date();
  
  // Helper function to show error notifications
  const showNotification = (message, isError = false) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-md shadow-md ${
      isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    } z-50 transform notification-animate`;
    notification.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">${isError ? '<i class="fas fa-exclamation-circle"></i>' : '<i class="fas fa-check-circle"></i>'}</span>
        <span>${message}</span>
      </div>
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('notification-animate-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };
  
  // Fetch all expenses
  const fetchExpenses = async () => {
    try {
      if (!isConnectedToServer) {
        console.warn('Not connected to server. Skipping fetchExpenses.');
        return;
      }
      
      const response = await fetch(`${API_URL}/expenses`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch expenses');
      }
      
      const data = await response.json();
      expenses = data.data;
      
      renderExpenses();
      updateExpenseSummary();
    } catch (error) {
      console.error('Error fetching expenses:', error);
      showNotification(`Error: ${error.message}`, true);
      
      // Check if unauthorized (likely expired token)
      if (error.message.includes('Not authorized') || error.message.includes('Invalid token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../views/login.html';
      }
    }
  };
  
  // Render expenses to the table
  const renderExpenses = () => {
    // Clear both table and card container with null checks
    if (expenseTableBody) {
      expenseTableBody.innerHTML = '';
    }
    const expenseCardContainer = document.getElementById('expense-card-container');
    if (expenseCardContainer) {
      expenseCardContainer.innerHTML = '';
    }
    
    // Filter expenses
    let filteredExpenses = [...expenses];
    
    if (categoryFilter && categoryFilter.value) {
      filteredExpenses = filteredExpenses.filter(exp => exp.category === categoryFilter.value);
    }
    
    if (dateFilter && dateFilter.value) {
      const filterDate = new Date(dateFilter.value).toISOString().split('T')[0];
      filteredExpenses = filteredExpenses.filter(exp => {
        const expDate = new Date(exp.date).toISOString().split('T')[0];
        return expDate === filterDate;
      });
    }
    
    // Check if there are expenses to display
    if (filteredExpenses.length === 0) {
      if (expenseTableBody) expenseTableBody.innerHTML = '';
      if (expenseCardContainer) expenseCardContainer.innerHTML = '';
      if (noExpensesMessage) noExpensesMessage.classList.remove('hidden');
      return;
    }
    
    // Hide the no expenses message
    if (noExpensesMessage) noExpensesMessage.classList.add('hidden');
    
    // Render expenses for both views
    filteredExpenses.forEach(expense => {
      // Format date
      const date = new Date(expense.date);
      const formattedDate = date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      // Format amount with ₹ symbol
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(expense.amount);
      
      // Get category icon
      const categoryIcon = getCategoryIcon(expense.category);
      
      // TABLE VIEW (Desktop)
      const row = document.createElement('tr');
      row.className = 'table-row-animate hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors';
      
      row.innerHTML = `
        <td class="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-700 dark:text-gray-300">${formattedDate}</td>
        <td class="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap">
          <div class="flex items-center">
            <span class="text-base sm:text-lg mr-2 category-icon">${categoryIcon}</span>
            <span class="text-xs sm:text-sm text-gray-700 dark:text-gray-300">${expense.category}</span>
          </div>
        </td>
        <td class="px-4 lg:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 max-w-[150px] truncate">${expense.description || '-'}</td>
        <td class="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">${formattedAmount}</td>
        <td class="px-4 lg:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
          <button class="edit-btn text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-2 sm:mr-3 p-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-all" data-id="${expense._id}" title="Edit">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-all" data-id="${expense._id}" title="Delete">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      
      if (expenseTableBody) {
        expenseTableBody.appendChild(row);
      }
      
      // CARD VIEW (Mobile)
      if (expenseCardContainer) {
        const card = document.createElement('div');
        card.className = 'expense-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all';
        
        card.innerHTML = `
          <div class="flex justify-between items-start mb-3">
            <div class="flex items-center">
              <span class="text-2xl mr-3 category-icon">${categoryIcon}</span>
              <div>
                <p class="text-sm font-semibold text-gray-900 dark:text-white">${expense.category}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}</p>
              </div>
            </div>
            <p class="text-lg font-bold text-gray-900 dark:text-white">${formattedAmount}</p>
          </div>
          
          <div class="mb-3 ${expense.description ? '' : 'hidden'}">
            <p class="text-sm text-gray-600 dark:text-gray-400">${expense.description || ''}</p>
          </div>
          
          <div class="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button class="edit-btn flex items-center justify-center text-indigo-600 hover:text-white dark:text-indigo-400 hover:bg-indigo-600 dark:hover:bg-indigo-500 px-4 py-2 rounded-lg transition-all font-medium text-sm min-h-[40px]" data-id="${expense._id}">
              <i class="fas fa-edit mr-1.5"></i> Edit
            </button>
            <button class="delete-btn flex items-center justify-center text-red-600 hover:text-white dark:text-red-400 hover:bg-red-600 dark:hover:bg-red-500 px-4 py-2 rounded-lg transition-all font-medium text-sm min-h-[40px]" data-id="${expense._id}">
              <i class="fas fa-trash-alt mr-1.5"></i> Delete
            </button>
          </div>
        `;
        
        expenseCardContainer.appendChild(card);
      }
    });
    
    // Add event listeners to edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDeleteModal(id);
      });
    });
  };
  
  // Function to get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Food':
        return '<i class="fas fa-utensils"></i>';
      case 'Transportation':
        return '<i class="fas fa-car"></i>';
      case 'Shopping':
        return '<i class="fas fa-shopping-bag"></i>';
      case 'Entertainment':
        return '<i class="fas fa-film"></i>';
      case 'Bills':
        return '<i class="fas fa-file-invoice-dollar"></i>';
      case 'Health':
        return '<i class="fas fa-heartbeat"></i>';
      case 'Other':
        return '<i class="fas fa-box"></i>';
      default:
        return '<i class="fas fa-tag"></i>';
    }
  };
  
  // Update expense summary
  const updateExpenseSummary = () => {
    // Calculate total amount
    const totalAmount = expenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate this month's expenses
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === thisMonth && expenseDate.getFullYear() === thisYear;
    });
    
    const monthAmount = monthlyExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Calculate today's expenses
    const today = new Date().toISOString().split('T')[0];
    
    const todayExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date).toISOString().split('T')[0];
      return expenseDate === today;
    });
    
    const todayAmount = todayExpenses.reduce((total, expense) => total + expense.amount, 0);
    
    // Format and update UI with null checks
    if (totalAmountEl) {
      totalAmountEl.textContent = new Intl.NumberFormat('en-IN').format(totalAmount);
    }
    if (monthAmountEl) {
      monthAmountEl.textContent = new Intl.NumberFormat('en-IN').format(monthAmount);
    }
    if (todayAmountEl) {
      todayAmountEl.textContent = new Intl.NumberFormat('en-IN').format(todayAmount);
    }
  };
  
  // Open modal for adding expense
  const openAddModal = () => {
    if (modalTitle) modalTitle.textContent = 'Add Expense';
    const expenseIdEl = document.getElementById('expense-id');
    const amountEl = document.getElementById('amount');
    const categoryEl = document.getElementById('category');
    const descriptionEl = document.getElementById('description');
    const dateEl = document.getElementById('date');
    
    if (expenseIdEl) expenseIdEl.value = '';
    if (amountEl) amountEl.value = '';
    if (categoryEl) categoryEl.value = '';
    if (descriptionEl) descriptionEl.value = '';
    if (dateEl) dateEl.valueAsDate = new Date();
    
    if (expenseModal) expenseModal.classList.remove('hidden');
  };
  
  // Open modal for editing expense
  const openEditModal = (id) => {
    const expense = expenses.find(exp => exp._id === id);
    if (!expense) return;
    
    modalTitle.textContent = 'Edit Expense';
    document.getElementById('expense-id').value = expense._id;
    document.getElementById('amount').value = expense.amount;
    document.getElementById('category').value = expense.category;
    document.getElementById('description').value = expense.description || '';
    document.getElementById('date').value = new Date(expense.date).toISOString().split('T')[0];
    
    expenseModal.classList.remove('hidden');
  };
  
  // Open delete confirmation modal
  const openDeleteModal = (id) => {
    currentExpenseId = id;
    deleteModal.classList.remove('hidden');
  };
  
  // Close modals
  const closeModal = () => {
    expenseModal.classList.add('hidden');
  };
  
  const closeDeleteModal = () => {
    deleteModal.classList.add('hidden');
    currentExpenseId = null;
  };
  
  // Create a new expense - with additional connection check
  let isSubmitting = false; // Prevent double submission
  
  const createExpense = async (expenseData) => {
    if (isSubmitting) {
      console.log('Already submitting, preventing duplicate');
      return;
    }
    
    try {
      isSubmitting = true;
      
      if (!isConnectedToServer) {
        showNotification('Cannot add expenses: Not connected to server', true);
        isSubmitting = false;
        return;
      }
      
      const response = await fetch(`${API_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create expense');
      }
      
      await fetchExpenses();
      closeModal();
      showNotification('Expense added successfully');
    } catch (error) {
      console.error('Error creating expense:', error);
      showNotification(`Error: ${error.message}`, true);
    } finally {
      isSubmitting = false;
    }
  };
  
  // Update an existing expense
  const updateExpense = async (id, expenseData) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(expenseData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update expense');
      }
      
      await fetchExpenses();
      closeModal();
      showNotification('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };
  
  // Delete an expense
  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`${API_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete expense');
      }
      
      await fetchExpenses();
      closeDeleteModal();
      showNotification('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      showNotification(`Error: ${error.message}`, true);
    }
  };
  
  // Event Listeners with null checks
  if (addExpenseBtn) addExpenseBtn.addEventListener('click', openAddModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  
  if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
      if (currentExpenseId) {
        deleteExpense(currentExpenseId);
      }
    });
  }
  
  // Handle form submission
  if (expenseForm) {
    expenseForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Prevent double submission
      const submitBtn = expenseForm.querySelector('button[type="submit"]');
      if (submitBtn && submitBtn.disabled) {
        console.log('Form already submitting, ignoring duplicate submission');
        return;
      }
      
      // Disable submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Saving...';
      }
      
      try {
        const id = document.getElementById('expense-id').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const category = document.getElementById('category').value;
        const description = document.getElementById('description').value;
        const date = document.getElementById('date').value;
        
        const expenseData = {
          amount,
          category,
          description,
          date: new Date(date)
        };
        
        if (id) {
          await updateExpense(id, expenseData);
        } else {
          await createExpense(expenseData);
        }
      } finally {
        // Re-enable submit button
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Save Expense';
        }
      }
    });
  }
  
  // Handle filters
  if (categoryFilter) categoryFilter.addEventListener('change', renderExpenses);
  if (dateFilter) dateFilter.addEventListener('change', renderExpenses);
  
  // Start with a connection test
  testConnection();
}); 