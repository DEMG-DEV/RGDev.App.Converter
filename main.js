const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

const ffmpegPath = require('ffmpeg-static').replace(
    'app.asar',
    'app.asar.unpacked'
);
const ffprobePath = require('ffprobe-static').path.replace(
    'app.asar',
    'app.asar.unpacked'
);
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC Handlers
ipcMain.handle('dialog:openDirectory', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openDirectory']
    });
    if (canceled) {
        return null;
    } else {
        return filePaths[0];
    }
});

ipcMain.on('conversion:start', (event, { files, outputDir, format, quality = 80 }) => {
    const sender = event.sender;

    files.forEach(file => {
        const inputPath = file.path;
        const fileName = path.basename(inputPath, path.extname(inputPath));
        const outputExt = format === 'video' ? 'webm' : 'webp';
        const outputPath = path.join(outputDir, `${fileName}.${outputExt}`);

        const command = ffmpeg(inputPath);

        // Format specific settings
        if (format === 'video') {
            // Map 0-100 quality to CRF 63-15 (reversed)
            // 100 -> 15 (Best)
            // 0 -> 63 (Worst)
            // Formula: 63 - (quality / 100 * 48)
            const crf = Math.round(63 - (quality / 100 * 48));
            
            command
                .output(outputPath)
                .videoCodec('libvpx-vp9')
                .audioCodec('libopus')
                .outputOptions(`-crf ${crf}`)
                .outputOptions('-b:v 0');
        } else {
            // WebP Image
            // Map 0-100 directly
            command
                .output(outputPath)
                .outputOptions(`-q:v ${quality}`);
        }

        command
            .on('start', () => {
                sender.send('conversion:progress', {
                    fileId: file.id,
                    percent: 0,
                    status: 'Starting...'
                });
            })
            .on('progress', (progress) => {
                // progress.percent can be undefined for some formats/length issues
                // We use timemark as fallback if percent is invalid
                const percent = (progress.percent && !isNaN(progress.percent)) ? Math.round(progress.percent) : 0;
                const status = percent > 0 ? `Converting... ${percent}%` : `Converting... (${progress.timemark})`;

                sender.send('conversion:progress', {
                    fileId: file.id,
                    percent: percent,
                    status: status
                });
            })
            .on('error', (err) => {
                console.error('Error converting file:', err);
                sender.send('conversion:progress', {
                    fileId: file.id,
                    percent: 0,
                    status: 'Error'
                });
            })
            .on('end', () => {
                // Calculate Savings
                try {
                    const originalSize = fs.statSync(inputPath).size;
                    const newSize = fs.statSync(outputPath).size;
                    const savingsBytes = originalSize - newSize;
                    const savingsPercent = ((savingsBytes / originalSize) * 100).toFixed(1);
                    
                    sender.send('conversion:progress', {
                        fileId: file.id,
                        percent: 100,
                        status: 'Completed',
                        stats: {
                            originalSize,
                            newSize,
                            savingsPercent
                        }
                    });
                } catch (e) {
                    console.error('Error calculating stats:', e);
                    sender.send('conversion:progress', {
                        fileId: file.id,
                        percent: 100,
                        status: 'Completed'
                    });
                }
            })
            .run();
    });
});
