// ─────────────────────────────────────────────────────────────────────────────
//  CigLog  —  Cigarette Logger
// ─────────────────────────────────────────────────────────────────────────────

const TRIGGERS = [
    // Physiological
    { id: 'morning',   label: 'Morning',    icon: 'fa-solid fa-toilet-paper',             group: 'physiological' },
    { id: 'aftermeal', label: 'After Meal', icon: 'fa-solid fa-utensils',                 group: 'physiological' },
    { id: 'coffee',    label: 'Coffee/Tea', icon: 'fa-solid fa-mug-hot',                  group: 'physiological' },
    { id: 'alcohol',   label: 'Alcohol',    icon: 'fa-solid fa-wine-glass',               group: 'physiological' },
    { id: 'tired',     label: 'Tired',      icon: 'fa-solid fa-bed',                      group: 'physiological' },
    { id: 'hunger',    label: 'Hunger',     icon: 'fa-solid fa-burger',                   group: 'physiological' },
    // Psychological
    { id: 'stress',    label: 'Stress',     icon: 'fa-solid fa-brain',                    group: 'psychological' },
    { id: 'anxiety',   label: 'Anxiety',    icon: 'fa-solid fa-heart-pulse',              group: 'psychological' },
    { id: 'boredom',   label: 'Boredom',    icon: 'fa-regular fa-face-meh',               group: 'psychological' },
    { id: 'lonely',    label: 'Lonely',     icon: 'fa-solid fa-person',                   group: 'psychological' },
    { id: 'angry',     label: 'Angry',      icon: 'fa-regular fa-face-angry',             group: 'psychological' },
    { id: 'sad',       label: 'Sad',        icon: 'fa-regular fa-face-sad-tear',          group: 'psychological' },
    { id: 'restless',  label: 'Restless',   icon: 'fa-solid fa-person-running',           group: 'psychological' },
    // Social
    { id: 'withsmokers', label: 'Smokers',  icon: 'fa-solid fa-people-group',            group: 'social' },
    { id: 'gathering',   label: 'Gathering',icon: 'fa-solid fa-champagne-glasses',        group: 'social' },
    { id: 'pressure',    label: 'Pressure', icon: 'fa-solid fa-hand-point-right',         group: 'social' },
    // Situational
    { id: 'work',      label: 'Work',       icon: 'fa-solid fa-briefcase',               group: 'situational' },
    { id: 'workbreak', label: 'Work Break', icon: 'fa-solid fa-business-time',           group: 'situational' },
    { id: 'driving',   label: 'Driving',    icon: 'fa-solid fa-car',                     group: 'situational' },
    { id: 'commuting', label: 'Commuting',  icon: 'fa-solid fa-bus',                     group: 'situational' },
    { id: 'waiting',   label: 'Waiting',    icon: 'fa-regular fa-clock',                 group: 'situational' },
    { id: 'exercise',  label: 'Exercise',   icon: 'fa-solid fa-dumbbell',                group: 'situational' },
    { id: 'relaxing',  label: 'Relaxing',   icon: 'fa-solid fa-couch',                   group: 'situational' },
    { id: 'phonecall', label: 'Phone Call', icon: 'fa-solid fa-phone',                   group: 'situational' },
    { id: 'afterwork', label: 'After Work', icon: 'fa-solid fa-building-circle-arrow-right', group: 'situational' },
    { id: 'outdoor',   label: 'Outdoors',   icon: 'fa-solid fa-tree',                    group: 'situational' },
];

const TRIGGER_GROUPS = [
    { key: 'physiological', label: 'Physiological' },
    { key: 'psychological', label: 'Psychological' },
    { key: 'social',        label: 'Social'        },
    { key: 'situational',   label: 'Situational'   },
];

class CigLogTracker {

    // ── Initialisation ────────────────────────────────────────────────────────

    constructor() {
        this.settings    = JSON.parse(localStorage.getItem('ciglog_v1_settings')) || null;
        this.entries     = JSON.parse(localStorage.getItem('ciglog_v1_entries'))  || [];
        this.activeDate  = null;   // date string currently open in any modal
        this.chart       = null;
        this._confirmCb  = null;
        this._toastTimer = null;

        this._cacheElements();
        this._bindListeners();
        this._populateTimezones();
        this._boot();
    }

    _cacheElements() {
        const $ = id => document.getElementById(id);

        // Layout
        this.entriesTable = $('entriesTable');
        this.sideMenu     = $('sideMenu');
        this.menuOverlay  = $('menuOverlay');

        // Modals
        this.modals = {
            settings:    $('settingsModal'),
            createToday: $('createTodayModal'),
            addCraving:  $('addCravingModal'),
            addSmoke:    $('addSmokeModal'),
            info:        $('infoModal'),
            editDay:     $('editDayModal'),
            chart:       $('chartModal'),
            about:       $('aboutModal'),
            readme:      $('readmeModal'),
            import:      $('importModal'),
            confirm:     $('confirmModal'),
            reset:       $('resetModal'),
            skippedDay:  $('skippedDayModal'),
        };

        // Settings close button (hidden on first run)
        this.closeSettingsBtn = $('closeSettings');

        // Settings form
        this.settingsTitle    = $('settingsTitle');
        this.currencyInput    = $('currency');
        this.priceInput       = $('cigarettePrice');
        this.timezoneInput    = $('timezone');
        this.currencySymbol   = $('currencySymbol');
        this.customTriggerToggle  = $('customTriggerToggle');
        this.customTriggerSection = $('customTriggerSection');
        this.customTriggerGroup   = $('customTriggerGroup');
        this.exportImportGroup    = $('exportImportGroup');
        this.csvFileSettings      = $('csvFileSettings');
        this.csvFileFirstRun      = $('csvFileFirstRun');

        // Create-today modal
        this.createTodayTitle = $('createTodayTitle');

        // Add-craving modal
        this.cravingTitle      = $('cravingTitle');
        this.smartTimeDefaults = $('smartTimeDefaults');
        this.cravingHH         = $('cravingHH');
        this.cravingMM         = $('cravingMM');
        this.saveCravingBtn    = $('saveCraving');

        // Add-smoke modal
        this.smokeTitle        = $('smokeTitle');
        this.smokeTimeDefaults = $('smokeTimeDefaults');
        this.smokeHH           = $('smokeHH');
        this.smokeMM           = $('smokeMM');
        this.cigaretteCount    = $('cigaretteCount');
        this.saveSmokeBtn      = $('saveSmoke');

        // Info/timeline modal
        this.infoTitle       = $('infoTitle');
        this.timelineContent = $('timelineContent');
        this.dayNotes        = $('dayNotes');

        // Edit-day modal
        this.editDayTitle    = $('editDayTitle');
        this.cravingsList    = $('cravingsList');
        this.smokedList      = $('smokedList');
        this.deleteCravingsBtn = $('deleteSelectedCravings');
        this.deleteSmokedBtn   = $('deleteSelectedSmoked');

        // Chart
        this.timeRange    = $('timeRange');
        this.statSmoked   = $('totalSmoked');
        this.statCravings = $('totalCravings');
        this.statMoney    = $('moneySpent');
        this.statLifeLost = $('lifeLost');
        this.charts       = { smoked: null, cravings: null, intensity: null, lifelost: null };
        this.activeTab    = 'smoked';

        // Trigger sections
        this.cravingTriggerToggle  = $('cravingTriggerToggle');
        this.cravingTriggerSection = $('cravingTriggerSection');
        this.smokeTriggerToggle    = $('smokeTriggerToggle');
        this.smokeTriggerSection   = $('smokeTriggerSection');
        this._activeTriggerPopover = null;

        // Import
        this.csvFile = $('csvFile');

        // Toast & confirm
        this.toast          = $('toastNotification');
        this.confirmTitle   = $('confirmTitle');
        this.confirmMessage = $('confirmMessage');
        this.confirmOk      = $('confirmOk');
        this.confirmCancel  = $('confirmCancel');

        // Last-smoked timer
        this.timerEl   = $('lastSmokedTimer');
        this.popoverEl = $('timerPopover');
        this._timerInterval = null;
    }

    _bindListeners() {
        // Menu
        document.getElementById('menuToggle').addEventListener('click', () => this._openMenu());
        document.getElementById('closeMenu').addEventListener('click',  () => this._closeMenu());
        this.menuOverlay.addEventListener('click', () => this._closeMenu());

        // Menu items
        document.getElementById('chartBtn').addEventListener('click',
            () => { this._closeMenu(); this._openModal('chart'); setTimeout(() => this._renderActiveTab(), 100); });
        document.getElementById('settingsMenuBtn').addEventListener('click',
            () => this._openSettings());
        document.getElementById('aboutBtn').addEventListener('click',
            () => { this._closeMenu(); this._openModal('about'); });
        document.getElementById('readmeBtn').addEventListener('click',
            () => { this._closeMenu(); this._openReadme(); });
        document.getElementById('resetBtn').addEventListener('click',
            () => { this._closeMenu(); this._openModal('reset'); });

        // Settings close button
        document.getElementById('closeSettings').addEventListener('click',
            () => this._closeModal('settings'));

        // Settings
        this.currencyInput.addEventListener('change',
            () => { this.currencySymbol.textContent = this.currencyInput.value; });
        document.getElementById('saveSettings').addEventListener('click',
            () => this._saveSettings());

        // Custom trigger toggle in settings
        document.getElementById('customTriggerToggle').addEventListener('click',
            () => this.customTriggerSection.classList.toggle('open'));

        // Export/Import in settings
        document.getElementById('exportSettingsBtn').addEventListener('click',
            () => this._exportCSV());
        document.getElementById('importSettingsBtn').addEventListener('click',
            () => this.csvFileSettings.click());
        this.csvFileSettings.addEventListener('change',
            () => this._importCSV('settings'));

        // Create-today modal
        document.getElementById('createTodayYes').addEventListener('click',
            () => this._createTodayEntry());
        document.getElementById('createTodayLoad').addEventListener('click',
            () => this.csvFileFirstRun.click());
        this.csvFileFirstRun.addEventListener('change',
            () => this._importCSV('firstrun'));

        // Skipped day modal
        document.getElementById('skippedAddEntries').addEventListener('click', () => {
            const date = this._skippedDayDate;
            this._closeModal('skippedDay');
            this._openEditDay(date);
        });
        document.getElementById('skippedMarkClean').addEventListener('click', () => {
            const idx = this._getEntryIdx(this._skippedDayDate);
            if (idx !== -1) {
                this.entries[idx].skipped = false;
                this.entries[idx].clean   = true;
                this._persist('entries');
            }
            this._closeModal('skippedDay');
            this._renderTable();
        });
        document.getElementById('skippedDismiss').addEventListener('click', () => {
            this._closeModal('skippedDay');
        });

        // Trigger toggles
        document.getElementById('cravingTriggerToggle').addEventListener('click', () => {
            this.cravingTriggerSection.classList.toggle('open');
        });
        document.getElementById('smokeTriggerToggle').addEventListener('click', () => {
            this.smokeTriggerSection.classList.toggle('open');
        });

        // Add-craving modal
        document.querySelector('.close-craving').addEventListener('click',
            () => this._closeModal('addCraving'));
        this.saveCravingBtn.addEventListener('click', () => this._saveCraving());
        this._bindTimeInputs(this.cravingHH, this.cravingMM,
            () => this._updateSaveBtn('craving'));

        // Intensity buttons (static in HTML — bind once)
        document.querySelectorAll('.intensity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this._updateSaveBtn('craving');
            });
        });

        // Add-smoke modal
        document.querySelector('.close-smoke').addEventListener('click',
            () => this._closeModal('addSmoke'));
        this.saveSmokeBtn.addEventListener('click', () => this._saveSmoke());
        this._bindTimeInputs(this.smokeHH, this.smokeMM,
            () => this._updateSaveBtn('smoke'));
        this.cigaretteCount.addEventListener('input', () => {
            const v = parseInt(this.cigaretteCount.value);
            if (!isNaN(v) && v < 1) this.cigaretteCount.value = 1;
            this._updateSaveBtn('smoke');
        });

        // Info modal
        document.querySelector('.close-info').addEventListener('click',
            () => this._closeModal('info'));
        document.getElementById('saveNotes').addEventListener('click',
            () => this._saveNotes());

        // Edit-day modal
        document.querySelector('.close-edit').addEventListener('click',
            () => this._closeModal('editDay'));
        document.getElementById('cancelEditDay').addEventListener('click',
            () => this._closeModal('editDay'));
        document.getElementById('addCravingEdit').addEventListener('click',
            () => this._addEmptyCravingRow());
        document.getElementById('addSmokeEdit').addEventListener('click',
            () => this._addEmptySmokeRow());
        this.deleteCravingsBtn.addEventListener('click',
            () => this._deleteSelected('craving'));
        this.deleteSmokedBtn.addEventListener('click',
            () => this._deleteSelected('smoke'));
        document.getElementById('saveEditDay').addEventListener('click',
            () => this._saveEditDay());

        // Chart controls
        this.timeRange.addEventListener('change', () => this._renderActiveTab());
        document.querySelectorAll('.chart-tab').forEach(tab => {
            tab.addEventListener('click', () => this._switchTab(tab.dataset.tab));
        });

        // Chart / About / Readme / Import close buttons
        document.querySelector('.close-chart').addEventListener('click',  () => this._closeChart());
        document.querySelector('.close-about').addEventListener('click',  () => this._closeModal('about'));
        document.querySelector('.close-readme').addEventListener('click', () => this._closeModal('readme'));
        document.querySelector('.close-import').addEventListener('click', () => this._closeModal('import'));
        document.getElementById('confirmImport').addEventListener('click', () => this._importCSV());

        // Confirm modal
        this.confirmOk.addEventListener('click', () => {
            if (this._confirmCb) this._confirmCb();
            this._closeModal('confirm');
        });
        this.confirmCancel.addEventListener('click', () => this._closeModal('confirm'));

        // Reset modal
        document.querySelector('.close-reset').addEventListener('click',  () => this._closeModal('reset'));
        document.getElementById('cancelReset').addEventListener('click',  () => this._closeModal('reset'));
        document.getElementById('confirmReset').addEventListener('click', () => this._doReset());

        // Backdrop clicks
        window.addEventListener('click', (e) => {
            // Modals that must not close on backdrop: settings, createToday, confirm, reset
            const locked = ['settings', 'createToday', 'confirm', 'reset', 'skippedDay'];
            for (const [key, modal] of Object.entries(this.modals)) {
                if (e.target === modal && !locked.includes(key)) {
                    if (key === 'chart') this._closeChart();
                    else                 this._closeModal(key);
                    break;
                }
            }
        });

        // Header cell tooltips — tap to show on touch devices
        this._tooltipTimer = null;
        document.querySelectorAll('.header-cell').forEach(cell => {
            cell.addEventListener('touchstart', (e) => {
                e.preventDefault();
                document.querySelectorAll('.header-cell').forEach(c => c.classList.remove('tooltip-visible'));
                clearTimeout(this._tooltipTimer);
                cell.classList.add('tooltip-visible');
                this._tooltipTimer = setTimeout(() => cell.classList.remove('tooltip-visible'), 1500);
            }, { passive: false });
        });
        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.header-cell')) {
                document.querySelectorAll('.header-cell').forEach(c => c.classList.remove('tooltip-visible'));
                clearTimeout(this._tooltipTimer);
            }
        }, { passive: true });
    }

    // ── Boot / setup flow ─────────────────────────────────────────────────────

    _boot() {
        if (!this.settings) {
            this._openSettings();
        } else {
            this._backfillSkippedDays();
            this._ensureTodayExists();
            this._renderTable();
            this._startTimer();
        }
    }

    _populateTimezones() {
        const zones = [
            'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles',
            'Europe/London', 'Europe/Paris',    'Asia/Tokyo',
            'Australia/Sydney', 'Asia/Singapore', 'Asia/Dubai',
            'America/Chicago',  'America/Toronto', 'Europe/Berlin',
        ];
        zones.forEach(tz => {
            const opt = document.createElement('option');
            opt.value = opt.textContent = tz;
            this.timezoneInput.appendChild(opt);
        });
        this.timezoneInput.value = 'Asia/Kolkata';
    }

    _saveSettings() {
        const currency = this.currencyInput.value;
        const price    = parseFloat(this.priceInput.value);
        const timezone = this.timezoneInput.value;

        if (!currency || isNaN(price) || price < 0.1 || !timezone) {
            this._toast('Please fill all fields correctly.');
            return;
        }

        if (!this.settings) {
            // First-time setup
            this.settings = { currency, cigarettePrice: price, timezone,
                setupDate: new Date().toISOString(), customTriggers: [] };
            this._persist('settings');
            this.currencyInput.disabled = false;
            this.timezoneInput.disabled = false;
            this._closeModal('settings');
            this.createTodayTitle.textContent = `Get started!`;
            this._openModal('createToday');
        } else {
            // Update price + custom triggers
            this.settings.cigarettePrice = price;
            const custom = [
                (document.getElementById('customTrigger0')?.value || '').trim(),
                (document.getElementById('customTrigger1')?.value || '').trim(),
                (document.getElementById('customTrigger2')?.value || '').trim(),
            ].filter(t => t.length > 0);
            this.settings.customTriggers = custom;
            this._persist('settings');
            this._toast('Settings saved ✓');
            this._closeModal('settings');
        }
    }

    _openSettings() {
        this._closeMenu();
        if (this.settings) {
            this.currencyInput.value    = this.settings.currency;
            this.priceInput.value       = this.settings.cigarettePrice;
            this.timezoneInput.value    = this.settings.timezone;
            this.currencySymbol.textContent = this.settings.currency;
            this.currencyInput.disabled = true;
            this.timezoneInput.disabled = true;
            this.priceInput.disabled    = false;
            this.settingsTitle.textContent = 'Settings';
            document.getElementById('saveSettings').innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save';
            this.closeSettingsBtn.style.display = 'block';
            // Show custom triggers + export/import sections
            this.customTriggerGroup.style.display  = 'flex';
            this.exportImportGroup.style.display   = 'flex';
            this.customTriggerSection.classList.remove('open');
            // Populate custom trigger inputs
            const custom = this.settings.customTriggers || [];
            const $ = id => document.getElementById(id);
            $('customTrigger0').value = custom[0] || '';
            $('customTrigger1').value = custom[1] || '';
            $('customTrigger2').value = custom[2] || '';
        } else {
            // First run — hide custom/export sections
            this.customTriggerGroup.style.display = 'none';
            this.exportImportGroup.style.display  = 'none';
            document.getElementById('saveSettings').innerHTML = '<i class="fa-solid fa-play"></i> Start Tracking';
            this.closeSettingsBtn.style.display = 'none';
        }
        this._openModal('settings');
    }

    // ── Date utilities ────────────────────────────────────────────────────────

    _today() {
        const tz    = this.settings?.timezone ?? 'Asia/Kolkata';
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz, day: '2-digit', month: '2-digit', year: '2-digit'
        }).formatToParts(new Date());
        const d = parts.find(p => p.type === 'day').value;
        const m = parts.find(p => p.type === 'month').value;
        const y = parts.find(p => p.type === 'year').value;
        return `${d}-${m}-${y}`;
    }

    // "dd-mm-yy" → JS Date
    _toDate(str) {
        const [d, m, y] = str.split('-').map(Number);
        return new Date(2000 + y, m - 1, d);
    }

    // Sort descending (newest first)
    _byDateDesc(a, b) { return this._toDate(b.date) - this._toDate(a.date); }

    // Sort ascending (earliest time first) for timeline & sorting within a day
    _byTimeAsc(a, b) {
        const [hA, mA] = a.time.split(':').map(Number);
        const [hB, mB] = b.time.split(':').map(Number);
        return (hA * 60 + mA) - (hB * 60 + mB);
    }

    // ── Entry helpers ─────────────────────────────────────────────────────────

    _blankEntry(date, skipped = false) {
        return { date, cravings: [], smoked: [], notes: '', skipped, clean: false };
    }

    _getEntry(date) {
        return this.entries.find(e => e.date === date);
    }

    _getEntryIdx(date) {
        return this.entries.findIndex(e => e.date === date);
    }

    // Auto-create entries for any days skipped in the past 30 days
    _backfillSkippedDays() {
        const today   = this._today();
        const todayDt = this._toDate(today);
        const added   = [];

        for (let i = 1; i <= 30; i++) {
            const dt = new Date(todayDt);
            dt.setDate(dt.getDate() - i);
            const d = String(dt.getDate()).padStart(2, '0');
            const m = String(dt.getMonth() + 1).padStart(2, '0');
            const y = String(dt.getFullYear() - 2000).padStart(2, '0');
            const dateStr = `${d}-${m}-${y}`;

            // Only backfill if we have at least one entry older than this date
            // (i.e. the user has been using the app long enough)
            const hasOlderEntry = this.entries.some(e =>
                this._toDate(e.date) <= this._toDate(dateStr)
            );
            if (!hasOlderEntry) break;

            if (!this.entries.some(e => e.date === dateStr)) {
                added.push(this._blankEntry(dateStr, true));
            }
        }

        if (added.length) {
            this.entries.push(...added);
            this._persist('entries');
        }
    }

    _openSkippedDay(date) {
        this._skippedDayDate = date;
        document.getElementById('skippedDayMessage').textContent =
            `No data was logged for ${date}. You can add entries or dismiss to keep it as a clean day.`;
        this._openModal('skippedDay');
    }

    _ensureTodayExists() {
        const today = this._today();
        if (!this.entries.some(e => e.date === today)) {
            this.entries.push(this._blankEntry(today));
            this._persist('entries');
        }
    }

    _createTodayEntry() {
        this._closeModal('createToday');
        this._ensureTodayExists();
        this._renderTable();
        this._startTimer();
    }

    addPreviousDay() {
        if (!this.entries.length) return;

        // Find oldest entry
        const oldest = this.entries.reduce((acc, e) =>
            this._toDate(e.date) < this._toDate(acc.date) ? e : acc
        );

        const prev = new Date(this._toDate(oldest.date));
        prev.setDate(prev.getDate() - 1);
        const prevDate = [
            String(prev.getDate()).padStart(2, '0'),
            String(prev.getMonth() + 1).padStart(2, '0'),
            String(prev.getFullYear() - 2000).padStart(2, '0'),
        ].join('-');

        if (this.entries.some(e => e.date === prevDate)) {
            this._toast('Entry for that day already exists!');
            return;
        }

        this.entries.push(this._blankEntry(prevDate));
        this._persist('entries');
        this._renderTable();
    }

    // ── Trigger helpers ───────────────────────────────────────────────────────

    _computeFrequentTriggers() {
        const counts = {};
        this.entries.forEach(entry => {
            [...entry.cravings, ...entry.smoked].forEach(ev => {
                (ev.triggers || []).forEach(id => {
                    counts[id] = (counts[id] || 0) + 1;
                });
            });
        });
        return Object.entries(counts)
            .filter(([, c]) => c >= 3)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6)
            .map(([id]) => id);
    }

    _buildTriggerChips(container, selectedIds = []) {
        container.innerHTML = '';
        const frequent = this._computeFrequentTriggers();
        const custom   = (this.settings.customTriggers || []).filter(t => t && t.trim());

        // Frequent section
        if (frequent.length) {
            const freqLabel = document.createElement('div');
            freqLabel.className = 'trigger-group-label';
            freqLabel.textContent = 'Frequent';
            const freqGrid = document.createElement('div');
            freqGrid.className = 'trigger-chip-grid';
            frequent.forEach(id => {
                const t = TRIGGERS.find(t => t.id === id)
                    || (custom.findIndex(c => c === id) !== -1 ? { id, label: id, icon: 'fa-solid fa-tag' } : null);
                if (t) freqGrid.appendChild(this._makeChip(t, selectedIds.includes(t.id)));
            });
            container.appendChild(freqLabel);
            container.appendChild(freqGrid);
        }

        // Custom section
        if (custom.length) {
            const custLabel = document.createElement('div');
            custLabel.className = 'trigger-group-label';
            custLabel.textContent = 'Custom';
            const custGrid = document.createElement('div');
            custGrid.className = 'trigger-chip-grid';
            custom.forEach((label, i) => {
                const t = { id: `custom_${i}`, label, icon: 'fa-solid fa-tag' };
                custGrid.appendChild(this._makeChip(t, selectedIds.includes(t.id)));
            });
            container.appendChild(custLabel);
            container.appendChild(custGrid);
        }

        // Preset groups
        TRIGGER_GROUPS.forEach(group => {
            const triggers = TRIGGERS.filter(t => t.group === group.key);
            const label = document.createElement('div');
            label.className = 'trigger-group-label';
            label.textContent = group.label;
            const grid = document.createElement('div');
            grid.className = 'trigger-chip-grid';
            triggers.forEach(t => {
                grid.appendChild(this._makeChip(t, selectedIds.includes(t.id)));
            });
            container.appendChild(label);
            container.appendChild(grid);
        });
    }

    _makeChip(trigger, selected = false) {
        const chip = document.createElement('button');
        chip.className = `trigger-chip${selected ? ' selected' : ''}`;
        chip.dataset.triggerId = trigger.id;
        chip.innerHTML = `<i class="${trigger.icon}"></i><span>${trigger.label}</span>`;
        chip.addEventListener('click', () => chip.classList.toggle('selected'));
        return chip;
    }

    _getSelectedTriggers(container) {
        return [...container.querySelectorAll('.trigger-chip.selected')]
            .map(c => c.dataset.triggerId);
    }

    // ── Table rendering ───────────────────────────────────────────────────────

    // ── MLL formatters ────────────────────────────────────────────────────────

    // For stats bar / tooltip: two largest units
    _fmtMLL(mins) {
        if (mins < 60)      return `${mins}m`;
        if (mins < 1440)  { const h = Math.floor(mins/60),  m = mins%60;        return `${h}h${m ? ' '+m+'m' : ''}`; }
        if (mins < 10080) { const d = Math.floor(mins/1440), h = Math.floor((mins%1440)/60); return `${d}d${h ? ' '+h+'h' : ''}`; }
        if (mins < 43200) { const w = Math.floor(mins/10080), d = Math.floor((mins%10080)/1440); return `${w}wk${d ? ' '+d+'d' : ''}`; }
        if (mins < 525600){ const mo = Math.floor(mins/43200), w = Math.floor((mins%43200)/10080); return `${mo}mo${w ? ' '+w+'wk' : ''}`; }
        const yr = Math.floor(mins/525600), mo = Math.floor((mins%525600)/43200);
        return `${yr}yr${mo ? ' '+mo+'mo' : ''}`;
    }

    // For table row: smart format, no leading zeros, two-line only when both h and m exist
    _fmtMLLRow(mins) {
        if (mins === 0) return '0m';
        if (mins < 60)  return `${mins}m`;
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return m ? `${h}h<br>${m}m` : `${h}h`;
    }

    _renderTable() {
        this.entriesTable.innerHTML = '';

        if (!this.entries.length) {
            this.entriesTable.innerHTML = '<div class="empty-state"><p>No entries yet.</p></div>';
            return;
        }

        this.entries.sort((a, b) => this._byDateDesc(a, b));

        this.entries.forEach(entry => {
            const [day, month, year] = entry.date.split('-');
            const cravCount  = entry.cravings.length;
            const smokeCount = entry.smoked.reduce((s, x) => s + x.count, 0);
            const money      = entry.smoked.reduce((s, x) =>
                s + x.count * (x.pricePerCigarette ?? this.settings.cigarettePrice), 0);
            const mllMins    = smokeCount * 20;

            // Format money: smart decimals, no currency symbol
            const moneyFmt = parseFloat(money.toFixed(2)).toString();
            const moneyHtml = moneyFmt;

            const isSkipped = entry.skipped && !entry.clean &&
                              !entry.cravings.length && !entry.smoked.length;

            const row = document.createElement('div');
            row.className = `entry-row${isSkipped ? ' entry-skipped' : ''}`;

            const infoBtn = isSkipped
                ? `<button class="info-btn skipped-btn" data-date="${entry.date}"><i class="fa-solid fa-triangle-exclamation"></i></button>`
                : `<button class="info-btn" data-date="${entry.date}"><i class="fa-solid fa-angle-down"></i></button>`;

            row.innerHTML = `
                <div class="entry-cell date-cell">
                    <div class="date-day">${day}</div>
                    <div class="date-month">${month}</div>
                    <div class="date-year">${year}</div>
                </div>
                <div class="entry-cell clickable-cell ${cravCount  ? 'value-positive' : 'value-zero'}"
                     data-date="${entry.date}" data-type="craving">${cravCount}</div>
                <div class="entry-cell clickable-cell ${smokeCount ? 'value-positive' : 'value-zero'}"
                     data-date="${entry.date}" data-type="smoke">${smokeCount}</div>
                <div class="entry-cell ${smokeCount ? 'value-positive' : 'value-zero'}">${moneyHtml}</div>
                <div class="entry-cell ${mllMins ? 'value-positive' : 'value-zero'}">${this._fmtMLLRow(mllMins)}</div>
                <div class="entry-cell">${infoBtn}</div>
                <div class="entry-cell">
                    <button class="edit-btn" data-date="${entry.date}"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                </div>`;
            this.entriesTable.appendChild(row);
        });

        // "Add previous day" row
        const addRow = document.createElement('div');
        addRow.className = 'add-previous-row';
        addRow.innerHTML = `
            <div class="add-previous-content">
                <button class="add-previous-btn"><i class="fas fa-plus-circle"></i></button>
                <span class="add-previous-text">Add entry for previous day</span>
            </div>`;
        addRow.querySelector('.add-previous-btn').addEventListener('click', () => this.addPreviousDay());
        this.entriesTable.appendChild(addRow);

        // Help text
        const help = document.createElement('div');
        help.className = 'help-row';
        help.innerHTML = `
            <p>• Tap <i class="fa-solid fa-face-tired"></i> or <i class="fa-solid fa-smoking"></i> in a row to log a craving or cigarette</p>
            <p>• Tap <i class="fa-solid fa-angle-down"></i> to view the day's timeline &amp; notes</p>
            <p>• Tap <i class="fa-solid fa-ellipsis-vertical"></i> to edit or delete entries</p>
            <p>• Tap <i class="fa-solid fa-triangle-exclamation"></i> on skipped days for more actions</p>
            <p style="margin-top:18px;"><i class="fa-solid fa-road-barrier" style="color:var(--yellow);font-size:1.3rem;"></i></p>`;
        this.entriesTable.appendChild(help);

        // Row event listeners
        this.entriesTable.querySelectorAll('.entry-cell[data-type]').forEach(cell => {
            cell.addEventListener('click', () => {
                if (cell.dataset.type === 'craving') this._openAddCraving(cell.dataset.date);
                else                                  this._openAddSmoke(cell.dataset.date);
            });
        });
        this.entriesTable.querySelectorAll('.info-btn:not(.skipped-btn)').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this._openInfo(btn.dataset.date); });
        });
        this.entriesTable.querySelectorAll('.skipped-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this._openSkippedDay(btn.dataset.date); });
        });
        this.entriesTable.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => { e.stopPropagation(); this._openEditDay(btn.dataset.date); });
        });
    }

    // ── Add Craving modal ─────────────────────────────────────────────────────

    _openAddCraving(date) {
        this.activeDate = date;
        this.cravingTitle.innerHTML = `Add Craving<br><span class="modal-subtitle">${date}</span>`;
        document.querySelectorAll('.intensity-btn, .time-btn').forEach(b => b.classList.remove('selected'));
        this.cravingHH.value = '';
        this.cravingMM.value = '';
        this.saveCravingBtn.disabled = true;
        // Reset trigger section
        this.cravingTriggerSection.classList.remove('open');
        this._buildTriggerChips(this.cravingTriggerSection, []);
        if (date === this._today()) {
            this._buildTimePresets(this.smartTimeDefaults, this.cravingHH, this.cravingMM,
                () => this._updateSaveBtn('craving'));
        } else {
            this.smartTimeDefaults.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Enter time manually for past dates</p>';
        }
        this._openModal('addCraving');
    }

    _saveCraving() {
        const hh  = this.cravingHH.value.padStart(2, '0');
        const mm  = this.cravingMM.value.padStart(2, '0');
        const sel = document.querySelector('.intensity-btn.selected');
        if (!this._timeOk(this.cravingHH, this.cravingMM) || !sel) {
            this._toast('Please enter a valid time and select intensity');
            return;
        }
        const idx = this._getEntryIdx(this.activeDate);
        if (idx === -1) { this._toast('Error: entry not found'); return; }
        const triggers = this._getSelectedTriggers(this.cravingTriggerSection);
        this.entries[idx].cravings.push({ time: `${hh}:${mm}`, intensity: sel.dataset.intensity, triggers });
        this.entries[idx].cravings.sort((a, b) => this._byTimeAsc(a, b));
        if (this.entries[idx].skipped) this.entries[idx].skipped = false;
        this._persist('entries');
        this._closeModal('addCraving');
        this._renderTable();
    }

    // ── Add Smoke modal ───────────────────────────────────────────────────────

    _openAddSmoke(date) {
        this.activeDate = date;
        this.smokeTitle.innerHTML = `Log Cigarette<br><span class="modal-subtitle">${date}</span>`;
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        this.smokeHH.value = '';
        this.smokeMM.value = '';
        this.cigaretteCount.value = '1';
        this.saveSmokeBtn.disabled = true;
        // Reset trigger section
        this.smokeTriggerSection.classList.remove('open');
        this._buildTriggerChips(this.smokeTriggerSection, []);
        if (date === this._today()) {
            this._buildTimePresets(this.smokeTimeDefaults, this.smokeHH, this.smokeMM,
                () => this._updateSaveBtn('smoke'));
        } else {
            this.smokeTimeDefaults.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Enter time manually for past dates</p>';
        }
        this._openModal('addSmoke');
    }

    _saveSmoke() {
        const hh    = this.smokeHH.value.padStart(2, '0');
        const mm    = this.smokeMM.value.padStart(2, '0');
        const count = parseInt(this.cigaretteCount.value) || 1;
        if (!this._timeOk(this.smokeHH, this.smokeMM)) {
            this._toast('Please enter a valid time');
            return;
        }
        const idx = this._getEntryIdx(this.activeDate);
        if (idx === -1) { this._toast('Error: entry not found'); return; }
        const triggers = this._getSelectedTriggers(this.smokeTriggerSection);
        this.entries[idx].smoked.push({
            time: `${hh}:${mm}`, count,
            pricePerCigarette: this.settings.cigarettePrice,
            triggers,
        });
        this.entries[idx].smoked.sort((a, b) => this._byTimeAsc(a, b));
        if (this.entries[idx].skipped) this.entries[idx].skipped = false;
        this._persist('entries');
        this._closeModal('addSmoke');
        this._renderTable();
        this._startTimer();
    }

    // ── Smart time presets ────────────────────────────────────────────────────

    _buildTimePresets(container, hhInput, mmInput, onChange) {
        const now     = new Date();
        const presets = [
            { label: 'Just now',   min: 0   },
            { label: '5 min ago',  min: 5   },
            { label: '15 min ago', min: 15  },
            { label: '30 min ago', min: 30  },
            { label: '1 hr ago',   min: 60  },
            { label: '2 hr ago',   min: 120 },
        ];
        container.innerHTML = '';
        presets.forEach(({ label, min }) => {
            const btn = document.createElement('button');
            btn.className = 'time-btn';
            btn.textContent = label;
            btn.addEventListener('click', () => {
                container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                const target = new Date(now.getTime() - min * 60000);
                if (min > 0 && target.getDate() !== now.getDate()) {
                    hhInput.value = ''; mmInput.value = '';  // crossed midnight
                } else {
                    hhInput.value = String(target.getHours()).padStart(2, '0');
                    mmInput.value = String(target.getMinutes()).padStart(2, '0');
                }
                onChange();
            });
            container.appendChild(btn);
        });
    }

    // ── Time input handling ───────────────────────────────────────────────────

    _bindTimeInputs(hhInput, mmInput, onChange) {
        const onInput = (e) => {
            let v = e.target.value.replace(/\D/g, '').slice(0, 2);
            if (e.target === hhInput && v.length === 2 && parseInt(v) > 23) v = '23';
            if (e.target === mmInput && v.length === 2 && parseInt(v) > 59) v = '59';
            e.target.value = v;
            if (v.length === 2 && e.target === hhInput) { mmInput.focus(); mmInput.select(); }
            onChange();
        };
        const onBlur = () => {
            if (hhInput.value.length === 1) hhInput.value = hhInput.value.padStart(2, '0');
            if (mmInput.value.length === 1) mmInput.value = mmInput.value.padStart(2, '0');
            onChange();
        };
        hhInput.addEventListener('input', onInput);
        mmInput.addEventListener('input', onInput);
        hhInput.addEventListener('blur',  onBlur);
        mmInput.addEventListener('blur',  onBlur);
    }

    _timeOk(hhInput, mmInput) {
        const hh = parseInt(hhInput.value);
        const mm = parseInt(mmInput.value);
        const ok = !isNaN(hh) && hh >= 0 && hh <= 23 && hhInput.value !== '' &&
                   !isNaN(mm) && mm >= 0 && mm <= 59 && mmInput.value !== '';
        hhInput.classList.toggle('invalid', !ok && hhInput.value !== '');
        mmInput.classList.toggle('invalid', !ok && mmInput.value !== '');
        return ok;
    }

    _updateSaveBtn(type) {
        if (type === 'craving') {
            const ok = this._timeOk(this.cravingHH, this.cravingMM) &&
                       !!document.querySelector('.intensity-btn.selected');
            this.saveCravingBtn.disabled = !ok;
        } else {
            const countVal = this.cigaretteCount.value.trim();
            const count    = parseInt(countVal);
            const ok = this._timeOk(this.smokeHH, this.smokeMM) &&
                       countVal !== '' && !isNaN(count) && count >= 1;
            this.saveSmokeBtn.disabled = !ok;
        }
    }

    // ── Info / timeline modal ─────────────────────────────────────────────────

    _openInfo(date) {
        this.activeDate = date;
        this.infoTitle.innerHTML = `Timeline<br><span class="modal-subtitle">${date}</span>`;
        const entry = this._getEntry(date);
        if (!entry) { this._toast('Entry not found'); return; }

        const intensityColor = {
            low:    'var(--low-intensity)',
            medium: 'var(--medium-intensity)',
            high:   'var(--high-intensity)'
        };

        // Helper: format interval in minutes to compact string
        const fmtInterval = (mins) => {
            if (mins < 1)  return '<1m';
            if (mins < 60) return `${mins}m`;
            const h = Math.floor(mins / 60);
            const m = mins % 60;
            return `${h}h${m ? ' ' + m + 'm' : ''}`;
        };

        // Build craving events with intra-day intervals
        let lastCravingMin = null;
        const cravingEvents = [...entry.cravings]
            .sort((a, b) => this._byTimeAsc(a, b))
            .map(c => {
                const [hh, mm] = c.time.split(':').map(Number);
                const totalMin = hh * 60 + mm;
                const interval = lastCravingMin === null ? '—' : fmtInterval(totalMin - lastCravingMin);
                lastCravingMin = totalMin;
                return { time: c.time, type: 'craving', intensity: c.intensity, interval, triggers: c.triggers || [] };
            });

        // Build smoke events with intra-day intervals
        let lastSmokeMin = null;
        const smokeEvents = [...entry.smoked]
            .sort((a, b) => this._byTimeAsc(a, b))
            .map(s => {
                const [hh, mm] = s.time.split(':').map(Number);
                const totalMin = hh * 60 + mm;
                const interval = lastSmokeMin === null ? '—' : fmtInterval(totalMin - lastSmokeMin);
                lastSmokeMin = totalMin;
                return { time: s.time, type: 'smoke', interval, triggers: s.triggers || [] };
            });

        const events = [...cravingEvents, ...smokeEvents]
            .sort((a, b) => this._byTimeAsc(a, b));

        if (!events.length) {
            this.timelineContent.innerHTML = '<p class="empty-timeline">No events recorded for this day.</p>';
        } else {
            this.timelineContent.innerHTML = '';
            events.forEach(ev => {
                const el = document.createElement('div');
                el.className = 'timeline-entry';
                const indicator = ev.type === 'craving'
                    ? `<span class="timeline-intensity" style="background-color:${intensityColor[ev.intensity]}"></span>`
                    : `<span class="timeline-skull"><i class="fa-solid fa-skull"></i></span>`;
                const hasTriggers = ev.triggers && ev.triggers.length > 0;
                const boltClass   = hasTriggers ? 'timeline-bolt has-triggers' : 'timeline-bolt';
                const triggerNames = hasTriggers
                    ? ev.triggers.map(id => {
                        const preset = TRIGGERS.find(t => t.id === id);
                        if (preset) return preset.label;
                        const custom = (this.settings.customTriggers || []);
                        const ci = parseInt(id.replace('custom_', ''));
                        return custom[ci] || id;
                    }).join(', ')
                    : '';
                el.innerHTML = `
                    <span class="timeline-time">${ev.time}</span>
                    <span class="timeline-emoji">${ev.type === 'craving' ? '<i class="fa-solid fa-face-tired fa-fw"></i>' : '<i class="fa-solid fa-smoking fa-fw"></i>'}</span>
                    <span class="timeline-interval">${ev.interval}</span>
                    <span class="${boltClass}" data-triggers="${triggerNames}"><i class="fa-solid fa-bolt"></i></span>
                    ${indicator}`;
                this.timelineContent.appendChild(el);
            });

            // Bind trigger popover on bolt icons
            this._activeTriggerPopover = null;
            this.timelineContent.querySelectorAll('.timeline-bolt.has-triggers').forEach(bolt => {
                bolt.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Remove existing popover
                    if (this._activeTriggerPopover) {
                        this._activeTriggerPopover.remove();
                        const prev = this._activeTriggerPopover._anchor;
                        this._activeTriggerPopover = null;
                        if (prev === bolt) return; // toggle off
                    }
                    const pop = document.createElement('div');
                    pop.className = 'trigger-popover';
                    pop.textContent = bolt.dataset.triggers;
                    pop._anchor = bolt;
                    bolt.appendChild(pop);
                    this._activeTriggerPopover = pop;
                });
            });
            document.addEventListener('click', () => {
                if (this._activeTriggerPopover) {
                    this._activeTriggerPopover.remove();
                    this._activeTriggerPopover = null;
                }
            });
        }
        this.dayNotes.value = entry.notes || '';
        this._openModal('info');
    }

    _saveNotes() {
        const idx = this._getEntryIdx(this.activeDate);
        if (idx === -1) { this._toast('Error: entry not found'); return; }
        this.entries[idx].notes = this.dayNotes.value;
        this._persist('entries');
        this._toast('Notes saved ✓');
    }

    // ── Edit-day modal ────────────────────────────────────────────────────────

    _openEditDay(date) {
        this.activeDate = date;
        this.editDayTitle.innerHTML = `Edit<br><span class="modal-subtitle">${date}</span>`;
        const entry = this._getEntry(date);
        if (!entry) { this._toast('Entry not found'); return; }
        this._renderCravingRows(entry.cravings);
        this._renderSmokeRows(entry.smoked);
        this._syncDeleteBtns();
        this._openModal('editDay');
    }

    _renderCravingRows(cravings) {
        this.cravingsList.innerHTML = '';
        cravings.forEach((c, i) => this.cravingsList.appendChild(this._makeCravingRow(c, i)));
    }

    _renderSmokeRows(smoked) {
        this.smokedList.innerHTML = '';
        smoked.forEach((s, i) => this.smokedList.appendChild(this._makeSmokeRow(s, i)));
    }

    _makeCravingRow(craving, index) {
        const [hh = '', mm = ''] = (craving.time || '').split(':');
        const el = document.createElement('div');
        el.className = 'edit-item';
        el.innerHTML = `
            <input type="checkbox" class="edit-checkbox craving-checkbox" data-index="${index}">
            <span>${index + 1}.</span>
            <div class="edit-time-input">
                <input type="text" inputmode="numeric" class="edit-hh" value="${hh}" maxlength="2" placeholder="HH">
                <span>:</span>
                <input type="text" inputmode="numeric" class="edit-mm" value="${mm}" maxlength="2" placeholder="MM">
            </div>
            <div class="edit-intensity-selector">
                <button class="edit-intensity-btn low    ${craving.intensity === 'low'    ? 'selected' : ''}" data-intensity="low">L</button>
                <button class="edit-intensity-btn medium ${craving.intensity === 'medium' ? 'selected' : ''}" data-intensity="medium">M</button>
                <button class="edit-intensity-btn high   ${craving.intensity === 'high'   ? 'selected' : ''}" data-intensity="high">H</button>
            </div>`;
        // Trigger section for edit row
        const triggerWrap = document.createElement('div');
        triggerWrap.className = 'edit-trigger-wrap';
        const triggerToggle = document.createElement('button');
        triggerToggle.className = 'trigger-toggle-btn';
        triggerToggle.innerHTML = '<i class="fa-solid fa-bolt"></i> + Add Trigger';
        triggerToggle.type = 'button';
        const triggerSection = document.createElement('div');
        triggerSection.className = 'trigger-section edit-trigger-section';
        const savedTriggers = craving.triggers || [];
        if (savedTriggers.length) triggerSection.classList.add('open');
        this._buildTriggerChips(triggerSection, savedTriggers);
        triggerToggle.addEventListener('click', () => triggerSection.classList.toggle('open'));
        triggerWrap.appendChild(triggerToggle);
        triggerWrap.appendChild(triggerSection);
        el.appendChild(triggerWrap);
        const hhInput = el.querySelector('.edit-hh');
        const mmInput = el.querySelector('.edit-mm');
        this._bindTimeInputs(hhInput, mmInput, () => {});
        el.querySelectorAll('.edit-intensity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.edit-intensity-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        el.querySelector('.edit-checkbox').addEventListener('change', () => this._syncDeleteBtns());
        return el;
    }

    _makeSmokeRow(smoke, index) {
        const [hh = '', mm = ''] = (smoke.time || '').split(':');
        const el = document.createElement('div');
        el.className = 'edit-item';
        el.innerHTML = `
            <input type="checkbox" class="edit-checkbox smoke-checkbox" data-index="${index}">
            <span>${index + 1}.</span>
            <div class="edit-time-input">
                <input type="text" inputmode="numeric" class="edit-hh" value="${hh}" maxlength="2" placeholder="HH">
                <span>:</span>
                <input type="text" inputmode="numeric" class="edit-mm" value="${mm}" maxlength="2" placeholder="MM">
            </div>
            <div class="edit-count-input">
                <span class="count-separator">×</span>
                <input type="number" class="edit-count" value="${smoke.count || 1}" min="1">
            </div>`;
        // Trigger section for edit row
        const triggerWrap = document.createElement('div');
        triggerWrap.className = 'edit-trigger-wrap';
        const triggerToggle = document.createElement('button');
        triggerToggle.className = 'trigger-toggle-btn';
        triggerToggle.innerHTML = '<i class="fa-solid fa-bolt"></i> + Add Trigger';
        triggerToggle.type = 'button';
        const triggerSection = document.createElement('div');
        triggerSection.className = 'trigger-section edit-trigger-section';
        const savedTriggers = smoke.triggers || [];
        if (savedTriggers.length) triggerSection.classList.add('open');
        this._buildTriggerChips(triggerSection, savedTriggers);
        triggerToggle.addEventListener('click', () => triggerSection.classList.toggle('open'));
        triggerWrap.appendChild(triggerToggle);
        triggerWrap.appendChild(triggerSection);
        el.appendChild(triggerWrap);
        const hhInput = el.querySelector('.edit-hh');
        const mmInput = el.querySelector('.edit-mm');
        this._bindTimeInputs(hhInput, mmInput, () => {});
        el.querySelector('.edit-checkbox').addEventListener('change', () => this._syncDeleteBtns());
        return el;
    }

    _addEmptyCravingRow() {
        const idx = this.cravingsList.querySelectorAll('.edit-item').length;
        this.cravingsList.appendChild(this._makeCravingRow({ time: '', intensity: '' }, idx));
    }

    _addEmptySmokeRow() {
        const idx = this.smokedList.querySelectorAll('.edit-item').length;
        this.smokedList.appendChild(this._makeSmokeRow({ time: '', count: 1 }, idx));
    }

    _deleteSelected(type) {
        const cls     = type === 'craving' ? '.craving-checkbox' : '.smoke-checkbox';
        const checked = [...document.querySelectorAll(`${cls}:checked`)];
        if (!checked.length) {
            this._toast(`Select ${type === 'craving' ? 'cravings' : 'smoked entries'} to delete`);
            return;
        }
        this._confirm(
            `Delete ${type === 'craving' ? 'Cravings' : 'Smoked'}`,
            `Delete ${checked.length} selected item(s)?`,
            () => {
                const entryIdx = this._getEntryIdx(this.activeDate);
                if (entryIdx === -1) return;
                const arr = type === 'craving'
                    ? this.entries[entryIdx].cravings
                    : this.entries[entryIdx].smoked;
                checked.map(cb => parseInt(cb.dataset.index))
                       .sort((a, b) => b - a)
                       .forEach(i => { if (i >= 0 && i < arr.length) arr.splice(i, 1); });
                if (type === 'craving') this._renderCravingRows(this.entries[entryIdx].cravings);
                else                    this._renderSmokeRows(this.entries[entryIdx].smoked);
                this._syncDeleteBtns();
            }
        );
    }

    _syncDeleteBtns() {
        this.deleteCravingsBtn.disabled = !document.querySelector('.craving-checkbox:checked');
        this.deleteSmokedBtn.disabled   = !document.querySelector('.smoke-checkbox:checked');
    }

    _saveEditDay() {
        const entryIdx = this._getEntryIdx(this.activeDate);
        if (entryIdx === -1) return;
        const TIME_RE = /^([01]?\d|2[0-3]):[0-5]\d$/;

        // Collect all issues across all rows
        let missingCT = false; // craving time
        let missingCI = false; // craving intensity
        let missingST = false; // smoke time
        let missingSQ = false; // smoke quantity

        this.cravingsList.querySelectorAll('.edit-item').forEach(item => {
            const hhRaw = item.querySelector('.edit-hh').value.trim();
            const mmRaw = item.querySelector('.edit-mm').value.trim();
            const validTime = hhRaw && mmRaw && TIME_RE.test(`${hhRaw.padStart(2,'0')}:${mmRaw.padStart(2,'0')}`);
            if (!validTime) {
                missingCT = true;
                item.querySelector('.edit-hh').classList.add('invalid');
                item.querySelector('.edit-mm').classList.add('invalid');
            }
            if (!item.querySelector('.edit-intensity-btn.selected')) {
                missingCI = true;
            }
        });

        this.smokedList.querySelectorAll('.edit-item').forEach(item => {
            const hhRaw = item.querySelector('.edit-hh').value.trim();
            const mmRaw = item.querySelector('.edit-mm').value.trim();
            const validTime = hhRaw && mmRaw && TIME_RE.test(`${hhRaw.padStart(2,'0')}:${mmRaw.padStart(2,'0')}`);
            if (!validTime) {
                missingST = true;
                item.querySelector('.edit-hh').classList.add('invalid');
                item.querySelector('.edit-mm').classList.add('invalid');
            }
            const countVal = item.querySelector('.edit-count').value.trim();
            const count = parseInt(countVal);
            if (!countVal || isNaN(count) || count < 1) {
                missingSQ = true;
                item.querySelector('.edit-count').classList.add('invalid');
            }
        });

        const issueCount = [missingCT, missingCI, missingST, missingSQ].filter(Boolean).length;
        if (issueCount > 1) {
            this._toast('Multiple fields missing or invalid.');
            return;
        }
        if (missingCT) { this._toast('Please enter time for all cravings.'); return; }
        if (missingCI) { this._toast('Please select intensity for all cravings.'); return; }
        if (missingST) { this._toast('Please enter time for all smoke entries.'); return; }
        if (missingSQ) { this._toast('Cigarettes smoked cannot be less than 1.'); return; }

        const cravings = [];
        this.cravingsList.querySelectorAll('.edit-item').forEach(item => {
            const hh  = item.querySelector('.edit-hh').value.padStart(2, '0');
            const mm  = item.querySelector('.edit-mm').value.padStart(2, '0');
            const sel = item.querySelector('.edit-intensity-btn.selected');
            const time = `${hh}:${mm}`;
            const triggerSection = item.querySelector('.edit-trigger-section');
            const triggers = triggerSection ? this._getSelectedTriggers(triggerSection) : [];
            if (TIME_RE.test(time) && sel) cravings.push({ time, intensity: sel.dataset.intensity, triggers });
        });

        const smoked = [];
        this.smokedList.querySelectorAll('.edit-item').forEach(item => {
            const hh    = item.querySelector('.edit-hh').value.padStart(2, '0');
            const mm    = item.querySelector('.edit-mm').value.padStart(2, '0');
            const count = parseInt(item.querySelector('.edit-count').value) || 1;
            const origIdx = parseInt(item.querySelector('.edit-checkbox').dataset.index);
            const origSmoked = this.entries[entryIdx].smoked;
            const price = (origIdx < origSmoked.length)
                ? (origSmoked[origIdx].pricePerCigarette ?? this.settings.cigarettePrice)
                : this.settings.cigarettePrice;
            const time = `${hh}:${mm}`;
            const triggerSection = item.querySelector('.edit-trigger-section');
            const triggers = triggerSection ? this._getSelectedTriggers(triggerSection) : [];
            if (TIME_RE.test(time) && count > 0) smoked.push({ time, count, pricePerCigarette: price, triggers });
        });

        cravings.sort((a, b) => this._byTimeAsc(a, b));
        smoked.sort((a, b) => this._byTimeAsc(a, b));

        this.entries[entryIdx].cravings = cravings;
        this.entries[entryIdx].smoked   = smoked;
        if ((cravings.length || smoked.length) && this.entries[entryIdx].skipped) {
            this.entries[entryIdx].skipped = false;
        }
        this._persist('entries');
        this._toast('Changes saved ✓');
        this._closeModal('editDay');
        this._renderTable();
        this._startTimer();
    }

    // ── Chart ─────────────────────────────────────────────────────────────────

    _chartStyle() {
        return {
            textPrimary: '#d9d9d9',
            textSecond:  '#a6a6a6',
            accent:      '#d9d9d9',
            gridColor:   'rgba(217,217,217,0.07)',
            font:        'Consolas, Monaco, monospace',
        };
    }

    _filteredEntries() {
        const days   = parseInt(this.timeRange.value);
        const now    = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);

        const filtered = this.entries
            .filter(e => { const d = this._toDate(e.date); return d >= cutoff && d <= now; })
            .sort((a, b) => this._toDate(a.date) - this._toDate(b.date));

        const totalSmoked   = filtered.reduce((s, e) => s + e.smoked.reduce((x, y) => x + y.count, 0), 0);
        const totalCravings = filtered.reduce((s, e) => s + e.cravings.length, 0);
        const totalMoney    = filtered.reduce((s, e) => s + e.smoked.reduce((x, y) =>
            x + y.count * (y.pricePerCigarette ?? this.settings.cigarettePrice), 0), 0);
        const totalMLL      = totalSmoked * 20;
        this.statSmoked.textContent   = totalSmoked;
        this.statCravings.textContent = totalCravings;
        this.statMoney.textContent    = parseFloat(totalMoney.toFixed(2)).toString();
        this.statLifeLost.textContent = this._fmtMLL(totalMLL);
        // Update currency label in stats bar
        const currLabel = document.getElementById('currencyLabel');
        if (currLabel) currLabel.textContent = this.settings.currency;

        return filtered;
    }

    _switchTab(tab) {
        this.activeTab = tab;
        document.querySelectorAll('.chart-tab').forEach(t => {
            t.classList.toggle('active', t.dataset.tab === tab);
        });
        ['smoked', 'cravings', 'intensity', 'lifelost'].forEach(key => {
            document.getElementById(`chartPanel${key.charAt(0).toUpperCase() + key.slice(1)}`)
                .style.display = key === tab ? 'block' : 'none';
        });
        this._renderActiveTab();
    }

    _renderActiveTab() {
        if (this.activeTab === 'smoked')    this._renderChartSmoked();
        if (this.activeTab === 'cravings')  this._renderChartCravings();
        if (this.activeTab === 'intensity') this._renderChartIntensity();
        if (this.activeTab === 'lifelost')  this._renderChartLifelost();
    }

    _renderChartSmoked() {
        const filtered = this._filteredEntries();
        const st = this._chartStyle();

        if (this.charts.smoked) { this.charts.smoked.destroy(); this.charts.smoked = null; }

        this.charts.smoked = new Chart(
            document.getElementById('chartSmoked').getContext('2d'), {
                type: 'line',
                data: {
                    labels: filtered.map(e => e.date),
                    datasets: [{
                        label: 'Cigarettes Smoked',
                        data: filtered.map(e => e.smoked.reduce((s, x) => s + x.count, 0)),
                        borderColor: '#c8c8c8',
                        backgroundColor: 'rgba(200,200,200,0.07)',
                        pointBackgroundColor: '#c8c8c8',
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        tension: 0.3,
                        fill: true,
                    }],
                },
                options: this._chartOptions(st),
            }
        );
    }

    _renderChartCravings() {
        const filtered = this._filteredEntries();
        const st = this._chartStyle();

        if (this.charts.cravings) { this.charts.cravings.destroy(); this.charts.cravings = null; }

        this.charts.cravings = new Chart(
            document.getElementById('chartCravings').getContext('2d'), {
                type: 'line',
                data: {
                    labels: filtered.map(e => e.date),
                    datasets: [{
                        label: 'Cravings',
                        data: filtered.map(e => e.cravings.length),
                        borderColor: '#909090',
                        backgroundColor: 'rgba(144,144,144,0.07)',
                        pointBackgroundColor: '#909090',
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        tension: 0.3,
                        fill: true,
                    }],
                },
                options: this._chartOptions(st),
            }
        );
    }

    _renderChartIntensity() {
        const filtered = this._filteredEntries();
        const st = this._chartStyle();

        if (this.charts.intensity) { this.charts.intensity.destroy(); this.charts.intensity = null; }

        const low    = filtered.map(e => e.cravings.filter(c => c.intensity === 'low').length);
        const medium = filtered.map(e => e.cravings.filter(c => c.intensity === 'medium').length);
        const high   = filtered.map(e => e.cravings.filter(c => c.intensity === 'high').length);

        this.charts.intensity = new Chart(
            document.getElementById('chartIntensity').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: filtered.map(e => e.date),
                    datasets: [
                        { label: 'Low',    data: low,    backgroundColor: 'rgba(198,224,180,0.85)', borderColor: '#C6E0B4', borderWidth: 1, borderRadius: 2 },
                        { label: 'Mid',    data: medium, backgroundColor: 'rgba(255,230,153,0.85)', borderColor: '#FFE699', borderWidth: 1, borderRadius: 2 },
                        { label: 'High',   data: high,   backgroundColor: 'rgba(255,149,149,0.85)', borderColor: '#FF9595', borderWidth: 1, borderRadius: 2 },
                    ],
                },
                options: this._chartOptions(st, { stacked: true }),
            }
        );
    }

    _renderChartLifelost() {
        const filtered = this._filteredEntries();
        const st = this._chartStyle();

        if (this.charts.lifelost) { this.charts.lifelost.destroy(); this.charts.lifelost = null; }

        const self = this;
        this.charts.lifelost = new Chart(
            document.getElementById('chartLifelost').getContext('2d'), {
                type: 'line',
                data: {
                    labels: filtered.map(e => e.date),
                    datasets: [{
                        label: 'Life Lost (min)',
                        data: filtered.map(e => e.smoked.reduce((s, x) => s + x.count, 0) * 20),
                        borderColor: '#FF9595',
                        backgroundColor: 'rgba(255,149,149,0.07)',
                        pointBackgroundColor: '#FF9595',
                        pointRadius: 3,
                        pointHoverRadius: 5,
                        borderWidth: 1.5,
                        tension: 0.3,
                        fill: true,
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                color: st.textPrimary,
                                font: { family: st.font, size: 11 },
                                boxWidth: 12,
                                padding: 10,
                            },
                        },
                        tooltip: {
                            backgroundColor: 'rgba(26,26,26,0.95)',
                            titleColor: st.textPrimary,
                            bodyColor: st.textPrimary,
                            borderColor: 'rgba(217,217,217,0.25)',
                            borderWidth: 1,
                            cornerRadius: 6,
                            callbacks: {
                                label: (item) => ` ${self._fmtMLL(item.raw)}`,
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid:  { color: st.gridColor },
                            ticks: { color: st.textSecond, maxRotation: 45,
                                     font: { family: st.font, size: 10 } },
                        },
                        y: {
                            beginAtZero: true,
                            grid:  { color: st.gridColor },
                            ticks: {
                                stepSize: 20,
                                color: st.textSecond,
                                font: { family: st.font, size: 10 },
                                callback: (val) => {
                                    if (val < 60)  return `${val}m`;
                                    const h = Math.floor(val / 60);
                                    const m = val % 60;
                                    return m ? `${h}h ${m}m` : `${h}h`;
                                },
                            },
                        },
                    },
                    animation: { duration: 400, easing: 'easeOutQuart' },
                },
            }
        );
    }

    _chartOptions(st, { stacked = false, tooltipExtra = null } = {}) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: st.textPrimary,
                        font: { family: st.font, size: 11 },
                        boxWidth: 12,
                        padding: 10,
                    },
                },
                tooltip: {
                    backgroundColor: 'rgba(26,26,26,0.95)',
                    titleColor: st.textPrimary,
                    bodyColor: st.textPrimary,
                    borderColor: 'rgba(217,217,217,0.25)',
                    borderWidth: 1,
                    cornerRadius: 6,
                    callbacks: tooltipExtra ? {
                        afterBody: (items) => {
                            const extra = tooltipExtra(items[0]);
                            return extra ? [extra] : [];
                        },
                    } : {},
                },
            },
            scales: {
                x: {
                    stacked,
                    grid:  { color: st.gridColor },
                    ticks: { color: st.textSecond, maxRotation: 45,
                             font: { family: st.font, size: 10 } },
                },
                y: {
                    stacked,
                    beginAtZero: true,
                    grid:  { color: st.gridColor },
                    ticks: { stepSize: 1, color: st.textSecond,
                             font: { family: st.font, size: 10 } },
                },
            },
            animation: { duration: 400, easing: 'easeOutQuart' },
        };
    }

    _closeChart() {
        this._closeModal('chart');
        Object.keys(this.charts).forEach(k => {
            if (this.charts[k]) { this.charts[k].destroy(); this.charts[k] = null; }
        });
    }

    // ── Export / Import ───────────────────────────────────────────────────────

    _exportCSV() {
        if (!this.entries.length) { this._toast('No data to export'); return; }
        const rows = ['Date,Time,Type,Intensity/Count,PricePerCigarette,Notes'];
        this.entries.forEach(e => {
            const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
            e.cravings.forEach(c =>
                rows.push([e.date, c.time, 'Craving', c.intensity, '', notes].join(',')));
            e.smoked.forEach(s =>
                rows.push([e.date, s.time, 'Smoked', s.count,
                    s.pricePerCigarette ?? this.settings.cigarettePrice, notes].join(',')));
        });
        const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
        const a   = Object.assign(document.createElement('a'), {
            href: url, download: `ciglog_export_${new Date().toISOString().slice(0, 10)}.csv`,
        });
        document.body.appendChild(a); a.click();
        document.body.removeChild(a); URL.revokeObjectURL(url);
    }

    _importCSV(source = 'settings') {
        const file = source === 'firstrun'
            ? this.csvFileFirstRun?.files[0]
            : this.csvFileSettings?.files[0];
        if (!file) { this._toast('Please select a CSV file'); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            // Step 1: Parse and validate BEFORE touching existing data
            let parsed;
            try {
                const rows = e.target.result.split('\n').filter(r => r.trim());
                if (rows.length < 2) { this._toast('Import failed: file appears empty or invalid. Your existing data is safe.'); return; }
                const byDate = {};
                let validRows = 0;
                for (let i = 1; i < rows.length; i++) {
                    const [date, time, type, value, price, ...noteParts] =
                        rows[i].split(',').map(s => s.trim());
                    if (!date || !time || !type) continue;
                    // Validate date format dd-mm-yy
                    if (!/^\d{2}-\d{2}-\d{2}$/.test(date)) continue;
                    // Validate type
                    const t = type.toLowerCase();
                    if (t !== 'craving' && t !== 'smoked') continue;
                    const notes = noteParts.join(',').replace(/^"|"$/g, '');
                    if (!byDate[date]) byDate[date] = this._blankEntry(date);
                    if (!byDate[date].notes && notes) byDate[date].notes = notes;
                    if (t === 'craving') {
                        byDate[date].cravings.push({ time, intensity: value.toLowerCase(), triggers: [] });
                    } else {
                        byDate[date].smoked.push({
                            time, count: parseInt(value) || 1,
                            pricePerCigarette: parseFloat(price) || this.settings.cigarettePrice,
                            triggers: [],
                        });
                    }
                    validRows++;
                }
                if (validRows === 0) {
                    this._toast('Import failed: no valid data found. Your existing data is safe.');
                    return;
                }
                parsed = Object.values(byDate).sort((a, b) => this._byDateDesc(a, b));
            } catch (err) {
                this._toast('Import failed: file appears corrupt or invalid. Your existing data is safe.');
                console.error(err);
                return;
            }

            // Step 2: If first run — no existing data, import directly
            if (source === 'firstrun') {
                this.entries = parsed;
                this._persist('entries');
                this._closeModal('createToday');
                this._ensureTodayExists();
                this._renderTable();
                this._startTimer();
                this._toast(`Imported ${parsed.length} days of data ✓`);
                // Reset file input
                if (this.csvFileFirstRun) this.csvFileFirstRun.value = '';
                return;
            }

            // Step 3: If existing data — show safety confirmation
            const doImport = () => {
                this.entries = parsed;
                this._persist('entries');
                this._closeModal('settings');
                this._renderTable();
                this._startTimer();
                this._toast(`Imported ${parsed.length} days of data ✓`);
                if (this.csvFileSettings) this.csvFileSettings.value = '';
            };

            if (this.entries.length > 0) {
                this._confirm(
                    'Import Data',
                    `You have existing data. Importing will replace it permanently. Export a backup first?`,
                    () => {
                        // "Confirm" = Import Anyway
                        doImport();
                    }
                );
                // Override confirm button temporarily to also offer export
                this.confirmOk.textContent = 'Import Anyway';
                // Add Export & Continue button logic via toast chain
                const existingCb = this._confirmCb;
                this._confirmCb = existingCb;
                // Offer export via a second confirm button swap
                const exportAndContinue = () => {
                    this._exportCSV();
                    setTimeout(() => {
                        this._confirm(
                            'Backup Saved',
                            'Your backup has been downloaded. Proceed with import?',
                            doImport
                        );
                        this.confirmOk.textContent = 'Proceed with Import';
                        this.confirmCancel.textContent = 'Cancel';
                    }, 500);
                };
                // Replace cancel with Export & Continue temporarily
                this.confirmCancel.textContent = 'Export & Continue';
                const origCancelCb = () => this._closeModal('confirm');
                this.confirmCancel.onclick = (e) => {
                    e.stopImmediatePropagation();
                    this._closeModal('confirm');
                    exportAndContinue();
                };
            } else {
                doImport();
            }
        };
        reader.readAsText(file);
    }

    // ── Modal management ──────────────────────────────────────────────────────

    _openModal(key) {
        this.modals[key].style.display = 'block';
    }

    _closeModal(key) {
        this.modals[key].style.display = 'none';
        if (['addCraving', 'addSmoke', 'info', 'editDay'].includes(key)) this.activeDate = null;
        if (key === 'confirm') this._confirmCb = null;
        if (key === 'import')  this.csvFile.value = '';
    }

    _openMenu()  { this.sideMenu.style.right = '0'; this.menuOverlay.style.display = 'block'; }
    _closeMenu() { this.sideMenu.style.right = '-300px'; this.menuOverlay.style.display = 'none'; }

    // ── Reset ─────────────────────────────────────────────────────────────────

    _doReset() {
        this._closeModal('reset');
        clearInterval(this._timerInterval);
        this._timerInterval = null;
        this.timerEl.textContent = 'No cigarettes logged yet';
        this.timerEl.classList.remove('timer-tappable');
        this.popoverEl.style.display = 'none';
        localStorage.removeItem('ciglog_v1_entries');
        localStorage.removeItem('ciglog_v1_settings');
        this.entries  = [];
        this.settings = null;
        this._boot();
    }

    // ── Last-smoked timer ─────────────────────────────────────────────────────

    _findLastSmoked() {
        let latest = null;
        this.entries.forEach(entry => {
            entry.smoked.forEach(s => {
                const [d, m, y] = entry.date.split('-').map(Number);
                const [hh, mm]  = s.time.split(':').map(Number);
                const dt = new Date(2000 + y, m - 1, d, hh, mm, 0);
                if (!latest || dt > latest) latest = dt;
            });
        });
        return latest;
    }

    _formatTimerLabel(ms) {
        const totalSec  = Math.floor(ms / 1000);
        const totalMin  = Math.floor(totalSec / 60);
        const totalHrs  = Math.floor(totalMin / 60);
        const totalDays = Math.floor(totalHrs / 24);
        const totalWks  = Math.floor(totalDays / 7);
        const totalMos  = Math.floor(totalDays / 30.44);
        const totalYrs  = Math.floor(totalDays / 365.25);

        const b = (t) => `<strong>${t}</strong>`;

        if (totalSec < 60) {
            return `Last smoked ${b(totalSec + ' s')} ago`;
        }
        if (totalMin < 60) {
            const s = totalSec % 60;
            return `Last smoked ${b(totalMin + ' min' + (s ? ' ' + s + ' s' : ''))} ago`;
        }
        if (totalHrs < 24) {
            const min = totalMin % 60;
            return `Last smoked ${b(totalHrs + ' hr' + (min ? ' ' + min + ' min' : ''))} ago`;
        }
        if (totalDays < 7) {
            const hr = totalHrs % 24;
            return `Last smoked ${b(totalDays + ' d' + (hr ? ' ' + hr + ' hr' : ''))} ago`;
        }
        if (totalWks < 4) {
            const d = totalDays % 7;
            return `Last smoked ${b(totalWks + ' wk' + (d ? ' ' + d + ' d' : ''))} ago`;
        }
        if (totalMos < 12) {
            const wk = Math.floor((totalDays % 30.44) / 7);
            return `Last smoked ${b(totalMos + ' mo' + (wk ? ' ' + wk + ' wk' : ''))} ago`;
        }
        const mo = totalMos % 12;
        return `Last smoked ${b(totalYrs + ' yr' + (mo ? ' ' + mo + ' mo' : ''))} ago`;
    }

    _formatExactDuration(ms) {
        const totalSec  = Math.floor(ms / 1000);
        const totalMin  = Math.floor(totalSec / 60);
        const totalHrs  = Math.floor(totalMin / 60);
        const totalDays = Math.floor(totalHrs / 24);

        const years  = Math.floor(totalDays / 365);
        const months = Math.floor((totalDays % 365) / 30);
        const days   = Math.floor((totalDays % 365) % 30);
        const hrs    = totalHrs % 24;
        const mins   = totalMin % 60;
        const secs   = totalSec % 60;

        const parts = [];
        if (years)  parts.push(`${years} yr${years > 1 ? 's' : ''}`);
        if (months) parts.push(`${months} mo`);
        if (days)   parts.push(`${days} d`);
        if (hrs)    parts.push(`${hrs} hr${hrs > 1 ? 's' : ''}`);
        if (mins)   parts.push(`${mins} min`);
        parts.push(`${secs} s`);

        return parts.join(', ');
    }

    _startTimer() {
        clearInterval(this._timerInterval);

        const tick = () => {
            const last = this._findLastSmoked();
            if (!last) {
                this.timerEl.innerHTML = 'No cigarettes logged yet';
                this.timerEl.classList.remove('timer-tappable');
                return;
            }
            const ms = Date.now() - last.getTime();
            this.timerEl.innerHTML = this._formatTimerLabel(ms);
            this.timerEl.classList.add('timer-tappable');
        };

        tick();
        this._timerInterval = setInterval(tick, 1000);

        // Bind popover click listeners only once
        if (!this._timerClickBound) {
            this._timerClickBound = true;

            this.timerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                const last = this._findLastSmoked();
                if (!last) return;

                if (this.popoverEl.style.display === 'block') {
                    this.popoverEl.style.display = 'none';
                    return;
                }

                const ms = Date.now() - last.getTime();
                this.popoverEl.textContent = `Exactly: ${this._formatExactDuration(ms)}`;
                this.popoverEl.style.display = 'block';
            });

            document.addEventListener('click', () => {
                this.popoverEl.style.display = 'none';
            });
        }
    }

    // ── README modal ──────────────────────────────────────────────────────────

    _openReadme() {
        const body = document.getElementById('readmeBody');
        body.innerHTML = `
            <h3>CigLog - Cigarette Logger</h3>
            <p>A data-driven PWA to help you log cigarettes craved and smoked, and get analytics for money spent and minutes of life lost.</p>

            <h3><i class="fa-regular fa-circle-check"></i> Features</h3>
            <ul>
                <li>Daily log - cravings count, cigarettes smoked, money spent, minutes of life lost</li>
                <li>Precise tracking - log each event with exact time</li>
                <li>Craving intensity - low <i class="fa-solid fa-circle" style="color: rgb(198, 224, 180);"></i>, mid <i class="fa-solid fa-circle" style="color: rgb(255, 230, 153);"></i>, high <i class="fa-solid fa-circle" style="color: rgb(255, 149, 149);"></i> for every craving</li>
                <li>Smart time presets - "just now", "5 min ago", "1 hour ago"</li>
                <li>Timeline view - all events of a day in chronological order</li>
                <li>Notes - add personal notes to each day</li>
                <li>Full edit mode - modify or delete any entry</li>
                <li>Interactive charts - smoked, cravings, intensity, and life lost</li>
                <li>CSV export / import - backup or analyse your data elsewhere</li>
                <li>Auto-detected skipped days - with option to mark as clean</li>
                <li>Installable - works offline, add to home screen</li>
            </ul>

            <h3><i class="fa-solid fa-wrench"></i> How to Use</h3>
            <ul>
                <li>Tap <i class="fa-solid fa-face-tired"></i> to log a craving with time &amp; intensity</li>
                <li>Tap <i class="fa-solid fa-smoking"></i> to log a cigarette with time</li>
                <li>Tap <i class="fa-solid fa-angle-down"></i> to see the day's timeline and add notes</li>
                <li>Tap <i class="fa-solid fa-ellipsis-vertical"></i> to edit or delete entries</li>
                <li>Tap <i class="fa-solid fa-triangle-exclamation"></i> on skipped days for more actions</li>
                <li>Open the side menu ☰ for charts, export/import, and settings</li>
            </ul>

            <h3><i class="fa-solid fa-code"></i> Tech Stack</h3>
            <ul>
                <li>Plain HTML, CSS, Vanilla JS — no frameworks</li>
                <li>Chart.js for charts, Font Awesome for icons</li>
                <li>Browser localStorage for data</li>
                <li>Service Worker + Web App Manifest for offline &amp; installability</li>
            </ul>

            <h3><i class="fa-regular fa-clipboard"></i> Release Notes</h3>
            <ul>
                <h4>Version 1.1.0 | 09-05-2026</h4>
                <ul>
                    <li>Literature changes and corrections.</li>
                </ul>
                <h4>Version 1.1.1 | 09-05-2026</h4>
                <ul>
                    <li>Added new column in Homescreen - Minutes of Life Lost.</li>
                    <li>Integration of Minutes of Life Lost in Charts and Status Bar.</li>
                    <li>Minor text formatting.</li>
                </ul>
                <h4>Version 1.1.2 | 09-05-2026</h4>
                <ul>
                    <li>Smart money formatting - no redundant decimals.</li>
                    <li>Smart MLL formatting - no leading zeros.</li>
                    <li>Stats bar redesigned - equal 4-column grid layout.</li>
                    <li>Cigarette count field now allows blank input; Save button disabled until valid.</li>
                </ul>
                <h4>Version 1.1.3 | 09-05-2026</h4>
                <ul>
                    <li>Added Google Font - Roboto Mono.</li>                    
                </ul>
                <h4>Version 1.2.0 | 11-05-2026</h4>
                <ul>
                    <li>New feature added - Triggers.</li>
                    <li>Each craving or smoked entry can now have multiple triggers selected from a predefined list.</li>
                    <li>Info & Notes modal now displays Trigger information.</li>
                </ul>
                <h4>Version 1.2.1 | 12-05-2026</h4>
                <ul>
                    <li>Import and Export Log moved from menu to Settings modal.</li>
                    <li>Custom Triggers (up to 3) can now be added in Settings.</li>
                    <li>First-run onboarding redesigned - option to Start Fresh or Load from a previous file.</li>
                    <li>Import now validates data before replacing existing entries.</li>
                    <li>Import safety flow - option to export a backup before overwriting data.</li>
                    <li>Menu simplified - Chart, Settings, About, Read Me, Reset only.</li>
                </ul>
                <h4>Version 1.2.2 | 13-05-2026</h4>
                <ul>
                    <li>First-run Start Tracking button icon changed to play icon.</li>
                    <li>Settings modal Custom Triggers section styled to match monochrome theme.</li>
                    <li>Settings modal Save button bug fixed.</li>
                    <li>Trigger category labels now centre aligned and no longer uppercase.</li>
                    <li>Triggers reworked: Restless, Work Break, After Work icons updated; Watching TV replaced with Relaxing; Work trigger added.</li>
                </ul>
            </ul>
            <div class="version"><a href="https://github.com/fuzzykaiju/ciglog" target="_blank" rel="noopener" style="color:var(--text-primary);">GitHub</a> · MIT License</div>
        `;
        this._openModal('readme');
    }

    // ── Toast & Confirm ───────────────────────────────────────────────────────

    _toast(msg, ms = 2200) {
        this.toast.textContent = msg;
        this.toast.style.display = 'block';
        this.toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this.toast.classList.remove('visible');
            setTimeout(() => { this.toast.style.display = 'none'; }, 300);
        }, ms);
    }

    showToast(msg, ms) { this._toast(msg, ms); }

    _confirm(title, message, onConfirm) {
        this.confirmTitle.textContent   = title;
        this.confirmMessage.textContent = message;
        this._confirmCb = onConfirm;
        this._openModal('confirm');
    }

    // ── Persistence ───────────────────────────────────────────────────────────

    _persist(what) {
        if (what === 'entries' || what === 'all')
            localStorage.setItem('ciglog_v1_entries',  JSON.stringify(this.entries));
        if (what === 'settings' || what === 'all')
            localStorage.setItem('ciglog_v1_settings', JSON.stringify(this.settings));
    }
}

// ── Boot ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new CigLogTracker();
});
