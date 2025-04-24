document.addEventListener('DOMContentLoaded', async function() {
    // Get all time slots
    const timeSlots = document.querySelectorAll('.time-slot');
    const dateItems = document.querySelectorAll('.date-item');
    const form = document.querySelector('form');
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Function to fetch booked slots for a date from backend
    async function fetchBookedSlots(date) {
        try {
            const response = await fetch(`/api/bookings/date/${date}`);
            if (!response.ok) return [];
            const bookings = await response.json();
            // Return an array of times that are booked
            return bookings.map(b => b.time);
        } catch (err) {
            console.error('Failed to fetch booked slots:', err);
            return [];
        }
    }

    // Function to check if a time slot has passed
    function isTimeSlotPassed(date, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0);
        // If the date is today, only mark slots as passed if they're before current time
        if (date === currentDate) {
            return hours < currentHour || (hours === currentHour && minutes <= currentMinutes);
        }
        // For future dates, all slots are available (unless booked)
        return false;
    }

    // Function to update time slot availability
    async function updateTimeSlotAvailability() {
        const selectedDate = document.querySelector('.date-item.active')?.dataset.date || currentDate;
        const bookedSlots = await fetchBookedSlots(selectedDate);
        timeSlots.forEach(slot => {
            const time = slot.textContent.trim();
            const isPassed = isTimeSlotPassed(selectedDate, time);
            const isBooked = bookedSlots.includes(time);
            if (isPassed || isBooked) {
                slot.classList.add('booked');
                slot.classList.remove('available', 'selected');
                slot.style.cursor = 'not-allowed';
            } else {
                slot.classList.remove('booked');
                slot.classList.add('available');
                slot.style.cursor = 'pointer';
            }
        });
    }

    // Update all date items to show current and future dates
    dateItems.forEach((item, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const day = dayNames[date.getDay()];
        const dateNum = date.getDate();
        
        // Update the displayed date
        item.querySelector('.day').textContent = day;
        item.querySelector('.date').textContent = dateNum;
        item.dataset.date = date.toISOString().split('T')[0];
        
        // Set first date as active
        if (index === 0) {
            item.classList.add('active');
        }
    });

    // Add click event listener to date items
    dateItems.forEach(item => {
        item.addEventListener('click', async function() {
            dateItems.forEach(d => d.classList.remove('active'));
            this.classList.add('active');
            await updateTimeSlotAvailability();
        });
    });

    // Add click event listener to time slots
    timeSlots.forEach(slot => {
        slot.addEventListener('click', function() {
            if (this.classList.contains('booked')) return;
            
            // Remove selected class from all slots
            timeSlots.forEach(s => s.classList.remove('selected'));
            // Add selected class to clicked slot
            this.classList.add('selected');
        });
    });

    // Show a beautiful toast notification
    function showBookingToast(message, isSuccess = true) {
        const toastEl = document.getElementById('bookingToast');
        const toastBody = document.getElementById('bookingToastBody');
        toastBody.textContent = message;
        // Change toast color
        toastEl.classList.remove('text-bg-success', 'text-bg-danger');
        toastEl.classList.add(isSuccess ? 'text-bg-success' : 'text-bg-danger');
        // Bootstrap 5 Toast
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }

    // Handle form submission with backend POST
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('Form submit handler triggered');
        const selectedDate = document.querySelector('.date-item.active')?.dataset.date;
        const selectedTime = document.querySelector('.time-slot.selected')?.textContent.trim();
        console.log('Selected date:', selectedDate);
        console.log('Selected time:', selectedTime);
        if (!selectedDate || !selectedTime) {
            showBookingToast('Please select both a date and time', false);
            return;
        }
        const service = document.getElementById('service')?.value;
        const name = document.getElementById('name')?.value;
        const email = document.getElementById('email')?.value;
        const phone = document.getElementById('phone')?.value;
        const notes = document.getElementById('notes')?.value;
        // Validate all required fields
        if (!name || !phone || !email || !service) {
            showBookingToast('Please fill in all required fields', false);
            return;
        }
        console.log('Form data:', { name, phone, email, service, notes });
        const bookingData = { name, phone, email, service, date: selectedDate, time: selectedTime, notes };
        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            console.log('Fetch response status:', response.status);
            if (response.ok) {
                showBookingToast('Booking submitted successfully!');
                form.reset();
                timeSlots.forEach(s => s.classList.remove('selected'));
                await updateTimeSlotAvailability();
            } else {
                const err = await response.json();
                showBookingToast('Booking failed: ' + (err.error || 'Unknown error'), false);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            showBookingToast('Could not connect to server. Is it running?', false);
        }
    });

    // Initial update of time slot availability
    await updateTimeSlotAvailability();
}); 