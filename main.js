document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const bookForm = document.getElementById('bookForm');
    const bookFormTitle = document.getElementById('bookFormTitle');
    const bookFormAuthor = document.getElementById('bookFormAuthor');
    const bookFormYear = document.getElementById('bookFormYear');
    const bookFormIsComplete = document.getElementById('bookFormIsComplete');
    const bookFormSubmit = document.getElementById('bookFormSubmit');
    const bookFormSubmitSpan = bookFormSubmit.querySelector('span');
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');
    const searchBook = document.getElementById('searchBook');
    const searchBookTitle = document.getElementById('searchBookTitle');
    const themeToggle = document.getElementById('themeToggle');
  
    // Global variables
    let books = [];
    let editMode = false;
    let editBookId = null;

    // Dark mode toggle
    function initializeTheme() {
        const savedTheme = localStorage.getItem('theme');
        document.body.classList.toggle('dark-mode', savedTheme === 'dark');
        themeToggle.textContent = savedTheme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        themeToggle.textContent = isDarkMode ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    }

    themeToggle.addEventListener('click', toggleTheme);
    initializeTheme();
  
    // Get books from localStorage
    function getBooks() {
      const storedBooks = localStorage.getItem('books');
      return storedBooks ? JSON.parse(storedBooks) : [];
    }
  
    // Save books to localStorage
    function saveBooks() {
      localStorage.setItem('books', JSON.stringify(books));
    }
  
    // Generate unique ID for books
    function generateId() {
      return Number(new Date());
    }
  
    // Load books from localStorage and render them
    function loadBooks() {
      books = getBooks();
      renderBooks();
    }
  
    // Render books to their respective shelves
    function renderBooks(filteredBooks = null) {
      // Clear both book lists
      incompleteBookList.innerHTML = '';
      completeBookList.innerHTML = '';
  
      // Use filtered books if provided, otherwise use all books
      const booksToRender = filteredBooks || books;
  
      // Render each book to its appropriate shelf
      booksToRender.forEach(book => {
        const bookElement = createBookElement(book);
        if (book.isComplete) {
          completeBookList.appendChild(bookElement);
        } else {
          incompleteBookList.appendChild(bookElement);
        }
      });
    }
  
    // Create DOM element for a book
    function createBookElement(book) {
      const bookElement = document.createElement('div');
      bookElement.setAttribute('data-bookid', book.id);
      bookElement.setAttribute('data-testid', 'bookItem');
  
      const titleElement = document.createElement('h3');
      titleElement.setAttribute('data-testid', 'bookItemTitle');
      titleElement.innerText = book.title;
  
      const authorElement = document.createElement('p');
      authorElement.setAttribute('data-testid', 'bookItemAuthor');
      authorElement.innerText = `Penulis: ${book.author}`;
  
      const yearElement = document.createElement('p');
      yearElement.setAttribute('data-testid', 'bookItemYear');
      yearElement.innerText = `Tahun: ${book.year}`;
  
      const buttonContainer = document.createElement('div');
  
      const toggleButton = document.createElement('button');
      toggleButton.setAttribute('data-testid', 'bookItemIsCompleteButton');
      toggleButton.innerText = book.isComplete ? 'Belum selesai dibaca' : 'Selesai dibaca';
      toggleButton.addEventListener('click', function() {
        toggleBookStatus(book.id);
      });
  
      const deleteButton = document.createElement('button');
      deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
      deleteButton.innerText = 'Hapus Buku';
      deleteButton.addEventListener('click', function() {
        deleteBook(book.id);
      });
  
      const editButton = document.createElement('button');
      editButton.setAttribute('data-testid', 'bookItemEditButton');
      editButton.innerText = 'Edit Buku';
      editButton.addEventListener('click', function() {
        startEditBook(book.id);
      });
  
      buttonContainer.appendChild(toggleButton);
      buttonContainer.appendChild(deleteButton);
      buttonContainer.appendChild(editButton);
  
      bookElement.appendChild(titleElement);
      bookElement.appendChild(authorElement);
      bookElement.appendChild(yearElement);
      bookElement.appendChild(buttonContainer);
  
      return bookElement;
    }
  
    // Add a new book
    function addBook(event) {
      event.preventDefault();
  
      const { value: title } = bookFormTitle;
      const { value: author } = bookFormAuthor;
      const { value: year } = bookFormYear;
      const { checked: isComplete } = bookFormIsComplete;
      
      if (!title || !author || isNaN(year)) {
        alert('Semua kolom harus diisi!');
        return;
      }
  
      if (editMode && editBookId) {
        // Edit existing book
        const index = books.findIndex(book => book.id === editBookId);
        if (index !== -1) {
          books[index] = {
            ...books[index],
            title,
            author,
            year,
            isComplete
          };
          editMode = false;
          editBookId = null;
          bookFormSubmit.innerText = 'Masukkan Buku ke rak ';
          bookFormSubmit.appendChild(bookFormSubmitSpan);
        }
      } else {
        // Add new book
        const newBook = {
          id: generateId(),
          title,
          author,
          year,
          isComplete
        };
        books.push(newBook);
      }
  
      saveBooks();
      renderBooks();
      bookForm.reset();
      updateBookFormSubmitButton();
    }
  
    // Toggle book status between complete and incomplete
    function toggleBookStatus(id) {
      const index = books.findIndex(book => book.id === id);
      if (index !== -1) {
        books[index].isComplete = !books[index].isComplete;
        saveBooks();
        renderBooks();
      }
    }
  
    // Delete a book
    function deleteBook(id) {
      const confirmation = confirm('Apakah Anda yakin ingin menghapus buku ini?');
      if (confirmation) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        renderBooks();
      }
    }
  
    // Start editing a book
    function startEditBook(id) {
      const book = books.find(book => book.id === id);
      if (book) {
        bookFormTitle.value = book.title;
        bookFormAuthor.value = book.author;
        bookFormYear.value = book.year;
        bookFormIsComplete.checked = book.isComplete;
        
        editMode = true;
        editBookId = id;
        bookFormSubmit.innerText = 'Perbarui Buku';
        updateBookFormSubmitButton();
      }
    }
  
    // Search for books by title
    function searchBooks(event) {
      event.preventDefault();
      const query = searchBookTitle.value.trim().toLowerCase();
      
      if (query) {
        const filteredBooks = books.filter(book =>
          book.title.toLowerCase().includes(query)
        );
        renderBooks(filteredBooks);
      } else {
        renderBooks();
      }
    }
  
    // Update the text of the submit button based on the checkbox state
    function updateBookFormSubmitButton() {
      if (!editMode) {
        bookFormSubmitSpan.innerText = bookFormIsComplete.checked ?
          'Selesai dibaca' :
          'Belum selesai dibaca';
      }
    }
  
    // Event Listeners
    bookForm.addEventListener('submit', addBook);
    searchBook.addEventListener('submit', searchBooks);
    bookFormIsComplete.addEventListener('change', updateBookFormSubmitButton);
  
    // Initialize
    loadBooks();
    updateBookFormSubmitButton();
  });