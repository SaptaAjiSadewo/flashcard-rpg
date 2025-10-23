// Chapter Management - DIPERBAIKI DENGAN VALIDASI DATA
class ChapterManager {
  constructor(storageManager, showNotificationCallback, cardManager) {
    this.storage = storageManager;
    this.showNotification = showNotificationCallback;
    this.cardManager = cardManager;
    this.chaptersTabs = document.getElementById("chaptersTabs");
    this.currentChapterId = null;

    // Bersihkan data yang rusak sebelum render
    this.storage.cleanupCorruptedData();

    this.initializeEventListeners();
    this.renderChapters();

    // Hubungkan dengan card manager
    if (this.cardManager) {
      this.cardManager.setRefreshChaptersTabs(() => this.renderChapters());
    }
  }

  initializeEventListeners() {
    // Add chapter modal
    const addChapterBtn = document.getElementById("addChapterBtn");
    if (addChapterBtn) {
      addChapterBtn.addEventListener("click", () => {
        document.getElementById("addChapterModal").classList.add("show");
      });
    }

    const closeChapterModal = document.getElementById("closeChapterModal");
    if (closeChapterModal) {
      closeChapterModal.addEventListener("click", () => {
        this.closeAddChapterModal();
      });
    }

    const cancelChapterBtn = document.getElementById("cancelChapterBtn");
    if (cancelChapterBtn) {
      cancelChapterBtn.addEventListener("click", () => {
        this.closeAddChapterModal();
      });
    }

    const chapterForm = document.getElementById("chapterForm");
    if (chapterForm) {
      chapterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleAddChapter();
      });
    }

    // Edit chapter modal
    const closeEditChapterModal = document.getElementById(
      "closeEditChapterModal"
    );
    if (closeEditChapterModal) {
      closeEditChapterModal.addEventListener("click", () => {
        this.closeEditChapterModal();
      });
    }

    const cancelEditChapterBtn = document.getElementById(
      "cancelEditChapterBtn"
    );
    if (cancelEditChapterBtn) {
      cancelEditChapterBtn.addEventListener("click", () => {
        this.closeEditChapterModal();
      });
    }

    const editChapterForm = document.getElementById("editChapterForm");
    if (editChapterForm) {
      editChapterForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleEditChapter();
      });
    }

    const deleteChapterBtn = document.getElementById("deleteChapterBtn");
    if (deleteChapterBtn) {
      deleteChapterBtn.addEventListener("click", () => {
        this.openDeleteChapterConfirmation();
      });
    }

    // Delete confirmation
    const cancelDeleteChapterBtn = document.getElementById(
      "cancelDeleteChapterBtn"
    );
    if (cancelDeleteChapterBtn) {
      cancelDeleteChapterBtn.addEventListener("click", () => {
        this.closeDeleteChapterModal();
      });
    }

    const confirmDeleteChapterBtn = document.getElementById(
      "confirmDeleteChapterBtn"
    );
    if (confirmDeleteChapterBtn) {
      confirmDeleteChapterBtn.addEventListener("click", () => {
        this.confirmDeleteChapter();
      });
    }

    // Close modals on outside click
    const addChapterModal = document.getElementById("addChapterModal");
    if (addChapterModal) {
      addChapterModal.addEventListener("click", (e) => {
        if (e.target === addChapterModal) {
          this.closeAddChapterModal();
        }
      });
    }

    const editChapterModal = document.getElementById("editChapterModal");
    if (editChapterModal) {
      editChapterModal.addEventListener("click", (e) => {
        if (e.target === editChapterModal) {
          this.closeEditChapterModal();
        }
      });
    }

    const confirmDeleteChapterModal = document.getElementById(
      "confirmDeleteChapterModal"
    );
    if (confirmDeleteChapterModal) {
      confirmDeleteChapterModal.addEventListener("click", (e) => {
        if (e.target === confirmDeleteChapterModal) {
          this.closeDeleteChapterModal();
        }
      });
    }
  }

  renderChapters() {
    const chapters = this.storage.getChapters();
    if (!this.chaptersTabs) {
      console.error("chaptersTabs element not found");
      return;
    }

    this.chaptersTabs.innerHTML = "";

    const languages = {
      javascript: { name: "JavaScript", icon: "⚡" },
      html: { name: "HTML", icon: "🌐" },
      css: { name: "CSS", icon: "🎨" },
      php: { name: "PHP", icon: "🐘" },
    };

    let hasChapters = false;

    for (const [languageKey, languageInfo] of Object.entries(languages)) {
      const languageChapters = chapters[languageKey] || [];

      // Filter out corrupted chapters
      const validChapters = languageChapters.filter(
        (chapter) => chapter && chapter.name && chapter.description
      );

      if (validChapters.length === 0) continue;

      hasChapters = true;

      const languageSection = document.createElement("div");
      languageSection.className = "language-section";

      languageSection.innerHTML = `
                <div class="language-header">
                    <div class="language-title">
                        <span class="language-icon">${languageInfo.icon}</span>
                        <h3>${languageInfo.name}</h3>
                        <span class="chapter-count">${validChapters.length} bab</span>
                    </div>
                    <button class="btn-primary btn-sm" data-language="${languageKey}">
                        + Tambah Bab
                    </button>
                </div>
                <div class="chapters-grid" id="chapters-${languageKey}">
                </div>
            `;

      this.chaptersTabs.appendChild(languageSection);

      // Add event listener for add chapter button
      const addBtn = languageSection.querySelector(
        `[data-language="${languageKey}"]`
      );
      if (addBtn) {
        addBtn.addEventListener("click", () => {
          this.openAddChapterForLanguage(languageKey);
        });
      }

      // Render chapters for this language
      const chaptersGrid = languageSection.querySelector(
        `#chapters-${languageKey}`
      );
      if (chaptersGrid) {
        validChapters.forEach((chapter) => {
          const chapterCard = this.createChapterCard(chapter);
          if (chapterCard) {
            chaptersGrid.appendChild(chapterCard);
          }
        });
      }
    }

    if (!hasChapters) {
      this.chaptersTabs.innerHTML = `
                <div class="empty-chapters">
                    <div style="text-align: center; padding: 40px; color: white;">
                        <h3>📚 Belum ada bab</h3>
                        <p>Tambahkan bab pertama untuk mulai mengorganisir kartu pembelajaran Anda</p>
                        <button class="btn-primary" style="margin-top: 15px;" id="addFirstChapter">+ Tambah Bab Pertama</button>
                    </div>
                </div>
            `;

      const addFirstChapterBtn = document.getElementById("addFirstChapter");
      if (addFirstChapterBtn) {
        addFirstChapterBtn.addEventListener("click", () => {
          document.getElementById("addChapterModal").classList.add("show");
        });
      }
    }
  }

  createChapterCard(chapter) {
    // Validasi data chapter
    if (!chapter || !chapter.id || !chapter.name || !chapter.description) {
      console.warn("Invalid chapter data:", chapter);
      return null;
    }

    const card = document.createElement("div");
    card.className = "chapter-card";
    card.setAttribute("data-chapter-id", chapter.id);

    const flashcards = this.storage.getFlashcardsByChapter(
      chapter.language,
      chapter.name
    );
    const cardCount = flashcards.length;

    // Pastikan nama dan deskripsi tidak undefined
    const safeName = chapter.name || "Bab Tanpa Nama";
    const safeDescription = chapter.description || "Deskripsi tidak tersedia";

    card.innerHTML = `
            <div class="chapter-header">
                <h4 class="chapter-name">${safeName}</h4>
                <div class="chapter-actions">
                    <button class="btn-chapter-action btn-edit-chapter" data-chapter-id="${
                      chapter.id
                    }">✏️</button>
                    <button class="btn-chapter-action btn-delete-chapter" data-chapter-id="${
                      chapter.id
                    }">🗑️</button>
                </div>
            </div>
            <div class="chapter-description">${safeDescription}</div>
            <div class="chapter-stats">
                <span class="chapter-card-count">
                    📊 ${cardCount} kartu
                </span>
                <span class="chapter-language">${this.getLanguageIcon(
                  chapter.language
                )}</span>
            </div>
            <div class="chapter-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${
                      cardCount > 0 ? "100" : "0"
                    }%"></div>
                </div>
            </div>
        `;

    // Add event listeners
    const editBtn = card.querySelector(".btn-edit-chapter");
    const deleteBtn = card.querySelector(".btn-delete-chapter");

    if (editBtn) {
      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.editChapter(chapter.id);
      });
    }

    if (deleteBtn) {
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openDeleteChapterConfirmation(chapter.id);
      });
    }

    // Click on card to filter by chapter
    card.addEventListener("click", () => {
      this.selectChapter(chapter);
    });

    return card;
  }

  getLanguageIcon(language) {
    const icons = {
      javascript: "⚡",
      html: "🌐",
      css: "🎨",
      php: "🐘",
    };
    return icons[language] || "📁";
  }

  openAddChapterForLanguage(language) {
    const chapterLanguage = document.getElementById("chapterLanguage");
    if (chapterLanguage) {
      chapterLanguage.value = language;
    }
    document.getElementById("addChapterModal").classList.add("show");
  }

  handleAddChapter() {
    const chapterLanguage = document.getElementById("chapterLanguage");
    const chapterName = document.getElementById("chapterName");
    const chapterDescription = document.getElementById("chapterDescription");

    if (!chapterLanguage || !chapterName || !chapterDescription) {
      this.showNotification("Form tidak lengkap!", "error");
      return;
    }

    const chapterData = {
      language: chapterLanguage.value,
      name: chapterName.value.trim(),
      description: chapterDescription.value.trim(),
    };

    // Validasi
    if (!chapterData.name) {
      this.showNotification("Nama bab tidak boleh kosong!", "error");
      return;
    }

    if (!chapterData.description) {
      this.showNotification("Deskripsi bab tidak boleh kosong!", "error");
      return;
    }

    const result = this.storage.saveChapter(chapterData);
    if (result) {
      this.showNotification("Bab berhasil ditambahkan!", "success");
      this.closeAddChapterModal();
      this.renderChapters();

      // Refresh filter di card manager
      if (this.cardManager) {
        this.cardManager.refreshChapters();
      }
    } else {
      this.showNotification("Gagal menambahkan bab!", "error");
    }
  }

  editChapter(chapterId) {
    const chapter = this.storage.getChapterById(chapterId);
    if (chapter) {
      this.currentChapterId = chapterId;

      // Isi form dengan data yang valid
      const editChapterId = document.getElementById("editChapterId");
      const editChapterLanguage = document.getElementById(
        "editChapterLanguage"
      );
      const editChapterName = document.getElementById("editChapterName");
      const editChapterDescription = document.getElementById(
        "editChapterDescription"
      );

      if (editChapterId) editChapterId.value = chapter.id;
      if (editChapterLanguage)
        editChapterLanguage.value = chapter.language || "javascript";
      if (editChapterName) editChapterName.value = chapter.name || "";
      if (editChapterDescription)
        editChapterDescription.value = chapter.description || "";

      document.getElementById("editChapterModal").classList.add("show");
    } else {
      this.showNotification("Bab tidak ditemukan!", "error");
    }
  }

  handleEditChapter() {
    const editChapterId = document.getElementById("editChapterId");
    const editChapterLanguage = document.getElementById("editChapterLanguage");
    const editChapterName = document.getElementById("editChapterName");
    const editChapterDescription = document.getElementById(
      "editChapterDescription"
    );

    if (
      !editChapterId ||
      !editChapterLanguage ||
      !editChapterName ||
      !editChapterDescription
    ) {
      this.showNotification("Form tidak lengkap!", "error");
      return;
    }

    const chapterId = editChapterId.value;
    const updatedChapter = {
      language: editChapterLanguage.value,
      name: editChapterName.value.trim(),
      description: editChapterDescription.value.trim(),
    };

    // Validasi
    if (!updatedChapter.name) {
      this.showNotification("Nama bab tidak boleh kosong!", "error");
      return;
    }

    if (!updatedChapter.description) {
      this.showNotification("Deskripsi bab tidak boleh kosong!", "error");
      return;
    }

    const result = this.storage.updateChapter(chapterId, updatedChapter);
    if (result) {
      this.showNotification("Bab berhasil diperbarui!", "success");
      this.closeEditChapterModal();
      this.renderChapters();

      // Update flashcards that use this chapter name
      this.updateFlashcardsChapterName(chapterId, updatedChapter.name);

      // Refresh filter di card manager
      if (this.cardManager) {
        this.cardManager.refreshChapters();
      }
    } else {
      this.showNotification("Gagal memperbarui bab!", "error");
    }
  }

  updateFlashcardsChapterName(chapterId, newChapterName) {
    const chapter = this.storage.getChapterById(chapterId);
    if (!chapter) return;

    const flashcards = this.storage.getFlashcardsByChapter(
      chapter.language,
      chapter.name
    );
    flashcards.forEach((card) => {
      this.storage.updateFlashcard(card.id, { chapter: newChapterName });
    });
  }

  openDeleteChapterConfirmation(chapterId = null) {
    if (chapterId) {
      this.currentChapterId = chapterId;
    }

    const chapter = this.storage.getChapterById(this.currentChapterId);
    if (chapter) {
      const flashcardCount = this.storage.getFlashcardsByChapter(
        chapter.language,
        chapter.name
      ).length;
      const message =
        flashcardCount > 0
          ? `Apakah Anda yakin ingin menghapus bab "${chapter.name}"? ${flashcardCount} kartu dalam bab ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan.`
          : `Apakah Anda yakin ingin menghapus bab "${chapter.name}"? Tindakan ini tidak dapat dibatalkan.`;

      const modalBody = document.querySelector(
        "#confirmDeleteChapterModal .modal-body p"
      );
      if (modalBody) {
        modalBody.textContent = message;
      }
    }

    document.getElementById("confirmDeleteChapterModal").classList.add("show");
  }

  confirmDeleteChapter() {
    if (this.currentChapterId) {
      const deletedChapter = this.storage.deleteChapter(this.currentChapterId);
      if (deletedChapter) {
        this.showNotification("Bab berhasil dihapus!", "success");
        this.closeDeleteChapterModal();
        this.closeEditChapterModal();
        this.renderChapters();

        // Refresh filter di card manager
        if (this.cardManager) {
          this.cardManager.refreshChapters();
          this.cardManager.renderCards();
        }

        this.currentChapterId = null;
      } else {
        this.showNotification("Gagal menghapus bab!", "error");
      }
    }
  }

  selectChapter(chapter) {
    // Remove active class from all chapters
    document.querySelectorAll(".chapter-card").forEach((card) => {
      card.classList.remove("active");
    });

    // Add active class to selected chapter
    const chapterCard = document.querySelector(
      `[data-chapter-id="${chapter.id}"]`
    );
    if (chapterCard) {
      chapterCard.classList.add("active");
    }

    // Trigger filter in card manager
    if (this.cardManager) {
      this.cardManager.filterByChapter(chapter.language, chapter.name);
    }
  }

  closeAddChapterModal() {
    document.getElementById("addChapterModal").classList.remove("show");
    const chapterForm = document.getElementById("chapterForm");
    if (chapterForm) {
      chapterForm.reset();
    }
  }

  closeEditChapterModal() {
    document.getElementById("editChapterModal").classList.remove("show");
    this.currentChapterId = null;
  }

  closeDeleteChapterModal() {
    document
      .getElementById("confirmDeleteChapterModal")
      .classList.remove("show");
  }
}
