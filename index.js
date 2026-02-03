
// --- State Management ---
const INITIAL_STATE = {
    participants: [],
    prizes: [],
    winners: [],
    isLoggedIn: false,
    currentPage: 'public', // public, login, dashboard
    activeDashboardTab: 'overview' // overview, participants, prizes, draw, report
};

let state = { ...INITIAL_STATE };

// Load from LocalStorage
const loadState = () => {
    const saved = localStorage.getItem('luckyDrawState_vanilla');
    if (saved) {
        const parsed = JSON.parse(saved);
        state = { ...state, ...parsed, isLoggedIn: false, currentPage: 'public' };
    }
};

const saveState = () => {
    localStorage.setItem('luckyDrawState_vanilla', JSON.stringify({
        participants: state.participants,
        prizes: state.prizes,
        winners: state.winners
    }));
};

// --- Utilities ---
const updateUI = () => {
    renderNavbar();
    renderPage();
    lucide.createIcons();
};

const navigate = (page) => {
    state.currentPage = page;
    updateUI();
};

const navigateDashboard = (tab) => {
    state.activeDashboardTab = tab;
    updateUI();
};

// --- Components & Rendering ---

const renderNavbar = () => {
    const nav = document.getElementById('navbar');
    nav.innerHTML = `
        <div class="container mx-auto px-4 h-full flex items-center justify-between">
            <div class="flex items-center space-x-2 cursor-pointer" id="nav-logo">
                <div class="bg-indigo-600 p-2 rounded-lg text-white">
                    <i data-lucide="ticket"></i>
                </div>
                <span class="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    LuckyDraw
                </span>
            </div>
            <div class="flex items-center space-x-2 sm:space-x-4">
                <button id="nav-public" class="flex items-center space-x-1 px-3 py-2 rounded-md transition ${state.currentPage === 'public' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:bg-gray-100'}">
                    <i data-lucide="home" class="w-5 h-5"></i>
                    <span class="hidden sm:inline">Cek Peserta</span>
                </button>
                ${!state.isLoggedIn ? `
                    <button id="nav-login" class="flex items-center space-x-1 px-3 py-2 rounded-md transition ${state.currentPage === 'login' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:bg-gray-100'}">
                        <i data-lucide="lock" class="w-5 h-5"></i>
                        <span class="hidden sm:inline">Admin Login</span>
                    </button>
                ` : `
                    <button id="nav-dashboard" class="flex items-center space-x-1 px-3 py-2 rounded-md transition ${state.currentPage === 'dashboard' ? 'text-indigo-600 bg-indigo-50 font-medium' : 'text-gray-600 hover:bg-gray-100'}">
                        <i data-lucide="layout-dashboard" class="w-5 h-5"></i>
                        <span class="hidden sm:inline">Dashboard</span>
                    </button>
                    <button id="nav-logout" class="flex items-center space-x-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md transition">
                        <i data-lucide="log-out" class="w-5 h-5"></i>
                        <span class="hidden sm:inline">Logout</span>
                    </button>
                `}
            </div>
        </div>
    `;

    // Event Listeners for Navbar
    document.getElementById('nav-logo').onclick = () => navigate('public');
    document.getElementById('nav-public').onclick = () => navigate('public');
    if (!state.isLoggedIn) {
        document.getElementById('nav-login').onclick = () => navigate('login');
    } else {
        document.getElementById('nav-dashboard').onclick = () => navigate('dashboard');
        document.getElementById('nav-logout').onclick = () => {
            state.isLoggedIn = false;
            navigate('public');
        };
    }
};

const renderPage = () => {
    const container = document.getElementById('page-container');
    container.innerHTML = '';
    
    switch (state.currentPage) {
        case 'public': renderPublicPage(container); break;
        case 'login': renderLoginPage(container); break;
        case 'dashboard': 
            if (state.isLoggedIn) renderDashboardPage(container);
            else navigate('login');
            break;
    }
};

// --- Pages ---

const renderPublicPage = (container) => {
    container.innerHTML = `
        <div class="max-w-2xl mx-auto py-12 fade-in">
            <div class="text-center mb-10">
                <h1 class="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Cek Keberuntungan Anda!</h1>
                <p class="text-gray-600">Masukkan Nomor Undian (BIB) untuk mengetahui status pemenang.</p>
            </div>
            <div class="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
                <form id="check-form" class="flex flex-col sm:row gap-4 mb-8">
                    <div class="flex-grow relative">
                        <i data-lucide="search" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"></i>
                        <input type="text" id="check-bib" placeholder="Contoh: 10023" class="w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:ring-0 outline-none transition text-lg">
                    </div>
                    <button type="submit" class="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">Cek Sekarang</button>
                </form>
                <div id="check-result"></div>
            </div>
        </div>
    `;

    document.getElementById('check-form').onsubmit = (e) => {
        e.preventDefault();
        const bib = document.getElementById('check-bib').value.trim().toLowerCase();
        const resultDiv = document.getElementById('check-result');
        if (!bib) return;

        const winner = state.winners.find(w => w.bib.toLowerCase() === bib);
        if (winner) {
            resultDiv.innerHTML = `
                <div class="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center fade-in">
                    <div class="inline-flex items-center justify-center p-4 bg-green-200 rounded-full text-green-700 mb-4">
                        <i data-lucide="trophy" class="w-12 h-12"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-green-800 mb-2">Selamat! Anda Menang</h3>
                    <p class="text-green-700 text-lg">Anda memenangkan: <span class="font-bold underline">${winner.prizeName}</span></p>
                    <p class="text-sm text-green-600 mt-4 italic">Silakan hubungi panitia untuk pengambilan hadiah.</p>
                </div>
            `;
        } else {
            const exists = state.participants.find(p => p.bib.toLowerCase() === bib);
            if (exists) {
                resultDiv.innerHTML = `
                    <div class="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8 text-center fade-in">
                        <div class="inline-flex items-center justify-center p-4 bg-amber-200 rounded-full text-amber-700 mb-4">
                            <i data-lucide="frown" class="w-12 h-12"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-amber-800 mb-2">Belum Beruntung</h3>
                        <p class="text-amber-700 text-lg">Mohon maaf, Anda belum beruntung atau nomor belum diundi.</p>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = `
                    <div class="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 text-center fade-in">
                        <div class="inline-flex items-center justify-center p-4 bg-gray-200 rounded-full text-gray-700 mb-4">
                            <i data-lucide="help-circle" class="w-12 h-12"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-2">BIB Tidak Terdaftar</h3>
                        <p class="text-gray-700">Pastikan nomor yang Anda masukkan sudah benar.</p>
                    </div>
                `;
            }
        }
        lucide.createIcons();
    };
};

const renderLoginPage = (container) => {
    container.innerHTML = `
        <div class="max-w-md mx-auto mt-12 fade-in">
            <div class="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                <div class="bg-indigo-600 p-8 text-white text-center">
                    <div class="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-4">
                        <i data-lucide="shield-check" class="w-12 h-12"></i>
                    </div>
                    <h2 class="text-2xl font-bold">Admin Portal</h2>
                    <p class="text-indigo-100 mt-1">Sistem Undian Panitia</p>
                </div>
                <div class="p-8">
                    <form id="login-form" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Password Akses</label>
                            <input type="password" id="login-pass" required placeholder="Masukkan password..." class="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition">
                        </div>
                        <div id="login-error" class="hidden text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm font-medium"></div>
                        <button type="submit" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">Masuk Dashboard</button>
                    </form>
                    <p class="text-center text-xs text-gray-400 mt-8 italic">Hint: adminbc2026</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('login-form').onsubmit = (e) => {
        e.preventDefault();
        const pass = document.getElementById('login-pass').value;
        const errorDiv = document.getElementById('login-error');
        if (pass === 'adminbc2026') {
            state.isLoggedIn = true;
            navigate('dashboard');
        } else {
            errorDiv.innerText = 'Password Salah';
            errorDiv.classList.remove('hidden');
        }
    };
};

const renderDashboardPage = (container) => {
    container.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8 fade-in">
            <aside class="w-full lg:w-64 flex-shrink-0">
                <div class="bg-white border rounded-2xl p-4 sticky top-24">
                    <nav id="dash-nav" class="space-y-1">
                        ${[
                            {id: 'overview', label: 'Ringkasan', icon: 'bar-chart-3'},
                            {id: 'participants', label: 'Input Peserta', icon: 'users'},
                            {id: 'prizes', label: 'Manajemen Hadiah', icon: 'gift'},
                            {id: 'draw', label: 'Undian', icon: 'play-circle'},
                            {id: 'report', label: 'Laporan', icon: 'file-text'}
                        ].map(item => `
                            <button data-tab="${item.id}" class="dash-tab w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition ${state.activeDashboardTab === item.id ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}">
                                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                                <span class="font-medium">${item.label}</span>
                            </button>
                        `).join('')}
                    </nav>
                </div>
            </aside>
            <div id="dashboard-content" class="flex-grow"></div>
        </div>
    `;

    document.querySelectorAll('.dash-tab').forEach(btn => {
        btn.onclick = () => navigateDashboard(btn.dataset.tab);
    });

    renderActiveTab();
};

const renderActiveTab = () => {
    const container = document.getElementById('dashboard-content');
    switch (state.activeDashboardTab) {
        case 'overview': renderOverviewTab(container); break;
        case 'participants': renderParticipantsTab(container); break;
        case 'prizes': renderPrizesTab(container); break;
        case 'draw': renderDrawTab(container); break;
        case 'report': renderReportTab(container); break;
    }
    lucide.createIcons();
};

// --- Dashboard Tabs ---

const renderOverviewTab = (container) => {
    container.innerHTML = `
        <div class="space-y-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div class="bg-blue-500 p-3 rounded-xl text-white inline-block mb-4"><i data-lucide="users"></i></div>
                    <p class="text-gray-500 text-sm font-medium uppercase">Total Peserta</p>
                    <h3 class="text-3xl font-bold mt-1">${state.participants.length}</h3>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div class="bg-purple-500 p-3 rounded-xl text-white inline-block mb-4"><i data-lucide="gift"></i></div>
                    <p class="text-gray-500 text-sm font-medium uppercase">Total Hadiah</p>
                    <h3 class="text-3xl font-bold mt-1">${state.prizes.length}</h3>
                </div>
                <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div class="bg-green-500 p-3 rounded-xl text-white inline-block mb-4"><i data-lucide="trophy"></i></div>
                    <p class="text-gray-500 text-sm font-medium uppercase">Total Pemenang</p>
                    <h3 class="text-3xl font-bold mt-1">${state.winners.length}</h3>
                </div>
            </div>
            <div class="bg-white p-8 rounded-2xl border border-gray-100">
                <h3 class="text-xl font-bold mb-6">Distribusi Hadiah</h3>
                <div class="space-y-4">
                    ${state.prizes.length ? state.prizes.map(p => `
                        <div>
                            <div class="flex justify-between text-sm mb-1 font-semibold">
                                <span>${p.name}</span>
                                <span>${p.actualWinnersCount} / ${p.totalQuota}</span>
                            </div>
                            <div class="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                <div class="bg-indigo-600 h-full transition-all duration-700" style="width: ${(p.actualWinnersCount/p.totalQuota)*100}%"></div>
                            </div>
                        </div>
                    `).join('') : '<p class="text-gray-400 italic">Belum ada data hadiah.</p>'}
                </div>
            </div>
        </div>
    `;
};

const renderParticipantsTab = (container) => {
    container.innerHTML = `
        <div class="space-y-8">
            <div class="flex items-center justify-between">
                <h2 class="text-2xl font-bold">Input Peserta</h2>
                <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 text-indigo-600 font-bold">Total: ${state.participants.length}</div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-8 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:border-indigo-400 cursor-pointer transition relative">
                    <input type="file" id="excel-upload" accept=".xlsx,.xls" class="absolute inset-0 opacity-0 cursor-pointer">
                    <div class="bg-indigo-50 p-4 rounded-full text-indigo-600 mb-4"><i data-lucide="file-spreadsheet" class="w-10 h-10"></i></div>
                    <h4 class="font-bold">Upload Excel</h4>
                    <p class="text-sm text-gray-500">Klik atau seret file .xlsx</p>
                </div>
                <div class="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h4 class="font-bold mb-4">Input Manual</h4>
                    <textarea id="manual-bibs" placeholder="Masukkan nomor (pisahkan koma/baris baru)" class="w-full h-32 p-4 border rounded-xl mb-4 focus:ring-2 focus:ring-indigo-500 outline-none"></textarea>
                    <button id="add-manual" class="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">Tambahkan</button>
                </div>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div class="p-6 border-b flex justify-between items-center">
                    <h3 class="font-bold">Daftar Peserta (Limit 100)</h3>
                    <button id="reset-participants" class="text-red-600 text-sm font-bold hover:underline">Reset Semua Data</button>
                </div>
                <div class="p-6 flex flex-wrap gap-2">
                    ${state.participants.slice(0, 100).map(p => `
                        <span class="px-3 py-1 bg-gray-50 border rounded-lg text-xs font-mono">${p.bib}</span>
                    `).join('') || '<span class="text-gray-400 italic">Belum ada data.</span>'}
                </div>
            </div>
        </div>
    `;

    document.getElementById('add-manual').onclick = () => {
        const text = document.getElementById('manual-bibs').value;
        const newBibs = text.split(/[\n,]+/).map(b => b.trim()).filter(b => b);
        const existing = new Set(state.participants.map(p => p.bib));
        const added = newBibs.filter(b => !existing.has(b)).map(b => ({ bib: b, status: 'available' }));
        state.participants.push(...added);
        saveState();
        renderActiveTab();
    };

    document.getElementById('excel-upload').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            const data = evt.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const bibs = json.flat().map(String).filter(b => b && b !== 'undefined');
            const existing = new Set(state.participants.map(p => p.bib));
            const added = bibs.filter(b => !existing.has(b)).map(b => ({ bib: b, status: 'available' }));
            state.participants.push(...added);
            saveState();
            renderActiveTab();
        };
        reader.readAsBinaryString(file);
    };

    document.getElementById('reset-participants').onclick = () => {
        if (confirm('Hapus semua peserta dan data undian?')) {
            state.participants = [];
            state.winners = [];
            state.prizes = state.prizes.map(p => ({...p, remainingQuota: p.totalQuota, actualWinnersCount: 0}));
            saveState();
            renderActiveTab();
        }
    };
};

const renderPrizesTab = (container) => {
    container.innerHTML = `
        <div class="space-y-8">
            <h2 class="text-2xl font-bold">Manajemen Hadiah</h2>
            <div class="bg-white p-6 rounded-2xl border border-gray-100">
                <form id="prize-form" class="flex flex-col md:flex-row gap-4">
                    <input type="text" id="prize-name" placeholder="Nama Hadiah" class="flex-grow px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <input type="number" id="prize-quota" min="1" placeholder="Kuota" class="w-full md:w-32 px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" required>
                    <button type="submit" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700">Tambah</button>
                </form>
            </div>
            <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4">Hadiah</th>
                            <th class="px-6 py-4">Total</th>
                            <th class="px-6 py-4">Sisa</th>
                            <th class="px-6 py-4">Status</th>
                            <th class="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${state.prizes.map(p => `
                            <tr>
                                <td class="px-6 py-4 font-bold">${p.name}</td>
                                <td class="px-6 py-4">${p.totalQuota}</td>
                                <td class="px-6 py-4">${p.remainingQuota}</td>
                                <td class="px-6 py-4">
                                    <span class="px-2 py-1 rounded text-xs font-bold ${p.remainingQuota > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">${p.remainingQuota > 0 ? 'Tersedia' : 'Habis'}</span>
                                </td>
                                <td class="px-6 py-4 text-right">
                                    <button class="delete-prize text-red-600 p-2 hover:bg-red-50 rounded-lg" data-id="${p.id}"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                                </td>
                            </tr>
                        `).join('') || '<tr><td colspan="5" class="px-6 py-10 text-center text-gray-400">Belum ada hadiah.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('prize-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('prize-name').value;
        const quota = parseInt(document.getElementById('prize-quota').value);
        state.prizes.push({
            id: Date.now().toString(),
            name,
            totalQuota: quota,
            remainingQuota: quota,
            actualWinnersCount: 0
        });
        saveState();
        renderActiveTab();
    };

    document.querySelectorAll('.delete-prize').forEach(btn => {
        btn.onclick = () => {
            const id = btn.dataset.id;
            state.prizes = state.prizes.filter(p => p.id !== id);
            saveState();
            renderActiveTab();
        };
    });
};

const renderDrawTab = (container) => {
    let pool = state.participants.filter(p => !state.winners.find(w => w.bib === p.bib));
    let availablePrizes = state.prizes.filter(p => p.remainingQuota > 0);

    container.innerHTML = `
        <div class="space-y-8">
            <h2 class="text-2xl font-bold">Undian Berhadiah</h2>
            <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-gray-500 uppercase">Pilih Hadiah</label>
                        <select id="draw-prize-select" class="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                            <option value="">-- Pilih Hadiah --</option>
                            ${availablePrizes.map(p => `<option value="${p.id}">${p.name} (Sisa: ${p.remainingQuota})</option>`).join('')}
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="text-xs font-bold text-gray-500 uppercase">Jumlah Pemenang</label>
                        <input type="number" id="draw-count" value="1" min="1" class="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500">
                    </div>
                    <button id="start-draw" class="bg-indigo-600 text-white py-3 px-8 rounded-xl font-bold hover:bg-indigo-700 shadow-lg flex items-center justify-center space-x-2">
                        <i data-lucide="play" class="w-5 h-5"></i><span>Mulai Undi</span>
                    </button>
                </div>
            </div>
            <div id="draw-result-area" class="min-h-[200px] flex flex-col items-center justify-center">
                <div class="text-gray-400 italic flex flex-col items-center">
                    <i data-lucide="ticket" class="w-16 h-16 mb-2 opacity-20"></i>
                    <p>Siap untuk mencari pemenang?</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('start-draw').onclick = () => {
        const prizeId = document.getElementById('draw-prize-select').value;
        const count = parseInt(document.getElementById('draw-count').value);
        const prize = state.prizes.find(p => p.id === prizeId);

        if (!prize || !count || count > prize.remainingQuota || count > pool.length) {
            alert("Validasi gagal: Pilih hadiah dan pastikan kuota/peserta mencukupi.");
            return;
        }

        const area = document.getElementById('draw-result-area');
        area.innerHTML = `
            <div class="text-center space-y-4 draw-animation">
                <div class="text-6xl font-black text-indigo-600 font-mono tracking-tighter">ROLLING...</div>
                <p class="text-indigo-400 animate-pulse">Memilih keberuntungan...</p>
            </div>
        `;

        setTimeout(() => {
            const shuffled = [...pool].sort(() => 0.5 - Math.random());
            const candidates = shuffled.slice(0, count);
            
            area.innerHTML = `
                <div class="w-full space-y-6 fade-in">
                    <div class="flex justify-between items-center">
                        <h3 class="text-xl font-bold">Kandidat Pemenang: ${prize.name}</h3>
                        <button id="confirm-all" class="bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700">Sahkan Semua</button>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        ${candidates.map(c => `
                            <div class="bg-white p-6 rounded-2xl border-2 border-indigo-50 shadow-sm flex flex-col items-center group relative overflow-hidden">
                                <div class="absolute top-0 left-0 w-full h-1 bg-indigo-500"></div>
                                <div class="text-3xl font-black text-indigo-600 font-mono">${c.bib}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

            document.getElementById('confirm-all').onclick = () => {
                candidates.forEach(c => {
                    state.winners.push({
                        bib: c.bib,
                        prizeId: prize.id,
                        prizeName: prize.name,
                        timestamp: Date.now()
                    });
                });
                prize.remainingQuota -= count;
                prize.actualWinnersCount += count;
                saveState();
                renderActiveTab();
            };
        }, 2000);
    };
};

const renderReportTab = (container) => {
    container.innerHTML = `
        <div class="space-y-8">
            <div class="flex justify-between items-center">
                <h2 class="text-2xl font-bold">Laporan Pemenang</h2>
                <button id="export-pdf" class="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg">
                    <i data-lucide="download"></i><span>Export PDF</span>
                </button>
            </div>
            <div class="bg-white rounded-2xl border shadow-sm overflow-hidden">
                <table class="w-full text-left">
                    <thead class="bg-gray-50 border-b">
                        <tr>
                            <th class="px-6 py-4">No.</th>
                            <th class="px-6 py-4">BIB</th>
                            <th class="px-6 py-4">Hadiah</th>
                            <th class="px-6 py-4">Waktu</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        ${state.winners.map((w, i) => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 text-gray-400">${i+1}</td>
                                <td class="px-6 py-4 font-bold text-indigo-600">${w.bib}</td>
                                <td class="px-6 py-4"><span class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">${w.prizeName}</span></td>
                                <td class="px-6 py-4 text-xs text-gray-500">${new Date(w.timestamp).toLocaleString('id-ID')}</td>
                            </tr>
                        `).join('') || '<tr><td colspan="4" class="px-6 py-10 text-center text-gray-400">Belum ada pemenang.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>
    `;

    document.getElementById('export-pdf').onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        doc.text('Laporan Pemenang LuckyDraw', 10, 10);
        const data = state.winners.map((w, i) => [i+1, w.bib, w.prizeName, new Date(w.timestamp).toLocaleString()]);
        doc.autoTable({
            head: [['No', 'BIB', 'Hadiah', 'Waktu']],
            body: data,
            startY: 20
        });
        doc.save('Laporan-Pemenang.pdf');
    };
};

// --- Initial Launch ---
window.onload = () => {
    loadState();
    updateUI();
};
