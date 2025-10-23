// Main Application - DIPERBAIKI
class FlashcardApp {
  constructor() {
    this.storage = new StorageManager();
    this.themeSwitcher = new ThemeSwitcher();

    // Pastikan storage diinisialisasi dulu
    this.storage.initializeSampleData();

    this.cardManager = new CardManager(
      this.storage,
      this.showNotification.bind(this)
    );

    this.chapterManager = new ChapterManager(
      this.storage,
      this.showNotification.bind(this),
      this.cardManager
    );

    this.initializeApp();
  }

  initializeApp() {
    // Setup modal functionality
    this.setupModal();
    this.setupFilters();
    this.setupEditModal();
    this.setupChapterModal();

    // Initial render
    this.cardManager.renderCards();
    this.chapterManager.renderChapters();

    console.log("CodeCards App initialized successfully!");
  }

  setupModal() {
    const modal = document.getElementById("addCardModal");
    const addCardBtn = document.getElementById("addCardBtn");
    const closeModal = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const cardForm = document.getElementById("cardForm");

    // Open modal
    addCardBtn.addEventListener("click", () => {
      modal.classList.add("show");
    });

    // Close modal
    const closeModalFunc = () => {
      modal.classList.remove("show");
      cardForm.reset();
    };

    closeModal.addEventListener("click", closeModalFunc);
    cancelBtn.addEventListener("click", closeModalFunc);

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    });

    // Form submission
    cardForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit(cardForm);
      closeModalFunc();
    });
  }

  setupEditModal() {
    const editModal = document.getElementById("editCardModal");
    const closeEditModal = document.getElementById("closeEditModal");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteModal = document.getElementById("confirmDeleteModal");

    // Close edit modal
    const closeEditModalFunc = () => {
      this.cardManager.closeEditModal();
    };

    closeEditModal.addEventListener("click", closeEditModalFunc);
    cancelEditBtn.addEventListener("click", closeEditModalFunc);

    editModal.addEventListener("click", (e) => {
      if (e.target === editModal) {
        closeEditModalFunc();
      }
    });

    // Close delete confirmation
    cancelDeleteBtn.addEventListener("click", () => {
      this.cardManager.closeDeleteModal();
    });

    confirmDeleteModal.addEventListener("click", (e) => {
      if (e.target === confirmDeleteModal) {
        this.cardManager.closeDeleteModal();
      }
    });
  }

  setupChapterModal() {
    // Chapter modals are handled in ChapterManager
  }

  setupFilters() {
    // Filters are handled in CardManager and ChapterManager
  }

  handleFormSubmit(form) {
    const cardData = {
      language: document.getElementById("cardLanguage").value,
      chapter: document.getElementById("cardChapter").value,
      question: document.getElementById("cardQuestion").value,
      code: document.getElementById("cardCode").value,
      explanation: document.getElementById("cardExplanation").value,
    };

    // Validasi
    if (!cardData.chapter.trim()) {
      this.showNotification("Bab tidak boleh kosong!", "error");
      return;
    }

    this.cardManager.addNewCard(cardData);

    // Refresh chapters tabs untuk update statistik
    this.chapterManager.renderChapters();
  }

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <span>${message}</span>
      <button class="notification-close">&times;</button>
    `;

    // Add styles if not already added
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1001;
          display: flex;
          align-items: center;
          gap: 10px;
          animation: slideIn 0.3s ease;
          color: white;
          font-weight: 500;
        }
        .notification-success { background: #27ae60; }
        .notification-error { background: #e74c3c; }
        .notification-warning { background: #f39c12; }
        .notification-info { background: #3498db; }
        .notification-close {
          background: none;
          border: none;
          color: white;
          font-size: 1.2rem;
          cursor: pointer;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);

    // Close button
    notification
      .querySelector(".notification-close")
      .addEventListener("click", () => {
        notification.parentNode.removeChild(notification);
      });
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new FlashcardApp();
});
