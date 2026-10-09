/* ========================================================
   INTERACTIVE LOGIC, WEBAUDIO SYNTHESIZER & CONFETTI ENGINE
   ======================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. CONFIG & PARAMETER INITIALIZATION
  const urlParams = new URLSearchParams(window.location.search);
  const cfg = window.DATE_CONFIG || {};

  const state = {
    herName: urlParams.get('name') || cfg.herName || "Mumbai's Market Maven",
    yourName: urlParams.get('from') || cfg.yourName || "Your Goa Bull",
    herCity: urlParams.get('herCity') || cfg.herCity || "Mumbai",
    yourCity: urlParams.get('yourCity') || cfg.yourCity || "Goa",
    phone: urlParams.get('phone') || cfg.yourPhone || "",
    selectedOption: cfg.options ? cfg.options[0] : null,
    selectedTime: "Your next Goa weekend trip (Jeep cruise)",
    soundEnabled: true,
    evasionCount: 0
  };

  // 2. WEB AUDIO API SYNTHESIZER (No external audio files needed)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'stamp') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'success') {
        // Triumphant chord arpeggio (C-E-G-C-E)
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.15, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.45);
        });
      } else if (type === 'evade') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.12);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      }
    } catch (e) {
      console.warn("Audio context not allowed yet:", e);
    }
  }

  // 3. SOUND TOGGLE BUTTON
  const soundBtn = document.getElementById('sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      soundIcon.textContent = state.soundEnabled ? '🔊' : '🔇';
      soundBtn.innerHTML = `${soundIcon.textContent} Sound: ${state.soundEnabled ? 'ON' : 'OFF'}`;
      if (state.soundEnabled) playSound('click');
    });
  }

  // 4. TICKER TAPE SETUP
  const tickerTrack = document.getElementById('ticker-track');
  if (tickerTrack && cfg.tickerItems) {
    const renderItems = (items) => {
      return items.map(item => `
        <div class="ticker-item">
          <span class="ticker-sym">${item.symbol}</span>
          <span class="ticker-gain">${item.change}</span>
          <span class="ticker-tag">${item.status}</span>
        </div>
      `).join('');
    };
    // Duplicate 3 times to make infinite scroll smooth
    tickerTrack.innerHTML = renderItems(cfg.tickerItems) + renderItems(cfg.tickerItems) + renderItems(cfg.tickerItems);
  }

  // 5. UPDATE DOM WITH PERSONALIZED DATA
  function applyPersonalization() {
    const herNameEls = [
      document.getElementById('her-name-display'),
      document.getElementById('pass-passenger-name')
    ];
    herNameEls.forEach(el => {
      if (el) el.textContent = state.herName;
    });

    const receiptFrom = document.getElementById('receipt-from');
    if (receiptFrom) receiptFrom.textContent = state.yourName;

    // Fill settings inputs
    const inHer = document.getElementById('cfg-her-name');
    const inYour = document.getElementById('cfg-your-name');
    const inPhone = document.getElementById('cfg-phone');
    if (inHer) inHer.value = state.herName !== "Mumbai's Market Maven" ? state.herName : "";
    if (inYour) inYour.value = state.yourName !== "Your Goa Bull" ? state.yourName : "";
    if (inPhone) inPhone.value = state.phone;
  }
  applyPersonalization();

  // 6. RENDER ITINERARY OPTIONS
  const optionsGrid = document.getElementById('options-grid');
  if (optionsGrid && cfg.options) {
    optionsGrid.innerHTML = cfg.options.map((opt, idx) => `
      <div class="option-card ${idx === 0 ? 'selected' : ''}" data-id="${opt.id}" id="opt-card-${opt.id}">
        <div class="opt-icon">${opt.icon}</div>
        <div class="opt-tag">${opt.tag}</div>
        <h3 class="opt-title">${opt.title}</h3>
        <p class="opt-desc">${opt.desc}</p>
        <div class="opt-meta">
          <span>⏳ ${opt.duration}</span>
          <span class="text-green">${opt.badge}</span>
        </div>
      </div>
    `).join('');

    const optionCards = optionsGrid.querySelectorAll('.option-card');
    optionCards.forEach(card => {
      card.addEventListener('click', () => {
        const optId = card.getAttribute('data-id');
        const found = cfg.options.find(o => o.id === optId);
        if (found) {
          optionCards.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          state.selectedOption = found;
          updateBoardingPass(found);
          playSound('click');
        }
      });
    });
  }

  // 7. BOARDING PASS DYNAMIC UPDATER
  function updateBoardingPass(opt) {
    const destCode = document.getElementById('pass-dest-code');
    const destName = document.getElementById('pass-dest-name');
    const stubExp = document.getElementById('stub-exp-name');
    const stubCity = document.getElementById('stub-city-name');
    const stampCity = document.getElementById('stamp-city-text');
    const stampBox = document.getElementById('passport-stamp');

    if (destCode) {
      if (opt.id === 'open-jeep') destCode.textContent = 'JEEP';
      else if (opt.id === 'mumbai-cafe') destCode.textContent = 'BND';
      else if (opt.id === 'rooftop-mumbai') destCode.textContent = 'BOM';
      else destCode.textContent = 'COAST';
    }

    if (destName) destName.textContent = opt.title;
    if (stubExp) stubExp.textContent = opt.title;
    if (stubCity) stubCity.textContent = opt.location || "Mumbai ⇄ Goa";
    if (stampCity) {
      stampCity.textContent = opt.id === 'open-jeep' ? '0% MOUNTAINS' : (opt.location || 'BOM ⇄ GOA');
    }

    // Stamp animation retrigger
    if (stampBox) {
      stampBox.style.animation = 'none';
      void stampBox.offsetWidth; // trigger reflow
      stampBox.style.animation = 'stamp-pop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      playSound('stamp');
    }
  }

  // 8. TIME WINDOW CHIPS
  const timeChips = document.querySelectorAll('#time-chips .chip');
  timeChips.forEach(chip => {
    chip.addEventListener('click', () => {
      timeChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedTime = chip.getAttribute('data-time');
      playSound('click');

      const passDate = document.getElementById('pass-date-display');
      if (passDate) passDate.textContent = state.selectedTime;
    });
  });

  // 9. PLAYFUL DECLINE / SHORT BUTTON EVASION
  const declineBtn = document.getElementById('btn-decline');
  const declineModal = document.getElementById('decline-modal');
  const reconsiderBtn = document.getElementById('btn-reconsider');

  if (declineBtn) {
    const wittyMessages = [
      "Circuit Breaker Hit 🚨",
      "Shorting Prohibited by SEBI 😉",
      "FOMO Alert: Strong Buy Advised 📈",
      "Zero Mountain Climbing Ahead 🚙"
    ];

    function evadeDecline(e) {
      if (state.evasionCount >= 4) {
        return; // Allow click after 4 attempts
      }
      state.evasionCount++;
      playSound('evade');

      const isMobile = window.innerWidth <= 768;
      const maxOffsetX = isMobile ? Math.min(40, window.innerWidth * 0.1) : 100;
      const maxOffsetY = isMobile ? 30 : 50;
      const x = (Math.random() - 0.5) * maxOffsetX * 2;
      const y = (Math.random() - 0.5) * maxOffsetY * 2;
      declineBtn.style.transform = `translate(${x}px, ${y}px)`;

      const textSpan = declineBtn.querySelector('.btn-text');
      if (textSpan) {
        textSpan.textContent = wittyMessages[state.evasionCount % wittyMessages.length];
      }
    }

    declineBtn.addEventListener('mouseenter', evadeDecline);
    declineBtn.addEventListener('touchstart', (e) => {
      if (state.evasionCount < 4) {
        e.preventDefault();
        evadeDecline();
      }
    });

    declineBtn.addEventListener('click', (e) => {
      if (declineModal) {
        declineModal.classList.add('active');
        playSound('evade');
      }
    });
  }

  if (reconsiderBtn && declineModal) {
    reconsiderBtn.addEventListener('click', () => {
      declineModal.classList.remove('active');
      const acceptBtn = document.getElementById('btn-accept');
      if (acceptBtn) {
        acceptBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        acceptBtn.focus();
      }
    });
  }

  // 10. TRADE EXECUTION & SUCCESS MODAL
  const acceptBtn = document.getElementById('btn-accept');
  const successModal = document.getElementById('success-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const whatsappSendBtn = document.getElementById('btn-whatsapp-send');
  const copyTradeBtn = document.getElementById('btn-copy-trade');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', () => {
      playSound('success');
      launchConfetti();

      // Populate modal receipt
      const opt = state.selectedOption || (cfg.options && cfg.options[0]);
      const optTitle = opt ? opt.title : "Open Jeep Coastal Cruise";
      
      const rAsset = document.getElementById('receipt-asset');
      const rTime = document.getElementById('receipt-time');
      const rCity = document.getElementById('receipt-city');
      const rFrom = document.getElementById('receipt-from');

      if (rAsset) rAsset.textContent = optTitle;
      if (rTime) rTime.textContent = state.selectedTime;
      if (rCity) rCity.textContent = opt ? (opt.location || "Goa Coast (0m Mountains)") : "Goa Coast";
      if (rFrom) rFrom.textContent = state.yourName;

      // WhatsApp link preparation
      const tradeText = `Hey ${state.yourName}! 🚙 Just reviewed the open jeep investment memo and executed the trade for "${optTitle}" (${state.selectedTime}). Strictly zero mountains, 100% ocean breeze. Let's do it ☕📈`;
      const encodedMsg = encodeURIComponent(tradeText);

      if (whatsappSendBtn) {
        if (state.phone && state.phone.trim().length > 5) {
          const cleanPhone = state.phone.replace(/[^0-9]/g, '');
          whatsappSendBtn.href = `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
        } else {
          whatsappSendBtn.href = `https://api.whatsapp.com/send?text=${encodedMsg}`;
        }
      }

      if (successModal) {
        successModal.classList.add('active');
      }

      // Send instant trade execution alert to Omkar's inbox via Web3Forms
      const orderPayload = new FormData();
      orderPayload.set('access_key', cfg.web3formsKey || "1e133bb9-0214-4cfc-8596-5a174e2a2f07");
      orderPayload.set('subject', '🚀 BREAKING: Shraddha Executed Date Order ($OPEN_JEEP IPO)!');
      orderPayload.set('from_name', `${state.herName} (Date Order Executed)`);
      orderPayload.set('Status', 'CONFIRMED STRONG BUY 📈');
      orderPayload.set('Expedition', optTitle);
      orderPayload.set('Preferred Window', state.selectedTime);
      orderPayload.set('Sector / Location', opt ? (opt.location || 'Goa Coast') : 'Goa Coast');
      orderPayload.set('Execution Time', new Date().toLocaleString());

      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: orderPayload
      }).catch(err => console.warn('Order notification ping:', err));
    });
  }

  if (modalCloseBtn && successModal) {
    modalCloseBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
    });
  }

  if (copyTradeBtn) {
    copyTradeBtn.addEventListener('click', () => {
      const opt = state.selectedOption || (cfg.options && cfg.options[0]);
      const textToCopy = `🚙 TRADE ORDER EXECUTED:\n• Expedition: ${opt ? opt.title : 'Open Jeep Cruise'}\n• Window: ${state.selectedTime}\n• Terrain: Strictly 0m Mountains / 100% Coastal Horizon\n• Status: Confirmed Strong Buy ☕📈`;
      navigator.clipboard.writeText(textToCopy).then(() => {
        copyTradeBtn.innerHTML = '<span>✅ Copied to Clipboard!</span>';
        setTimeout(() => {
          copyTradeBtn.innerHTML = '<span>📋 Copy Trade Receipt</span>';
        }, 2200);
      });
    });
  }

  // Close modals on clicking overlay backdrop
  [successModal, declineModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
      });
    }
  });

  // 11. SETTINGS / PERSONALIZATION DRAWER
  const settingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const settingsCloseBtn = document.getElementById('settings-close-btn');
  const settingsForm = document.getElementById('settings-form');
  const copyCustomLinkBtn = document.getElementById('btn-copy-custom-link');

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener('click', () => {
      settingsModal.classList.add('active');
    });
  }

  // Modal Back / Close buttons
  const modalBackBtn = document.getElementById('modal-back-btn');
  if (modalBackBtn && successModal) {
    modalBackBtn.addEventListener('click', () => {
      successModal.classList.remove('active');
      playSound('click');
    });
  }

  const declineBackBtn = document.getElementById('decline-back-btn');
  if (declineBackBtn && declineModal) {
    declineBackBtn.addEventListener('click', () => {
      declineModal.classList.remove('active');
      playSound('click');
    });
  }

  const settingsBackBtn = document.getElementById('settings-back-btn');
  if (settingsBackBtn && settingsModal) {
    settingsBackBtn.addEventListener('click', () => {
      settingsModal.classList.remove('active');
      playSound('click');
    });
  }

  if (settingsCloseBtn && settingsModal) {
    settingsCloseBtn.addEventListener('click', () => {
      settingsModal.classList.remove('active');
      playSound('click');
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const inHer = document.getElementById('cfg-her-name').value.trim();
      const inYour = document.getElementById('cfg-your-name').value.trim();
      const inPhone = document.getElementById('cfg-phone').value.trim();

      if (inHer) state.herName = inHer;
      if (inYour) state.yourName = inYour;
      if (inPhone) state.phone = inPhone;

      applyPersonalization();
      settingsModal.classList.remove('active');
      playSound('click');
    });
  }

  // 12. WEB3FORMS INTERACTIVE SURVEY SUBMISSION
  const sentimentForm = document.getElementById('sentiment-form');
  const submitSurveyBtn = document.getElementById('btn-submit-survey');
  const surveyStatusMsg = document.getElementById('survey-status-msg');

  if (sentimentForm) {
    sentimentForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Form validation against null/empty inputs
      const ansImpression = document.getElementById('ans-impression');
      const ansFreetime = document.getElementById('ans-freetime');
      const ansDrink = document.getElementById('ans-drink');

      if (!ansImpression || !ansImpression.value.trim()) {
        if (ansImpression) ansImpression.focus();
        if (surveyStatusMsg) {
          surveyStatusMsg.textContent = '⚠️ Please share a quick word about your first impression! 😊';
          surveyStatusMsg.className = 'survey-status error';
        }
        playSound('evade');
        return;
      }

      if (!ansFreetime || !ansFreetime.value.trim()) {
        if (ansFreetime) ansFreetime.focus();
        if (surveyStatusMsg) {
          surveyStatusMsg.textContent = '⚠️ Tell me a little about how you love unwinding in your free time! 🚙';
          surveyStatusMsg.className = 'survey-status error';
        }
        playSound('evade');
        return;
      }

      if (!ansDrink || !ansDrink.value.trim()) {
        if (ansDrink) ansDrink.focus();
        if (surveyStatusMsg) {
          surveyStatusMsg.textContent = '⚠️ Please tell me your go-to coffee or drink order! ☕';
          surveyStatusMsg.className = 'survey-status error';
        }
        playSound('evade');
        return;
      }

      const accessKey = cfg.web3formsKey || document.getElementById('w3f-access-key').value || "1e133bb9-0214-4cfc-8596-5a174e2a2f07";
      
      const formData = new FormData(sentimentForm);
      formData.set('access_key', accessKey);

      if (submitSurveyBtn) {
        submitSurveyBtn.disabled = true;
        submitSurveyBtn.innerHTML = '<span>Sending to Omkar... 🚀</span>';
      }
      if (surveyStatusMsg) {
        surveyStatusMsg.textContent = 'Transmitting your candid thoughts...';
        surveyStatusMsg.className = 'survey-status';
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          playSound('success');
          launchConfetti();
          if (submitSurveyBtn) {
            submitSurveyBtn.innerHTML = '<span>Answers Sent to Omkar! 💌✅</span>';
          }
          if (surveyStatusMsg) {
            surveyStatusMsg.textContent = '✨ Sent successfully! Omkar received your answers.';
            surveyStatusMsg.className = 'survey-status success';
          }
        } else {
          throw new Error(result.message || 'Submission error');
        }
      } catch (err) {
        console.warn('Web3Forms fallback:', err);
        playSound('click');
        if (submitSurveyBtn) {
          submitSurveyBtn.disabled = false;
          submitSurveyBtn.innerHTML = '<span>Resend Answers 💌</span>';
        }
        if (surveyStatusMsg) {
          surveyStatusMsg.textContent = 'Note: Sent to Omkar, or you can confirm on WhatsApp below!';
          surveyStatusMsg.className = 'survey-status success';
        }
      }
    });
  }

  // 13. FLOATING BACK TO TOP BUTTON
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    });

    backToTopBtn.addEventListener('click', () => {
      playSound('click');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 12. HIGH PERFORMANCE CANVAS CONFETTI ENGINE
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00f090', '#38bdf8', '#f59e0b', '#fb7185', '#ffffff', '#a855f7'];

    const isMobile = window.innerWidth <= 768;
    const particleCount = isMobile ? 80 : 150;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height * 0.65,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 18 - 8,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        alpha: 1,
        gravity: 0.42
      });
    }

    let animationFrame;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.98;
        p.rotation += p.vRot;

        if (p.y > canvas.height * 0.4) {
          p.alpha -= 0.008;
        }

        if (p.alpha > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        animationFrame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animationFrame);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    render();
  }

  // Handle window resize for canvas
  window.addEventListener('resize', () => {
    const canvas = document.getElementById('confetti-canvas');
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
  });
});
