const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnSelectFolder = document.getElementById('btn-select-folder');
const inputOutputPath = document.getElementById('output-path');
const btnStart = document.getElementById('btn-start');
const progressList = document.getElementById('progress-list');
const emptyState = document.getElementById('empty-state');
const formatSelect = document.getElementById('format-select');
const qualitySlider = document.getElementById('quality-slider');
const qualityValue = document.getElementById('quality-value');
const globalStatus = document.getElementById('global-status');
const btnClear = document.getElementById('btn-clear');
const queueBadge = document.getElementById('queue-badge');

let filesToConvert = [];
let outputDirectory = '';
let completedCount = 0;

// Update Slider Value Display
if (qualitySlider && qualityValue) {
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = `${e.target.value}%`;
    });
}

// --- Drag & Drop Handling ---
dropZone.addEventListener('dragover', (e) => {
    if (btnStart.disabled && btnStart.querySelector('span').innerText === 'Processing...') return;
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('border-primary', 'bg-slate-800/60');
    dropZone.classList.remove('border-slate-600/30');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-primary', 'bg-slate-800/60');
    dropZone.classList.add('border-slate-600/30');
});

dropZone.addEventListener('drop', (e) => {
    if (btnStart.disabled && btnStart.querySelector('span').innerText === 'Processing...') {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-primary', 'bg-slate-800/60');
    dropZone.classList.add('border-slate-600/30');

    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
});

dropZone.addEventListener('click', () => {
    if (btnStart.disabled && btnStart.querySelector('span').innerText === 'Processing...') return;
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFilesAdded(files);
    // Reset input so same file can be selected again if needed (though we dedupe)
    fileInput.value = '';
});

function handleFilesAdded(files) {
    if (files.length > 0) {
        if (emptyState) emptyState.style.display = 'none';

        files.forEach(file => {
            // Basic deduplication check by path
            if (!filesToConvert.some(f => f.path === file.path)) {

                const fileId = Math.random().toString(36).substr(2, 9);
                const fileObj = {
                    id: fileId,
                    path: file.path,
                    name: file.name
                };
                filesToConvert.push(fileObj);
                addProgressItem(fileObj);
            }
        });

        updateGlobalStatus();
        if (filesToConvert.length > 0) {
            btnClear.classList.remove('hidden');
            queueBadge.classList.remove('hidden');
            queueBadge.textContent = filesToConvert.length;
        }
    }
}

function updateGlobalStatus() {
    globalStatus.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
        ${filesToConvert.length} files queued ready.
    `;
}

function addProgressItem(file) {
    const item = document.createElement('div');
    item.id = `item-${file.id}`;
    //item.className = 'bg-dark-card rounded-lg p-3 shadow-sm border border-gray-800 fade-in';
    item.className = 'bg-slate-800/40 hover:bg-slate-800/60 rounded-lg p-3 border border-slate-700/30 transition-colors group animate-fade-in';
    
    item.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <div class="flex items-center gap-3 overflow-hidden">
                    <div class="w-8 h-8 rounded bg-slate-700/50 flex items-center justify-center shrink-0">
                    <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <span class="text-xs font-medium text-slate-200 truncate">${file.name}</span>
            </div>
            <span id="status-${file.id}" class="text-[10px] font-mono text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded">Queued</span>
        </div>
        <div class="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
            <div id="bar-${file.id}" class="h-full bg-primary w-0 rounded-full relative overflow-hidden transition-all duration-300">
                <div class="absolute inset-0 bg-white/20"></div>
            </div>
         </div>
    `;
    progressList.appendChild(item);
}


// --- Directory Selection ---
btnSelectFolder.addEventListener('click', async () => {
    const path = await window.api.selectFolder();
    if (path) {
        outputDirectory = path;
        inputOutputPath.value = path;
    }
});


// --- Start Conversion ---
btnStart.addEventListener('click', () => {
    if (filesToConvert.length === 0) {
        alert('Please add files first.');
        return;
    }
    if (!outputDirectory) {
        alert('Please select an output folder.');
        return;
    }

    const format = formatSelect.value;
    const quality = qualitySlider ? qualitySlider.value : 80;

    // Reset counters
    completedCount = 0;

    // Disable inputs
    btnStart.disabled = true;
    const btnText = btnStart.querySelector('span');
    if(btnText) btnText.innerText = 'Processing...';

    // Disable Clear while processing
    btnClear.disabled = true;
    btnClear.classList.add('opacity-50', 'cursor-not-allowed');

    // Send to Main
    window.api.startConversion(filesToConvert, outputDirectory, format, quality);
});

// --- Clear All ---
btnClear.addEventListener('click', () => {
    filesToConvert = [];
    progressList.innerHTML = '';
    progressList.appendChild(emptyState);
    emptyState.style.display = 'flex';

    completedCount = 0;

    //updateGlobalStatus(); // Custom logic below
    globalStatus.innerHTML = `
        <span class="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
        Ready to convert.
    `;
    queueBadge.classList.add('hidden');
    queueBadge.textContent = '0';

    // Reset buttons
    btnStart.disabled = false;
    const btnText = btnStart.querySelector('span');
    if(btnText) btnText.innerText = 'Start Conversion';

    btnClear.classList.add('hidden');

    // Reset inputs
    inputOutputPath.value = '';
    outputDirectory = '';
});


// --- Progress Updates ---
window.api.onProgress((data) => {
    const { fileId, percent, status, stats } = data;

    const statusEl = document.getElementById(`status-${fileId}`);
    const barEl = document.getElementById(`bar-${fileId}`);

    if (statusEl && barEl) {
        statusEl.textContent = status;
        barEl.style.width = `${percent}%`;

        if (status === 'Completed') {
            statusEl.className = 'text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded';
            barEl.classList.remove('bg-primary');
            barEl.classList.add('bg-emerald-500');
            
            if (stats && stats.savingsPercent) {
                const saved = parseFloat(stats.savingsPercent);
                if (saved > 0) {
                     statusEl.textContent = `Saved ${stats.savingsPercent}%`;
                } else {
                     statusEl.textContent = `Completed`;
                }
            }
        } else if (status === 'Error') {
            statusEl.className = 'text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded';
            barEl.classList.remove('bg-primary');
            barEl.classList.add('bg-red-500');
        }
    }

    // Check if all done
    if (percent === 100 || status === 'Error') {
        completedCount++;
        checkAllDone();
    }
});

function checkAllDone() {
    if (completedCount >= filesToConvert.length) {
        btnStart.disabled = false;
        const btnText = btnStart.querySelector('span');
        if(btnText) btnText.innerText = 'Start Conversion';

        btnClear.disabled = false;
        btnClear.classList.remove('opacity-50', 'cursor-not-allowed');

        globalStatus.innerHTML = `
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Batch completed. ${completedCount} files processed.
        `;
    }
}
