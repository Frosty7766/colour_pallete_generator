// DOM Elements
const generateBtn = document.getElementById('generate-btn');
const colorsContainer = document.querySelector('.colors-container');
const colorFormat = document.getElementById('color-format');
const customColor = document.getElementById('custom-color');
const harmonyType = document.getElementById('harmony-type');
const exportCssBtn = document.getElementById('export-css');
const exportJsonBtn = document.getElementById('export-json');
const savePaletteBtn = document.getElementById('save-palette');
const palettesContainer = document.getElementById('palettes-container');
const toast = document.querySelector('.toast');

// Color conversion functions
function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}

function hexToHSLObj(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) {
        h = s = 0;
    } else {
        let d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s;
    let x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Color harmony functions
function getComplementaryColor(hex) {
    const hsl = hexToHSLObj(hex);
    let newHue = (hsl.h + 180) % 360;
    return hslToHex(newHue, hsl.s, hsl.l);
}

function getAnalogousColors(hex) {
    const hsl = hexToHSLObj(hex);
    let h1 = (hsl.h + 30) % 360;
    let h2 = (hsl.h + 330) % 360; // -30 is +330 mod 360
    return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)];
}

function getTriadicColors(hex) {
    const hsl = hexToHSLObj(hex);
    let h1 = (hsl.h + 120) % 360;
    let h2 = (hsl.h + 240) % 360;
    return [hslToHex(h1, hsl.s, hsl.l), hslToHex(h2, hsl.s, hsl.l)];
}

// Generate random hex color
function generateRandomColor() {
    const hex = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hex[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Format color based on selected format
function formatColor(color, format) {
    switch (format) {
        case 'rgb':
            return hexToRgb(color);
        case 'hsl':
            return hexToHSLObj(color);
        default:
            return color;
    }
}

// Create color box element
function createColorBox(color, isLocked = false) {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.dataset.hex = color;
    
    const colorElement = document.createElement('div');
    colorElement.className = 'color';
    colorElement.style.backgroundColor = color;
    
    const colorInfo = document.createElement('div');
    colorInfo.className = 'color-info';
    
    const colorValue = document.createElement('span');
    colorValue.className = 'color-value';
    colorValue.textContent = formatColor(color, colorFormat.value);
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
    
    const lockBtn = document.createElement('button');
    lockBtn.className = `lock-btn ${isLocked ? 'active' : ''}`;
    lockBtn.innerHTML = '<i class="fas fa-lock"></i>';
    
    colorInfo.appendChild(colorValue);
    colorInfo.appendChild(copyBtn);
    colorInfo.appendChild(lockBtn);
    
    colorBox.appendChild(colorElement);
    colorBox.appendChild(colorInfo);
    
    // Copy to clipboard functionality
    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(colorValue.textContent).then(() => {
            showToast('Color copied to clipboard!');
        });
    });
    
    // Lock/unlock functionality
    lockBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        lockBtn.classList.toggle('active');
        colorBox.dataset.locked = lockBtn.classList.contains('active');
    });
    
    return colorBox;
}

// Generate colors based on harmony type
function generateColors() {
    let colors = [];
    let count = 5;
    let harmony = harmonyType.value;
    let baseColor = generateRandomColor();
    if (harmony === 'complementary') {
        colors = [baseColor, getComplementaryColor(baseColor)];
        count = 2;
    } else if (harmony === 'analogous') {
        const analogous = getAnalogousColors(baseColor);
        colors = [baseColor, ...analogous];
        count = 3;
    } else if (harmony === 'triadic') {
        const triadic = getTriadicColors(baseColor);
        colors = [baseColor, ...triadic];
        count = 3;
    } else {
        for (let i = 0; i < 5; i++) {
            colors.push(generateRandomColor());
        }
        count = 5;
    }
    colorsContainer.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const colorBox = createColorBox(colors[i]);
        colorsContainer.appendChild(colorBox);
    }
}

// Show toast notification
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Export functions
function exportAsCSS() {
    const colors = Array.from(colorsContainer.querySelectorAll('.color-box')).map(box => {
        const color = box.querySelector('.color').style.backgroundColor;
        const name = box.querySelector('.color-value').textContent;
        return `--color-${name.replace(/[^a-zA-Z0-9]/g, '')}: ${color};`;
    }).join('\n');

    const css = `:root {\n${colors}\n}`;
    navigator.clipboard.writeText(css).then(() => {
        showToast('CSS variables copied to clipboard!');
    });
}

function exportAsJSON() {
    const colors = Array.from(colorsContainer.querySelectorAll('.color-box')).map(box => {
        const color = box.querySelector('.color').style.backgroundColor;
        const name = box.querySelector('.color-value').textContent;
        return { name, value: color };
    });

    navigator.clipboard.writeText(JSON.stringify(colors, null, 2)).then(() => {
        showToast('JSON copied to clipboard!');
    });
}

// Persistent palette storage
function getSavedPalettes() {
    return JSON.parse(localStorage.getItem('savedPalettes') || '[]');
}

function setSavedPalettes(palettes) {
    localStorage.setItem('savedPalettes', JSON.stringify(palettes));
}

function renderSavedPalettes() {
    palettesContainer.innerHTML = '';
    const palettes = getSavedPalettes();
    palettes.forEach((palette, idx) => {
        const paletteDiv = document.createElement('div');
        paletteDiv.className = 'saved-palette';

        const colorsDiv = document.createElement('div');
        colorsDiv.className = 'saved-palette-colors';
        palette.forEach(color => {
            const colorDiv = document.createElement('div');
            colorDiv.className = 'saved-color';
            colorDiv.style.backgroundColor = color;
            colorsDiv.appendChild(colorDiv);
        });

        // Use button
        const useBtn = document.createElement('button');
        useBtn.textContent = 'Use';
        useBtn.onclick = () => {
            loadPaletteToMain(palette);
        };

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => {
            const newPalettes = getSavedPalettes();
            newPalettes.splice(idx, 1);
            setSavedPalettes(newPalettes);
            renderSavedPalettes();
            showToast('Palette deleted!');
        };

        const actionsDiv = document.createElement('div');
        actionsDiv.style.marginTop = '0.5rem';
        actionsDiv.appendChild(useBtn);
        actionsDiv.appendChild(deleteBtn);

        paletteDiv.appendChild(colorsDiv);
        paletteDiv.appendChild(actionsDiv);
        palettesContainer.appendChild(paletteDiv);
    });
}

function loadPaletteToMain(palette) {
    colorsContainer.innerHTML = '';
    palette.forEach(color => {
        const colorBox = createColorBox(color);
        colorsContainer.appendChild(colorBox);
    });
}

function savePalette() {
    const colors = Array.from(colorsContainer.querySelectorAll('.color-box')).map(box => {
        return box.querySelector('.color').style.backgroundColor;
    });
    const palettes = getSavedPalettes();
    palettes.push(colors);
    setSavedPalettes(palettes);
    renderSavedPalettes();
    showToast('Palette saved!');
}

// Event Listeners
generateBtn.addEventListener('click', generateColors);

colorFormat.addEventListener('change', () => {
    const colorBoxes = colorsContainer.querySelectorAll('.color-box');
    colorBoxes.forEach(box => {
        const hex = box.dataset.hex;
        box.querySelector('.color-value').textContent = formatColor(hex, colorFormat.value);
    });
});

customColor.addEventListener('input', () => {
    const colorBoxes = colorsContainer.querySelectorAll('.color-box');
    if (colorBoxes.length > 0) {
        const firstBox = colorBoxes[0];
        firstBox.querySelector('.color').style.backgroundColor = customColor.value;
        firstBox.querySelector('.color-value').textContent = formatColor(customColor.value, colorFormat.value);
    }
});

harmonyType.addEventListener('change', generateColors);

exportCssBtn.addEventListener('click', exportAsCSS);
exportJsonBtn.addEventListener('click', exportAsJSON);
savePaletteBtn.addEventListener('click', savePalette);

// Generate initial colors
generateColors(); 
generateColors(); 

// On page load, render saved palettes
renderSavedPalettes(); 