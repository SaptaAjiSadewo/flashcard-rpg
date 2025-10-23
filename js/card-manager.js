// Flashcard Management - DIPERBAIKI DENGAN FILTER BAB
class CardManager {
  constructor(storageManager, showNotificationCallback) {
    this.storage = storageManager;
    this.cardsGrid = document.getElementById("cardsGrid");
    this.languageFilter = document.getElementById("languageFilter");
    this.chapterFilter = document.getElementById("chapterFilter");
    this.currentEditCardId = null;
    this.showNotification = showNotificationCallback;
    this.currentFilter = { language: "all", chapter: "all" };

    this.initializeEventListeners();
    this.loadChapters();
    this.renderCards();
  }

  initializeEventListeners() {
    this.languageFilter.addEventListener("change", () =>
      this.handleLanguageFilterChange()
    );
    this.chapterFilter.addEventListener("change", () =>
      this.handleFilterChange()
    );

    // Edit modal events
    document
      .getElementById("editCardForm")
      .addEventListener("submit", (e) => this.handleEditFormSubmit(e));
    document
      .getElementById("deleteCardBtn")
      .addEventListener("click", () => this.openDeleteConfirmation());
    document
      .getElementById("confirmDeleteBtn")
      .addEventListener("click", () => this.confirmDelete());
  }

  handleLanguageFilterChange() {
    this.currentFilter.language = this.languageFilter.value;
    this.currentFilter.chapter = "all"; // Reset chapter filter ketika bahasa berubah
    this.chapterFilter.value = "all";
    this.loadChapters();
    this.renderCards();
  }

  handleFilterChange() {
    this.currentFilter.language = this.languageFilter.value;
    this.currentFilter.chapter = this.chapterFilter.value;
    this.renderCards();
  }

  filterByChapter(language, chapter) {
    this.languageFilter.value = language;
    this.chapterFilter.value = chapter;
    this.currentFilter.language = language;
    this.currentFilter.chapter = chapter;
    this.loadChapters();
    this.renderCards();
  }

  loadChapters() {
    const chapters = this.storage.getChapters();
    const chapterFilter = this.chapterFilter;

    // Simpan value yang sedang dipilih
    const currentValue = chapterFilter.value;

    // Clear existing options except "all"
    while (chapterFilter.children.length > 1) {
      chapterFilter.removeChild(chapterFilter.lastChild);
    }

    const selectedLanguage = this.languageFilter.value;
    if (selectedLanguage !== "all" && chapters[selectedLanguage]) {
      chapters[selectedLanguage].forEach((chapter) => {
        const option = document.createElement("option");
        option.value = chapter.name;
        option.textContent = chapter.name;
        chapterFilter.appendChild(option);
      });

      // Coba set kembali value sebelumnya jika masih ada
      if (currentValue && currentValue !== "all") {
        const exists = Array.from(chapterFilter.options).some(
          (opt) => opt.value === currentValue
        );
        if (exists) {
          chapterFilter.value = currentValue;
          this.currentFilter.chapter = currentValue;
        }
      }
    }
  }

  renderCards() {
    const filteredCards = this.storage.getFilteredCards(
      this.currentFilter.language,
      this.currentFilter.chapter
    );

    this.cardsGrid.innerHTML = "";

    if (filteredCards.length === 0) {
      let message = "Tambahkan kartu baru atau ubah filter pencarian";

      if (
        this.currentFilter.language !== "all" &&
        this.currentFilter.chapter !== "all"
      ) {
        message = `Tidak ada kartu untuk ${this.currentFilter.language} - ${this.currentFilter.chapter}`;
      } else if (this.currentFilter.language !== "all") {
        message = `Tidak ada kartu untuk bahasa ${this.currentFilter.language}`;
      } else if (this.currentFilter.chapter !== "all") {
        message = `Tidak ada kartu untuk bab ${this.currentFilter.chapter}`;
      }

      this.cardsGrid.innerHTML = `
        <div class="no-cards">
          <h3>📝 Tidak ada kartu yang ditemukan</h3>
          <p>${message}</p>
        </div>
      `;
      return;
    }

    // Tampilkan info filter
    const filterInfo = this.createFilterInfo();
    if (filterInfo) {
      this.cardsGrid.appendChild(filterInfo);
    }

    filteredCards.forEach((card) => {
      const cardElement = this.createCardElement(card);
      this.cardsGrid.appendChild(cardElement);
    });

    if (typeof hljs !== "undefined") {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  }

  createFilterInfo() {
    if (
      this.currentFilter.language === "all" &&
      this.currentFilter.chapter === "all"
    ) {
      return null;
    }

    const infoDiv = document.createElement("div");
    infoDiv.className = "filter-info";
    infoDiv.style.cssText = `
      grid-column: 1 / -1;
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      border-radius: 10px;
      margin-bottom: 15px;
      text-align: center;
      color: white;
    `;

    let filterText = "Menampilkan kartu: ";
    const parts = [];

    if (this.currentFilter.language !== "all") {
      parts.push(`Bahasa: ${this.currentFilter.language}`);
    }
    if (this.currentFilter.chapter !== "all") {
      parts.push(`Bab: ${this.currentFilter.chapter}`);
    }

    filterText += parts.join(" - ");

    infoDiv.innerHTML = `
      <strong>${filterText}</strong>
      <button id="clearFilter" style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        margin-left: 10px;
        cursor: pointer;
      ">✕ Clear Filter</button>
    `;

    // Add event listener untuk clear filter
    infoDiv.querySelector("#clearFilter").addEventListener("click", () => {
      this.clearFilters();
    });

    return infoDiv;
  }

  clearFilters() {
    this.languageFilter.value = "all";
    this.chapterFilter.value = "all";
    this.currentFilter = { language: "all", chapter: "all" };
    this.loadChapters();
    this.renderCards();
  }

  createCardElement(card) {
    const cardDiv = document.createElement("div");
    cardDiv.className = "flashcard";
    cardDiv.setAttribute("data-card-id", card.id);
    cardDiv.innerHTML = `
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="language-badge">${card.language}</div>
          <div class="chapter-badge">${card.chapter}</div>
          <div class="card-content">
            <div class="card-question">${card.question}</div>
          </div>
          <div class="card-actions">
            <button class="btn-action btn-edit" data-card-id="${
              card.id
            }">✏️ Edit</button>
            <button class="btn-action btn-delete" data-card-id="${
              card.id
            }">🗑️ Hapus</button>
          </div>
          <div class="card-hint">👆 Klik untuk melihat jawaban</div>
        </div>
        <div class="flashcard-back">
          <div class="code-container">
            <pre><code class="language-${card.language}">${this.escapeHtml(
      card.code
    )}</code></pre>
          </div>
          <div class="explanation">
            ${this.escapeHtml(card.explanation)}
          </div>
          <div class="card-actions">
            <button class="btn-action btn-edit" data-card-id="${
              card.id
            }">✏️ Edit</button>
            <button class="btn-action btn-delete" data-card-id="${
              card.id
            }">🗑️ Hapus</button>
          </div>
          <div class="card-hint">👆 Klik untuk kembali</div>
        </div>
      </div>
    `;

    // Flip functionality
    cardDiv.addEventListener("click", (e) => {
      if (!e.target.classList.contains("btn-action")) {
        cardDiv.classList.toggle("flipped");
      }
    });

    // Edit and Delete buttons
    const editButtons = cardDiv.querySelectorAll(".btn-edit");
    const deleteButtons = cardDiv.querySelectorAll(".btn-delete");

    editButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.editCard(card.id);
      });
    });

    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openDeleteConfirmation(card.id);
      });
    });

    return cardDiv;
  }

  editCard(cardId) {
    const cards = this.storage.getFlashcards();
    const card = cards.find((c) => c.id === cardId);

    if (card) {
      this.currentEditCardId = cardId;

      // Fill edit form
      document.getElementById("editCardId").value = cardId;
      document.getElementById("editCardLanguage").value = card.language;
      document.getElementById("editCardChapter").value = card.chapter;
      document.getElementById("editCardQuestion").value = card.question;
      document.getElementById("editCardCode").value = card.code;
      document.getElementById("editCardExplanation").value = card.explanation;

      // Show edit modal
      document.getElementById("editCardModal").classList.add("show");
    }
  }

  handleEditFormSubmit(e) {
    e.preventDefault();

    const cardData = {
      language: document.getElementById("editCardLanguage").value,
      chapter: document.getElementById("editCardChapter").value,
      question: document.getElementById("editCardQuestion").value,
      code: document.getElementById("editCardCode").value,
      explanation: document.getElementById("editCardExplanation").value,
    };

    if (this.currentEditCardId) {
      const updatedCard = this.storage.updateFlashcard(
        this.currentEditCardId,
        cardData
      );
      if (updatedCard) {
        this.showNotification("Kartu berhasil diperbarui!", "success");
        this.closeEditModal();
        this.renderCards();

        // Refresh chapters tabs jika perlu
        if (typeof this.refreshChaptersTabs === "function") {
          this.refreshChaptersTabs();
        }
      }
    }
  }

  openDeleteConfirmation(cardId = null) {
    if (cardId) {
      this.currentEditCardId = cardId;
    }

    if (this.currentEditCardId) {
      document.getElementById("confirmDeleteModal").classList.add("show");
    }
  }

  confirmDelete() {
    if (this.currentEditCardId) {
      this.storage.deleteFlashcard(this.currentEditCardId);
      this.showNotification("Kartu berhasil dihapus!", "success");
      this.closeDeleteModal();
      this.closeEditModal();
      this.renderCards();
      this.currentEditCardId = null;
    }
  }

  closeEditModal() {
    document.getElementById("editCardModal").classList.remove("show");
    this.currentEditCardId = null;
  }

  closeDeleteModal() {
    document.getElementById("confirmDeleteModal").classList.remove("show");
  }

  addNewCard(cardData) {
    const newCard = this.storage.saveFlashcard(cardData);
    this.loadChapters();
    this.renderCards();
    this.showNotification("Kartu berhasil ditambahkan!", "success");
    return newCard;
  }

  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // Public method to refresh chapters
  refreshChapters() {
    this.loadChapters();
    this.renderCards();
  }

  // Method untuk dihubungkan dengan chapter manager
  setRefreshChaptersTabs(callback) {
    this.refreshChaptersTabs = callback;
  }
}
