const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const btnSelectFolder = document.getElementById('btn-select-folder');
const inputOutputPath = document.getElementById('output-path');
const btnStart = document.getElementById('btn-start');
const progressList = document.getElementById('progress-list');
const emptyState = document.getElementById('empty-state');
const formatSelect = document.getElementById('format-select');
const globalStatus = document.getElementById('global-status');
const btnClear = document.getElementById('btn-clear');

let filesToConvert = [];
let outputDirectory = '';
let completedCount = 0;

// --- Drag & Drop Handling ---
dropZone.addEventListener('dragover', (e) => {
    if (btnStart.disabled && btnStart.innerText === 'Processing...') return;
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('border-accent', 'bg-opacity-10', 'bg-white');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-accent', 'bg-opacity-10', 'bg-white');
});

dropZone.addEventListener('drop', (e) => {
    if (btnStart.disabled && btnStart.innerText === 'Processing...') {
        e.preventDefault();
        e.stopPropagation();
        return;
    }
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('border-accent', 'bg-opacity-10', 'bg-white');

    const files = Array.from(e.dataTransfer.files);
    handleFilesAdded(files);
});

dropZone.addEventListener('click', () => {
    if (btnStart.disabled && btnStart.innerText === 'Processing...') return;
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
        }
    }
}

function updateGlobalStatus() {
    globalStatus.textContent = `${filesToConvert.length} files queued.`;
}

function addProgressItem(file) {
    const item = document.createElement('div');
    item.id = `item-${file.id}`;
    item.className = 'bg-dark-card rounded-lg p-3 shadow-sm border border-gray-800 fade-in';
    item.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <span class="text-sm font-medium text-white truncate max-w-[70%]">${file.name}</span>
            <span id="status-${file.id}" class="text-xs text-gray-500">Queued</span>
        </div>
        <div class="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div id="bar-${file.id}" class="bg-accent h-2.5 rounded-full transition-all duration-300" style="width: 0%"></div>
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

    // Reset counters
    completedCount = 0;

    // Disable inputs
    btnStart.disabled = true;
    btnStart.innerText = 'Processing...';

    // Disable Clear while processing
    btnClear.disabled = true;
    btnClear.classList.add('opacity-50', 'cursor-not-allowed');

    // Send to Main
    window.api.startConversion(filesToConvert, outputDirectory, format);
});

// --- Clear All ---
btnClear.addEventListener('click', () => {
    filesToConvert = [];
    progressList.innerHTML = '';
    progressList.appendChild(emptyState);
    emptyState.style.display = 'flex';

    completedCount = 0;

    updateGlobalStatus();

    // Reset buttons
    btnStart.disabled = false;
    btnStart.innerText = 'Start Conversion';

    btnClear.classList.add('hidden');

    // Reset inputs
    inputOutputPath.value = '';
    outputDirectory = '';
});


// --- Progress Updates ---
window.api.onProgress((data) => {
    const { fileId, percent, status } = data;

    const statusEl = document.getElementById(`status-${fileId}`);
    const barEl = document.getElementById(`bar-${fileId}`);

    if (statusEl && barEl) {
        statusEl.textContent = status;
        barEl.style.width = `${percent}%`;

        if (status === 'Completed') {
            statusEl.classList.add('text-success');
            barEl.classList.remove('bg-accent');
            barEl.classList.add('bg-success');
        } else if (status === 'Error') {
            statusEl.classList.add('text-error');
            barEl.classList.remove('bg-accent');
            barEl.classList.add('bg-error');
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
        btnStart.innerText = 'Start Conversion';

        btnClear.disabled = false;
        btnClear.classList.remove('opacity-50', 'cursor-not-allowed');

        globalStatus.textContent = `Batch completed. ${completedCount} files processed.`;
    }
}
