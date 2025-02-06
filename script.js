document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const editor = document.getElementById('editor');
    const closeEditor = document.getElementById('closeEditor');
    const compressButton = document.getElementById('compressButton');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const results = document.getElementById('results');
    const downloadButton = document.getElementById('downloadButton');

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.body.setAttribute('data-theme', savedTheme);

    // File Upload Handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = 'var(--primary)';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });

    // Click to upload
    dropZone.querySelector('.select-btn').addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    });

    // Close editor
    closeEditor.addEventListener('click', () => {
        editor.classList.add('hidden');
        results.classList.add('hidden');
    });

    // Quality slider
    qualitySlider.addEventListener('input', function() {
        const quality = this.value;
        qualityValue.textContent = quality + '%';
        
        // Update slider background
        const percentage = (quality - this.min) / (this.max - this.min) * 100;
        this.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, var(--surface-2) ${percentage}%, var(--surface-2) 100%)`;
    });

    let currentFile = null;

    function handleFile(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            alert('File size exceeds 10MB limit');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = document.getElementById('image-preview');
            img.src = e.target.result;
            editor.classList.remove('hidden');
            results.classList.add('hidden');
            
            // Update original size display
            document.getElementById('originalSize').textContent = formatFileSize(file.size);
        };
        
        reader.readAsDataURL(file);
    }

    // Compression
    compressButton.addEventListener('click', function() {
        if (!currentFile) return;

        const quality = qualitySlider.value / 100;
        const btnContent = this.querySelector('.btn-content');
        const btnText = btnContent.querySelector('.btn-text');
        const spinner = btnContent.querySelector('.spinner');
        
        // Show loading state
        this.disabled = true;
        btnText.textContent = 'Compressing...';
        spinner.classList.remove('hidden');

        const img = document.getElementById('image-preview');
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set canvas dimensions
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Compress image
        canvas.toBlob((blob) => {
            // Update compressed size display
            document.getElementById('compressedSize').textContent = formatFileSize(blob.size);
            
            // Calculate and display savings
            const savings = ((currentFile.size - blob.size) / currentFile.size * 100).toFixed(1);
            document.getElementById('savingsPercent').textContent = savings + '%';
            
            // Show results
            results.classList.remove('hidden');
            
            // Reset button state
            this.disabled = false;
            btnText.textContent = 'Compress Now';
            spinner.classList.add('hidden');
            
            // Setup download
            downloadButton.onclick = () => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'compressed-' + currentFile.name;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            };
        }, 'image/jpeg', quality);
    });

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Initialize quality slider background
    qualitySlider.dispatchEvent(new Event('input'));
});