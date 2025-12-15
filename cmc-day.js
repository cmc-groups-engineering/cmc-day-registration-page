(function () {
  const form = document.getElementById('cmc-day-form');
  const successView = document.getElementById('success-view');
  const registerAnotherBtn = document.getElementById('register-another-btn');
  const shareQrBtn = document.getElementById('share-qr-btn');
  const shareLinkBtn = document.getElementById('share-link-btn');
  const copyLinkBtn = document.getElementById('copy-link-btn');
  const year = document.getElementById('year');
  const cdDays = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMinutes = document.getElementById('cd-minutes');
  const cdSeconds = document.getElementById('cd-seconds');

  // Set current year in footer
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Countdown to Nov 25, 2025 9:00 AM PST (Thanksgiving Community Giveback start time)
  if (cdDays && cdHours && cdMinutes && cdSeconds) {
    // PST offset (-08:00). Using a fixed offset to avoid DST ambiguity.
    const target = new Date('2025-12-21T18:00:00-08:00');

    function pad2(n) {
      return String(n).padStart(2, '0');
    }

    function updateCountdown() {
      const now = new Date();
      const diffMs = target.getTime() - now.getTime();

      if (diffMs <= 0) {
        cdDays.textContent = '00';
        cdHours.textContent = '00';
        cdMinutes.textContent = '00';
        cdSeconds.textContent = '00';
        return;
      }

      const totalSeconds = Math.floor(diffMs / 1000);
      const days = Math.floor(totalSeconds / (24 * 3600));
      const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      cdDays.textContent = pad2(days);
      cdHours.textContent = pad2(hours);
      cdMinutes.textContent = pad2(minutes);
      cdSeconds.textContent = pad2(seconds);
    }

    // Initial draw and start interval
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Form submission
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect form data using the specified structure
      const formData = {
        name: e.target.name.value.trim(),
        phoneNumber: e.target.phoneNumber.value.trim(),
        email: e.target.email.value.trim(),
        source: e.target.source.value,
        dateOfEvent: 'November 25th, 2025'
      };

      // Validate email
      if (!formData.email || formData.email === '') {
        alert('Please enter an email address.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Prepare data for submission
      const data = formData;

      // Google Sheets Web App endpoint
      const API_URL = 'https://script.google.com/macros/s/AKfycbxR2Nj3xpaLqGt-ZX4qNxrd2j4GiIKO1BepGCp-iwlKAUlaCQUf09NdC5uJLhhOUwaY1Q/exec';

      // Disable submit button to prevent multiple submissions
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
      }

      // Submit to Google Sheets
      fetch(API_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      })
        .then(() => {
          // With no-cors mode, we can't read the response, but we assume success
          // Show success view
          showSuccessView();
          // Re-enable submit button (will be hidden in success view, but good practice)
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        })
        .catch(error => {
          console.error('Error submitting form:', error);
          alert('There was an error submitting your registration. Please try again.');
          // Re-enable submit button
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
          }
        });
    });
  }

  function showSuccessView() {
    if (form && successView) {
      form.classList.add('hidden');
      successView.classList.remove('hidden');
      successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // Register another person
  if (registerAnotherBtn) {
    registerAnotherBtn.addEventListener('click', () => {
      if (form && successView) {
        successView.classList.add('hidden');
        form.classList.remove('hidden');
        form.reset();
        
        // Focus on name field
        const nameField = document.getElementById('name');
        if (nameField) nameField.focus();
      }
    });
  }

  // Share QR Code (Web Share API with fallback to download)
  if (shareQrBtn) {
    shareQrBtn.addEventListener('click', async () => {
      try {
        const qrUrl = './assets/cmc-registration-qr-code.png';
        const response = await fetch(qrUrl);
        const blob = await response.blob();
        const file = new File([blob], 'cmc-registration-qr-code.png', { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Thanksgiving Community Giveback Registration QR Code',
            text: 'Scan this QR code for the CMC & Donut King 2 Thanksgiving Community Giveback registration info.',
            files: [file]
          });
        } else {
          // Fallback: trigger download
          const link = document.getElementById('download-qr-link');
          if (link) link.click();
        }
      } catch (err) {
        console.error('Share failed, falling back to download:', err);
        const link = document.getElementById('download-qr-link');
        if (link) link.click();
      }
    });
  }

  // Share or copy registration link
  const registrationUrl = 'https://cmc-groups-engineering.github.io/cmc-day-registration-page/';
  if (shareLinkBtn) {
    shareLinkBtn.addEventListener('click', async () => {
      try {
        if (navigator.share) {
          await navigator.share({
            title: 'Thanksgiving Community Giveback Registration',
            text: 'Register for the CMC & Donut King 2 Thanksgiving Community Giveback at the link below.',
            url: registrationUrl
          });
        } else {
          await navigator.clipboard.writeText(registrationUrl);
          shareLinkBtn.textContent = 'Link Copied!';
          setTimeout(() => (shareLinkBtn.textContent = 'Share Registration Link'), 1500);
        }
      } catch (e) {
        await navigator.clipboard.writeText(registrationUrl).catch(() => {});
        shareLinkBtn.textContent = 'Link Copied!';
        setTimeout(() => (shareLinkBtn.textContent = 'Share Registration Link'), 1500);
      }
    });
  }

  if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(registrationUrl);
        copyLinkBtn.textContent = 'Copied!';
        setTimeout(() => (copyLinkBtn.textContent = 'Copy Registration Link'), 1500);
      } catch (e) {
        alert('Copy failed. Please copy manually: ' + registrationUrl);
      }
    });
  }
})();

