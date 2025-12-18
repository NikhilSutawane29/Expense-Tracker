document.addEventListener('DOMContentLoaded', () => {
  // API URL
  const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:5000/api'
    : 'https://expense-tracker-tdxm.onrender.com/api';
  
  const token = localStorage.getItem('token');
  
  // DOM Elements
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  const filePreview = document.getElementById('file-preview');
  const fileName = document.getElementById('file-name');
  const fileSize = document.getElementById('file-size');
  const removeFileBtn = document.getElementById('remove-file');
  const processBtn = document.getElementById('process-btn');
  const processingStatus = document.getElementById('processing-status');
  const results = document.getElementById('results');
  const downloadSampleBtn = document.getElementById('download-sample');
  const viewDashboardBtn = document.getElementById('view-dashboard');
  
  let selectedFile = null;
  
  // Click to upload
  dropZone.addEventListener('click', () => fileInput.click());
  
  // Drag & Drop handlers
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
  });
  
  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-primary', 'bg-blue-50', 'dark:bg-blue-900/20');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  });
  
  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });
  
  // Handle file selection
  function handleFile(file) {
    // Validate file type
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExtension)) {
      showNotification('Please upload a CSV or Excel file', true);
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      showNotification('File size must be less than 5MB', true);
      return;
    }
    
    selectedFile = file;
    
    // Show file preview
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    filePreview.classList.remove('hidden');
    processBtn.classList.remove('hidden');
    results.classList.add('hidden');
  }
  
  // Remove file
  removeFileBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    selectedFile = null;
    fileInput.value = '';
    filePreview.classList.add('hidden');
    processBtn.classList.add('hidden');
  });
  
  // Process transactions
  processBtn.addEventListener('click', async () => {
    if (!selectedFile) return;
    
    processingStatus.classList.remove('hidden');
    processBtn.disabled = true;
    
    try {
      // Read file content
      const fileContent = await readFileContent(selectedFile);
      
      // Parse CSV
      const transactions = parseCSV(fileContent);
      
      if (transactions.length === 0) {
        showNotification('No valid transactions found in the file', true);
        processingStatus.classList.add('hidden');
        processBtn.disabled = false;
        return;
      }
      
      // Import transactions
      const result = await importTransactions(transactions);
      
      // Show results
      displayResults(result);
      
    } catch (error) {
      console.error('Error processing file:', error);
      showNotification('Error processing file: ' + error.message, true);
    } finally {
      processingStatus.classList.add('hidden');
      processBtn.disabled = false;
    }
  });
  
  // Read file content
  function readFileContent(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
  
  // Parse CSV content
  function parseCSV(content) {
    const lines = content.split('\n').filter(line => line.trim());
    const transactions = [];
    
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      
      if (columns.length < 3) continue;
      
      const [date, description, amount, type] = columns;
      
      // Skip credit transactions (we only track expenses)
      if (type && type.toLowerCase().includes('credit')) continue;
      
      // Auto-categorize based on description
      const category = categorizeTransaction(description);
      
      transactions.push({
        date: parseDate(date),
        description: description || 'Bank Transaction',
        amount: parseFloat(amount),
        category: category
      });
    }
    
    return transactions.filter(t => t.amount > 0);
  }
  
  // Parse various date formats
  function parseDate(dateStr) {
    // Try DD/MM/YYYY format
    const parts = dateStr.split(/[\/\-]/);
    if (parts.length === 3) {
      // Assume DD/MM/YYYY or DD-MM-YYYY
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1;
      const year = parseInt(parts[2]);
      return new Date(year, month, day).toISOString();
    }
    
    // Try parsing as ISO or other formats
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }
  
  // Auto-categorize transaction based on description
  function categorizeTransaction(description) {
    const desc = description.toLowerCase();
    
    if (desc.includes('swiggy') || desc.includes('zomato') || desc.includes('restaurant') || desc.includes('food')) {
      return 'Food';
    }
    if (desc.includes('uber') || desc.includes('ola') || desc.includes('fuel') || desc.includes('petrol')) {
      return 'Transportation';
    }
    if (desc.includes('amazon') || desc.includes('flipkart') || desc.includes('shopping') || desc.includes('mall')) {
      return 'Shopping';
    }
    if (desc.includes('netflix') || desc.includes('movie') || desc.includes('game') || desc.includes('entertainment')) {
      return 'Entertainment';
    }
    if (desc.includes('electricity') || desc.includes('water') || desc.includes('bill') || desc.includes('recharge')) {
      return 'Bills';
    }
    if (desc.includes('hospital') || desc.includes('medical') || desc.includes('pharmacy') || desc.includes('doctor')) {
      return 'Health';
    }
    
    return 'Other';
  }
  
  // Import transactions to backend
  async function importTransactions(transactions) {
    let imported = 0;
    let skipped = 0;
    
    for (const transaction of transactions) {
      try {
        const response = await fetch(`${API_URL}/expenses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(transaction)
        });
        
        if (response.ok) {
          imported++;
        } else {
          skipped++;
        }
      } catch (error) {
        console.error('Error importing transaction:', error);
        skipped++;
      }
    }
    
    return {
      total: transactions.length,
      imported: imported,
      skipped: skipped
    };
  }
  
  // Display results
  function displayResults(result) {
    document.getElementById('total-transactions').textContent = result.total;
    document.getElementById('imported-transactions').textContent = result.imported;
    document.getElementById('skipped-transactions').textContent = result.skipped;
    
    results.classList.remove('hidden');
    
    showNotification(`Successfully imported ${result.imported} transactions!`, false);
  }
  
  // Download sample CSV
  downloadSampleBtn.addEventListener('click', () => {
    const sampleCSV = `Date,Description,Amount,Type
18/12/2025,UPI-Swiggy Food Order,350.00,Debit
17/12/2025,ATM Withdrawal,2000.00,Debit
16/12/2025,UPI-Amazon Purchase,1299.00,Debit
16/12/2025,UPI-Ola Cab Service,185.00,Debit
15/12/2025,Netflix Subscription,649.00,Debit
15/12/2025,Electricity Bill Payment,1850.00,Debit
14/12/2025,UPI-Zomato Food Order,425.00,Debit
13/12/2025,Fuel-Petrol Pump,3500.00,Debit
12/12/2025,UPI-Flipkart Shopping,2399.00,Debit
11/12/2025,Medical Store,560.00,Debit`;
    
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_bank_statement.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  });
  
  // View dashboard
  viewDashboardBtn.addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });
  
  // Format file size
  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
  
  // Show notification
  function showNotification(message, isError = false) {
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
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('notification-animate-out');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }
});
