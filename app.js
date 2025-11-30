/* Simple Todo App + Theme + Gallery helpers */
(function () {
  const THEME_KEY = "theme-preference";
  const STORAGE_KEY = "tasks-v1";

  // Theme toggle
  window.toggleTheme = function toggleTheme() {
    const root = document.documentElement;
    const current = root.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
    updateThemeToggleButton(next);
  };

  function updateThemeToggleButton(theme) {
    const btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    const icon = btn.querySelector(".material-icons");
    const label = btn.querySelector("span:last-child");
    if (icon) icon.textContent = theme === "light" ? "dark_mode" : "light_mode";
    if (label)
      label.textContent = theme === "light" ? "다크 모드" : "라이트 모드";
    btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
  }

  // Restore theme on load
  (function initTheme() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "light" || saved === "dark") {
        document.documentElement.setAttribute("data-theme", saved);
        updateThemeToggleButton(saved);
      }
    } catch {}
    // Ensure button state reflects current theme on first load
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    updateThemeToggleButton(current);
  })();

  // Tasks state
  /** @type {{ id: string, title: string, completed: boolean }[]} */
  let tasks = [];
  let filter = "all"; // all | active | completed

  // DOM elements
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const list = document.getElementById("task-list");
  const clearCompletedBtn = document.getElementById("clear-completed");
  const totalCountEl = document.getElementById("total-count");
  const completedCountEl = document.getElementById("completed-count");
  const filterButtons = document.querySelectorAll(".btn-filter");

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {}
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      tasks = raw ? JSON.parse(raw) : [];
    } catch {
      tasks = [];
    }
  }

  function setFilter(next) {
    filter = next;
    filterButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.filter === filter)
    );
    render();
  }

  function filteredTasks() {
    if (filter === "active") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }

  function updateSummary() {
    const total = tasks.length;
    const done = tasks.filter((t) => t.completed).length;
    if (totalCountEl) totalCountEl.textContent = String(total);
    if (completedCountEl) completedCountEl.textContent = String(done);
    if (clearCompletedBtn) clearCompletedBtn.disabled = done === 0;
  }

  function render() {
    // 목록 요소가 없으면(이 페이지에서 투두 UI 미사용) 렌더링을 생략합니다.
    if (!list) {
      updateSummary();
      return;
    }
    list.innerHTML = "";
    const items = filteredTasks();
    for (const t of items) {
      const li = document.createElement("li");
      li.className = "task-item";

      // checkbox
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = t.completed;
      cb.ariaLabel = "완료 표시";
      cb.addEventListener("change", () => {
        t.completed = cb.checked;
        save();
        updateSummary();
        render();
      });

      // title
      const title = document.createElement("span");
      title.className = "task-title" + (t.completed ? " completed" : "");
      title.textContent = t.title;

      // actions
      const actions = document.createElement("div");
      actions.className = "task-actions";

      const doneBtn = document.createElement("button");
      doneBtn.className = "icon-btn success";
      doneBtn.title = "완료 전환";
      doneBtn.innerHTML =
        '<span class="material-icons" aria-hidden="true">check_circle</span>';
      doneBtn.addEventListener("click", () => {
        cb.click();
      });

      const delBtn = document.createElement("button");
      delBtn.className = "icon-btn danger";
      delBtn.title = "삭제";
      delBtn.innerHTML =
        '<span class="material-icons" aria-hidden="true">delete</span>';
      delBtn.addEventListener("click", () => {
        tasks = tasks.filter((x) => x.id !== t.id);
        save();
        updateSummary();
        render();
      });

      actions.append(doneBtn, delBtn);
      li.append(cb, title, actions);
      list.append(li);
    }

    updateSummary();
  }

  // Event bindings
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const title = (input.value || "").trim();
      if (!title) return;
      tasks.unshift({ id: uid(), title, completed: false });
      input.value = "";
      save();
      render();
    });
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFilter(btn.dataset.filter));
  });

  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", () => {
      tasks = tasks.filter((t) => !t.completed);
      save();
      render();
    });
  }

  // Lazy hint: if images are not visible, the browser handles via loading="lazy".
  // App bootstrap
  load();
  render();

  // ===== Gallery Lightbox & Carousel =====
  // Build gallery items from either explicit hero gallery or photos on page
  const galleryAnchors = Array.from(
    document.querySelectorAll(".hero-gallery .hero-card")
  );
  const detectiveImgs = Array.from(
    document.querySelectorAll(".detective-image img, .hero-photo")
  );
  /** @type {{node:HTMLElement, href:string, caption:string, alt:string}[]} */
  const galleryItems = galleryAnchors.length
    ? galleryAnchors.map((a) => ({
        node: a,
        href: a.getAttribute("href"),
        caption:
          a.getAttribute("data-caption") ||
          a.querySelector("img")?.alt ||
          "이미지",
        alt: a.querySelector("img")?.alt || "이미지",
      }))
    : detectiveImgs.map((img) => ({
        node: img,
        href: img.getAttribute("src"),
        caption: img.getAttribute("alt") || "이미지",
        alt: img.getAttribute("alt") || "이미지",
      }));

  // Minimal built-in lightbox if markup is missing
  let lb = document.getElementById("lightbox");
  if (!lb) {
    lb = document.createElement("div");
    lb.id = "lightbox";
    lb.className = "lightbox";
    lb.hidden = true;
    lb.innerHTML = `
      <div class="lightbox-backdrop" data-lightbox-close></div>
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="이미지 미리보기">
        <button class="lightbox-close" data-lightbox-close aria-label="닫기"><span class="material-icons">close</span></button>
        <img id="lightbox-image" alt="이미지 미리보기" />
        <div id="lightbox-caption" class="lightbox-caption"></div>
        <div class="lightbox-actions">
          <button class="icon-btn" data-lightbox-prev aria-label="이전"><span class="material-icons">chevron_left</span></button>
          <button class="icon-btn" data-lightbox-next aria-label="다음"><span class="material-icons">chevron_right</span></button>
          <button class="icon-btn" data-lightbox-autoplay aria-pressed="false" aria-label="자동재생"><span class="material-icons">play_arrow</span></button>
          <button class="icon-btn" data-lightbox-shuffle aria-pressed="false" aria-label="셔플"><span class="material-icons">shuffle</span></button>
        </div>
      </div>`;
    document.body.appendChild(lb);
  }
  const lbImg = lb.querySelector("#lightbox-image");
  const lbCaption = lb.querySelector("#lightbox-caption");
  const lbCloseButtons = lb.querySelectorAll("[data-lightbox-close]");
  const lbPrev = lb.querySelector("[data-lightbox-prev]");
  const lbNext = lb.querySelector("[data-lightbox-next]");
  const lbAutoplayBtn = lb.querySelector("[data-lightbox-autoplay]");
  const lbShuffleBtn = lb.querySelector("[data-lightbox-shuffle]");

  let currentIndex = 0;
  let autoplayTimer = null;
  let shuffle = false;
  let lastFocused = null;

  function focusables() {
    return lb.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
  }

  function showImage(index) {
    if (!lbImg || !lbCaption || !galleryItems.length) return;
    currentIndex =
      ((index % galleryItems.length) + galleryItems.length) %
      galleryItems.length;
    const item = galleryItems[currentIndex];
    lbImg.src = item.href;
    lbImg.alt = item.alt || "이미지 미리보기";
    lbCaption.textContent = item.caption || "";
  }

  function openLightbox(index) {
    if (!lb) return;
    console.log("Opening lightbox at index:", index);
    lastFocused = document.activeElement;
    showImage(index);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    const f = focusables();
    if (f.length) f[0].focus();
    document.addEventListener("keydown", onKeyDown);
    lb.addEventListener("keydown", trapFocus);
  }

  function closeLightbox() {
    if (!lb) return;
    console.log("Closing lightbox");
    lb.hidden = true;
    document.body.style.overflow = "";
    stopAutoplay();
    document.removeEventListener("keydown", onKeyDown);
    lb.removeEventListener("keydown", trapFocus);
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  function nextImage() {
    if (shuffle && galleryItems.length > 1) {
      let n;
      do {
        n = Math.floor(Math.random() * galleryItems.length);
      } while (n === currentIndex);
      showImage(n);
    } else {
      showImage(currentIndex + 1);
    }
  }

  function prevImage() {
    showImage(currentIndex - 1);
  }

  function onKeyDown(e) {
    if (lb.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextImage();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevImage();
    }
  }

  function trapFocus(e) {
    if (e.key !== "Tab") return;
    const f = Array.from(focusables());
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function startAutoplay(intervalMs = 3000) {
    if (autoplayTimer) return;
    autoplayTimer = setInterval(() => {
      nextImage();
    }, intervalMs);
    if (lbAutoplayBtn) {
      lbAutoplayBtn.setAttribute("aria-pressed", "true");
      const icon = lbAutoplayBtn.querySelector(".material-icons");
      if (icon) icon.textContent = "pause";
    }
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
      if (lbAutoplayBtn) {
        lbAutoplayBtn.setAttribute("aria-pressed", "false");
        const icon = lbAutoplayBtn.querySelector(".material-icons");
        if (icon) icon.textContent = "play_arrow";
      }
    }
  }

  // Wire gallery clicks for whichever items we built
  galleryItems.forEach((item, idx) => {
    if (!item.node) return;
    item.node.style.cursor = "zoom-in";
    item.node.addEventListener("click", (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
  });

  // Wire lightbox controls
  console.log(
    "Wiring lightbox controls. Close buttons found:",
    lbCloseButtons.length
  );
  lbCloseButtons.forEach((btn) => {
    console.log("Adding close listener to:", btn);
    btn.addEventListener("click", (e) => {
      console.log("Close button clicked");
      closeLightbox();
    });
  });
  if (lbPrev) lbPrev.addEventListener("click", prevImage);
  if (lbNext) lbNext.addEventListener("click", nextImage);
  if (lbAutoplayBtn)
    lbAutoplayBtn.addEventListener("click", () => {
      if (autoplayTimer) stopAutoplay();
      else startAutoplay();
    });
  if (lbShuffleBtn)
    lbShuffleBtn.addEventListener("click", () => {
      shuffle = !shuffle;
      lbShuffleBtn.setAttribute("aria-pressed", shuffle ? "true" : "false");
    });

  // Close if clicking backdrop
  if (lb) {
    const backdrop = lb.querySelector(".lightbox-backdrop");
    if (backdrop) backdrop.addEventListener("click", closeLightbox);
  }

  // Theme toggle hotkey: press 't' outside of inputs
  document.addEventListener("keydown", (e) => {
    if (e.key?.toLowerCase() === "t" && !e.altKey && !e.ctrlKey && !e.metaKey) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (
        (tag !== "input" && tag !== "textarea" && tag !== "select" && !lb) ||
        (lb && lb.hidden)
      ) {
        window.toggleTheme();
      }
    }
  });

  // Bind theme toggle button click (avoid inline handlers)
  const themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", window.toggleTheme);

  // ===== Smooth scroll for internal anchors with offset =====
  const internalLinks = Array.from(
    document.querySelectorAll('a[href^="#"]:not([href="#"])')
  );
  internalLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  // ===== Stats counter on reveal =====
  const counters = document.querySelectorAll(".stat-number");
  const toNumber = (s) => Number(String(s).replace(/[^\d.]/g, ""));
  const formatSuffix = (s) => (String(s).includes("+") ? "+" : "");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        observer.unobserve(el);
        const target = toNumber(el.textContent || "0");
        const suffix = formatSuffix(el.textContent || "");
        const duration = 900;
        const start = performance.now();
        const startVal = 0;
        function step(now) {
          const p = Math.min(1, (now - start) / duration);
          const val = Math.floor(startVal + (target - startVal) * p);
          el.textContent = val.toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    },
    { threshold: 0.4 }
  );
  counters.forEach((c) => observer.observe(c));

  // ===== Login/Contact form handling =====
  const contactForm = document.getElementById("contact-form");
  let uploadedFiles = [];

  // File Upload Functionality
  const fileDropZone = document.querySelector(".file-drop-zone");
  const fileInput = document.getElementById("file-input");
  const filePreviewList = document.getElementById("file-preview-list");
  const analysisStatus = document.getElementById("ai-analysis-status");
  const analysisResult = document.getElementById("ai-analysis-result");

  if (fileDropZone && fileInput) {
    // Click to open file dialog
    fileDropZone.addEventListener("click", () => {
      fileInput.click();
    });

    // Drag & Drop events
    fileDropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      fileDropZone.classList.add("drag-over");
    });

    fileDropZone.addEventListener("dragleave", () => {
      fileDropZone.classList.remove("drag-over");
    });

    fileDropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      fileDropZone.classList.remove("drag-over");
      const files = Array.from(e.dataTransfer.files);
      handleFiles(files);
    });

    // File input change
    fileInput.addEventListener("change", (e) => {
      const files = Array.from(e.target.files);
      handleFiles(files);
    });
  }

  function handleFiles(files) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        alert(`${file.name}은(는) 50MB를 초과합니다.`);
        return false;
      }
      return true;
    });

    uploadedFiles = [...uploadedFiles, ...validFiles];
    renderFilePreview();
    if (uploadedFiles.length > 0) {
      analyzeFiles();
    }
  }

  function renderFilePreview() {
    if (!filePreviewList) return;
    filePreviewList.innerHTML = "";

    uploadedFiles.forEach((file, index) => {
      const item = document.createElement("div");
      item.className = "file-preview-item";

      const iconType = getFileIcon(file.type);
      const fileSize = formatFileSize(file.size);

      item.innerHTML = `
        <div class="file-icon">
          <span class="material-icons">${iconType}</span>
        </div>
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${fileSize}</div>
        </div>
        <button class="file-remove" data-index="${index}" type="button">
          <span class="material-icons">close</span>
        </button>
      `;

      const removeBtn = item.querySelector(".file-remove");
      removeBtn.addEventListener("click", () => {
        uploadedFiles.splice(index, 1);
        renderFilePreview();
        if (uploadedFiles.length === 0) {
          hideAnalysisUI();
        }
      });

      filePreviewList.appendChild(item);
    });
  }

  function getFileIcon(type) {
    if (type.startsWith("image/")) return "image";
    if (type.startsWith("audio/")) return "audiotrack";
    if (type.startsWith("video/")) return "videocam";
    if (type.includes("pdf")) return "picture_as_pdf";
    if (type.includes("word") || type.includes("document"))
      return "description";
    return "insert_drive_file";
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function analyzeFiles() {
    if (!analysisStatus || !analysisResult) return;

    // Show analysis status
    analysisStatus.style.display = "block";
    analysisResult.style.display = "none";

    const progressFill = analysisStatus.querySelector(".progress-fill");
    const analysisText = analysisStatus.querySelector(".analysis-text");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progressFill) progressFill.style.width = progress + "%";
      if (analysisText) {
        if (progress < 30)
          analysisText.textContent = "파일을 분석하고 있습니다...";
        else if (progress < 60)
          analysisText.textContent = "내용을 추출하고 있습니다...";
        else if (progress < 90)
          analysisText.textContent = "AI 분석을 진행하고 있습니다...";
        else analysisText.textContent = "분석 완료 중...";
      }

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          showAnalysisResult();
        }, 500);
      }
    }, 60);
  }

  function showAnalysisResult() {
    if (!analysisStatus || !analysisResult) return;

    analysisStatus.style.display = "none";
    analysisResult.style.display = "block";

    // Mock AI analysis result
    const hasImages = uploadedFiles.some((f) => f.type.startsWith("image/"));
    const hasAudio = uploadedFiles.some((f) => f.type.startsWith("audio/"));
    const hasVideo = uploadedFiles.some((f) => f.type.startsWith("video/"));
    const hasDocs = uploadedFiles.some(
      (f) => f.type.includes("pdf") || f.type.includes("document")
    );

    let resultHTML = `
      <div class="result-header">
        <span class="material-icons">check_circle</span>
        <h4>AI 분석 완료</h4>
      </div>
      <div class="analysis-content">
    `;

    if (hasImages) {
      resultHTML += `
        <div class="analysis-section">
          <h5>이미지 분석 <span class="confidence-badge confidence-high">신뢰도: 높음</span></h5>
          <ul>
            <li>문서 내 텍스트가 감지되었습니다 (OCR 완료)</li>
            <li>총 ${uploadedFiles.filter((f) => f.type.startsWith("image/")).length}개의 이미지 파일 확인</li>
            <li>증거 자료로 활용 가능한 품질입니다</li>
          </ul>
        </div>
      `;
    }

    if (hasAudio) {
      resultHTML += `
        <div class="analysis-section">
          <h5>음성 분석 <span class="confidence-badge confidence-medium">신뢰도: 중간</span></h5>
          <ul>
            <li>음성 파일이 업로드되었습니다</li>
            <li>전문가가 직접 확인 예정입니다</li>
            <li>텍스트 변환(STT)을 진행할 수 있습니다</li>
          </ul>
        </div>
      `;
    }

    if (hasVideo) {
      resultHTML += `
        <div class="analysis-section">
          <h5>영상 분석 <span class="confidence-badge confidence-high">신뢰도: 높음</span></h5>
          <ul>
            <li>영상 파일 형식이 확인되었습니다</li>
            <li>주요 장면 추출이 가능합니다</li>
            <li>증거 자료로 제출 가능합니다</li>
          </ul>
        </div>
      `;
    }

    if (hasDocs) {
      resultHTML += `
        <div class="analysis-section">
          <h5>문서 분석 <span class="confidence-badge confidence-high">신뢰도: 높음</span></h5>
          <ul>
            <li>PDF/문서 파일이 확인되었습니다</li>
            <li>텍스트 추출이 완료되었습니다</li>
            <li>관련 키워드가 감지되었습니다</li>
          </ul>
        </div>
      `;
    }

    resultHTML += `
        <div class="analysis-section">
          <h5>종합 평가</h5>
          <p>총 ${uploadedFiles.length}개의 파일이 업로드되었으며, AI 분석이 완료되었습니다. 전문 탐정이 추가 검토 후 연락드리겠습니다.</p>
        </div>
      </div>
    `;

    if (analysisResult) {
      analysisResult.innerHTML = resultHTML;
    }
  }

  function hideAnalysisUI() {
    if (analysisStatus) analysisStatus.style.display = "none";
    if (analysisResult) analysisResult.style.display = "none";
  }

  // ===== 본인확인: 휴대폰 본인인증 =====
  let isAuthenticated = false;
  const niceAuthBtn = document.getElementById("nice-auth");
  const authStatusDiv = document.getElementById("auth-status");

  // ===== 약관 동의 처리 =====
  const agreeAllCheckbox = document.getElementById("agree-all");
  const termsCheckbox = document.getElementById("agree-terms");
  const privacyCheckbox = document.getElementById("agree-privacy");
  const marketingCheckbox = document.getElementById("agree-marketing");

  if (
    agreeAllCheckbox &&
    termsCheckbox &&
    privacyCheckbox &&
    marketingCheckbox
  ) {
    // 필수 약관 동의 여부 확인 및 본인인증 버튼 활성화
    const checkRequiredTerms = () => {
      const isRequiredChecked =
        termsCheckbox.checked && privacyCheckbox.checked;
      if (niceAuthBtn) {
        niceAuthBtn.disabled = !isRequiredChecked;
        if (isRequiredChecked) {
          niceAuthBtn.innerHTML =
            '<span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem">phone_android</span>휴대폰 본인인증';
        } else {
          niceAuthBtn.innerHTML =
            '<span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem">phone_android</span>휴대폰 본인인증 (약관 동의 필요)';
        }
      }
    };

    // 전체 동의 체크박스 클릭 시
    agreeAllCheckbox.addEventListener("change", () => {
      const checked = agreeAllCheckbox.checked;
      termsCheckbox.checked = checked;
      privacyCheckbox.checked = checked;
      marketingCheckbox.checked = checked;
      checkRequiredTerms();
    });

    // 개별 체크박스 변경 시 전체 동의 상태 업데이트 및 본인인증 버튼 상태 변경
    const updateAgreeAll = () => {
      agreeAllCheckbox.checked =
        termsCheckbox.checked &&
        privacyCheckbox.checked &&
        marketingCheckbox.checked;
      checkRequiredTerms();
    };
    termsCheckbox.addEventListener("change", updateAgreeAll);
    privacyCheckbox.addEventListener("change", updateAgreeAll);
    marketingCheckbox.addEventListener("change", updateAgreeAll);

    // 초기 상태 설정
    checkRequiredTerms();
  }

  if (niceAuthBtn && authStatusDiv) {
    niceAuthBtn.addEventListener("click", () => {
      const nameInput = document.querySelector("input[name='name']");
      const phoneInput = document.querySelector("input[name='phone']");

      const name = nameInput ? nameInput.value.trim() : "";
      const phone = phoneInput ? phoneInput.value.trim() : "";

      if (!name) {
        alert("이름을 입력해 주세요.");
        nameInput?.focus();
        return;
      }
      if (!/^01[0-9]{8,9}$/.test(phone.replace(/-/g, ""))) {
        alert("올바른 휴대폰 번호를 입력해 주세요. (예: 01012345678)");
        phoneInput?.focus();
        return;
      }

      // 실제 서비스에서는 NICE/KCB 본인인증 팝업 호출
      // window.open('본인인증URL', 'niceAuth', 'width=500,height=600');

      // 개발 환경에서는 시뮬레이션
      alert(
        `본인인증을 진행합니다.\n이름: ${name}\n휴대폰: ${phone}\n\n(실제 서비스에서는 NICE/KCB 본인인증 팝업이 열립니다)`
      );

      // 인증 성공 시뮬레이션
      setTimeout(() => {
        isAuthenticated = true;
        authStatusDiv.style.display = "block";
        niceAuthBtn.disabled = true;
        niceAuthBtn.style.opacity = "0.6";
        niceAuthBtn.innerHTML =
          '<span class="material-icons" style="vertical-align: middle; margin-right: 0.5rem">check_circle</span>인증 완료';
      }, 1000);
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // 필수 약관 동의 확인
      if (!termsCheckbox?.checked || !privacyCheckbox?.checked) {
        alert("필수 약관에 모두 동의해 주세요.");
        termsCheckbox?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      // 본인인증 확인
      if (!isAuthenticated) {
        alert("휴대폰 본인인증을 먼저 진행해 주세요.");
        niceAuthBtn?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      const inputs = contactForm.querySelectorAll(
        "input[type='text'], input[type='tel'], input[type='email'], select, textarea"
      );
      const data = {};
      inputs.forEach((i) => {
        if (i.name) data[i.name] = i.value.trim();
      });

      // 필수값 체크
      if (!data["name"] || !data["phone"]) {
        alert("이름과 휴대폰 번호를 모두 입력해 주세요.");
        return;
      }

      // 사건 유형 및 상세 내용 검증
      if (!data["case-type"]) {
        alert("사건 유형을 선택해주세요.");
        return;
      }
      if (!data["case-detail"] || data["case-detail"].trim() === "") {
        alert("사건 상세 내용을 입력해주세요.");
        return;
      }

      // ...기존 파일 업로드 및 분석 로직...
      // Build email body with file info
      let body = `이름: ${data["name"]}\n전화: ${data["phone"]}\n이메일: ${data["email"] || "(없음)"}\n본인인증: 완료\n\n사건 유형: ${data["case-type"]}\n사건 상세:\n${data["case-detail"]}`;
      if (uploadedFiles.length > 0) {
        body += `\n\n업로드된 파일:\n`;
        uploadedFiles.forEach((file, idx) => {
          body += `${idx + 1}. ${file.name} (${formatFileSize(file.size)})\n`;
        });
      }
      const encodedBody = encodeURIComponent(body);
      window.location.href = `mailto:contact@piip.example?subject=%5BPIIP%5D%20사건%20접수%20요청&body=${encodedBody}`;
      // 실제 서비스에서는 서버로 FormData 전송
    });
  }

  // ===== Video modal wiring =====
  const videoBtn = document.querySelector("[data-open-video]");
  const videoModal = document.getElementById("video-modal");
  const videoFrame = document.getElementById("video-frame");
  const videoClosers = videoModal
    ? videoModal.querySelectorAll("[data-video-close]")
    : [];
  if (videoBtn && videoModal && videoFrame) {
    videoBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const src = videoBtn.getAttribute("data-open-video");
      if (!src) return;
      videoModal.hidden = false;
      videoFrame.src = src;
      document.body.style.overflow = "hidden";
    });
    videoClosers.forEach((b) =>
      b.addEventListener("click", () => {
        videoModal.hidden = true;
        videoFrame.src = "";
        document.body.style.overflow = "";
      })
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !videoModal.hidden) {
        videoModal.hidden = true;
        videoFrame.src = "";
        document.body.style.overflow = "";
      }
    });
  }

  // ===== 추후 실제 연동 대기 영역 =====
  // ===== Phase 2-2: 이벤트/프로모션 연동 (사건접수 섹션) =====
  const eventBtn = document.querySelector("#case-request .btn-white");
  if (eventBtn) {
    eventBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showEventModal();
    });
  }

  function showEventModal() {
    const modalHTML = `
      <div id="event-modal" style="position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;">
        <div style="background:var(--card); border:1px solid var(--border); border-radius:16px; padding:2rem; max-width:600px; width:90%; max-height:80vh; overflow-y:auto;">
          <h2 style="margin-bottom:1rem; background:var(--primary); -webkit-background-clip:text; background-clip:text; -webkit-text-fill-color:transparent;">신규 접수 이벤트</h2>

          <div style="margin-bottom:2rem;">
            <h3 style="margin-bottom:0.5rem;">🎁 경품 이벤트</h3>
            <p style="color:var(--text-dim); margin-bottom:1rem;">신규 사건 접수 고객 대상 추첨을 통해 스타벅스 기프티콘, 애플워치 등 경품 제공</p>
            <button class="btn btn-gradient" onclick="alert('경품 응모가 완료되었습니다!');">경품 응모하기</button>
          </div>

          <div style="margin-bottom:2rem;">
            <h3 style="margin-bottom:0.5rem;">💰 할인 쿠폰</h3>
            <p style="color:var(--text-dim); margin-bottom:1rem;">첫 상담 무료, 서비스 이용 시 10% 할인 쿠폰 자동 발급</p>
            <div style="background:var(--accent); color:#fff; padding:1rem; border-radius:12px; text-align:center; font-weight:700; font-size:1.2rem;">
              쿠폰 코드: PIIP2025
            </div>
          </div>

          <div style="margin-bottom:2rem;">
            <h3 style="margin-bottom:0.5rem;">📞 무료 상담</h3>
            <p style="color:var(--text-dim); margin-bottom:1rem;">24시간 무료 상담 진행 중 (전화/채팅 모두 가능)</p>
            <button class="btn btn-secondary" onclick="window.location.href='tel:1577-0000';">무료 상담 신청</button>
          </div>

          <div style="text-align:right;">
            <button id="event-close" class="btn btn-outline">닫기</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("event-modal");
    modal.querySelector("#event-close").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ===== Phase 1-1: 실시간 상담 연동 (모니터링 섹션) =====
  // 채팅 상담: 카카오톡 채널톡 연동
  const chatConsultBtn = document.querySelector("#monitoring .btn-white");
  if (chatConsultBtn) {
    chatConsultBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // 카카오톡 채널톡 연결 (실제 채널 ID로 교체 필요)
      // 예시: 카카오톡 채널 추가
      const kakaoChannelId = "_your_channel_id"; // 실제 채널 ID
      window.open(
        `https://pf.kakao.com/${kakaoChannelId}/chat`,
        "_blank",
        "width=400,height=600"
      );

      // 또는 라이브챗/채널톡 SDK 사용
      // 예시: ChannelIO('showMessenger');

      // 전화 상담 대안
      // window.location.href = 'tel:1577-0000';

      console.log("실시간 상담 연결됨");
    });
  }

  // ===== Phase 3-1: SNS 공유 연동 (검색 섹션) =====
  const shareBtn = document.querySelector("#search .btn-white");
  if (shareBtn) {
    shareBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showShareModal();
    });
  }

  function showShareModal() {
    const shareURL = window.location.href;
    const shareTitle = "PIIP Detective - 세계 최고의 탐정 플랫폼";
    const shareDescription = "AI 기반 전문가 탐정 매칭 및 사건 관리";

    const modalHTML = `
      <div id="share-modal" style="position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;">
        <div style="background:var(--card); border:1px solid var(--border); border-radius:16px; padding:2rem; max-width:400px; width:90%;">
          <h3 style="margin-bottom:1.5rem;">공유하기</h3>

          <div style="display:grid; gap:1rem;">
            <button id="share-kakao" class="btn btn-primary" style="background:#FEE500; color:#000;">
              카카오톡 공유
            </button>
            <button id="share-facebook" class="btn btn-primary" style="background:#1877F2;">
              페이스북 공유
            </button>
            <button id="share-twitter" class="btn btn-primary" style="background:#1DA1F2;">
              트위터 공유
            </button>
            <button id="share-copy" class="btn btn-outline">
              링크 복사
            </button>
          </div>

          <div style="margin-top:1.5rem; text-align:right;">
            <button id="share-close" class="btn btn-ghost">닫기</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("share-modal");

    // 카카오톡 공유 (Kakao SDK 필요)
    modal.querySelector("#share-kakao").addEventListener("click", () => {
      // Kakao SDK가 로드되어 있다면
      if (typeof Kakao !== "undefined" && Kakao.isInitialized()) {
        Kakao.Link.sendDefault({
          objectType: "feed",
          content: {
            title: shareTitle,
            description: shareDescription,
            imageUrl: "https://source.unsplash.com/800x600/?detective",
            link: {
              mobileWebUrl: shareURL,
              webUrl: shareURL,
            },
          },
        });
      } else {
        alert(
          "카카오톡 SDK가 로드되지 않았습니다.\n링크를 복사하여 공유해주세요."
        );
      }
    });

    // 페이스북 공유
    modal.querySelector("#share-facebook").addEventListener("click", () => {
      const fbURL = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareURL)}`;
      window.open(fbURL, "_blank", "width=600,height=400");
    });

    // 트위터 공유
    modal.querySelector("#share-twitter").addEventListener("click", () => {
      const twitterURL = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareURL)}&text=${encodeURIComponent(shareTitle)}`;
      window.open(twitterURL, "_blank", "width=600,height=400");
    });

    // 링크 복사
    modal.querySelector("#share-copy").addEventListener("click", () => {
      navigator.clipboard
        .writeText(shareURL)
        .then(() => {
          alert("링크가 복사되었습니다!");
        })
        .catch(() => {
          alert("링크 복사 실패. 브라우저 설정을 확인해주세요.");
        });
    });

    // 닫기
    modal.querySelector("#share-close").addEventListener("click", () => {
      modal.remove();
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ===== Phase 2-1: 후기/평점 연동 (체크리스트 섹션) =====
  const reviewBtn = document.querySelector("#checklist .btn-white");
  if (reviewBtn) {
    reviewBtn.addEventListener("click", (e) => {
      e.preventDefault();
      showReviewModal();
    });
  }

  function showReviewModal() {
    // 후기 작성 모달 HTML 생성
    const modalHTML = `
      <div id="review-modal" style="position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center;">
        <div style="background:var(--card); border:1px solid var(--border); border-radius:16px; padding:2rem; max-width:500px; width:90%;">
          <h3 style="margin-bottom:1rem;">후기 작성</h3>
          <div style="margin-bottom:1rem;">
            <label style="display:block; margin-bottom:0.5rem;">평점</label>
            <div id="rating-stars" style="font-size:2rem; color:#fbbf24; cursor:pointer;">
              <span data-rating="1">☆</span>
              <span data-rating="2">☆</span>
              <span data-rating="3">☆</span>
              <span data-rating="4">☆</span>
              <span data-rating="5">☆</span>
            </div>
          </div>
          <div style="margin-bottom:1rem;">
            <label style="display:block; margin-bottom:0.5rem;">후기 내용</label>
            <textarea id="review-content" rows="5" style="width:100%; padding:0.75rem; border:1px solid var(--border); border-radius:8px; background:var(--bg-alt); color:var(--text);" placeholder="서비스 이용 후기를 작성해주세요..."></textarea>
          </div>
          <div style="display:flex; gap:1rem; justify-content:flex-end;">
            <button id="review-cancel" class="btn btn-outline">취소</button>
            <button id="review-submit" class="btn btn-primary">제출</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHTML);

    const modal = document.getElementById("review-modal");
    const stars = modal.querySelectorAll("[data-rating]");
    let selectedRating = 0;

    // 별점 클릭 이벤트
    stars.forEach((star) => {
      star.addEventListener("click", () => {
        selectedRating = parseInt(star.dataset.rating);
        stars.forEach((s, idx) => {
          s.textContent = idx < selectedRating ? "★" : "☆";
        });
      });
    });

    // 취소 버튼
    modal.querySelector("#review-cancel").addEventListener("click", () => {
      modal.remove();
    });

    // 제출 버튼
    modal.querySelector("#review-submit").addEventListener("click", () => {
      const content = modal.querySelector("#review-content").value;

      if (selectedRating === 0) {
        alert("평점을 선택해주세요.");
        return;
      }
      if (!content.trim()) {
        alert("후기 내용을 입력해주세요.");
        return;
      }

      // 서버로 후기 전송 (실제 API 연동 필요)
      const reviewData = {
        rating: selectedRating,
        content: content,
        timestamp: new Date().toISOString(),
      };

      console.log("후기 제출:", reviewData);

      // fetch('/api/reviews', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reviewData)
      // }).then(res => res.json()).then(data => {
      //   alert('후기가 등록되었습니다!');
      //   modal.remove();
      // });

      alert("후기가 등록되었습니다! (개발 모드)");
      modal.remove();
    });

    // 모달 외부 클릭 시 닫기
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // ===== Phase 1-2: 사건별 알림 시스템 =====
  // 웹 푸시 알림 권한 요청 및 구독
  function initPushNotifications() {
    if (!("Notification" in window)) {
      console.log("브라우저가 알림을 지원하지 않습니다.");
      return;
    }

    if (Notification.permission === "granted") {
      subscribeToPush();
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          subscribeToPush();
        }
      });
    }
  }

  function subscribeToPush() {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      console.log("푸시 알림을 지원하지 않습니다.");
      return;
    }

    navigator.serviceWorker.ready.then((registration) => {
      // VAPID 공개키 (실제 서버에서 생성한 키로 교체 필요)
      const vapidPublicKey = "YOUR_VAPID_PUBLIC_KEY";

      registration.pushManager
        .subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })
        .then((subscription) => {
          console.log("푸시 구독 성공:", subscription);
          // 서버로 구독 정보 전송
          // fetch('/api/push/subscribe', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify(subscription)
          // });
        })
        .catch((err) => {
          console.error("푸시 구독 실패:", err);
        });
    });
  }

  function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // 알림 초기화 (페이지 로드 시 자동 실행)
  // initPushNotifications(); // 주석 해제하여 활성화

  // TODO: 진행 단계별 자동화
  // - AI 분석 완료 시 자동 전문가 배정 로직
  // - 증거 수집 완료 시 자동 리포트 생성 트리거
  // - 예시: fetch('/api/case/auto-assign', { method: 'POST', body: JSON.stringify({caseId, step}) });

  // TODO: 전문가/의뢰자별 맞춤 안내
  // - 사용자 역할(의뢰자/전문가/관리자)에 따라 맞춤 대시보드 표시
  // - 역할별 체크리스트, 진행 상황, 필요 서류 안내 자동화
  // - 예시: if (userRole === 'client') { showClientDashboard(); } else if (userRole === 'expert') { showExpertDashboard(); }
})();
