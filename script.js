// Global State Management
const state = {
    events: [],
    bookings: [],
    attendees: [],
    reminders: [],
    notifications: [],
    currentUser: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'organizer'
    },
    filters: {
        category: '',
        startDate: '',
        endDate: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    }
};

// Sample Data Generator
function generateSampleEvents() {
    const categories = ['music', 'business', 'tech', 'sports', 'food', 'art'];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco'];
    const eventNames = {
        music: ['Summer Music Festival', 'Jazz Night', 'Rock Concert', 'Classical Evening'],
        business: ['Tech Summit', 'Business Networking', 'Leadership Conference', 'Startup Pitch'],
        tech: ['AI Conference', 'Web Development Workshop', 'Cybersecurity Summit', 'Cloud Computing Expo'],
        sports: ['Marathon Event', 'Yoga Retreat', 'Basketball Tournament', 'Fitness Bootcamp'],
        food: ['Wine Tasting', 'Food Festival', 'Cooking Workshop', 'Chef\'s Table'],
        art: ['Art Exhibition', 'Photography Workshop', 'Theater Performance', 'Dance Show']
    };

    const events = [];
    for (let i = 0; i < 12; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const city = cities[Math.floor(Math.random() * cities.length)];
        const names = eventNames[category];
        const name = names[Math.floor(Math.random() * names.length)];
        const price = Math.floor(Math.random() * 150) + 10;
        const date = new Date();
        date.setDate(date.getDate() + Math.floor(Math.random() * 60));
        
        events.push({
            id: i + 1,
            title: name,
            category: category,
            description: `Join us for an amazing ${category} event in ${city}. This will be an unforgettable experience!`,
            startDate: date.toISOString(),
            endDate: new Date(date.getTime() + 3600000 * 4).toISOString(),
            venue: {
                name: `${city} Convention Center`,
                address: `123 Main St, ${city}`,
                city: city,
                state: 'State'
            },
            price: price,
            tickets: [
                { type: 'General Admission', price: price, quantity: 100, sold: Math.floor(Math.random() * 50) },
                { type: 'VIP', price: price * 2, quantity: 50, sold: Math.floor(Math.random() * 25) }
            ],
            vendors: [
                { type: 'catering', name: 'Delicious Catering Co.', contact: '555-0101' },
                { type: 'photography', name: 'Snap Photos', contact: '555-0102' }
            ],
            groupBooking: {
                enabled: Math.random() > 0.5,
                minSize: 5,
                discount: 10
            },
            organizer: state.currentUser.id,
            attendees: Math.floor(Math.random() * 200) + 50
        });
    }
    return events;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    state.events = generateSampleEvents();
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    displayEvents(state.events);
    generateNotifications();
    displayNotifications();
    
    // Simulate real-time updates
    setInterval(() => {
        if (Math.random() > 0.7) {
            addNotification('info', 'New event added to your area!', 'Check out the latest events');
        }
    }, 30000);
}

// Event Listeners Setup
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = e.target.getAttribute('href').substring(1);
            scrollToSection(target);
            updateActiveNav(e.target);
        });
    });

    // Search
    document.getElementById('heroSearchBtn').addEventListener('click', performSearch);
    document.getElementById('heroSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    // Filters
    document.getElementById('applyFilters').addEventListener('click', applyFilters);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);

    // Create Event Form
    document.getElementById('createEventForm').addEventListener('submit', handleCreateEvent);
    document.getElementById('addTicketType').addEventListener('click', addTicketType);
    document.getElementById('addVendor').addEventListener('click', addVendor);
    document.getElementById('enableGroupBooking').addEventListener('change', toggleGroupBooking);

    // Dashboard Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });

    // Modals
    document.getElementById('closeModal').addEventListener('click', () => closeModal('eventModal'));
    document.getElementById('closeBookingModal').addEventListener('click', () => closeModal('bookingModal'));
    document.getElementById('closeReminderModal').addEventListener('click', () => closeModal('reminderModal'));

    // Notifications
    document.getElementById('notificationBtn').addEventListener('click', toggleNotificationPanel);
    document.getElementById('closeNotificationPanel').addEventListener('click', toggleNotificationPanel);

    // Reminders
    document.getElementById('addReminderBtn').addEventListener('click', openReminderModal);
    document.getElementById('reminderForm').addEventListener('submit', handleAddReminder);

    // Login (Mock)
    document.getElementById('loginBtn').addEventListener('click', () => {
        showNotification('success', 'Logged in successfully!');
    });
}

// Navigation Functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function updateActiveNav(activeLink) {
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

// Search Functions
function performSearch() {
    const searchTerm = document.getElementById('heroSearch').value.toLowerCase();
    const filtered = state.events.filter(event => 
        event.title.toLowerCase().includes(searchTerm) ||
        event.category.toLowerCase().includes(searchTerm) ||
        event.venue.city.toLowerCase().includes(searchTerm)
    );
    displayEvents(filtered);
    scrollToSection('events');
}

// Filter Functions
function applyFilters() {
    state.filters = {
        category: document.getElementById('categoryFilter').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        location: document.getElementById('locationFilter').value.toLowerCase(),
        minPrice: parseFloat(document.getElementById('minPrice').value) || 0,
        maxPrice: parseFloat(document.getElementById('maxPrice').value) || Infinity
    };

    const filtered = state.events.filter(event => {
        const matchCategory = !state.filters.category || event.category === state.filters.category;
        const matchLocation = !state.filters.location || event.venue.city.toLowerCase().includes(state.filters.location);
        const matchPrice = event.price >= state.filters.minPrice && event.price <= state.filters.maxPrice;
        
        let matchDate = true;
        if (state.filters.startDate) {
            matchDate = matchDate && new Date(event.startDate) >= new Date(state.filters.startDate);
        }
        if (state.filters.endDate) {
            matchDate = matchDate && new Date(event.startDate) <= new Date(state.filters.endDate);
        }

        return matchCategory && matchLocation && matchPrice && matchDate;
    });

    displayEvents(filtered);
    showNotification('success', `Found ${filtered.length} events matching your criteria`);
}

function resetFilters() {
    document.getElementById('categoryFilter').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('locationFilter').value = '';
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    state.filters = {
        category: '',
        startDate: '',
        endDate: '',
        location: '',
        minPrice: '',
        maxPrice: ''
    };
    
    displayEvents(state.events);
}

// Display Functions
function displayEvents(events) {
    const grid = document.getElementById('eventsGrid');
    
    if (events.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--dark-alt);">No events found matching your criteria.</div>';
        return;
    }

    grid.innerHTML = events.map(event => `
        <div class="event-card" onclick="openEventDetail(${event.id})">
            <div class="event-image">
                <i class="fas ${getCategoryIcon(event.category)}"></i>
            </div>
            <div class="event-content">
                <span class="event-category">${formatCategory(event.category)}</span>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-meta">
                    <div class="event-meta-item">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(event.startDate)}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${formatTime(event.startDate)}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${event.venue.city}</span>
                    </div>
                    <div class="event-meta-item">
                        <i class="fas fa-users"></i>
                        <span>${event.attendees} attendees</span>
                    </div>
                </div>
                <div class="event-footer">
                    <span class="event-price">$${event.price}</span>
                    <button class="btn-book" onclick="event.stopPropagation(); openBookingModal(${event.id})">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function openEventDetail(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    const modal = document.getElementById('eventModal');
    const content = document.getElementById('eventDetailContent');
    
    content.innerHTML = `
        <div class="event-detail-header">
            <span class="event-category">${formatCategory(event.category)}</span>
            <h2 class="event-detail-title">${event.title}</h2>
            <p>${event.description}</p>
        </div>

        <div class="event-detail-section">
            <h3><i class="fas fa-calendar-alt"></i> Date & Time</h3>
            <p><strong>Start:</strong> ${formatDateTime(event.startDate)}</p>
            <p><strong>End:</strong> ${formatDateTime(event.endDate)}</p>
        </div>

        <div class="event-detail-section">
            <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
            <p><strong>${event.venue.name}</strong></p>
            <p>${event.venue.address}</p>
            <p>${event.venue.city}, ${event.venue.state}</p>
            <div class="location-map">
                <i class="fas fa-map" style="font-size: 3rem; color: var(--primary);"></i>
                <p style="margin-top: 1rem;">Interactive map would display here</p>
            </div>
        </div>

        <div class="event-detail-section">
            <h3><i class="fas fa-ticket-alt"></i> Tickets Available</h3>
            <div class="ticket-options">
                ${event.tickets.map(ticket => `
                    <div class="ticket-option">
                        <div>
                            <strong>${ticket.type}</strong>
                            <p>$${ticket.price} • ${ticket.quantity - ticket.sold} remaining</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${event.groupBooking.enabled ? `
                <div style="margin-top: 1rem; padding: 1rem; background: var(--light); border-radius: 8px;">
                    <strong><i class="fas fa-users"></i> Group Discount Available!</strong>
                    <p>Book ${event.groupBooking.minSize}+ tickets and get ${event.groupBooking.discount}% off</p>
                </div>
            ` : ''}
        </div>

        <div class="event-detail-section">
            <h3><i class="fas fa-handshake"></i> Vendors & Service Providers</h3>
            <div class="vendor-list">
                ${event.vendors.map(vendor => `
                    <div class="vendor-card">
                        <div class="vendor-card-info">
                            <div class="vendor-icon">
                                <i class="fas ${getVendorIcon(vendor.type)}"></i>
                            </div>
                            <div>
                                <strong>${vendor.name}</strong>
                                <p style="color: var(--dark-alt);">${formatVendorType(vendor.type)}</p>
                            </div>
                        </div>
                        <div>
                            <i class="fas fa-phone"></i> ${vendor.contact}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <button class="btn-submit" onclick="openBookingModal(${event.id})">
                Book Tickets
            </button>
            <button class="btn-action" onclick="shareEvent(${event.id})">
                <i class="fas fa-share-alt"></i> Share
            </button>
        </div>
    `;

    modal.classList.add('active');
}

function openBookingModal(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    closeModal('eventModal');
    const modal = document.getElementById('bookingModal');
    const content = document.getElementById('bookingContent');
    
    content.innerHTML = `
        <h3>${event.title}</h3>
        <p style="color: var(--dark-alt); margin-bottom: 1.5rem;">${formatDateTime(event.startDate)}</p>

        <div class="form-group">
            <label>Select Tickets</label>
            ${event.tickets.map((ticket, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: var(--light); border-radius: 8px; margin-bottom: 0.5rem;">
                    <div>
                        <strong>${ticket.type}</strong>
                        <p style="color: var(--dark-alt);">$${ticket.price}</p>
                    </div>
                    <input type="number" id="ticket_${index}" min="0" max="${ticket.quantity - ticket.sold}" value="0" 
                        style="width: 80px; padding: 0.5rem; border: 2px solid var(--light-alt); border-radius: 6px; text-align: center;"
                        onchange="updateBookingTotal(${event.id})">
                </div>
            `).join('')}
        </div>

        <div class="form-row">
            <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="bookingName" value="${state.currentUser.name}" required>
            </div>
            <div class="form-group">
                <label>Email</label>
                <input type="email" id="bookingEmail" value="${state.currentUser.email}" required>
            </div>
        </div>

        <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="bookingPhone" required>
        </div>

        <div class="form-group">
            <label>
                <input type="checkbox" id="enableReminder">
                Send me a reminder before the event
            </label>
        </div>

        <div style="margin-top: 1.5rem; padding: 1rem; background: var(--light); border-radius: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>Subtotal:</span>
                <strong id="bookingSubtotal">$0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;" id="discountRow" style="display: none;">
                <span>Group Discount:</span>
                <strong id="bookingDiscount" style="color: var(--success);">-$0.00</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 1.2rem; padding-top: 0.5rem; border-top: 2px solid var(--accent);">
                <span>Total:</span>
                <strong id="bookingTotal" style="color: var(--primary);">$0.00</strong>
            </div>
        </div>

        <button type="button" class="btn-submit" onclick="completeBooking(${event.id})">
            Complete Booking
        </button>
    `;

    modal.classList.add('active');
}

function updateBookingTotal(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    let subtotal = 0;
    let totalTickets = 0;

    event.tickets.forEach((ticket, index) => {
        const quantity = parseInt(document.getElementById(`ticket_${index}`).value) || 0;
        subtotal += ticket.price * quantity;
        totalTickets += quantity;
    });

    let discount = 0;
    const discountRow = document.getElementById('discountRow');
    
    if (event.groupBooking.enabled && totalTickets >= event.groupBooking.minSize) {
        discount = subtotal * (event.groupBooking.discount / 100);
        discountRow.style.display = 'flex';
        document.getElementById('bookingDiscount').textContent = `-$${discount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }

    const total = subtotal - discount;
    
    document.getElementById('bookingSubtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('bookingTotal').textContent = `$${total.toFixed(2)}`;
}

function completeBooking(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;

    const booking = {
        id: state.bookings.length + 1,
        eventId: eventId,
        eventTitle: event.title,
        userName: document.getElementById('bookingName').value,
        userEmail: document.getElementById('bookingEmail').value,
        userPhone: document.getElementById('bookingPhone').value,
        tickets: [],
        total: parseFloat(document.getElementById('bookingTotal').textContent.replace('$', '')),
        bookingDate: new Date().toISOString(),
        status: 'confirmed'
    };

    event.tickets.forEach((ticket, index) => {
        const quantity = parseInt(document.getElementById(`ticket_${index}`).value) || 0;
        if (quantity > 0) {
            booking.tickets.push({
                type: ticket.type,
                quantity: quantity,
                price: ticket.price
            });
            ticket.sold += quantity;
        }
    });

    if (booking.tickets.length === 0) {
        showNotification('error', 'Please select at least one ticket');
        return;
    }

    state.bookings.push(booking);
    
    // Set reminder if requested
    if (document.getElementById('enableReminder').checked) {
        const reminderDate = new Date(event.startDate);
        reminderDate.setHours(reminderDate.getHours() - 24);
        
        state.reminders.push({
            id: state.reminders.length + 1,
            eventId: eventId,
            eventTitle: event.title,
            dateTime: reminderDate.toISOString(),
            message: `Don't forget! Your event "${event.title}" starts tomorrow.`
        });
    }

    closeModal('bookingModal');
    showNotification('success', 'Booking confirmed! Check your email for details.');
    addNotification('success', 'Booking Confirmed', `Your tickets for ${event.title} have been booked successfully!`);
    
    // Update dashboard
    displayDashboard();
}

// Create Event Functions
function handleCreateEvent(e) {
    e.preventDefault();

    const ticketTypes = [];
    document.querySelectorAll('.ticket-type').forEach(ticket => {
        ticketTypes.push({
            type: ticket.querySelector('.ticketName').value,
            price: parseFloat(ticket.querySelector('.ticketPrice').value),
            quantity: parseInt(ticket.querySelector('.ticketQuantity').value),
            sold: 0
        });
    });

    const vendors = [];
    document.querySelectorAll('.vendor-item').forEach(vendor => {
        vendors.push({
            type: vendor.querySelector('.vendorType').value,
            name: vendor.querySelector('.vendorName').value,
            contact: vendor.querySelector('.vendorContact').value
        });
    });

    const newEvent = {
        id: state.events.length + 1,
        title: document.getElementById('eventTitle').value,
        category: document.getElementById('eventCategory').value,
        description: document.getElementById('eventDescription').value,
        startDate: document.getElementById('eventStartDate').value,
        endDate: document.getElementById('eventEndDate').value,
        venue: {
            name: document.getElementById('venueName').value,
            address: document.getElementById('venueAddress').value,
            city: document.getElementById('venueCity').value,
            state: document.getElementById('venueState').value
        },
        price: ticketTypes[0]?.price || 0,
        tickets: ticketTypes,
        vendors: vendors,
        groupBooking: {
            enabled: document.getElementById('enableGroupBooking').checked,
            minSize: parseInt(document.getElementById('groupMinSize').value) || 5,
            discount: parseInt(document.getElementById('groupDiscount').value) || 10
        },
        organizer: state.currentUser.id,
        attendees: 0
    };

    state.events.unshift(newEvent);
    displayEvents(state.events);
    document.getElementById('createEventForm').reset();
    showNotification('success', 'Event created successfully!');
    scrollToSection('events');
}

function addTicketType() {
    const container = document.getElementById('ticketTypes');
    const ticketType = document.createElement('div');
    ticketType.className = 'ticket-type';
    ticketType.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Ticket Type</label>
                <input type="text" class="ticketName" placeholder="e.g., General Admission" required>
            </div>
            <div class="form-group">
                <label>Price ($)</label>
                <input type="number" class="ticketPrice" min="0" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Quantity</label>
                <input type="number" class="ticketQuantity" min="1" required>
            </div>
            <button type="button" class="btn-remove-ticket" onclick="this.closest('.ticket-type').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(ticketType);
}

function addVendor() {
    const container = document.getElementById('vendorList');
    const vendorItem = document.createElement('div');
    vendorItem.className = 'vendor-item';
    vendorItem.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label>Vendor Type</label>
                <select class="vendorType" required>
                    <option value="">Select Type</option>
                    <option value="catering">Catering</option>
                    <option value="photography">Photography</option>
                    <option value="audio">Audio/Visual</option>
                    <option value="decoration">Decoration</option>
                    <option value="security">Security</option>
                    <option value="entertainment">Entertainment</option>
                </select>
            </div>
            <div class="form-group">
                <label>Vendor Name</label>
                <input type="text" class="vendorName" required>
            </div>
            <div class="form-group">
                <label>Contact</label>
                <input type="text" class="vendorContact" required>
            </div>
            <button type="button" class="btn-remove-vendor" onclick="this.closest('.vendor-item').remove()">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(vendorItem);
}

function toggleGroupBooking(e) {
    const options = document.getElementById('groupBookingOptions');
    options.style.display = e.target.checked ? 'block' : 'none';
}

// Dashboard Functions
function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    event.target.classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    if (tabName === 'myEvents') displayDashboard();
    if (tabName === 'bookings') displayBookings();
    if (tabName === 'attendees') displayAttendees();
    if (tabName === 'reminders') displayReminders();
}

function displayDashboard() {
    const container = document.getElementById('dashboardEvents');
    const userEvents = state.events.filter(e => e.organizer === state.currentUser.id);

    if (userEvents.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--dark-alt);">You haven\'t created any events yet.</p>';
        return;
    }

    container.innerHTML = userEvents.map(event => `
        <div class="dashboard-event-card">
            <div class="dashboard-event-info">
                <h3>${event.title}</h3>
                <p>${formatDateTime(event.startDate)}</p>
                <div class="dashboard-event-stats">
                    <span><i class="fas fa-users"></i> ${event.attendees} attendees</span>
                    <span><i class="fas fa-ticket-alt"></i> ${event.tickets.reduce((sum, t) => sum + t.sold, 0)} tickets sold</span>
                    <span><i class="fas fa-dollar-sign"></i> $${calculateRevenue(event)}</span>
                </div>
            </div>
            <div class="dashboard-event-actions">
                <button class="btn-action" onclick="openEventDetail(${event.id})">View</button>
                <button class="btn-action" onclick="editEvent(${event.id})">Edit</button>
                <button class="btn-action btn-danger" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function displayBookings() {
    const container = document.getElementById('bookingsList');

    if (state.bookings.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--dark-alt);">You don\'t have any bookings yet.</p>';
        return;
    }

    container.innerHTML = state.bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-card-header">
                <div>
                    <h3 class="booking-card-title">${booking.eventTitle}</h3>
                    <p style="color: var(--dark-alt);">Booking ID: #${booking.id.toString().padStart(6, '0')}</p>
                </div>
                <span class="booking-status confirmed">Confirmed</span>
            </div>
            <div class="booking-details">
                <p><strong>Booked on:</strong> ${formatDate(booking.bookingDate)}</p>
                <p><strong>Tickets:</strong> ${booking.tickets.map(t => `${t.quantity}x ${t.type}`).join(', ')}</p>
                <p><strong>Total:</strong> $${booking.total.toFixed(2)}</p>
                <p><strong>Email:</strong> ${booking.userEmail}</p>
            </div>
            <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                <button class="btn-action" onclick="downloadTicket(${booking.id})">
                    <i class="fas fa-download"></i> Download Ticket
                </button>
                <button class="btn-action btn-danger" onclick="cancelBooking(${booking.id})">
                    Cancel Booking
                </button>
            </div>
        </div>
    `).join('');
}

function displayAttendees() {
    // Generate sample attendees
    const sampleAttendees = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'checked-in', ticketType: 'VIP' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'pending', ticketType: 'General' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', status: 'checked-in', ticketType: 'General' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', status: 'pending', ticketType: 'VIP' },
        { id: 5, name: 'Eve Williams', email: 'eve@example.com', status: 'checked-in', ticketType: 'General' }
    ];

    const checkedIn = sampleAttendees.filter(a => a.status === 'checked-in').length;
    const pending = sampleAttendees.filter(a => a.status === 'pending').length;

    document.getElementById('totalAttendees').textContent = sampleAttendees.length;
    document.getElementById('checkedIn').textContent = checkedIn;
    document.getElementById('pending').textContent = pending;

    const container = document.getElementById('attendeesList');
    container.innerHTML = sampleAttendees.map(attendee => `
        <div class="attendee-item">
            <div class="attendee-info">
                <div class="attendee-avatar">${attendee.name.charAt(0)}</div>
                <div>
                    <strong>${attendee.name}</strong>
                    <p style="color: var(--dark-alt); font-size: 0.9rem;">${attendee.email}</p>
                    <p style="color: var(--dark-alt); font-size: 0.9rem;">Ticket: ${attendee.ticketType}</p>
                </div>
            </div>
            <span class="attendee-status ${attendee.status === 'checked-in' ? 'status-checked-in' : 'status-pending'}">
                ${attendee.status === 'checked-in' ? 'Checked In' : 'Pending'}
            </span>
        </div>
    `).join('');
}

function displayReminders() {
    const container = document.getElementById('remindersList');

    if (state.reminders.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: var(--dark-alt);">No reminders set.</p>';
        return;
    }

    container.innerHTML = state.reminders.map(reminder => `
        <div class="reminder-item">
            <div class="reminder-header">
                <div>
                    <div class="reminder-title">${reminder.eventTitle}</div>
                    <div class="reminder-time">
                        <i class="fas fa-clock"></i> ${formatDateTime(reminder.dateTime)}
                    </div>
                </div>
                <button class="btn-delete-reminder" onclick="deleteReminder(${reminder.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="reminder-message">${reminder.message}</div>
        </div>
    `).join('');
}

function openReminderModal() {
    const modal = document.getElementById('reminderModal');
    const select = document.getElementById('reminderEvent');
    
    select.innerHTML = '<option value="">Select Event</option>' + 
        state.events.map(e => `<option value="${e.id}">${e.title}</option>`).join('');
    
    modal.classList.add('active');
}

function handleAddReminder(e) {
    e.preventDefault();
    
    const eventId = parseInt(document.getElementById('reminderEvent').value);
    const event = state.events.find(e => e.id === eventId);
    
    if (!event) return;

    const reminder = {
        id: state.reminders.length + 1,
        eventId: eventId,
        eventTitle: event.title,
        dateTime: document.getElementById('reminderDateTime').value,
        message: document.getElementById('reminderMessage').value
    };

    state.reminders.push(reminder);
    closeModal('reminderModal');
    showNotification('success', 'Reminder set successfully!');
    displayReminders();
    document.getElementById('reminderForm').reset();
}

function deleteReminder(id) {
    state.reminders = state.reminders.filter(r => r.id !== id);
    displayReminders();
    showNotification('success', 'Reminder deleted');
}

// Notification Functions
function generateNotifications() {
    state.notifications = [
        {
            id: 1,
            type: 'info',
            title: 'New Event Alert',
            message: 'A new tech conference has been added in your area!',
            time: new Date(Date.now() - 3600000).toISOString()
        },
        {
            id: 2,
            type: 'success',
            title: 'Booking Reminder',
            message: 'Your event "Summer Music Festival" starts tomorrow!',
            time: new Date(Date.now() - 7200000).toISOString()
        },
        {
            id: 3,
            type: 'info',
            title: 'Price Drop',
            message: 'Early bird tickets now available for Business Summit',
            time: new Date(Date.now() - 10800000).toISOString()
        }
    ];
}

function displayNotifications() {
    const container = document.getElementById('notificationsList');
    
    if (state.notifications.length === 0) {
        container.innerHTML = '<p style="padding: 1rem; text-align: center; color: var(--dark-alt);">No notifications</p>';
        return;
    }

    container.innerHTML = state.notifications.map(notif => `
        <div class="notification-item">
            <div class="notification-item-title">${notif.title}</div>
            <div class="notification-item-message">${notif.message}</div>
            <div class="notification-item-time">${formatTimeAgo(notif.time)}</div>
        </div>
    `).join('');
}

function addNotification(type, title, message) {
    const notification = {
        id: state.notifications.length + 1,
        type: type,
        title: title,
        message: message,
        time: new Date().toISOString()
    };
    
    state.notifications.unshift(notification);
    displayNotifications();
    updateNotificationBadge();
}

function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    badge.textContent = state.notifications.length;
}

function toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('active');
}

function showNotification(type, message) {
    const container = document.getElementById('notificationContainer');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Modal Functions
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// Utility Functions
function formatCategory(category) {
    const categories = {
        music: 'Music & Concerts',
        business: 'Business',
        tech: 'Technology',
        sports: 'Sports',
        food: 'Food & Drink',
        art: 'Arts & Culture',
        education: 'Education',
        charity: 'Charity'
    };
    return categories[category] || category;
}

function getCategoryIcon(category) {
    const icons = {
        music: 'fa-music',
        business: 'fa-briefcase',
        tech: 'fa-laptop-code',
        sports: 'fa-basketball-ball',
        food: 'fa-utensils',
        art: 'fa-palette',
        education: 'fa-graduation-cap',
        charity: 'fa-hand-holding-heart'
    };
    return icons[category] || 'fa-calendar';
}

function getVendorIcon(type) {
    const icons = {
        catering: 'fa-utensils',
        photography: 'fa-camera',
        audio: 'fa-microphone',
        decoration: 'fa-paint-brush',
        security: 'fa-shield-alt',
        entertainment: 'fa-music'
    };
    return icons[type] || 'fa-handshake';
}

function formatVendorType(type) {
    const types = {
        catering: 'Catering Services',
        photography: 'Photography',
        audio: 'Audio/Visual',
        decoration: 'Decoration',
        security: 'Security',
        entertainment: 'Entertainment'
    };
    return types[type] || type;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

function formatDateTime(dateString) {
    return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
}

function calculateRevenue(event) {
    return event.tickets.reduce((sum, ticket) => sum + (ticket.price * ticket.sold), 0).toFixed(2);
}

function shareEvent(eventId) {
    const event = state.events.find(e => e.id === eventId);
    if (!event) return;
    
    const shareText = `Check out this event: ${event.title}`;
    
    if (navigator.share) {
        navigator.share({
            title: event.title,
            text: shareText,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(`${shareText} - ${window.location.href}`);
        showNotification('success', 'Event link copied to clipboard!');
    }
}

function downloadTicket(bookingId) {
    showNotification('success', 'Ticket downloaded successfully!');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        state.bookings = state.bookings.filter(b => b.id !== bookingId);
        displayBookings();
        showNotification('success', 'Booking cancelled successfully');
    }
}

function editEvent(eventId) {
    showNotification('info', 'Event editing feature coming soon!');
}

function deleteEvent(eventId) {
    if (confirm('Are you sure you want to delete this event?')) {
        state.events = state.events.filter(e => e.id !== eventId);
        displayEvents(state.events);
        displayDashboard();
        showNotification('success', 'Event deleted successfully');
    }
}

// Check for upcoming reminders every minute
setInterval(() => {
    const now = new Date();
    state.reminders.forEach(reminder => {
        const reminderDate = new Date(reminder.dateTime);
        if (reminderDate <= now) {
            showNotification('info', reminder.message);
            addNotification('info', 'Event Reminder', reminder.message);
        }
    });
}, 60000);

