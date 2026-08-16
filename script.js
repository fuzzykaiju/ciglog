//  CigLog - Cigarette Logger

// --- Triggers ---
const TRIGGERS = [
    // Physiological
    { id: 'aftermeal',   label: 'After Meal',  icon: 'lunch_dining',      group: 'physiological' },
    { id: 'alcohol',     label: 'Alcohol',      icon: 'local_bar',       group: 'physiological' },
    { id: 'coffee',      label: 'Coffee/Tea',   icon: 'emoji_food_beverage', group: 'physiological' },
    { id: 'hunger',      label: 'Hunger',       icon: 'fork_spoon',    group: 'physiological' },
    { id: 'morning',     label: 'Morning',      icon: 'sunny',        group: 'physiological' },
    { id: 'pain',        label: 'Pain',         icon: 'healing',         group: 'physiological' },
    { id: 'postsmoke',   label: 'Post-Smoke',   icon: 'smoking_rooms',   group: 'physiological' },
    { id: 'tired',       label: 'Tired',        icon: 'hotel',           group: 'physiological' },
    { id: 'withdrawal',  label: 'Withdrawal',   icon: 'falling',         group: 'physiological' },
    // Psychological
    { id: 'alone',       label: 'Alone',        icon: 'man',             group: 'psychological' },
    { id: 'angry',       label: 'Angry',        icon: 'sentiment_extremely_dissatisfied', group: 'psychological' },
    { id: 'anxiety',     label: 'Anxiety',      icon: 'pulse_alert',     group: 'psychological' },
    { id: 'boredom',     label: 'Boredom',      icon: 'sentiment_neutral', group: 'psychological' },
    { id: 'habit',       label: 'Habit',        icon: 'cached',          group: 'psychological' },
    { id: 'restless',    label: 'Restless',     icon: 'psychology_alt',  group: 'psychological' },
    { id: 'reward',      label: 'Reward',       icon: 'trophy',          group: 'psychological' },
    { id: 'sad',         label: 'Sad',          icon: 'sentiment_dissatisfied', group: 'psychological' },
    { id: 'stress',      label: 'Stress',       icon: 'sentiment_stressed', group: 'psychological' },
    // Social
    { id: 'gathering',   label: 'Gathering',    icon: 'nightlife',       group: 'social' },
    { id: 'pressure',    label: 'Pressure',     icon: 'emoji_people', group: 'social' },
    { id: 'withsmokers', label: 'Smokers',      icon: 'diversity_3',     group: 'social' },
    // Situational
    { id: 'activity',    label: 'Activity',     icon: 'directions_run',  group: 'situational' },
    { id: 'afterwork',   label: 'After Work',   icon: 'moving_ministry', group: 'situational' },
    { id: 'commuting',   label: 'Commuting',    icon: 'train',           group: 'situational' },
    { id: 'driving',     label: 'Driving',      icon: 'directions_car',  group: 'situational' },
    { id: 'focus',       label: 'Focus',        icon: 'target',          group: 'situational' },
    { id: 'hobby',       label: 'Hobby',        icon: 'interests',       group: 'situational' },
    { id: 'outdoor',     label: 'Outdoors',     icon: 'nature',          group: 'situational' },
    { id: 'phonecall',   label: 'Phone Call',   icon: 'call',            group: 'situational' },
    { id: 'relaxing',    label: 'Relaxing',     icon: 'weekend',         group: 'situational' },
    { id: 'waiting',     label: 'Waiting',      icon: 'schedule',        group: 'situational' },
    { id: 'work',        label: 'Work',         icon: 'work',            group: 'situational' },
    { id: 'workbreak',   label: 'Work Break',   icon: 'work_history',    group: 'situational' },
];

// --- Trigger groups ---
const TRIGGER_GROUPS = [
    { key: 'physiological', label: 'Physiological' },
    { key: 'psychological', label: 'Psychological' },
    { key: 'social',        label: 'Social'        },
    { key: 'situational',   label: 'Situational'   },
];

class CigLogTracker {

    // --- Initialisation ---

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
            dailyLimit:  $('dailyLimitModal'),
            addCraving:  $('addCravingModal'),
            addSmoke:    $('addSmokeModal'),
            smart:       $('smartModal'),
            info:        $('infoModal'),
            editDay:     $('editDayModal'),
            editTrigger: $('editTriggerModal'),
            chart:       $('chartModal'),
            about:       $('aboutModal'),
            readme:      $('readmeModal'),
            changelog:   document.getElementById('changelogModal'),
            roadmap:     document.getElementById('roadmapModal'),
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

        // Smart modal
        this.smartTitle = $('smartTitle');
        this.smartLogTimeDefaults = $('smartLogTimeDefaults');
        this.smartHH = $('smartHH');
        this.smartMM = $('smartMM');
        this.smartCount = $('smartCount');
        this.saveSmartBtn = $('saveSmart');
        this.smartCopyTriggerBtn = $('smartCopyTriggerBtn');
        this.smartTriggerToggle = $('smartTriggerToggle');
        this.smartIntensitySelector = $('smartIntensitySelector');

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

        // Daily limit
        this.dailyLimitGroup = document.getElementById('dailyLimitGroup');

        // Chart
        this.timeRange    = $('timeRange');
        this.statSmoked   = $('totalSmoked');
        this.statCravings = $('totalCravings');
        this.statMoney    = $('moneySpent');
        this.statLifeLost = $('lifeLost');
        this.chart        = null;

        // Trigger sections
        this.cravingTriggerToggle  = $('cravingTriggerToggle');
        this.smokeTriggerToggle    = $('smokeTriggerToggle');
        this._pendingCravingTriggers = [];
        this._pendingSmokeTriggers   = [];
        this._pendingSmartTriggers = [];
        this._triggerModalSource     = null;
        this._activeTriggerPopover   = null;
        
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

        // Persistent listener for closing trigger popovers
        document.addEventListener('click', () => {
            if (this._activeTriggerPopover) {
                this._activeTriggerPopover.remove();
                this._activeTriggerPopover = null;
            }
        });
    }

    _bindListeners() {
        // Menu
        document.getElementById('menuToggle').addEventListener('click', () => this._openMenu());
        document.getElementById('closeMenu').addEventListener('click',  () => this._closeMenu());
        this.menuOverlay.addEventListener('click', () => this._closeMenu());

        // Menu items
        document.getElementById('chartBtn').addEventListener('click',
            () => { this._closeMenu(); this._openModal('chart'); setTimeout(() => this._renderChart(), 100); });
        document.getElementById('analyticsBtn').addEventListener('click',
            () => { this._closeMenu(); this._showAnalyticsView(); });
        document.getElementById('settingsMenuBtn').addEventListener('click',
            () => this._openSettings());
        document.getElementById('aboutBtn').addEventListener('click', () => {
            // Populate Chart.js version
            const chartVerSpan = document.getElementById('chartVersion');
            if (window.Chart && window.Chart.version) {
                chartVerSpan.textContent = window.Chart.version;
            } else {
                chartVerSpan.textContent = 'unknown';
            }
            // User agent
            document.getElementById('userAgent').textContent = navigator.userAgent;
            // Service worker status
            const swStatusSpan = document.getElementById('swStatus');
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                swStatusSpan.textContent = 'active';
            } else {
                swStatusSpan.textContent = 'not active';
            }
            this._closeMenu();
            this._openModal('about');
        });
        document.getElementById('readmeBtn').addEventListener('click',
            () => { this._closeMenu(); this._openReadme(); });
        document.getElementById('changelogBtn').addEventListener('click',
            () => { this._closeMenu(); this._openChangelog(); });
        document.getElementById('roadmapBtn').addEventListener('click',
            () => { this._closeMenu(); this._openRoadmap(); });
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
        
        // Daily limit modal
        document.getElementById('dailyLimitSet').addEventListener('click', () => {
            const input = document.getElementById('onboardingLimitValue');
            input.disabled = !input.disabled;
            if (!input.disabled) {
                // First click: enable input, change button text
                document.getElementById('dailyLimitSet').textContent = 'Confirm';
                input.focus();
            } else {
                // Second click: confirm and save
                const val = parseInt(input.value);
                if (isNaN(val) || input.value.trim() === '') {
                    this._toast('Please enter a number (0–99) or skip.');
                    return;
                }
                const newLimit = !isNaN(val) ? val : null;
                if (newLimit !== null) {
                    if (!this.settings.limitHistory) this.settings.limitHistory = [];
                    this.settings.limitHistory.push({ limit: newLimit, from: this._today() });
                }
                this.settings.dailyLimit = newLimit;
                this._persist('settings');
                this._closeModal('dailyLimit');
                this._finishOnboarding();
            }
        });

        document.getElementById('dailyLimitSkip').addEventListener('click', () => {
            this.settings.dailyLimit = null;
            this._persist('settings');
            this._closeModal('dailyLimit');
            this._finishOnboarding();
        });
        
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

        // Trigger toggles — open global trigger modal
        document.getElementById('cravingTriggerToggle').addEventListener('click', () => {
            this._openGlobalTriggerModal('craving', this._pendingCravingTriggers);
        });
        document.getElementById('smokeTriggerToggle').addEventListener('click', () => {
            this._openGlobalTriggerModal('smoke', this._pendingSmokeTriggers);
        });        
        document.getElementById('smokeCopyTriggerBtn').addEventListener('click', () => {
            this._pendingSmokeTriggers = [...this._recentCravingTriggers];
            const label = this._pendingSmokeTriggers.length + ' trigger' + (this._pendingSmokeTriggers.length > 1 ? 's' : '') + ' copied';
            this.smokeTriggerToggle.innerHTML = `<span class="ms ms-fill">bolt</span> ${label}`;
            document.getElementById('smokeCopyTriggerBtn').style.display = 'none';
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

        // Smart modal
        document.querySelector('.close-smart').addEventListener('click', () => this._closeModal('smart'));
        this.saveSmartBtn.addEventListener('click', () => this._saveSmart());
        this._bindTimeInputs(this.smartHH, this.smartMM, () => this._updateSmartSaveBtn());
        this.smartCount.addEventListener('input', () => {
            const v = parseInt(this.smartCount.value);
            if (!isNaN(v) && v < 1) this.smartCount.value = 1;
            this._updateSmartSaveBtn();
        });
        this.smartTriggerToggle.addEventListener('click', () => {
            this._openGlobalTriggerModal('smart', this._pendingSmartTriggers);
        });
        this.smartCopyTriggerBtn.addEventListener('click', () => {
            this._pendingSmartTriggers = [...this._recentCravingTriggers];
            const label = this._pendingSmartTriggers.length + ' trigger' + (this._pendingSmartTriggers.length > 1 ? 's' : '') + ' copied';
            this.smartTriggerToggle.innerHTML = `<span class="ms ms-fill">bolt</span> ${label}`;
            this.smartCopyTriggerBtn.style.display = 'none';
        });
        document.querySelectorAll('#smartIntensitySelector .intensity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#smartIntensitySelector .intensity-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this._updateSmartSaveBtn();
            });
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
        this.timeRange.addEventListener('change', () => this._renderChart());

        // Edit trigger modal
        document.querySelector('.close-edit-trigger').addEventListener('click',
            () => this._closeModal('editTrigger'));
        document.getElementById('cancelEditTrigger').addEventListener('click',
            () => this._closeModal('editTrigger'));
        document.getElementById('confirmEditTrigger').addEventListener('click',
            () => this._confirmEditTriggers());

        // Chart / About / Readme / Import close buttons
        document.querySelector('.close-chart').addEventListener('click',  () => this._closeChart());
        document.querySelector('.close-about').addEventListener('click',  () => this._closeModal('about'));
        document.querySelector('.close-readme').addEventListener('click', () => this._closeModal('readme'));
        document.querySelector('.close-changelog').addEventListener('click', () => this._closeModal('changelog'));
        document.querySelector('.close-roadmap').addEventListener('click',   () => this._closeModal('roadmap'));

        // Confirm modal
        this.confirmOk.addEventListener('click', () => {
            if (this._confirmCb) this._confirmCb();
            this._closeModal('confirm');
        });
        this.confirmCancel.onclick = () => this._closeModal('confirm');

        // Reset modal
        document.querySelector('.close-reset').addEventListener('click',  () => this._closeModal('reset'));
        document.getElementById('cancelReset').addEventListener('click',  () => this._closeModal('reset'));
        document.getElementById('confirmReset').addEventListener('click', () => this._doReset());

        // Backdrop clicks
        window.addEventListener('click', (e) => {
            // Modals that must not close on backdrop: settings, createToday, confirm, reset
            const locked = ['settings', 'createToday', 'confirm', 'reset', 'skippedDay', 'dailyLimit'];
            for (const [key, modal] of Object.entries(this.modals)) {
                if (e.target === modal && !locked.includes(key)) {
                    if (key === 'chart') this._closeChart();
                    else                 this._closeModal(key);
                    break;
                }
            }
        });

        // Daily limit checkbox toggle
        document.getElementById('dailyLimitEnabled').addEventListener('change', () => {
            const dlValue = document.getElementById('dailyLimitValue');
            dlValue.disabled = !document.getElementById('dailyLimitEnabled').checked;
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

    // --- Boot / setup flow ---

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
        const select = this.timezoneInput;
        select.innerHTML = '';
        // from UTC-12:00 to UTC+14:00 in 30-min steps
        for (let offset = -720; offset <= 840; offset += 30) {
            const hours = Math.floor(Math.abs(offset) / 60);
            const mins = Math.abs(offset) % 60;
            const sign = offset >= 0 ? '+' : '-';
            const label = `UTC${sign}${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
            const opt = document.createElement('option');
            opt.value = String(offset);
            opt.textContent = label;
            select.appendChild(opt);
        }
        // Default: user's current offset (or +05:30)
        const defaultOffset = this.settings?.timezoneOffset ?? -(new Date().getTimezoneOffset());
        select.value = String(defaultOffset);
    }

    _saveSettings() {
        const currency = this.currencyInput.value;
        const price    = parseFloat(this.priceInput.value);
        const timezoneOffset = parseInt(this.timezoneInput.value);

        if (!currency || isNaN(price) || price < 0.1 || isNaN(timezoneOffset)) {
            this._toast('Please fill all fields correctly.');
            return;
        }

        if (!this.settings) {
            // First-time setup            
            this.settings = {
                currency,
                cigarettePrice: price,
                timezoneOffset,
                setupDate: new Date().toISOString(),
                customTriggers: [],
                dailyLimit: null,
                limitHistory: [],
                featuredHistory: {}
            };
            this._persist('settings');
            this.currencyInput.disabled = false;
            this.timezoneInput.disabled = false;
            this._closeModal('settings');
            this.createTodayTitle.innerHTML = `<span class="ms">rocket_launch</span> Getting started!`;
            this._openModal('createToday');
        } else {
            // Update price + custom triggers
            this.settings.cigarettePrice = price;
            this.settings.timezoneOffset = timezoneOffset;
            const custom = [
                (document.getElementById('customTrigger0')?.value || '').trim(),
                (document.getElementById('customTrigger1')?.value || '').trim(),
                (document.getElementById('customTrigger2')?.value || '').trim(),
            ].filter(t => t.length > 0);
            this.settings.customTriggers = custom;

            // When saving, read daily limit
            const dailyLimitEnabled = document.getElementById('dailyLimitEnabled')?.checked;
            const dailyLimitValue   = parseInt(document.getElementById('dailyLimitValue')?.value);
            const newLimit = dailyLimitEnabled && !isNaN(dailyLimitValue) ? dailyLimitValue : null;
            if (newLimit !== this.settings.dailyLimit) {
                if (!this.settings.limitHistory) this.settings.limitHistory = [];
                if (newLimit !== null) {
                    this.settings.limitHistory.push({ limit: newLimit, from: this._today() });
                }
                this.settings.dailyLimit = newLimit;
            }

            this._persist('settings');
            this._toast('Settings saved <span class="ms ms-fill" style="color: var(--green);">check_small</span>');
            this._closeModal('settings');
        }
    }

    _openSettings() {
    this._closeMenu();

    if (this.settings) {
        // Existing settings – populate form
        this.currencyInput.value = this.settings.currency;
        this.priceInput.value = this.settings.cigarettePrice;
        this.currencySymbol.textContent = this.settings.currency;

        // Disable fields that cannot be changed after setup
        this.currencyInput.disabled = true;
        this.timezoneInput.disabled = true;
        this.priceInput.disabled = false;

        // Populate timezone offset – handle legacy named timezone
        let offset = this.settings.timezoneOffset;
        if (offset === undefined && this.settings.timezone) {
            // Try to compute offset from named timezone
            const now = new Date();
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: this.settings.timezone,
                timeZoneName: 'shortOffset'
            }).formatToParts(now);
            const offsetPart = parts.find(p => p.type === 'timeZoneName');
            if (offsetPart) {
                const match = offsetPart.value.match(/([+-])(\d{2}):(\d{2})/);
                if (match) {
                    const sign = match[1] === '+' ? 1 : -1;
                    offset = sign * (parseInt(match[2]) * 60 + parseInt(match[3]));
                }
            }
        }
        // Fallback to +05:30 if still undefined
        if (offset === undefined) offset = 330;
        this.timezoneInput.value = String(offset);

        // Set title and button
        this.settingsTitle.innerHTML = '<span class="ms">settings</span> Settings';
        document.getElementById('saveSettings').innerHTML = '<span class="ms">save</span> Save';
        this.closeSettingsBtn.style.display = 'block';

        // Show custom triggers & export/import sections
        this.customTriggerGroup.style.display = 'flex';
        this.exportImportGroup.style.display = 'flex';

        // Daily limit group
        this.dailyLimitGroup.classList.remove('daily-limit-hidden');
        const dlEnabled = document.getElementById('dailyLimitEnabled');
        const dlValue = document.getElementById('dailyLimitValue');
        dlEnabled.checked = this.settings.dailyLimit !== null && this.settings.dailyLimit !== undefined;
        dlValue.value = (this.settings.dailyLimit !== null && this.settings.dailyLimit !== undefined)
            ? this.settings.dailyLimit
            : '';
        dlValue.disabled = !dlEnabled.checked;

        this.customTriggerSection.classList.remove('open');

        // Populate custom trigger inputs
        const custom = this.settings.customTriggers || [];
        const $ = id => document.getElementById(id);
        $('customTrigger0').value = custom[0] || '';
        $('customTrigger1').value = custom[1] || '';
        $('customTrigger2').value = custom[2] || '';

    } else {
        // First run – hide advanced sections
        this.customTriggerGroup.style.display = 'none';
        this.exportImportGroup.style.display = 'none';
        this.dailyLimitGroup.classList.add('daily-limit-hidden');
        document.getElementById('saveSettings').innerHTML = '<span class="ms">play_arrow</span> Start Tracking';
        this.closeSettingsBtn.style.display = 'none';
        this.settingsTitle.innerHTML = '<span class="ms">wand_shine</span> Welcome to CigLog';

        // Set default timezone offset to user's current system offset
        const defaultOffset = -(new Date().getTimezoneOffset()); // minutes from UTC
        this.timezoneInput.value = String(defaultOffset);

        // Currency and price fields remain editable; timezone disabled after first save
        this.currencyInput.disabled = false;
        this.timezoneInput.disabled = false;
        this.priceInput.disabled = false;
    }

    this._openModal('settings');
}

    // --- Date utilities ---

    _today() {
        // If we have a named timezone (legacy), use it
        if (this.settings?.timezone && typeof this.settings.timezone === 'string') {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: this.settings.timezone,
                day: '2-digit', month: '2-digit', year: '2-digit'
            }).formatToParts(new Date());
            const d = parts.find(p => p.type === 'day').value;
            const m = parts.find(p => p.type === 'month').value;
            const y = parts.find(p => p.type === 'year').value;
            return `${d}-${m}-${y}`;
        }

        // Otherwise use stored offset in minutes
        const offset = this.settings?.timezoneOffset ?? 330; // default +05:30
        const now = new Date();
        const utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
                            now.getUTCHours(), now.getUTCMinutes()) + offset * 60000;
        const d = new Date(utc);
        const dd = String(d.getUTCDate()).padStart(2, '0');
        const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
        const yy = String(d.getUTCFullYear() - 2000).padStart(2, '0');
        return `${dd}-${mm}-${yy}`;
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

    // --- Entry helpers ---

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
        this._openModal('dailyLimit');
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

    // --- Trigger helpers ---

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
                    || (custom.findIndex(c => c === id) !== -1 ? { id, label: id, icon: 'label' } : null);
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
                const t = { id: `custom_${i}`, label, icon: 'label' };
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
        chip.innerHTML = `<span class="ms">${trigger.icon}</span><span>${trigger.label}</span>`;
        chip.addEventListener('click', () => chip.classList.toggle('selected'));
        return chip;
    }

    _getSelectedTriggers(container) {
        return [...container.querySelectorAll('.trigger-chip.selected')]
            .map(c => c.dataset.triggerId);
    }

    // --- Table rendering --- 

    // --- MLL formatters ---

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
                ? `<button class="info-btn skipped-btn" data-date="${entry.date}"><span class="ms">warning</span></button>`
                : `<button class="info-btn" data-date="${entry.date}"><span class="ms">keyboard_arrow_down</span></button>`;

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
                    <button class="edit-btn" data-date="${entry.date}"><span class="ms">more_vert</span></button>
                </div>`;
            this.entriesTable.appendChild(row);
        });

        // "Add previous day" row
        const addRow = document.createElement('div');
        addRow.className = 'add-previous-row';
        addRow.innerHTML = `
            <div class="add-previous-content">
                <button class="add-previous-btn"><span class="ms">add_circle</span></button>
                <span class="add-previous-text">Add entry for previous day</span>
            </div>`;
        addRow.querySelector('.add-previous-btn').addEventListener('click', () => this.addPreviousDay());
        this.entriesTable.appendChild(addRow);

        // Help text
        const help = document.createElement('div');
        help.className = 'help-row';
        help.innerHTML = `
            <p>• Tap <span class="ms">sentiment_frustrated</span> to log cravings</p>
            <p>• Tap <span class="ms">smoking_rooms</span> to log smokes</p>
            <p>• Long press <span class="ms">smoking_rooms</span> to log both</p>
            <p>• Tap <span class="ms">keyboard_arrow_down</span> to view timeline</p>
            <p>• Tap <span class="ms">more_vert</span> to edit entries</p>
            <p>• Tap <span class="ms">warning</span> on skipped days for more actions</p>`;
        this.entriesTable.appendChild(help);

        // Row event listeners
        this.entriesTable.querySelectorAll('.entry-cell[data-type]').forEach(cell => {
            cell.addEventListener('click', () => {
                // Check if a long press was triggered on this cell
                if (cell.dataset.longPress === 'true') {
                    cell.dataset.longPress = 'false';
                    return;
                }
                if (cell.dataset.type === 'craving') this._openAddCraving(cell.dataset.date);
                else this._openAddSmoke(cell.dataset.date);
            });
        });
        // Long press on smoke cell -> Smart Logging modal
        this.entriesTable.querySelectorAll('.entry-cell[data-type="smoke"]').forEach(cell => {
            const date = cell.dataset.date;
            let longPressTimer = null;

            const startTimer = () => {
                cell.dataset.longPress = 'false';
                longPressTimer = setTimeout(() => {
                    cell.dataset.longPress = 'true';
                    this._openSmartModal(date);
                }, 500);
            };

            const cancelTimer = () => {
                clearTimeout(longPressTimer);
            };

            const endTimer = (e) => {
                clearTimeout(longPressTimer);
                if (cell.dataset.longPress === 'true') {
                    // Prevent click event from firing
                    e.preventDefault();
                    e.stopPropagation();
                    // Reset after a brief delay to allow click to be blocked
                    setTimeout(() => { cell.dataset.longPress = 'false'; }, 100);
                }
            };

            // Mobile touch events
            cell.addEventListener('touchstart', startTimer, { passive: true });
            cell.addEventListener('touchmove', cancelTimer, { passive: true });
            cell.addEventListener('touchend', endTimer, { passive: false }); // passive: false to allow preventDefault
            cell.addEventListener('touchcancel', cancelTimer, { passive: true });

            // Desktop mouse events
            cell.addEventListener('mousedown', startTimer);
            cell.addEventListener('mouseup', endTimer);
            cell.addEventListener('mouseleave', cancelTimer);

            // Prevent context menu on long press
            cell.addEventListener('contextmenu', (e) => e.preventDefault());
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

    // --- Add Craving modal ---

    _openAddCraving(date) {
        this.activeDate = date;
        this.cravingTitle.innerHTML = `Log Craving<br><span class="modal-subtitle">${date}</span>`;
        document.querySelectorAll('.intensity-btn, .time-btn').forEach(b => b.classList.remove('selected'));
        this.cravingHH.value = '';
        this.cravingMM.value = '';
        this.saveCravingBtn.disabled = true;
        // Reset pending triggers
        this._pendingCravingTriggers = [];
        this.cravingTriggerToggle.innerHTML = '<span class="ms ms-fill">bolt</span> Add Trigger';
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
        const triggers = this._pendingCravingTriggers || [];
        this.entries[idx].cravings.push({ time: `${hh}:${mm}`, intensity: sel.dataset.intensity, triggers });
        this.entries[idx].cravings.sort((a, b) => this._byTimeAsc(a, b));
        if (this.entries[idx].skipped) this.entries[idx].skipped = false;
        this._persist('entries');
        this._closeModal('addCraving');
        this._renderTable();
    }

    // --- Add Smoke modal ---

    _openAddSmoke(date) {
        this.activeDate = date;
        this.smokeTitle.innerHTML = `Log Smoke<br><span class="modal-subtitle">${date}</span>`;
        document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
        this.smokeHH.value = '';
        this.smokeMM.value = '';
        this.cigaretteCount.value = '1';
        this.saveSmokeBtn.disabled = true;
        
        // Reset pending triggers
        this._pendingSmokeTriggers = [];
        this.smokeTriggerToggle.innerHTML = '<span class="ms ms-fill">bolt</span> Add Trigger';
        
        // Check for recent craving with triggers
        this._recentCravingTriggers = [];
        const entry = this._getEntry(date);
        if (entry && entry.cravings.length) {
            const now = new Date();
            const recentCraving = [...entry.cravings]
                .sort((a, b) => this._byTimeAsc(b, a))
                .find(c => {
                    const [hh, mm] = c.time.split(':').map(Number);
                    const cravingTime = new Date();
                    cravingTime.setHours(hh, mm, 0, 0);
                    const diffMin = (now - cravingTime) / 60000;
                    return diffMin >= 0 && diffMin <= 30 && (c.triggers || []).length > 0;
                });
            if (recentCraving) {
                this._recentCravingTriggers = recentCraving.triggers;
            }
        }

        // Update carry-over button visibility
        const carryBtn = document.getElementById('smokeCopyTriggerBtn');
        if (carryBtn) {
            carryBtn.style.display = this._recentCravingTriggers.length ? 'flex' : 'none';
        }
        if (date === this._today()) {
            this._buildTimePresets(this.smokeTimeDefaults, this.smokeHH, this.smokeMM,
                () => this._updateSaveBtn('smoke'));
        } else {
            this.smokeTimeDefaults.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Enter time manually for past dates</p>';
        }
        this._openModal('addSmoke');
    }

    // --- Smart Logging Modal ---

    _openSmartModal(date) {
        this.activeDate = date;
        this.smartTitle.innerHTML = `Log Both<br><span class="modal-subtitle">${date}</span>`;
        // Reset form
        document.querySelectorAll('#smartIntensitySelector .intensity-btn, .time-btn').forEach(b => b.classList.remove('selected'));
        this.smartHH.value = '';
        this.smartMM.value = '';
        this.smartCount.value = '1';
        this.saveSmartBtn.disabled = true;
        this._pendingSmartTriggers = [];
        this.smartTriggerToggle.innerHTML = '<span class="ms ms-fill">bolt</span> Add Trigger';
        this.smartCopyTriggerBtn.style.display = 'none';

        // Check for recent craving with triggers (for carry-over)
        this._recentCravingTriggers = [];
        const entry = this._getEntry(date);
        if (entry && entry.cravings.length) {
            const now = new Date();
            const recentCraving = [...entry.cravings]
                .sort((a, b) => this._byTimeAsc(b, a))
                .find(c => {
                    const [hh, mm] = c.time.split(':').map(Number);
                    const cravingTime = new Date();
                    cravingTime.setHours(hh, mm, 0, 0);
                    const diffMin = (now - cravingTime) / 60000;
                    return diffMin >= 0 && diffMin <= 30 && (c.triggers || []).length > 0;
                });
            if (recentCraving) {
                this._recentCravingTriggers = recentCraving.triggers;
            }
        }
        if (this._recentCravingTriggers.length) {
            this.smartCopyTriggerBtn.style.display = 'flex';
        }

        // Time presets
        if (date === this._today()) {
            this._buildTimePresets(this.smartLogTimeDefaults, this.smartHH, this.smartMM,
                () => this._updateSmartSaveBtn());
        } else {
            this.smartLogTimeDefaults.innerHTML = '<p style="grid-column:1/-1;text-align:center;">Enter time manually for past dates</p>';
        }

        this._openModal('smart');
    }

    _saveSmart() {
        const hh = this.smartHH.value.padStart(2, '0');
        const mm = this.smartMM.value.padStart(2, '0');
        const time = `${hh}:${mm}`;
        const count = parseInt(this.smartCount.value) || 1;
        const intensityBtn = document.querySelector('#smartIntensitySelector .intensity-btn.selected');
        if (!this._timeOk(this.smartHH, this.smartMM) || !intensityBtn) {
            this._toast('Please enter a valid time and select intensity');
            return;
        }
        const idx = this._getEntryIdx(this.activeDate);
        if (idx === -1) { this._toast('Error: entry not found'); return; }

        // Check for linkable craving within 30 minutes
        const linkableCraving = this._findLinkableCraving(this.activeDate, time);
        const triggers = this._pendingSmartTriggers || [];

        if (linkableCraving) {
            // Link to existing craving – no new craving
            this.entries[idx].smoked.push({
                time,
                count,
                pricePerCigarette: this.settings.cigarettePrice,
                triggers,
            });
            this.entries[idx].smoked.sort((a, b) => this._byTimeAsc(a, b));
            if (this.entries[idx].skipped) this.entries[idx].skipped = false;
            this._persist('entries');
            this._closeModal('smart');
            this._renderTable();
            this._startTimer();
            this._toast('Smoke linked to existing craving.');
            return;
        }

        // No linkable craving – create both
        const intensity = intensityBtn.dataset.intensity;
        this.entries[idx].cravings.push({ time, intensity, triggers, isLinked: false });
        this.entries[idx].cravings.sort((a, b) => this._byTimeAsc(a, b));
        this.entries[idx].smoked.push({
            time,
            count,
            pricePerCigarette: this.settings.cigarettePrice,
            triggers,
        });
        this.entries[idx].smoked.sort((a, b) => this._byTimeAsc(a, b));
        if (this.entries[idx].skipped) this.entries[idx].skipped = false;
        this._persist('entries');
        this._closeModal('smart');
        this._renderTable();
        this._startTimer();
        this._toast('Craving & Smoke logged.');
    }

    _findLinkableCraving(date, time) {
        const entry = this._getEntry(date);
        if (!entry) return null;
        const [hh, mm] = time.split(':').map(Number);
        const targetMinutes = hh * 60 + mm;

        const candidates = entry.cravings.filter(c => {
            const [cH, cM] = c.time.split(':').map(Number);
            const cMinutes = cH * 60 + cM;
            const diff = Math.abs(targetMinutes - cMinutes);
            return diff <= 30;
        });
        if (candidates.length === 0) return null;
        candidates.sort((a, b) => {
            const [aH, aM] = a.time.split(':').map(Number);
            const aMin = aH * 60 + aM;
            const [bH, bM] = b.time.split(':').map(Number);
            const bMin = bH * 60 + bM;
            return Math.abs(targetMinutes - aMin) - Math.abs(targetMinutes - bMin);
        });
        return candidates[0];
    }

    _updateSmartSaveBtn() {
        const timeOk = this._timeOk(this.smartHH, this.smartMM);
        const countVal = this.smartCount.value.trim();
        const count = parseInt(countVal);
        const countOk = countVal !== '' && !isNaN(count) && count >= 1;
        const intensityOk = document.querySelector('#smartIntensitySelector .intensity-btn.selected') !== null;
        this.saveSmartBtn.disabled = !(timeOk && countOk && intensityOk);
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
        const triggers = this._pendingSmokeTriggers || [];
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

    // --- Smart time presets ---

    _buildTimePresets(container, hhInput, mmInput, onChange) {
        const now     = new Date();
        const presets = [
            { label: 'Just now',  min: 0   },
            { label: '5m ago',    min: 5   },
            { label: '15m ago',   min: 15  },
            { label: '30m ago',   min: 30  },
            { label: '1hr ago',   min: 60  },
            { label: '2hr ago',   min: 120 },
        ];
        container.innerHTML = '';
        presets.forEach(({ label, min }) => {
            const btn = document.createElement('button');
            btn.className = 'time-btn';
            btn.textContent = label;
            const target = new Date(now.getTime() - min * 60000);
            if (target.getDate() !== now.getDate()) {
                btn.disabled = true;
                btn.style.opacity = '0.3';
            } else {
                btn.addEventListener('click', () => {
                    container.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    hhInput.value = String(target.getHours()).padStart(2, '0');
                    mmInput.value = String(target.getMinutes()).padStart(2, '0');
                    onChange();
                });
            }
            container.appendChild(btn);
        });
    }

    // --- Time input handling ---

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

    // --- Info / timeline modal ---

    _openInfo(date) {
        this.activeDate = date;
        this.infoTitle.innerHTML = `Info<br><span class="modal-subtitle">${date}</span>`;
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
                    : `<span class="timeline-square"><span class="ms ms-fill" style="color:var(--amber);font-size:0.7rem;">square</span></span>`;
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
                    <span class="timeline-emoji">${ev.type === 'craving' ? '<span class="ms">sentiment_frustrated</span>' : '<span class="ms">smoking_rooms</span>'}</span>
                    <span class="timeline-interval">${ev.interval}</span>
                    <span class="${boltClass}" data-triggers="${triggerNames}"><span class="ms ms-fill">bolt</span></span>
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
                    // Viewport-aware positioning
                    document.body.appendChild(pop);
                    const boltRect = bolt.getBoundingClientRect();
                    const popH = pop.offsetHeight;
                    const spaceAbove = boltRect.top;
                    const spaceBelow = window.innerHeight - boltRect.bottom;
                    if (spaceAbove > popH + 10 || spaceAbove > spaceBelow) {
                        // Position above
                        pop.style.top  = `${boltRect.top - popH - 8}px`;
                    } else {
                        // Position below
                        pop.style.top  = `${boltRect.bottom + 8}px`;
                    }
                    pop.style.left = `${Math.max(8, Math.min(boltRect.left + boltRect.width/2 - pop.offsetWidth/2, window.innerWidth - pop.offsetWidth - 8))}px`;
                    this._activeTriggerPopover = pop;
                });
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
        this._toast('Notes saved <span class="ms ms-fill" style="color: var(--green);">check_small</span>');
    }

    // --- Edit-day modal ---

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
        const savedTriggers = craving.triggers || [];
        const el = document.createElement('div');
        el.className = 'edit-item';
        el.dataset.triggers = JSON.stringify(savedTriggers);
        el.innerHTML = `
            <input type="checkbox" class="edit-checkbox craving-checkbox" data-index="${index}">
            <div class="edit-time-input">
                <input type="text" inputmode="numeric" class="edit-hh" value="${hh}" maxlength="2" placeholder="HH">
                <span>:</span>
                <input type="text" inputmode="numeric" class="edit-mm" value="${mm}" maxlength="2" placeholder="MM">
            </div>
            <div class="edit-intensity-selector">
                <button class="edit-intensity-btn low    ${craving.intensity === 'low'    ? 'selected' : ''}" data-intensity="low">L</button>
                <button class="edit-intensity-btn medium ${craving.intensity === 'medium' ? 'selected' : ''}" data-intensity="medium">M</button>
                <button class="edit-intensity-btn high   ${craving.intensity === 'high'   ? 'selected' : ''}" data-intensity="high">H</button>
            </div>
            <button type="button" class="edit-trigger-btn ${savedTriggers.length ? 'has-triggers' : ''}"><span class="ms ms-fill">bolt</span></button>`;
        const hhInput = el.querySelector('.edit-hh');
        const mmInput = el.querySelector('.edit-mm');
        this._bindTimeInputs(hhInput, mmInput, () => {});
        el.querySelectorAll('.edit-intensity-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                el.querySelectorAll('.edit-intensity-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });
        el.querySelector('.edit-trigger-btn').addEventListener('click', () => {
            this._openEditTriggerModal(el, savedTriggers);
        });
        el.querySelector('.edit-checkbox').addEventListener('change', () => this._syncDeleteBtns());
        return el;
    }

    _makeSmokeRow(smoke, index) {
        const [hh = '', mm = ''] = (smoke.time || '').split(':');
        const savedTriggers = smoke.triggers || [];
        const el = document.createElement('div');
        el.className = 'edit-item';
        el.dataset.triggers = JSON.stringify(savedTriggers);
        el.innerHTML = `
            <input type="checkbox" class="edit-checkbox smoke-checkbox" data-index="${index}">
            <div class="edit-time-input">
                <input type="text" inputmode="numeric" class="edit-hh" value="${hh}" maxlength="2" placeholder="HH">
                <span>:</span>
                <input type="text" inputmode="numeric" class="edit-mm" value="${mm}" maxlength="2" placeholder="MM">
            </div>
            <div class="edit-count-input">
                <span class="count-separator">×</span>
                <input type="number" class="edit-count" value="${smoke.count || 1}" min="1">
            </div>
            <button type="button" class="edit-trigger-btn ${savedTriggers.length ? 'has-triggers' : ''}"><span class="ms ms-fill">bolt</span></button>`;
        const hhInput = el.querySelector('.edit-hh');
        const mmInput = el.querySelector('.edit-mm');
        this._bindTimeInputs(hhInput, mmInput, () => {});
        el.querySelector('.edit-trigger-btn').addEventListener('click', () => {
            this._openEditTriggerModal(el, savedTriggers);
        });
        el.querySelector('.edit-checkbox').addEventListener('change', () => this._syncDeleteBtns());
        return el;
    }

    _openGlobalTriggerModal(source, currentTriggers = []) {
        this._triggerModalSource = source;
        const grid = document.getElementById('editTriggerChipGrid');
        this._buildTriggerChips(grid, currentTriggers);
        this._openModal('editTrigger');
    }

    _openEditTriggerModal(rowEl, currentTriggers) {
        this._openGlobalTriggerModal(rowEl, currentTriggers);
    }

    _confirmEditTriggers() {
        const grid = document.getElementById('editTriggerChipGrid');
        const selected = this._getSelectedTriggers(grid);
        const source = this._triggerModalSource;

        if (source === 'craving') {
            this._pendingCravingTriggers = selected;
            const label = selected.length ? `${selected.length} trigger${selected.length > 1 ? 's' : ''}` : 'Add Trigger';
            this.cravingTriggerToggle.innerHTML = `<span class="ms ms-fill">bolt</span> ${label}`;
        } else if (source === 'smoke') {
            this._pendingSmokeTriggers = selected;
            const label = selected.length ? `${selected.length} trigger${selected.length > 1 ? 's' : ''}` : 'Add Trigger';
            this.smokeTriggerToggle.innerHTML = `<span class="ms ms-fill">bolt</span> ${label}`;
        } else if (source === 'smart') {      // <-- ADD THIS BLOCK
            this._pendingSmartTriggers = selected;
            const label = selected.length ? `${selected.length} trigger${selected.length > 1 ? 's' : ''}` : 'Add Trigger';
            this.smartTriggerToggle.innerHTML = `<span class="ms ms-fill">bolt</span> ${label}`;
        } else if (source && typeof source === 'object') {
            // Edit modal row element
            source.dataset.triggers = JSON.stringify(selected);
            const btn = source.querySelector('.edit-trigger-btn');
            if (btn) btn.classList.toggle('has-triggers', selected.length > 0);
        }
        this._closeModal('editTrigger');
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
            const triggers = JSON.parse(item.dataset.triggers || '[]');
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
            const triggers = JSON.parse(item.dataset.triggers || '[]');
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
        this._toast('Changes saved <span class="ms ms-fill" style="color: var(--green);">check_small</span>');
        this._closeModal('editDay');
        this._renderTable();
        this._startTimer();
    }

    // --- Chart ---

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
        this.statMoney.textContent = this.settings.currency + parseFloat(totalMoney.toFixed(2)).toString();
        this.statLifeLost.textContent = this._fmtMLL(totalMLL);

        return filtered;
    }

    // New single chart
    _renderChart() {
        const filtered = this._filteredEntries();
        const st = this._chartStyle();

        if (this.chart) { this.chart.destroy(); this.chart = null; }

        this.chart = new Chart(
            document.getElementById('chartMain').getContext('2d'), {
                type: 'line',
                data: {
                    labels: filtered.map(e => e.date),
                    datasets: [
                        {
                            label: 'Smoked',
                            data: filtered.map(e => e.smoked.reduce((s, x) => s + x.count, 0)),
                            borderColor: '#FF9595',
                            backgroundColor: 'rgba(255,149,149,0.07)',
                            pointBackgroundColor: '#FF9595',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 2,
                            tension: 0.3,
                            fill: true,
                        },
                        {
                            label: 'Craved',
                            data: filtered.map(e => e.cravings.length),
                            borderColor: '#d9d9d9',
                            backgroundColor: 'rgba(217,217,217,0.04)',
                            pointBackgroundColor: '#d9d9d9',
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            borderWidth: 1.5,
                            borderDash: [5, 4],
                            tension: 0.3,
                            fill: false,
                        },
                    ],
                },
                options: this._chartOptions(st),
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
        if (this.chart) { this.chart.destroy(); this.chart = null; }
    }

    // --- Export / Import ---

    _exportCSV() {
        if (!this.entries.length) { this._toast('No data to export'); return; }
        const rows = ['Date,Time,Type,Intensity/Count,PricePerCigarette,Notes,Triggers'];

        this.entries.forEach(e => {
            const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;

            // --- Export normal events ---
            e.cravings.forEach(c => {
                const triggers = (c.triggers || []).join(';');
                rows.push([e.date, c.time, 'Craving', c.intensity, '', notes, `"${triggers}"`].join(','));
            });
            e.smoked.forEach(s => {
                const triggers = (s.triggers || []).join(';');
                rows.push([e.date, s.time, 'Smoked', s.count,
                    s.pricePerCigarette ?? this.settings.cigarettePrice, notes, `"${triggers}"`].join(','));
            });

            // --- Export empty entries (clean, skipped, or plain empty) ---
            if (e.cravings.length === 0 && e.smoked.length === 0) {
                let type = '';
                if (e.clean) type = 'Clean';
                else if (e.skipped) type = 'Skipped';
                else type = 'Empty'; // NEW: preserves unflagged empty days
                rows.push([e.date, '', type, 0, '', notes, '']);
            }
        });

        // --- Append settings block ---
        const settingsJSON = JSON.stringify(this.settings);
        const escapedSettings = settingsJSON.replace(/"/g, '""');
        rows.push(`Settings,"${escapedSettings}"`);

        const url = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }));
        const a = Object.assign(document.createElement('a'), {
            href: url,
            download: `ciglog_export_${new Date().toISOString().slice(0, 10)}.csv`,
        });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    _importCSV(source = 'settings') {
        const file = source === 'firstrun'
            ? this.csvFileFirstRun?.files[0]
            : this.csvFileSettings?.files[0];
        if (!file) { this._toast('Please select a CSV file'); return; }

        const reader = new FileReader();
        reader.onload = (e) => {
            let parsed;
            try {
                const lines = e.target.result.split('\n').filter(r => r.trim());
                if (lines.length < 2) {
                    this._toast('Import failed: file appears empty or invalid.');
                    return;
                }

                const byDate = {};
                let validRows = 0;
                let settingsImported = false;

                for (let i = 0; i < lines.length; i++) {
                    const cols = this._parseCSVLine(lines[i]);
                    if (cols.length === 0) continue;

                    // --- Check for Settings row ---
                    if (cols[0].toLowerCase() === 'settings' && cols.length >= 2) {
                        try {
                            const importedSettings = JSON.parse(cols[1]);
                            this.settings = { ...this.settings, ...importedSettings };
                            this._persist('settings');
                            settingsImported = true;
                        } catch (err) {
                            console.warn('Failed to parse settings row:', err);
                        }
                        continue;
                    }

                    // --- Parse row ---
                    const [date, time, type, value, price] = cols;
                    if (!date || !type) continue; // date and type required
                    if (!/^\d{2}-\d{2}-\d{2}$/.test(date)) continue;

                    const t = type.toLowerCase();

                    // --- Special types: Clean, Skipped, Empty (time can be empty) ---
                    if (t === 'clean' || t === 'skipped' || t === 'empty') {
                        if (!byDate[date]) byDate[date] = this._blankEntry(date);
                        byDate[date].clean = (t === 'clean');
                        byDate[date].skipped = (t === 'skipped');
                        byDate[date].cravings = [];
                        byDate[date].smoked = [];
                        const notes = (cols[5] || '').replace(/^"|"$/g, '');
                        if (notes) byDate[date].notes = notes;
                        validRows++;
                        continue;
                    }

                    // --- For normal craving/smoked, time is required ---
                    if (!time) continue;
                    if (t !== 'craving' && t !== 'smoked') continue;

                    const notes = (cols[5] || '').replace(/^"|"$/g, '');
                    const trigRaw = (cols[6] || '').replace(/^"|"$/g, '');
                    const triggers = trigRaw ? trigRaw.split(';').filter(x => x.trim()) : [];

                    if (!byDate[date]) byDate[date] = this._blankEntry(date);
                    if (!byDate[date].notes && notes) byDate[date].notes = notes;

                    if (t === 'craving') {
                        byDate[date].cravings.push({ time, intensity: value.toLowerCase(), triggers });
                    } else {
                        byDate[date].smoked.push({
                            time,
                            count: parseInt(value) || 1,
                            pricePerCigarette: parseFloat(price) || this.settings.cigarettePrice,
                            triggers,
                        });
                    }
                    validRows++;
                }

                if (validRows === 0 && !settingsImported) {
                    this._toast('Import failed: no valid data found.');
                    return;
                }

                parsed = Object.values(byDate).sort((a, b) => this._byDateDesc(a, b));

            } catch (err) {
                this._toast('Import failed: file appears corrupt or invalid.');
                console.error(err);
                return;
            }

            // --- Proceed with import ---
            const doImport = () => {
                this.entries = parsed;
                this._persist('entries');
                this._backfillSkippedDays();
                this._ensureTodayExists();
                this._closeModal('settings');
                this._renderTable();
                this._startTimer();
                if (document.getElementById('analyticsView').style.display !== 'none') {
                    this._renderAnalytics();
                }
                this._toast(`Imported ${parsed.length} days of data`);
                if (this.csvFileSettings) this.csvFileSettings.value = '';
            };

            // --- First‑run import: skip backfill (data is complete) ---
            if (source === 'firstrun') {
                this.entries = parsed;
                this._persist('entries');
                // No backfill – imported data is complete
                this._ensureTodayExists(); // still add today if missing
                this._closeModal('createToday');
                this._openModal('dailyLimit');
                this._toast(`Imported ${parsed.length} days of data`);
                if (this.csvFileFirstRun) this.csvFileFirstRun.value = '';
                return;
            }

            // --- Existing data safety flow ---
            if (this.entries.length > 0) {
                this._confirm(
                    'Import Data',
                    'You have existing data. Importing will replace it permanently. Export a backup first?',
                    () => doImport()
                );
                this.confirmOk.textContent = 'Import Anyway';
                const exportAndContinue = () => {
                    this._exportCSV();
                    setTimeout(() => {
                        this.confirmCancel.onclick = () => this._closeModal('confirm');
                        this._confirm(
                            'Backup Saved',
                            'Your backup has been downloaded. Proceed with import?',
                            doImport
                        );
                        this.confirmOk.textContent = 'Proceed with Import';
                        this.confirmCancel.textContent = 'Cancel';
                    }, 500);
                };
                this.confirmCancel.textContent = 'Export & Continue';
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

    // --- Modal management ---

    _openModal(key) {
        this.modals[key].style.display = 'block';

        // Reset daily limit modal state when opened
        if (key === 'dailyLimit') {
            const setBtn = document.getElementById('dailyLimitSet');
            const input = document.getElementById('onboardingLimitValue');
            setBtn.textContent = 'Set Limit';
            input.disabled = true;
            input.value = '';
        }
    }

    _closeModal(key) {
        this.modals[key].style.display = 'none';
        if (['addCraving', 'addSmoke', 'info', 'editDay'].includes(key)) this.activeDate = null;
        if (key === 'confirm') {
            this._confirmCb = null;
            this.confirmOk.textContent = 'Confirm';
            this.confirmCancel.textContent = 'Cancel';
            this.confirmCancel.onclick = () => this._closeModal('confirm');
        }
    }

    _openMenu()  { this.sideMenu.style.right = '0'; this.menuOverlay.style.display = 'block'; }
    _closeMenu() { this.sideMenu.style.right = '-300px'; this.menuOverlay.style.display = 'none'; }

    // --- Reset ---

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

    // --- Last-smoked timer ---

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

    // --- Finish Onboarding ---
    _finishOnboarding() {
        this._renderTable();
        this._startTimer();
    }

    // --- README modal ---

    _openReadme() {
        const body = document.getElementById('readmeBody');
        fetch('./META-README.html')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.text();
            })
            .then(html => {
                body.innerHTML = html;
                this._openModal('readme');
            })
            .catch(err => {
                console.warn('Failed to load README content:', err);
                body.innerHTML = '<p>Error loading README content.</p>';
                this._openModal('readme');
            });
    }

    // --- Changelog modal ---

    _openChangelog() {
        const body = document.getElementById('changelogBody');
        fetch('./META-CHANGELOG.html')
            .then(r => { if (!r.ok) throw new Error(); return r.text(); })
            .then(html => { body.innerHTML = html; this._openModal('changelog'); })
            .catch(() => { body.innerHTML = '<p>Error loading changelog.</p>'; this._openModal('changelog'); });
    }

    // --- Roadmap modal ---

    _openRoadmap() {
        const body = document.getElementById('roadmapBody');
        fetch('./META-ROADMAP.html')
            .then(r => { if (!r.ok) throw new Error(); return r.text(); })
            .then(html => { body.innerHTML = html; this._openModal('roadmap'); })
            .catch(() => { body.innerHTML = '<p>Error loading roadmap.</p>'; this._openModal('roadmap'); });
    }

    // --- Toast & Confirm ---

    _toast(msg, ms = 2200) {
        this.toast.innerHTML = msg;
        this.toast.style.display = 'block';
        this.toast.classList.add('visible');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this.toast.classList.remove('visible');
            setTimeout(() => { this.toast.style.display = 'none'; }, 300);
        }, ms);
    }

    _confirm(title, message, onConfirm) {
        this.confirmTitle.textContent   = title;
        this.confirmMessage.textContent = message;
        this._confirmCb = onConfirm;
        this._openModal('confirm');
    }

    // --- Persistence ---

    _persist(what) {
        if (what === 'entries' || what === 'all')
            localStorage.setItem('ciglog_v1_entries',  JSON.stringify(this.entries));
        if (what === 'settings' || what === 'all')
            localStorage.setItem('ciglog_v1_settings', JSON.stringify(this.settings));
    }

    // --- CSV line parser ---
    _parseCSVLine(line) {
        const result = [];
        let current = '';
        let insideQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (insideQuotes) {
                if (ch === '"' && i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i++; // skip escaped quote
                } else if (ch === '"') {
                    insideQuotes = false;
                } else {
                    current += ch;
                }
            } else {
                if (ch === ',') {
                    result.push(current.trim());
                    current = '';
                } else if (ch === '"') {
                    insideQuotes = true;
                } else {
                    current += ch;
                }
            }
        }
        result.push(current.trim());
        return result;
    }

    // --- Analytics View ---

    _showAnalyticsView() {
        document.querySelector('.main-content').style.display = 'none';
        document.getElementById('analyticsView').style.display = 'flex';
        document.body.classList.add('analytics-active');
        // Preserve period across re-renders; default 30 on first open
        if (!this._analyticsPeriod) this._analyticsPeriod = 30;
        if (this._calMonth === undefined) {
            this._calMonth = new Date().getMonth();
            this._calYear  = new Date().getFullYear();
        }
        this._renderAnalytics();

        // Back button
        document.getElementById('backToTableBtn').onclick = () => this._showMainTableView();
    }

    _showMainTableView() {
        document.getElementById('analyticsView').style.display = 'none';
        document.querySelector('.main-content').style.display = 'block';
        document.body.classList.remove('analytics-active');
        // Destroy analytics chart if it exists
        if (this._analyticsChart) {
            this._analyticsChart.destroy();
            this._analyticsChart = null;
        }
    }

    _getAnalyticsPeriodEntries() {
        const days   = this._analyticsPeriod || 30;
        const now    = new Date();
        const cutoff = new Date(now);
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0,0,0,0);
        return this.entries
            .filter(e => { const d = this._toDate(e.date); return d >= cutoff && d <= now; })
            .sort((a, b) => this._toDate(a.date) - this._toDate(b.date));
    }

    // --- Data helpers ---

    _computeTriggerStats(entries, minCount = 5) {
        const stats = {}; // id → { cravings, smoked }

        const allTriggerIds = () => {
            const ids = new Set();
            entries.forEach(e => {
                [...e.cravings, ...e.smoked].forEach(ev =>
                    (ev.triggers || []).forEach(id => ids.add(id))
                );
            });
            return [...ids];
        };

        allTriggerIds().forEach(id => { stats[id] = { cravings: 0, smoked: 0 }; });

        entries.forEach(e => {
            e.cravings.forEach(c => (c.triggers || []).forEach(id => {
                if (stats[id]) stats[id].cravings++;
            }));
            e.smoked.forEach(s => (s.triggers || []).forEach(id => {
                if (stats[id]) stats[id].smoked++;
            }));
        });

        return Object.entries(stats)
            .map(([id, { cravings, smoked }]) => {
                const total = cravings + smoked;
                return { id, cravings, smoked, total, rate: total ? smoked / total : 0 };
            })
            .filter(t => t.total >= minCount)
            .sort((a, b) => b.rate - a.rate);
    }

    _computeTriggerPairStats(entries, minCount = 5) {
        const pairs = {}; // "id1|id2" → { cravings, smoked }

        const addPairs = (evList, type) => {
            evList.forEach(ev => {
                const triggers = (ev.triggers || []).slice().sort();
                for (let i = 0; i < triggers.length; i++) {
                    for (let j = i + 1; j < triggers.length; j++) {
                        const key = `${triggers[i]}|${triggers[j]}`;
                        if (!pairs[key]) pairs[key] = { cravings: 0, smoked: 0 };
                        pairs[key][type]++;
                    }
                }
            });
        };

        entries.forEach(e => {
            addPairs(e.cravings, 'cravings');
            addPairs(e.smoked,   'smoked');
        });

        return Object.entries(pairs)
            .map(([key, { cravings, smoked }]) => {
                const [idA, idB] = key.split('|');
                const total = cravings + smoked;
                return { idA, idB, cravings, smoked, total, rate: total ? smoked / total : 0 };
            })
            .filter(p => p.total >= minCount)
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 3);
    }
    
    _computeResistanceStreak(entries) {
        // Flatten all events chronologically; increment streak on craving, reset on any smoked entry
        const allEvents = [];
        entries.forEach(e => {
            e.cravings.forEach(c => {
                const [d, m, y] = e.date.split('-').map(Number);
                const [hh, mm]  = c.time.split(':').map(Number);
                allEvents.push({ dt: new Date(2000+y, m-1, d, hh, mm), type: 'craving' });
            });
            e.smoked.forEach(s => {
                const [d, m, y] = e.date.split('-').map(Number);
                const [hh, mm]  = s.time.split(':').map(Number);
                allEvents.push({ dt: new Date(2000+y, m-1, d, hh, mm), type: 'smoked' });
            });
        });
        allEvents.sort((a, b) => a.dt - b.dt || (a.type === 'craving' ? -1 : 1));

        // Remove cravings that have a smoke at the exact same timestamp
        const smokedTimes = new Set(
            allEvents.filter(e => e.type === 'smoked').map(e => e.dt.getTime())
        );
        const filteredEvents = allEvents.filter(e => 
            !(e.type === 'craving' && smokedTimes.has(e.dt.getTime()))
        );

        let current = 0, longest = 0;
        filteredEvents.forEach(ev => {
            if (ev.type === 'craving') {
                current++;
                if (current > longest) longest = current;
            } else {
                current = 0;
            }
        });        
        return longest;
    }

    _getLimitForDate(dateStr) {
        const history = this.settings.limitHistory || [];
        if (!history.length) return this.settings.dailyLimit ?? null;
        const active = [...history]
            .filter(h => this._toDate(h.from) <= this._toDate(dateStr))
            .sort((a, b) => this._toDate(b.from) - this._toDate(a.from));
        return active.length ? active[0].limit : null;
    }

    _computeTimeOfDay(entries) {
        // 2-hour bins: index 0 = midnight–2am, 11 = 10pm–midnight
        const cravings = new Array(12).fill(0);
        const smoked   = new Array(12).fill(0);
        entries.forEach(e => {
            e.cravings.forEach(c => { cravings[Math.floor(parseInt(c.time.split(':')[0]) / 2)]++; });
            e.smoked.forEach(s   => { smoked[Math.floor(parseInt(s.time.split(':')[0]) / 2)]++;   });
        });
        return { cravings, smoked };
    }

    _todBinLabels() {
        return ['12–2a','2–4a','4–6a','6–8a','8–10a','10a–12p',
                '12–2p','2–4p','4–6p','6–8p','8–10p','10p–12a'];
    }

    _triggerLabel(id) {
        const preset = TRIGGERS.find(t => t.id === id);
        if (preset) return { label: preset.label, icon: preset.icon };
        const custom = (this.settings.customTriggers || []);
        const ci = parseInt(id.replace('custom_', ''));
        return { label: custom[ci] || id, icon: 'label' };
    }

    // Intensity Trend (Insight)
    _computeIntensityTrend() {
        const today = this._today();
        const todayDt = this._toDate(today);
        const d7 = new Date(todayDt);
        d7.setDate(d7.getDate() - 6);
        d7.setHours(0, 0, 0, 0);
        const d14 = new Date(todayDt);
        d14.setDate(d14.getDate() - 13);
        d14.setHours(0, 0, 0, 0);

        const last7 = this.entries.filter(e => {
            const d = this._toDate(e.date);
            return d >= d7 && d <= todayDt;
        });
        const prev7 = this.entries.filter(e => {
            const d = this._toDate(e.date);
            return d >= d14 && d < d7;
        });

        const countIntensities = (entries) => {
            const counts = { low: 0, medium: 0, high: 0 };
            entries.forEach(e => {
                e.cravings.forEach(c => {
                    if (c.intensity && counts[c.intensity] !== undefined) counts[c.intensity]++;
                });
            });
            return counts;
        };

        const currCounts = countIntensities(last7);
        const prevCounts = countIntensities(prev7);
        const currTotal = currCounts.low + currCounts.medium + currCounts.high;
        const prevTotal = prevCounts.low + prevCounts.medium + prevCounts.high;

        if (currTotal < 5 || prevTotal < 3) return null;

        const currHighPct = Math.round((currCounts.high / currTotal) * 100);
        const prevHighPct = Math.round((prevCounts.high / prevTotal) * 100);
        const shift = currHighPct - prevHighPct;

        if (Math.abs(shift) < 5) return null;

        const dir = shift > 0 ? 'up' : 'down';
        return {
            text: `This week, ${currHighPct}% of your cravings were High intensity – that's ${dir} from ${prevHighPct}% last week.`,
            shift,
        };
    }

    // Trigger + Intensity Association (Insight)
    _computeTriggerIntensityInsight() {
        const triggerData = {};
        this.entries.forEach(e => {
            e.cravings.forEach(c => {
                const triggers = c.triggers || [];
                const intensity = c.intensity;
                if (!triggers.length || !intensity) return;
                triggers.forEach(id => {
                    if (!triggerData[id]) triggerData[id] = { total: 0, high: 0, low: 0 };
                    triggerData[id].total++;
                    if (intensity === 'high') triggerData[id].high++;
                    if (intensity === 'low') triggerData[id].low++;
                });
            });
        });

        const eligible = Object.entries(triggerData)
            .filter(([id, data]) => data.total >= 3)
            .map(([id, data]) => ({
                id,
                total: data.total,
                highPct: Math.round((data.high / data.total) * 100),
                lowPct: Math.round((data.low / data.total) * 100),
            }));

        if (eligible.length < 2) return null;

        const sortedByHigh = [...eligible].sort((a, b) => b.highPct - a.highPct);
        const topHigh = sortedByHigh[0];
        const bottomHigh = sortedByHigh[sortedByHigh.length - 1];

        if (topHigh.highPct - bottomHigh.highPct < 20) return null;

        const topLabel = this._triggerLabel(topHigh.id).label;
        const bottomLabel = this._triggerLabel(bottomHigh.id).label;

        let tail = '';
        if (bottomHigh.lowPct >= 50) {
            tail = `but ${bottomLabel} is usually Low (${bottomHigh.lowPct}% Low).`;
        } else {
            tail = `while ${bottomLabel} triggers High only ${bottomHigh.highPct}% of the time.`;
        }

        return `${topLabel} triggers High cravings ${topHigh.highPct}% of the time, ${tail}`;
    }
    
    // Pick featured insight
    _pickFeaturedInsight(sentences) {
        if (!sentences || !sentences.length) return null;
        this._cleanupFeaturedHistory(sentences);

        const withDecay = sentences.map(s => ({
            ...s,
            effectivePriority: this._getDecayedPriority(s.text, s.priority ?? null),
            lastFeatured: this.settings.featuredHistory?.[s.text] ?? null,
        }));

        withDecay.sort((a, b) => {
            const aEff = a.effectivePriority ?? Infinity;
            const bEff = b.effectivePriority ?? Infinity;
            if (aEff !== bEff) return aEff - bEff;
            const aTime = a.lastFeatured ?? 0;
            const bTime = b.lastFeatured ?? 0;
            if (aTime !== bTime) return aTime - bTime;
            return a.text.localeCompare(b.text);
        });

        return withDecay[0]?.text || null;
    }

    // Decay helper with edge-case handling
    _getDecayedPriority(sentence, basePriority) {
        if (basePriority !== null && basePriority <= 3) return basePriority;
        if (!this.settings.featuredHistory) return basePriority;
        const lastFeatured = this.settings.featuredHistory[sentence];
        if (!lastFeatured) return basePriority;

        const hoursSince = (Date.now() - lastFeatured) / (1000 * 60 * 60);
        let penalty = 0;
        if (hoursSince < 24) penalty = 2;
        else if (hoursSince < 72) penalty = 1;
        if (basePriority === null) return null;
        return basePriority + penalty;
    }

    // Clean up stale featuredHistory entries
    _cleanupFeaturedHistory(currentSentences) {
        if (!this.settings.featuredHistory) return;
        const currentTexts = new Set(currentSentences.map(s => s.text));
        let changed = false;
        Object.keys(this.settings.featuredHistory).forEach(key => {
            if (!currentTexts.has(key)) {
                delete this.settings.featuredHistory[key];
                changed = true;
            }
        });
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        Object.keys(this.settings.featuredHistory).forEach(key => {
            if (this.settings.featuredHistory[key] < thirtyDaysAgo) {
                delete this.settings.featuredHistory[key];
                changed = true;
            }
        });
        if (changed) this._persist('settings');
    }

    // --- Insight sentences ---
    _generateInsightSentences(entries, triggerStats) {
        const sentences = [];
        const tod = this._computeTimeOfDay(entries);
        const binLabels = this._todBinLabels();

        // 1. Peak smoking time (priority 6)
        const peakBin = tod.smoked.indexOf(Math.max(...tod.smoked));
        if (Math.max(...tod.smoked) > 0) {
            sentences.push({
                text: `Most smoking occurs between ${binLabels[peakBin]}.`,
                priority: 6,
            });
        }

        // 2. Most dangerous trigger (priority 4)
        if (triggerStats.length > 0) {
            const top = triggerStats[0];
            const { label } = this._triggerLabel(top.id);
            sentences.push({
                text: `${label} is your strongest smoking trigger (${Math.round(top.rate * 100)}% conversion).`,
                priority: 4,
            });
        }

        // 3. Daily average — with or without limit comparison
        const totalSmoked = entries.reduce((s, e) => s + e.smoked.reduce((x, y) => x + y.count, 0), 0);
        const uniqueDays = new Set(entries.map(e => e.date)).size;
        if (uniqueDays > 0 && totalSmoked > 0) {
            const avg = (totalSmoked / uniqueDays).toFixed(1);
            const limitEntries = entries.filter(e => this._getLimitForDate(e.date) !== null);
            if (limitEntries.length > 0) {
                const weightedLimit = limitEntries.reduce((s, e) => s + this._getLimitForDate(e.date), 0) / limitEntries.length;
                if (weightedLimit > 0) {
                    const pct = Math.round(((parseFloat(avg) - weightedLimit) / weightedLimit) * 100);
                    const dir = pct > 0 ? `${pct}% over` : `${Math.abs(pct)}% under`;
                    // Priority 2 if over limit by 20% or more
                    const priority = (pct >= 20) ? 2 : null;
                    sentences.push({
                        text: `You average ${avg} cigs/day — ${dir} your limit.`,
                        priority,
                    });
                } else {
                    sentences.push({
                        text: `You average ${avg} cigs/day against a limit of 0.`,
                        priority: null,
                    });
                }
            } else {
                sentences.push({
                    text: `You average ${avg} cigarettes per day in this period.`,
                    priority: null,
                });
            }
        }

        // 4. Spending projection (priority 5)
        const totalMoney = entries.reduce((s, e) => s + e.smoked.reduce((x, y) =>
            x + y.count * (y.pricePerCigarette ?? this.settings.cigarettePrice), 0), 0);
        if (uniqueDays >= 7 && totalMoney > 0) {
            const yearlyProjection = Math.round((totalMoney / uniqueDays) * 365);
            sentences.push({
                text: `At your current rate, you'll spend ${this.settings.currency}${yearlyProjection} on cigarettes this year.`,
                priority: 5,
            });
        }

        // 5. Smoking trend (priority 1 if trending up)
        if (uniqueDays >= 14) {
            const sorted = [...entries].sort((a, b) => this._toDate(a.date) - this._toDate(b.date));
            const n = sorted.length;
            const yValues = sorted.map(e => e.smoked.reduce((s, x) => s + x.count, 0));
            const yMean = yValues.reduce((s, v) => s + v, 0) / n;
            const xMean = (n - 1) / 2;
            let num = 0, den = 0;
            yValues.forEach((y, i) => {
                num += (i - xMean) * (y - yMean);
                den += (i - xMean) ** 2;
            });
            const slope = den !== 0 ? num / den : 0;
            const weeklySlope = Math.abs(slope * 7).toFixed(1);
            if (Math.abs(slope) * 7 >= 0.2) {
                const dir = slope > 0 ? 'up' : 'down';
                const priority = (dir === 'up') ? 1 : null;
                sentences.push({
                    text: `Smoking is trending ${dir} by ${weeklySlope} cigarettes per week.`,
                    priority,
                });
            }
        }

        // 6. Intensity Trend (priority 3 if high% shift > 10)
        const intensityTrend = this._computeIntensityTrend();
        if (intensityTrend) {
            const priority = (Math.abs(intensityTrend.shift) > 10) ? 3 : null;
            sentences.push({
                text: intensityTrend.text,
                priority,
            });
        }

        // 7. Trigger + Intensity Association (no priority)
        const triggerIntensity = this._computeTriggerIntensityInsight();
        if (triggerIntensity) {
            sentences.push({
                text: triggerIntensity,
                priority: null,
            });
        }

        // 8. Worst day (no priority)
        const worst = entries.reduce((acc, e) => {
            const count = e.smoked.reduce((s, x) => s + x.count, 0);
            return count > acc.count ? { date: e.date, count } : acc;
        }, { date: null, count: 0 });
        if (worst.count > 0) {
            sentences.push({
                text: `Highest single day was ${worst.count} cigarette${worst.count !== 1 ? 's' : ''} (${worst.date}).`,
                priority: null,
            });
        }

        return sentences;
    }

    // --- Render ---

    _renderAnalytics() {
        const content = document.getElementById('analyticsContent');
        const entries = this._getAnalyticsPeriodEntries();
        content.innerHTML = '';

        if (!entries.length) {
            content.innerHTML = '<p class="analytics-empty" style="margin-top:40px;">No data in this period. Start logging to see analytics.</p>';
            return;
        }
        
        const triggerStats = this._computeTriggerStats(entries, 5);
        const pairStats    = this._computeTriggerPairStats(entries, 5);
        const sentences    = this._generateInsightSentences(entries, triggerStats);
        
        // 1. Weekly summary (with delta comparison)
        // Normalize to midnight to avoid time-of-day boundary drift
        // last7  = today and the 6 days before it (7 days total, inclusive)
        // prev7  = the 7 days before that (days 8–14 ago)
        const todayMidnight = new Date(); todayMidnight.setHours(23,59,59,999);
        const d7  = new Date(); d7.setDate(d7.getDate() - 6);   d7.setHours(0,0,0,0);
        const d14 = new Date(); d14.setDate(d14.getDate() - 13); d14.setHours(0,0,0,0);

        const last7 = this.entries.filter(e => {
            const d = this._toDate(e.date);
            return d >= d7 && d <= todayMidnight;
        });
        const prev7 = this.entries.filter(e => {
            const d = this._toDate(e.date);
            return d >= d14 && d < d7;
        });

        // 14‑day threshold for deltas
        const totalLoggedDays = last7.length + prev7.length;
        const hasEnoughData = totalLoggedDays >= 14;

        const w7Smoked       = last7.reduce((s, e) => s + e.smoked.reduce((x, y) => x + y.count, 0), 0);
        const w7Cravings     = last7.reduce((s, e) => s + e.cravings.length, 0);
        // Use cigarette COUNT (not entry count) so logging 3 cigs in one entry counts as 3
        const w7Resisted     = Math.max(0, w7Cravings - w7Smoked);
        // Resistance rate = resisted / total cravings
        const w7ResRate      = w7Cravings > 0
            ? Math.round((w7Resisted / w7Cravings) * 100) : null;
        const w7Streak       = this._computeResistanceStreak(last7);
        const w7Money        = last7.reduce((s, e) => s + e.smoked.reduce((x, y) =>
            x + y.count * (y.pricePerCigarette ?? this.settings.cigarettePrice), 0), 0);
        const w7MLL          = w7Smoked * 20;

        // Previous 7 days
        const p7Smoked       = prev7.reduce((s, e) => s + e.smoked.reduce((x, y) => x + y.count, 0), 0);
        const p7Cravings     = prev7.reduce((s, e) => s + e.cravings.length, 0);
        const p7Resisted     = Math.max(0, p7Cravings - p7Smoked);
        const p7ResRate      = p7Cravings > 0
            ? Math.round((p7Resisted / p7Cravings) * 100) : null;

        // Delta helper — returns bracket HTML or empty string
        const _delta = (curr, prev, lowerIsBetter = true) => {
            if (!hasEnoughData) return '';            
            if (prev === 0) return '';
            const pct = Math.round(((curr - prev) / prev) * 100);
            if (pct === 0) return '&nbsp;<span class="weekly-delta-bracket">[</span><span class="weekly-delta" style="color:var(--text-secondary);">-</span><span class="weekly-delta-bracket">]</span>';
            const arrow = pct < 0 ? '↓' : '↑';
            // lowerIsBetter: decrease = good (green), increase = bad (red)
            const isGood = lowerIsBetter ? pct < 0 : pct > 0;
            const cls = isGood ? 'delta-green' : 'delta-red';
            return ` <span class="weekly-delta-bracket">[</span><span class="weekly-delta ${cls}">${arrow}${Math.abs(pct)}%</span><span class="weekly-delta-bracket">]</span>`;
        };
        
        // Delta arrow helper — returns just an arrow HTML or empty string
        const _deltaArrow = (curr, prev, lowerIsBetter = true) => {
            if (!hasEnoughData || prev === 0) return '';
            const isGood = lowerIsBetter ? curr < prev : curr > prev;
            const arrow = curr < prev ? '↓' : curr > prev ? '↑' : '';
            if (!arrow) return '';
            const cls = isGood ? 'delta-green' : 'delta-red';
            return ` <span class="weekly-delta-bracket">[</span><span class="weekly-delta ${cls}">${arrow}</span><span class="weekly-delta-bracket">]</span>`;
        };

        // Resistance rate delta — relative % change, higher is better
        const resRateDelta = (() => {
            if (!hasEnoughData || w7ResRate === null || p7ResRate === null || p7ResRate === 0) return '';
            const pct = Math.round(((w7ResRate - p7ResRate) / p7ResRate) * 100);
            if (pct === 0) return '&nbsp;<span class="weekly-delta-bracket">[</span><span class="weekly-delta" style="color:var(--text-secondary);">-</span><span class="weekly-delta-bracket">]</span>';
            const arrow = pct > 0 ? '↑' : '↓';
            const cls   = pct > 0 ? 'delta-green' : 'delta-red';
            return ` <span class="weekly-delta-bracket">[</span><span class="weekly-delta ${cls}">${arrow}${Math.abs(pct)}%</span><span class="weekly-delta-bracket">]</span>`;
        })();

        // Trigger labels (min 3 for 7-day window) — tie-aware
        const w7TrigStats = this._computeTriggerStats(last7, 3);
        const w7Freq      = this._computeTriggerStats(last7, 1).sort((a, b) => b.total - a.total);

        // Helper: given sorted stats array and key to compare, return up to 2 tied labels
        const _tiedLabels = (stats, key) => {
            if (!stats.length) return null;
            const topVal = stats[0][key];
            const tied   = stats
                .filter(t => t[key] === topVal)
                .map(t => this._triggerLabel(t.id).label)
                .sort((a, b) => a.localeCompare(b))
                .slice(0, 2);
            return tied.join(' & ');
        };

        const topFreqLabel    = w7Freq.length     ? _tiedLabels(w7Freq,      'total') : null;
        const strongestLabel  = w7TrigStats.length ? _tiedLabels(w7TrigStats, 'rate')  : null;

        // Helper: given sorted stats array and key, return up to 2 tied {icon, label} objects
        const _tiedEntries = (stats, key) => {
            if (!stats.length) return [];
            const topVal = stats[0][key];
            return stats
                .filter(t => t[key] === topVal)
                .map(t => this._triggerLabel(t.id))
                .sort((a, b) => a.label.localeCompare(b.label))
                .slice(0, 2);
        };

        const topFreqEntries   = w7Freq.length     ? _tiedEntries(w7Freq,      'total') : [];
        const strongestEntries = w7TrigStats.length ? _tiedEntries(w7TrigStats, 'rate')  : [];

        const _renderTriggerValue = (entries) => {
            if (!entries.length) return '<span class="weekly-trigger-value muted">—</span>';
            return entries.map(e =>
                `<span class="weekly-trigger-entry"><span class="ms weekly-trigger-icon">${e.icon}</span><span class="weekly-trigger-value">${e.label}</span></span>`
            ).join('');
        };        

        // Money + Time Lost for previous period (for delta)
        const p7Money = prev7.reduce((s, e) => s + e.smoked.reduce((x, y) =>
            x + y.count * (y.pricePerCigarette ?? this.settings.cigarettePrice), 0), 0);
        const p7MLL   = p7Smoked * 20;

        const w7Clean = last7.filter(e =>
            e.smoked.reduce((s, x) => s + x.count, 0) === 0
        ).length;

        const p7Clean = 7 - prev7.filter(e =>
            e.smoked.reduce((s, x) => s + x.count, 0) > 0
        ).length;

        // Build full 7-day arrays for streak calculation
        const buildWeekDays = (startDate, days = 7) => {
            const result = [];
            for (let i = 0; i < days; i++) {
                const dt = new Date(startDate);
                dt.setDate(dt.getDate() + i);
                const d = String(dt.getDate()).padStart(2, '0');
                const m = String(dt.getMonth() + 1).padStart(2, '0');
                const y = String(dt.getFullYear() - 2000).padStart(2, '0');
                const dateStr = `${d}-${m}-${y}`;
                const entry = this.entries.find(e => e.date === dateStr);
                const smoked = entry ? entry.smoked.reduce((s, x) => s + x.count, 0) : 0;
                result.push({ dateStr, smoked });
            }
            return result;
        };

        const prev7Days = buildWeekDays(d14);

        const last7Sorted = [...last7].sort((a, b) => this._toDate(a.date) - this._toDate(b.date));
        let w7CleanStreak = 0, w7CurrentStreak = 0;
        for (const e of last7Sorted) {
            if (e.smoked.reduce((s, x) => s + x.count, 0) === 0) {
                w7CurrentStreak++;
                if (w7CurrentStreak > w7CleanStreak) w7CleanStreak = w7CurrentStreak;
            } else {
                w7CurrentStreak = 0;
            }
        }

        let p7CleanStreak = 0, p7CurrentStreak = 0;
        for (const day of prev7Days) {
            if (day.smoked === 0) {
                p7CurrentStreak++;
                if (p7CurrentStreak > p7CleanStreak) p7CleanStreak = p7CurrentStreak;
            } else {
                p7CurrentStreak = 0;
            }
        }

        // Daily limit stats
        const w7WithinLimit = last7.filter(e => {
            const dayLimit = this._getLimitForDate(e.date);
            const effectiveLimit = (dayLimit !== null) ? dayLimit : (this.settings.dailyLimit ?? null);
            if (effectiveLimit === null) return false;
            const smoked = e.smoked.reduce((s, x) => s + x.count, 0);
            return smoked <= effectiveLimit;
        }).length;

        const p7WithinLimit = prev7.filter(e => {
            const dayLimit = this._getLimitForDate(e.date);
            const effectiveLimit = (dayLimit !== null) ? dayLimit : (this.settings.dailyLimit ?? null);
            if (effectiveLimit === null) return false;
            const smoked = e.smoked.reduce((s, x) => s + x.count, 0);
            return smoked <= effectiveLimit;
        }).length;

        // Check if any limit exists (current or historical)
        const hasLimit = (this.settings.limitHistory && this.settings.limitHistory.length > 0) || 
                        (this.settings.dailyLimit !== null && this.settings.dailyLimit !== undefined);

        // Total cigarettes smoked over the limit (using per-day limits)
        const overLimitCigs = last7.reduce((sum, e) => {
            const dayLimit = this._getLimitForDate(e.date);
            const effectiveLimit = (dayLimit !== null) ? dayLimit : (this.settings.dailyLimit ?? null);
            if (effectiveLimit === null) return sum;
            const smoked = e.smoked.reduce((s, x) => s + x.count, 0);
            return sum + Math.max(0, smoked - effectiveLimit);
        }, 0);
                
        // Display values - show - when no data this week
        const resistedDisplay   = w7Cravings === 0 ? '—' : String(w7Resisted);
        const resRateDisplay    = w7ResRate === null ? '—' : `${w7ResRate}%`;

        const weeklyBody = `
            <div class="weekly-grid">
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Cigarettes Smoked</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${w7Smoked}</span>${w7Smoked === 0 ? '' : _delta(w7Smoked, p7Smoked, true)}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Cravings</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${w7Cravings}</span>${w7Cravings === 0 ? '' : _delta(w7Cravings, p7Cravings, true)}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Resisted</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${resistedDisplay}</span>${w7Cravings === 0 ? '' : _delta(w7Resisted, p7Resisted, false)}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Resistance Rate</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${resRateDisplay}</span>${w7Cravings === 0 ? '' : resRateDelta}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Clean Days</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${w7Clean} / ${last7.length}</span>${_delta(w7Clean, p7Clean, false)}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Clean Day Streak</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${w7CleanStreak}d</span>${_delta(w7CleanStreak, p7CleanStreak, false)}
                    </div>
                </div>
                                
                ${hasLimit ? `
                    <div class="weekly-stat">
                        <div class="weekly-stat-label">Days Within Limit</div>
                        <div class="weekly-stat-value-row">
                            <span class="weekly-stat-value">${w7WithinLimit} / ${last7.length}</span>${_delta(w7WithinLimit, p7WithinLimit, false)}
                        </div>
                    </div>
                    <div class="weekly-stat">
                        <div class="weekly-stat-label">Over Limit</div>
                        <div class="weekly-stat-value">${overLimitCigs} cig${overLimitCigs !== 1 ? 's' : ''}</div>
                    </div>
                ` : ''}

                <div class="weekly-stat">
                    <div class="weekly-stat-label">Money Spent</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${this.settings.currency}${parseFloat(w7Money.toFixed(2))}</span>${w7Smoked === 0 ? '' : _deltaArrow(w7Money, p7Money, true)}
                    </div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Time Lost</div>
                    <div class="weekly-stat-value-row">
                        <span class="weekly-stat-value">${this._fmtMLL(w7MLL)}</span>${w7Smoked === 0 ? '' : _deltaArrow(w7MLL, p7MLL, true)}
                    </div>
                </div>
                <div class="weekly-stat weekly-stat-full">
                    <div class="weekly-stat-label">Longest Resistance Streak</div>
                    <div class="weekly-stat-value">${w7Streak} cravings</div>
                </div>
                <div class="weekly-stat weekly-stat-full">
                    <div class="weekly-stat-label">Most Logged Trigger</div>
                    <div class="weekly-stat-value">${topFreqEntries.length ? topFreqEntries.map(e => `<span class="ms">${e.icon}</span> ${e.label}`).join(', ') : '—'}</div>
                </div>
                <div class="weekly-stat weekly-stat-full">
                    <div class="weekly-stat-label">Most Associated with Smoking</div>
                    <div class="weekly-stat-value">${strongestEntries.length ? strongestEntries.map(e => `<span class="ms">${e.icon}</span> ${e.label}`).join(', ') : '—'}</div>
                </div>
                ${last7.length < 7 ? `<p class="weekly-comparison-note">Based on ${last7.length} day${last7.length !== 1 ? 's' : ''} of logged data.</p>` : ''}
                ${!hasEnoughData ? `<p class="weekly-comparison-note">Delta comparison requires at least 14 days of logged data across both weeks.</p>` : ''}
            </div>`;
        content.appendChild(this._makeSection('date_range', 'Week in Review', null, weeklyBody,
            'Your weekly summary compared to the previous 7-day period.'));

        // Monthly Calendar
        const calMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
            .format(new Date(this._calYear, this._calMonth));

        content.appendChild(this._makeSection('calendar_view_month', 'Monthly Calendar', null, `
            <div class="cal-nav">
                <button id="calPrev" class="cal-nav-btn"><span class="ms">keyboard_arrow_left</span></button>
                <span id="calMonthLabel" class="pattern-month-label">${calMonthLabel}</span>
                <button id="calNext" class="cal-nav-btn"><span class="ms">keyboard_arrow_right</span></button>
            </div>
            <div class="cal-day-headers">
                <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
            </div>
            <div id="calGrid" class="cal-grid"></div>
        `, 'Days with logged smoking activity are highlighted.'));

        this._renderMonthlyCalendar();

        // Deep Dive divider + period selector
        const deepDive = document.createElement('div');
        deepDive.className = 'analytics-deep-dive-header';
        deepDive.innerHTML = `
            <div class="deep-dive-title">Deep Dive</div>
            <div class="deep-dive-period">
                <span class="deep-dive-label">Period:</span>
                <select id="analyticsTimeRange" class="time-select analytics-time-select-inline">
                    <option value="7">Past 1 Week</option>
                    <option value="30">Past 1 Month</option>
                    <option value="90">Past 3 Months</option>
                    <option value="180">Past 6 Months</option>
                    <option value="365">Past 1 Year</option>
                    <option value="730">Past 2 Years</option>
                </select>
            </div>`;
        content.appendChild(deepDive);

        // Restore persisted selection, then bind change
        const sel = deepDive.querySelector('#analyticsTimeRange');
        sel.value = String(this._analyticsPeriod || 30);
        sel.addEventListener('change', () => {
            this._analyticsPeriod = parseInt(sel.value);
            this._renderAnalytics();
        });

        // 2. Period Overview
        const periodSmoked  = entries.reduce((s, e) => s + e.smoked.reduce((x, y) => x + y.count, 0), 0);
        const periodMoney   = entries.reduce((s, e) => s + e.smoked.reduce((x, y) =>
            x + y.count * (y.pricePerCigarette ?? this.settings.cigarettePrice), 0), 0);
        const periodMLL     = periodSmoked * 20;
        const periodDays    = new Set(entries.map(e => e.date)).size;
        const periodAvg     = periodDays > 0 ? (periodSmoked / periodDays).toFixed(1) : '0';

        content.appendChild(this._makeSection('overview', 'Period Overview', null,
            periodSmoked === 0
            ? '<p class="analytics-empty">No smoking logged in this period.</p>'
            : `
            <div class="weekly-grid">
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Cigarettes Smoked</div>
                    <div class="weekly-stat-value">${periodSmoked}</div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Daily Average</div>
                    <div class="weekly-stat-value">${periodAvg}</div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Money Spent</div>
                    <div class="weekly-stat-value">${this.settings.currency}${parseFloat(periodMoney.toFixed(2))}</div>
                </div>
                <div class="weekly-stat">
                    <div class="weekly-stat-label">Time Lost</div>
                    <div class="weekly-stat-value">${this._fmtMLL(periodMLL)}</div>
                </div>
            </div>
        `, 'Totals for the selected Deep Dive period.'
        ));

        // 3. Insights
        let insightBody;
        if (!sentences.length) {
            insightBody = '<p class="analytics-empty">Keep logging to see behavioural insights.</p>';
        } else {
            const featuredText = this._pickFeaturedInsight(sentences);

            if (featuredText) {
                if (!this.settings.featuredHistory) this.settings.featuredHistory = {};
                const lastTimestamp = this.settings.featuredHistory[featuredText];
                const now = Date.now();
                if (!lastTimestamp || (now - lastTimestamp) > 24 * 60 * 60 * 1000) {
                    this.settings.featuredHistory[featuredText] = now;
                    this._persist('settings');
                }
            }

            const secondary = sentences.filter(s => s.text !== featuredText);

            const featuredHtml = featuredText ? `
                <div class="insight-item insight-featured">
                    <span>${featuredText}</span>
                </div>` : '';

            const secondaryHtml = secondary.map(s => `
                <div class="insight-item insight-secondary">
                    <span>${s.text}</span>
                </div>`).join('');

            insightBody = `<div class="insight-list">${featuredHtml}${secondaryHtml}</div>`;
        }
        content.appendChild(this._makeSection('lightbulb_2', 'Insights', null, insightBody, 'Behavioral insights based on your data in this period.'));

        // 4. Trigger rankings (no bars — ranked text list)
        let triggerBody;
        if (!triggerStats.length) {
            triggerBody = '<p class="analytics-empty">Not enough data yet — need at least 5 events per trigger. Keep logging to see rankings.</p>';
        } else {
            const items = triggerStats.map((t, i) => {
                const { label, icon } = this._triggerLabel(t.id);
                const pct = Math.round(t.rate * 100);
                const passed = t.total - t.smoked;
                return `
                    <div class="trigger-rank-item">
                        <span class="ms trigger-rank-icon">${icon}</span>
                        <span class="trigger-rank-name">${label}</span>
                        <span class="trigger-rank-fraction">${pct}%</span>
                        <span class="trigger-rank-pct-small">${t.total} logged · ${t.smoked} smoked · ${passed} passed</span>
                    </div>`;
            }).join('');
            triggerBody = `<div class="trigger-rank-list">${items}</div>`;
        }
        content.appendChild(this._makeSection('equalizer', 'Trigger Rankings',
            null, triggerBody, 'Triggers ranked by how often they lead to smoking. Minimum 5 logged events per trigger.'));

        // 5. Trigger pairs
        let pairBody;
        if (!pairStats.length) {
            pairBody = '<p class="analytics-empty">Need at least 5 events per trigger pair. Log entries with multiple triggers to unlock this section.</p>';
        } else {
            const items = pairStats.map(p => {
                const a = this._triggerLabel(p.idA).label;
                const b = this._triggerLabel(p.idB).label;
                return `
                    <div class="trigger-pair-item">
                        <div class="trigger-pair-name">${a} + ${b}</div>
                        <div class="trigger-pair-meta">
                            <span class="trigger-pair-pct">${Math.round(p.rate * 100)}% smoking rate</span>
                            &nbsp;·&nbsp;
                            <span class="trigger-pair-fraction">${p.smoked} / ${p.total} events</span>
                        </div>
                    </div>`;
            }).join('');
            pairBody = `<div class="trigger-pair-list">${items}</div>`;
        }
        content.appendChild(this._makeSection('join', 'Trigger Combinations', null, pairBody, 'Trigger pairs that frequently appear together. Minimum 5 combined events.'));

        // 6. Time of day
        content.appendChild(this._makeSection('schedule', 'Time of Day',
            null, `
            <div class="analytics-chart-container">
                <canvas id="analyticsTimeOfDayChart"></canvas>
            </div>
        `, 'Cravings and smoking frequency by time of day, in 2-hour bins.'
        ));

        requestAnimationFrame(() => {
            if (this._analyticsChart) { this._analyticsChart.destroy(); this._analyticsChart = null; }
            const tod = this._computeTimeOfDay(entries);
            const st  = this._chartStyle();
            this._analyticsChart = new Chart(
                document.getElementById('analyticsTimeOfDayChart').getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: this._todBinLabels(),
                        datasets: [
                            {
                                label: 'Cravings',
                                data: tod.cravings,
                                backgroundColor: '#A6A6A6',
                                borderColor: '#A6A6A6',
                                borderWidth: 1,
                                borderRadius: 3,
                                barPercentage: 0.8,
                            },
                            {
                                label: 'Smoked',
                                data: tod.smoked,
                                backgroundColor: '#F1976D',
                                borderColor: '#F1976D',
                                borderWidth: 1,
                                borderRadius: 3,
                                barPercentage: 0.8,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: true,
                                position: 'top',
                                labels: { color: st.textPrimary, font: { family: st.font, size: 10 }, boxWidth: 10, padding: 8 },
                            },
                            tooltip: {
                                backgroundColor: 'rgba(26,26,26,0.95)',
                                titleColor: st.textPrimary,
                                bodyColor: st.textPrimary,
                                borderColor: 'rgba(217,217,217,0.25)',
                                borderWidth: 1,
                                cornerRadius: 6,
                            },
                        },
                        scales: {
                            x: {
                                grid: { color: st.gridColor },
                                ticks: { color: st.textSecond, maxRotation: 0, font: { family: st.font, size: 9 } },
                            },
                            y: {
                                beginAtZero: true,
                                grid: { color: st.gridColor },
                                ticks: { stepSize: 1, color: st.textSecond, font: { family: st.font, size: 10 } },
                            },
                        },
                        animation: { duration: 400, easing: 'easeOutQuart' },
                    },
                }
            );
        });
    }

    _renderMonthlyCalendar() {
        const now   = new Date();
        const month = this._calMonth;
        const year  = this._calYear;

        const nextBtn = document.getElementById('calNext');
        const prevBtn = document.getElementById('calPrev');
        if (nextBtn) {
            nextBtn.disabled = (year === now.getFullYear() && month === now.getMonth());
            nextBtn.style.opacity = nextBtn.disabled ? '0.3' : '1';
        }

        // First entry date
        const sortedEntries = [...this.entries].sort((a, b) => this._toDate(a.date) - this._toDate(b.date));
        const firstEntryDate = sortedEntries.length ? this._toDate(sortedEntries[0].date) : now;

        // Build a set of dates that have smoked entries
        const smokedDates = new Set();
        this.entries.forEach(e => {
            if (e.smoked.reduce((s, x) => s + x.count, 0) > 0) smokedDates.add(e.date);
        });

        const firstDay = new Date(year, month, 1);
        const lastDay  = new Date(year, month + 1, 0);
        const today    = new Date(); today.setHours(0,0,0,0);

        // Day of week of first day, Monday-based (0=Mon, 6=Sun)
        let startDow = firstDay.getDay() - 1;
        if (startDow < 0) startDow = 6;

        let cells = '';

        // Empty cells before first day
        for (let i = 0; i < startDow; i++) {
            cells += `<div class="cal-cell cal-empty"></div>`;
        }

        for (let d = 1; d <= lastDay.getDate(); d++) {
            const cellDate = new Date(year, month, d);
            cellDate.setHours(0,0,0,0);
            const dd   = String(d).padStart(2, '0');
            const mm   = String(month + 1).padStart(2, '0');
            const yy   = String(year - 2000).padStart(2, '0');
            const dateStr = `${dd}-${mm}-${yy}`;

            const isFuture   = cellDate > today;
            const isBeforeFirst = cellDate < firstEntryDate;
            const isSmoked   = smokedDates.has(dateStr);
            const isToday    = cellDate.getTime() === today.getTime();

            let cls = 'cal-cell';
            if (isFuture || isBeforeFirst) cls += ' cal-muted';
            else if (isSmoked)             cls += ' cal-smoked';
            else                           cls += ' cal-normal';
            if (isToday)                   cls += ' cal-today';

            cells += `<div class="${cls}">${d}</div>`;
        }

        const grid = document.getElementById('calGrid');
        if (grid) grid.innerHTML = cells;

        const label = document.getElementById('calMonthLabel');
        if (label) label.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' })
            .format(new Date(year, month));

        if (prevBtn) prevBtn.onclick = () => {
            if (this._calMonth === 0) { this._calMonth = 11; this._calYear--; }
            else this._calMonth--;
            this._renderMonthlyCalendar();
        };
        if (nextBtn) nextBtn.onclick = () => {
            if (year === now.getFullYear() && month === now.getMonth()) return;
            if (this._calMonth === 11) { this._calMonth = 0; this._calYear++; }
            else this._calMonth++;
            this._renderMonthlyCalendar();
        };
    }
    
    _makeSection(icon, title, subtitle, bodyHtml, helpText = null) {
        const section = document.createElement('div');
        section.className = 'analytics-section';
        const subtitleHtml = subtitle
            ? `<p class="analytics-section-subtitle">${subtitle}</p>`
            : '';
        const helpBtn = helpText
            ? `<button class="section-help-btn">?</button>`
            : '';
        section.innerHTML = `
            <div class="analytics-section-header">
                <span class="ms">${icon}</span>
                <div class="analytics-section-title-wrap">
                    <h3>${title}</h3>
                    ${subtitleHtml}
                </div>
                ${helpBtn}
            </div>
            <div class="analytics-section-body">${bodyHtml}</div>`;

        if (helpText) {
            const btn = section.querySelector('.section-help-btn');
            const popover = document.createElement('div');
            popover.className = 'section-help-popover';
            popover.textContent = helpText;
            document.body.appendChild(popover);

            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.section-help-popover.visible')
                    .forEach(p => p.classList.remove('visible'));
                if (popover.classList.contains('visible')) {
                    popover.classList.remove('visible');
                    return;
                }
                const rect = btn.getBoundingClientRect();
                popover.style.top  = `${rect.bottom + 8}px`;
                const left = Math.min(rect.left, window.innerWidth - 240 - 8);
                popover.style.left = `${Math.max(8, left)}px`;
                popover.classList.add('visible');
            });

            document.addEventListener('click', () => popover.classList.remove('visible'));
        }

    return section;
}
}

// --- Boot ---
document.addEventListener('DOMContentLoaded', () => {
    window.tracker = new CigLogTracker();
});
