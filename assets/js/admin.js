document.addEventListener('DOMContentLoaded', function() {
    // Initialize the modals
    const reservationModal = new bootstrap.Modal(document.getElementById('reservationModal'));
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    let currentPage = 1;
    const totalPages = 3; // This should come from your backend in a real application
    
    // Get filter elements
    const statusFilter = document.getElementById('statusFilter');
    const serviceFilter = document.getElementById('serviceFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchInput = document.getElementById('searchInput');
    const filterForm = document.getElementById('filterForm');
    const applyFilterBtn = document.getElementById('applyFilter');
    
    // Set minimum date to today
    if (dateFilter) {
        const today = new Date().toISOString().split('T')[0];
        dateFilter.min = today;
        dateFilter.value = today; // Set default value to today
    }
    
    // Debug: Check if elements are found
    console.log('Status Filter:', statusFilter);
    console.log('Service Filter:', serviceFilter);
    console.log('Date Filter:', dateFilter);
    console.log('Search Input:', searchInput);
    console.log('Filter Form:', filterForm);
    console.log('Apply Filter Button:', applyFilterBtn);
    
    // Get all view details buttons
    const viewButtons = document.querySelectorAll('.btn-outline-primary');
    const confirmButtons = document.querySelectorAll('.btn-outline-success');
    const cancelButtons = document.querySelectorAll('.btn-outline-danger');
    const resetButton = document.getElementById('resetStatusBtn');
    
    // Function to update status badge
    function updateStatusBadge(row, newStatus) {
        const statusCell = row.cells[5];
        const badge = statusCell.querySelector('.badge');
        
        // Remove all existing badge classes
        badge.classList.remove('bg-success', 'bg-warning', 'bg-danger');
        
        // Add new status class and text
        switch(newStatus) {
            case 'Confirmed':
                badge.classList.add('bg-success');
                badge.textContent = 'Confirmed';
                break;
            case 'Pending':
                badge.classList.add('bg-warning');
                badge.textContent = 'Pending';
                break;
            case 'Cancelled':
                badge.classList.add('bg-danger');
                badge.textContent = 'Cancelled';
                break;
        }
    }
    
    // Function to show confirmation dialog
    function showConfirmationDialog(message, callback) {
        document.getElementById('confirmationMessage').textContent = message;
        document.getElementById('confirmActionBtn').onclick = function() {
            confirmationModal.hide();
            callback();
        };
        confirmationModal.show();
    }

    // Function to format date for comparison
    function formatDate(dateString) {
        return new Date(dateString).toISOString().split('T')[0];
    }

    // Function to filter reservations
    function filterReservations() {
        console.log('Filtering reservations...');
        
        if (!statusFilter || !serviceFilter || !dateFilter || !searchInput) {
            console.error('Filter elements not found!');
            return;
        }

        const status = statusFilter.value;
        const service = serviceFilter.value;
        const date = dateFilter.value;
        const searchTerm = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');

        console.log('Filter values:', { status, service, date, searchTerm });
        console.log('Total rows:', rows.length);

        rows.forEach(row => {
            const rowStatus = row.cells[5].querySelector('.badge').textContent;
            const rowService = row.cells[2].textContent;
            const rowDate = formatDate(row.cells[3].textContent);
            const rowText = row.textContent.toLowerCase();
            
            const statusMatch = status === 'all' || rowStatus === status;
            const serviceMatch = service === 'all' || rowService === service;
            const dateMatch = !date || rowDate === date;
            const searchMatch = !searchTerm || rowText.includes(searchTerm);
            
            row.style.display = statusMatch && serviceMatch && dateMatch && searchMatch ? '' : 'none';
        });

        // Update pagination visibility based on filtered results
        const visibleRows = document.querySelectorAll('tbody tr[style=""]').length;
        const pagination = document.querySelector('.pagination');
        pagination.style.display = visibleRows > 0 ? 'flex' : 'none';
        
        console.log('Visible rows after filtering:', visibleRows);
    }

    // Add event listeners for filters
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            console.log('Status filter changed:', this.value);
            filterReservations();
        });
    }
    
    if (serviceFilter) {
        serviceFilter.addEventListener('change', function() {
            console.log('Service filter changed:', this.value);
            filterReservations();
        });
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            console.log('Date filter changed:', this.value);
            filterReservations();
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            console.log('Search input changed:', this.value);
            filterReservations();
        });
    }
    
    // Add event listener for Apply Filter button
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Apply filter button clicked');
            filterReservations();
        });
    }

    // Add event listener for form submission
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Filter form submitted');
            filterReservations();
        });
    }

    // Add click event listener to each view button
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the row data
            const row = this.closest('tr');
            const id = row.cells[0].textContent;
            const name = row.cells[1].textContent;
            const service = row.cells[2].textContent;
            const date = row.cells[3].textContent;
            const time = row.cells[4].textContent;
            const status = row.cells[5].querySelector('.badge').textContent;
            
            // Set data-id on the row if not already set
            if (!row.hasAttribute('data-id')) {
                row.setAttribute('data-id', id);
            }
            
            // Update modal content
            document.getElementById('modal-id').textContent = id;
            document.getElementById('modal-name').textContent = name;
            document.getElementById('modal-service').textContent = service;
            document.getElementById('modal-date').textContent = date;
            document.getElementById('modal-time').textContent = time;
            document.getElementById('modal-status').textContent = status;
            document.getElementById('modal-notes').textContent = 'No additional notes available.';
            
            // Show/hide reset button based on status
            if (status === 'Pending') {
                resetButton.style.display = 'none';
            } else {
                resetButton.style.display = 'inline-block';
            }
            
            // Store the row reference in the modal for later use
            document.getElementById('reservationModal').dataset.rowId = id;
            
            // Show the modal
            reservationModal.show();
        });
    });

    // Add click event listener to confirm buttons
    confirmButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            showConfirmationDialog('Are you sure you want to confirm this reservation?', function() {
                updateStatusBadge(row, 'Confirmed');
                filterReservations(); // Reapply filters after status change
                console.log('Reservation confirmed:', row.cells[0].textContent);
            });
        });
    });

    // Add click event listener to cancel buttons
    cancelButtons.forEach(button => {
        button.addEventListener('click', function() {
            const row = this.closest('tr');
            showConfirmationDialog('Are you sure you want to cancel this reservation?', function() {
                updateStatusBadge(row, 'Cancelled');
                filterReservations(); // Reapply filters after status change
                console.log('Reservation cancelled:', row.cells[0].textContent);
            });
        });
    });

    // Add click event listener to reset status button in modal
    resetButton.addEventListener('click', function() {
        const modal = document.getElementById('reservationModal');
        const rowId = modal.dataset.rowId;
        const row = document.querySelector(`tr[data-id="${rowId}"]`);
        
        if (row) {
            showConfirmationDialog('Are you sure you want to reset this reservation to pending?', function() {
                updateStatusBadge(row, 'Pending');
                document.getElementById('modal-status').textContent = 'Pending';
                resetButton.style.display = 'none'; // Hide the button after resetting
                filterReservations(); // Reapply filters after status change
                console.log('Reservation reset to pending:', rowId);
            });
        } else {
            console.error('Row not found for ID:', rowId);
        }
    });

    // Handle pagination
    const pagination = document.querySelector('.pagination');
    const prevButton = pagination.querySelector('.page-item:first-child');
    const nextButton = pagination.querySelector('.page-item:last-child');
    const pageNumbers = pagination.querySelectorAll('.page-item:not(:first-child):not(:last-child)');

    // Update pagination state
    function updatePaginationState() {
        // Update Previous button
        prevButton.classList.toggle('disabled', currentPage === 1);
        
        // Update page numbers
        pageNumbers.forEach((item, index) => {
            item.classList.toggle('active', currentPage === index + 1);
        });
        
        // Update Next button
        nextButton.classList.toggle('disabled', currentPage === totalPages);
    }

    // Handle Previous button
    prevButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            updatePaginationState();
            // Here you would typically fetch new data for the page
            console.log(`Loading page ${currentPage}`);
        }
    });

    // Handle Next button
    nextButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            updatePaginationState();
            // Here you would typically fetch new data for the page
            console.log(`Loading page ${currentPage}`);
        }
    });

    // Handle page number clicks
    pageNumbers.forEach((item, index) => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = index + 1;
            updatePaginationState();
            // Here you would typically fetch new data for the page
            console.log(`Loading page ${currentPage}`);
        });
    });

    // Initialize pagination state
    updatePaginationState();
}); 