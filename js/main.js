document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. MOBILE NAVIGATION & SCROLL BLUR
    // ==========================================
    const navbar = document.querySelector('.navbar');
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    // Scroll effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile nav toggle
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-xmark');
            }
        });

        // Close menu when clicking link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                const icon = navToggle.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bars');
                    icon.classList.remove('fa-xmark');
                }
            });
        });
    }


    // ==========================================
    // 2. TRACTOR EARNINGS & MARGIN CALCULATOR
    // ==========================================
    const rateInput = document.getElementById('calc-rate');
    const hoursInput = document.getElementById('calc-hours');
    const fuelInput = document.getElementById('calc-fuel');

    const rateVal = document.getElementById('calc-rate-val');
    const hoursVal = document.getElementById('calc-hours-val');
    const fuelVal = document.getElementById('calc-fuel-val');

    const grossOutput = document.getElementById('res-gross');
    const fuelOutput = document.getElementById('res-fuel');
    const netOutput = document.getElementById('res-net');
    const marginCircle = document.getElementById('progress-ring-circle');
    const marginText = document.getElementById('margin-percentage');

    function calculateProfit() {
        if (!rateInput || !hoursInput || !fuelInput) return;

        const rate = parseFloat(rateInput.value);
        const hours = parseFloat(hoursInput.value);
        const fuelRate = parseFloat(fuelInput.value);

        // Update Slider Text Value labels
        rateVal.textContent = `$${rate}`;
        hoursVal.textContent = `${hours} hrs`;
        fuelVal.textContent = `$${fuelRate}/hr`;

        // Calculate metrics
        // Gross earnings = rate per hour * hours
        const grossEarnings = rate * hours;
        // Fuel cost = fuel cost rate per hour * hours
        const fuelCost = fuelRate * hours;
        // Net profit = gross earnings - fuel cost
        const netProfit = Math.max(0, grossEarnings - fuelCost);
        // Margin % = (net profit / gross earnings) * 100
        const profitMargin = grossEarnings > 0 ? Math.round((netProfit / grossEarnings) * 100) : 0;

        // Render Outputs with beautiful formatting
        grossOutput.textContent = `$${grossEarnings.toLocaleString()}`;
        fuelOutput.textContent = `$${fuelCost.toLocaleString()}`;
        netOutput.textContent = `$${netProfit.toLocaleString()}`;

        // Radial Progress Ring Animation
        // Ring Circumference = 2 * PI * R = 2 * 3.14159 * 36 = ~226
        const circumference = 226;
        const offset = circumference - (profitMargin / 100) * circumference;
        if (marginCircle) {
            marginCircle.style.strokeDashoffset = offset;
        }
        if (marginText) {
            marginText.textContent = `${profitMargin}%`;
        }
    }

    // Attach Calculator Event Listeners
    if (rateInput && hoursInput && fuelInput) {
        [rateInput, hoursInput, fuelInput].forEach(slider => {
            slider.addEventListener('input', calculateProfit);
        });
        // Initial run
        calculateProfit();
    }


    // ==========================================
    // 3. LIVE OFFLINE SYNC SIMULATION
    // ==========================================
    const connToggleBtn = document.getElementById('btn-connection');
    const statusText = document.getElementById('status-text');
    const statusDot = document.getElementById('status-dot');
    
    const addSession1 = document.getElementById('btn-add-session-1');
    const addSession2 = document.getElementById('btn-add-session-2');
    
    const queueList = document.getElementById('queue-list');
    const queueBadge = document.getElementById('queue-count');
    const queueEmptyMsg = document.getElementById('queue-empty');

    let isOnline = true;
    let queueItems = [];
    let itemIdCounter = 1;

    function updateSyncUI() {
        if (!queueBadge || !queueList) return;

        // Count pending
        const pendingCount = queueItems.filter(item => item.status === 'Pending').length;
        queueBadge.textContent = pendingCount;

        // Toggle Empty Message
        if (queueItems.length === 0) {
            queueEmptyMsg.style.display = 'block';
        } else {
            queueEmptyMsg.style.display = 'none';
        }

        // Render logs list
        queueList.innerHTML = '';
        if (queueItems.length === 0) {
            queueList.appendChild(queueEmptyMsg);
        } else {
            // Render items in reverse order (newest first)
            [...queueItems].reverse().forEach(item => {
                const itemEl = document.createElement('div');
                itemEl.className = `queue-item ${item.status === 'Synced' ? 'synced' : ''}`;
                itemEl.innerHTML = `
                    <div class="queue-item-details">
                        <span class="queue-item-title">${item.title}</span>
                        <span class="queue-item-meta">${item.meta}</span>
                    </div>
                    <span class="queue-item-status ${item.status === 'Synced' ? 'synced' : 'pending'}">
                        ${item.status === 'Synced' ? '✓ Synced' : '⚡ Pending'}
                    </span>
                `;
                queueList.appendChild(itemEl);
            });
        }
    }

    function addWorkLog(title, meta) {
        const item = {
            id: itemIdCounter++,
            title: title,
            meta: meta,
            status: isOnline ? 'Synced' : 'Pending'
        };

        queueItems.push(item);
        updateSyncUI();

        // If online, trigger a small highlight sync flash, then auto-cleanup success logs after 4s
        if (isOnline) {
            setTimeout(() => {
                // Keep only the last 4 synced logs to avoid cluttering screen
                if (queueItems.length > 5) {
                    queueItems.shift();
                    updateSyncUI();
                }
            }, 4000);
        }
    }

    function flushQueue() {
        const pendingItems = queueItems.filter(item => item.status === 'Pending');
        if (pendingItems.length === 0) return;

        let index = 0;
        
        function syncNext() {
            if (index < pendingItems.length) {
                const item = pendingItems[index];
                item.status = 'Synced';
                updateSyncUI();
                index++;
                setTimeout(syncNext, 550); // Beautiful fluid sync animation interval
            } else {
                // After fully synchronized, schedule a cleanup
                setTimeout(() => {
                    if (isOnline) {
                        queueItems = queueItems.slice(-4); // Keep last 4 logs
                        updateSyncUI();
                    }
                }, 3500);
            }
        }
        
        syncNext();
    }

    // Listeners for Offline simulator toggles
    if (connToggleBtn) {
        connToggleBtn.addEventListener('click', () => {
            isOnline = !isOnline;

            if (isOnline) {
                // Online State
                statusText.textContent = 'ONLINE MODE';
                statusDot.className = 'status-indicator';
                connToggleBtn.innerHTML = '🔌 Switch to Offline';
                flushQueue();
            } else {
                // Offline State
                statusText.textContent = 'OFFLINE MODE (No Cell Signal)';
                statusDot.className = 'status-indicator offline';
                connToggleBtn.innerHTML = '📶 Restore Connection';
            }
        });
    }

    // Work Session Add Triggers
    if (addSession1) {
        addSession1.addEventListener('click', () => {
            addWorkLog('Tillage Session logged', 'Client: David Miller | 4.5 Acres | rate: $45/Acre');
        });
    }

    if (addSession2) {
        addSession2.addEventListener('click', () => {
            addWorkLog('Harvester Session logged', 'Client: Sarah Higgins | 3.2 Hours | rate: $110/hr');
        });
    }


    // ==========================================
    // 4. CONTACT / REGISTRATION FORM HANDLER
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            // Visual loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending demo link...';
            
            setTimeout(() => {
                submitBtn.innerHTML = '✓ Check your inbox!';
                submitBtn.style.background = 'linear-gradient(135deg, hsl(150, 84%, 35%) 0%, hsl(170, 95%, 30%) 100%)';
                
                // Form reset
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalText;
                    submitBtn.style.background = '';
                }, 4000);
            }, 1800);
        });
    }
});
