// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// BPM matching logic
document.querySelectorAll('input[name="bmp_match"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const customBpmSection = document.getElementById('custom-bpm');
        const customBpmInput = document.getElementById('custom_bpm_value');
        
        if (this.value === 'different') {
            customBpmSection.style.display = 'block';
            customBmpInput.required = true;
        } else {
            customBpmSection.style.display = 'none';
            customBpmInput.required = false;
            customBpmInput.value = '';
        }
    });
});

// Upload method switching
document.querySelectorAll('input[name="upload_method"]').forEach(radio => {
    radio.addEventListener('change', function() {
        const directUpload = document.getElementById('direct-upload');
        const wetransferUpload = document.getElementById('wetransfer-upload');
        const methods = document.querySelectorAll('.method');
        
        // Remove active class from all methods
        methods.forEach(method => method.classList.remove('active'));
        
        // Add active class to selected method
        this.closest('.method').classList.add('active');
        
        if (this.value === 'direct') {
            directUpload.style.display = 'block';
            wetransferUpload.style.display = 'none';
            document.getElementById('files').required = true;
            document.getElementById('wetransfer_link').required = false;
        } else {
            directUpload.style.display = 'none';
            wetransferUpload.style.display = 'block';
            document.getElementById('files').required = false;
            document.getElementById('wetransfer_link').required = true;
        }
    });
});

// Form submission handling
document.querySelector('.submission-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Show loading state
    const submitButton = this.querySelector('.submit-button');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'שולח...';
    submitButton.disabled = true;
    
    // Get form data
    const formData = new FormData(this);
    const uploadMethod = formData.get('upload_method');
    
    // Validate files for direct upload
    if (uploadMethod === 'direct') {
        const filesInput = this.querySelector('#files');
        if (filesInput.files.length < 2) {
            alert('אנא בחרו 2 קבצים: פלייבק + גייד שירה');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
        
        // Check total file size
        let totalSize = 0;
        for (let file of filesInput.files) {
            totalSize += file.size;
        }
        
        if (totalSize > 25 * 1024 * 1024) {
            alert('הקבצים גדולים מדי. אנא השתמשו ב-WeTransfer');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }
    }
    
    // Create email body
    const emailBody = createEmailBody(formData);
    
    // Create mailto link
    const subject = encodeURIComponent(`פלייבק חדש: ${formData.get('song_name')} - ${formData.get('original_artist')}`);
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:karaokeilmizrahi@gmail.com?subject=${subject}&body=${body}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Reset form after short delay
    setTimeout(() => {
        alert('המייל נפתח! אנא שלחו את המייל כדי להשלים את השליחה.');
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }, 1000);
});

function createEmailBody(formData) {
    const uploadMethod = formData.get('upload_method');
    const bpmMatch = formData.get('bpm_match');
    
    let body = `שלום,

הגשת פלייבק חדש

פרטי הפלייבק:
==================
שם המעבד: ${formData.get('arranger_name')}
שם השיר: ${formData.get('song_name')}
זמר מקורי: ${formData.get('original_artist')}

קצב הפלייבק:
`;

    if (bpmMatch === 'matching') {
        body += `BPM תואם למקור המקורי`;
    } else {
        body += `BPM לא תואם למקור - קצב הפלייבק: ${formData.get('custom_bpm_value')} BPM`;
    }

    body += `

`;

    if (uploadMethod === 'wetransfer') {
        body += `קישור WeTransfer (פלייבק + גייד שירה): ${formData.get('wetransfer_link')}

`;
    } else {
        body += `הפלייבק וגייד השירה מצורפים למייל.

`;
    }

    body += `
⚠️ הפלייבק כולל גם גייד שירה (הקלטת שירה לפי הקצב)

תודה,
אתר Karaoke Il Mizrahi`;

    return body;
}

// Add floating animation to benefit cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
        }
    });
}, observerOptions);

document.querySelectorAll('.benefit-card').forEach(card => {
    observer.observe(card);
});

// Validate WeTransfer link format
document.getElementById('wetransfer_link').addEventListener('input', function() {
    const link = this.value.trim();
    if (link && !link.includes('we.tl') && !link.includes('wetransfer.com')) {
        this.setCustomValidity('אנא הכניסו קישור WeTransfer תקין');
    } else {
        this.setCustomValidity('');
    }
});