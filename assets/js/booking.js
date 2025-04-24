document.addEventListener('DOMContentLoaded', function() {
    // Get all time slots
    const timeSlots = document.querySelectorAll('.time-slot');
    const dateItems = document.querySelectorAll('.date-item');
    const form = document.querySelector('form');
    
    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Sample booked slots for presentation
    const sampleBookedSlots = {
        [currentDate]: ['10:00', '14:00', '16:00'], // Today's booked slots
        [new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0]]: ['11:00', '15:00'], // Tomorrow's booked slots
        [new Date(now.setDate(now.getDate() + 1)).toISOString().split('T')[0]]: ['09:00', '13:00'] // Day after tomorrow's booked slots
    };
    
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
    
    // Function to check if a time slot has passed or is booked
    function isTimeSlotPassed(date, time) {
        const [hours, minutes] = time.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(hours, minutes, 0);
        
        // Check if the slot is booked
        if (sampleBookedSlots[date] && sampleBookedSlots[date].includes(time)) {
            return true;
        }
        
        // If the date is today, only mark slots as passed if they're before current time
        if (date === currentDate) {
            return hours < currentHour || (hours === currentHour && minutes <= currentMinutes);
        }
        
        // For future dates, all slots are available
        return false;
    }
    
    // Function to update time slot availability
    function updateTimeSlotAvailability() {
        const selectedDate = document.querySelector('.date-item.active')?.dataset.date || currentDate;
        
        timeSlots.forEach(slot => {
            const time = slot.textContent.trim();
            const isPassed = isTimeSlotPassed(selectedDate, time);
            
            if (isPassed) {
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
    
    // Add click event listener to date items
    dateItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all dates
            dateItems.forEach(d => d.classList.remove('active'));
            // Add active class to clicked date
            this.classList.add('active');
            // Update time slot availability
            updateTimeSlotAvailability();
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
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedDate = document.querySelector('.date-item.active')?.dataset.date;
        const selectedTime = document.querySelector('.time-slot.selected')?.textContent.trim();
        
        if (!selectedDate || !selectedTime) {
            alert('Please select both a date and time');
            return;
        }
        
        // Here you would typically send the data to your backend
        console.log('Selected date:', selectedDate);
        console.log('Selected time:', selectedTime);
        console.log('Selected service:', document.getElementById('service').value);
        console.log('Client name:', document.getElementById('name').value);
        console.log('Client email:', document.getElementById('email').value);
        console.log('Client phone:', document.getElementById('phone').value);
        
        // Show success message
        alert('Booking submitted successfully!');
        form.reset();
        
        // Reset selections
        timeSlots.forEach(s => s.classList.remove('selected'));
    });
    
    // Initial update of time slot availability
    updateTimeSlotAvailability();
}); 