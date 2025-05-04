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

function hexToHsl(hex) {
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
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

    h = Math.round(h * 360);
    s = Math.round(s * 100);
    l = Math.round(l * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
}

// Color harmony functions
function getComplementaryColor(hex) {
    const r = 255 - parseInt(hex.slice(1, 3), 16);
    const g = 255 - parseInt(hex.slice(3, 5), 16);
    const b = 255 - parseInt(hex.slice(5, 7), 16);
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function getAnalogousColors(hex) {
    const h = parseInt(hex.slice(1, 3), 16);
    const s = parseInt(hex.slice(3, 5), 16);
    const l = parseInt(hex.slice(5, 7), 16);
    
    const h1 = (h + 30) % 256;
    const h2 = (h - 30 + 256) % 256;
    
    return [
        `#${h1.toString(16).padStart(2, '0')}${s.toString(16).padStart(2, '0')}${l.toString(16).padStart(2, '0')}`,
        `#${h2.toString(16).padStart(2, '0')}${s.toString(16).padStart(2, '0')}${l.toString(16).padStart(2, '0')}`
    ];
}

function getTriadicColors(hex) {
    const h = parseInt(hex.slice(1, 3), 16);
    const s = parseInt(hex.slice(3, 5), 16);
    const l = parseInt(hex.slice(5, 7), 16);
    
    const h1 = (h + 120) % 256;
    const h2 = (h + 240) % 256;
    
    return [
        `#${h1.toString(16).padStart(2, '0')}${s.toString(16).padStart(2, '0')}${l.toString(16).padStart(2, '0')}`,
        `#${h2.toString(16).padStart(2, '0')}${s.toString(16).padStart(2, '0')}${l.toString(16).padStart(2, '0')}`
    ];
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
            return hexToHsl(color);
        default:
            return color;
    }
}

// Create color box element
function createColorBox(color, isLocked = false) {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    
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
    colorsContainer.innerHTML = '';
    const baseColor = generateRandomColor();
    let colors = [baseColor];

    switch (harmonyType.value) {
        case 'complementary':
            colors.push(getComplementaryColor(baseColor));
            break;
        case 'analogous':
            colors = [baseColor, ...getAnalogousColors(baseColor)];
            break;
        case 'triadic':
            colors = [baseColor, ...getTriadicColors(baseColor)];
            break;
        default:
            // Random colors
            for (let i = 1; i < 5; i++) {
                colors.push(generateRandomColor());
            }
    }

    colors.forEach(color => {
        const colorBox = createColorBox(color);
        colorsContainer.appendChild(colorBox);
    });
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

function savePalette() {
    const colors = Array.from(colorsContainer.querySelectorAll('.color-box')).map(box => {
        return box.querySelector('.color').style.backgroundColor;
    });

    const palette = document.createElement('div');
    palette.className = 'saved-palette';
    
    const colorsDiv = document.createElement('div');
    colorsDiv.className = 'saved-palette-colors';
    
    colors.forEach(color => {
        const colorDiv = document.createElement('div');
        colorDiv.className = 'saved-color';
        colorDiv.style.backgroundColor = color;
        colorsDiv.appendChild(colorDiv);
    });
    
    palette.appendChild(colorsDiv);
    palettesContainer.appendChild(palette);
    
    showToast('Palette saved!');
}

// Event Listeners
generateBtn.addEventListener('click', generateColors);

colorFormat.addEventListener('change', () => {
    const colorBoxes = colorsContainer.querySelectorAll('.color-box');
    colorBoxes.forEach(box => {
        const color = box.querySelector('.color').style.backgroundColor;
        box.querySelector('.color-value').textContent = formatColor(color, colorFormat.value);
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