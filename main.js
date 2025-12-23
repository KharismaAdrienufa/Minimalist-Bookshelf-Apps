const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'save-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

const editBookDialog = document.getElementById('editBook');
const editBookForm = document.getElementById('editBookForm');
let editBookId = null;
const newBookTitle = document.getElementById('newBookTitle');
const newBookAuthor = document.getElementById('newBookAuthor');
const newBookYear = document.getElementById('newBookYear');
const newBookIsComplete = document.getElementById('newBookIsComplete');

const searchBookTitle = document.getElementById('searchBookTitle');

const overlay = document.getElementById('overlay');

function checkStorage() {
    if (typeof(Storage) === 'undefined') {
        alert('Browser doesn\'t support local storage');
        return false;
    } else {
        return true;
    }
}

function save() {
    if(checkStorage()) {
        const strBookParsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, strBookParsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function load() {
    const bookStorage = localStorage.getItem(STORAGE_KEY);
    let objBookParsed = JSON.parse(bookStorage);

    if (objBookParsed !== null) {
        for (const book of objBookParsed) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year: parseInt(year),
        isComplete
    }
}

function addBook() {
    const bookId = generateId();
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = document.getElementById('bookFormYear').value;
    const isCompleted = document.getElementById('bookFormIsComplete').checked;

    const bookObject = generateBookObject(bookId, bookTitle, bookAuthor, bookYear, isCompleted);
    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    save();
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) return book;
    }
    return null;
}

function checkBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    save();
}

function uncheckBook(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    save();
}

function findBookIndex(bookId) {
    return books.findIndex(book => book.id === bookId);
}

function deleteBook(bookId) {
    const bookIndex = findBookIndex(bookId);

    if (bookIndex == -1) return;

    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    save();
}

function confirmDelete(bookId) {
    overlay.removeAttribute('hidden');
    const confirmDialog = document.getElementById('confirmDelete');
    confirmDialog.style.display = 'block';

    const yesButton = document.getElementById('yes-button');
    const noButton = document.getElementById('no-button');

    yesButton.onclick = () => {
        deleteBook(bookId);
        overlay.setAttribute('hidden', '');
        confirmDialog.style.display = 'none';
    };

    noButton.onclick = () => {
        overlay.setAttribute('hidden', '');
        confirmDialog.style.display = 'none';
    };

}

function showEditBook(bookId) {
    const bookTarget = findBook(bookId);

    if (!bookTarget) return;

    editBookId = bookId;
    newBookTitle.value = bookTarget.title;
    newBookAuthor.value = bookTarget.author;
    newBookYear.value = bookTarget.year;
    newBookIsComplete.checked = bookTarget.isComplete;

    overlay.removeAttribute('hidden');
    editBookDialog.style.display = 'block';
}

function saveEditBook() {
    if (editBookId == null) return;

    const bookTarget = findBook(editBookId);
    if (!bookTarget) return;

    bookTarget.title = newBookTitle.value;
    bookTarget.author = newBookAuthor.value;
    bookTarget.year = parseInt(newBookYear.value);
    bookTarget.isComplete = newBookIsComplete.checked;

    editBookId = null;
    overlay.setAttribute('hidden', '');
    editBookDialog.style.display = 'none';

    document.dispatchEvent(new Event(RENDER_EVENT));
    save();
}

function makeBook(bookObject) {
    const {id, title, author, year, isComplete} = bookObject;

    const bookTitle = document.createElement('h5');
    bookTitle.setAttribute('data-testid', 'bookItemTitle');
    bookTitle.innerText = title;

    const bookAuthor = document.createElement('p');
    bookAuthor.setAttribute('data-testid', 'bookItemAuthor');
    bookAuthor.innerText = author;

    const bookYear = document.createElement('p');
    bookYear.setAttribute('data-testid', 'bookItemYear');
    bookYear.innerText = year;
    
    const isCompleteIcon = document.createElement('i');
    isCompleteIcon.innerText = 'check_circle';
    const isCompleteIconClass = isComplete ? 'check-button' : 'uncheck-button';
    isCompleteIcon.classList.add(isCompleteIconClass, 'material-icons');
    
    const isCompleteButton = document.createElement('button');
    isCompleteButton.setAttribute('type', 'button');
    isCompleteButton.setAttribute('data-testid', 'bookItemIsCompleteButton')
    isCompleteButton.append(isCompleteIcon);
    isCompleteButton.addEventListener('click', () => {
        isComplete ? uncheckBook(id) : checkBook(id);

        document.dispatchEvent(new Event(RENDER_EVENT));
        save();
    })

    const deleteIcon = document.createElement('i');
    deleteIcon.classList.add('delete-button', 'material-icons');
    deleteIcon.innerText = 'delete';
    
    const deleteButton = document.createElement('button');
    deleteButton.setAttribute('type', 'button');
    deleteButton.setAttribute('data-testid', 'bookItemDeleteButton');
    deleteButton.append(deleteIcon);

    deleteButton.addEventListener('click', () => {
        confirmDelete(id);

        document.dispatchEvent(new Event(RENDER_EVENT));
        save();
    })
    
    const editIcon = document.createElement('i');
    editIcon.classList.add('edit-button', 'material-icons');
    editIcon.innerText = 'edit';
    
    const editButton = document.createElement('button');
    editButton.setAttribute('type', 'button');
    editButton.setAttribute('data-testid', 'bookItemEditButton');
    editButton.append(editIcon);

    editButton.addEventListener('click', () => {
        showEditBook(id);

        document.dispatchEvent(new Event(RENDER_EVENT));
        save();
    })
    
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', id);
    bookItem.setAttribute('data-testid', 'bookItem');
    bookItem.classList.add('bookItem', 'card');
    bookItem.append(bookTitle, bookAuthor, bookYear, isCompleteButton, deleteButton, editButton);

    return bookItem;
}

function searchBook(keyword) {
    const bookList = document.querySelectorAll('.bookItem > h5');

    for (const book of bookList) {
        const bookTitle = book.innerText.toLowerCase();
        const bookItem = book.parentElement;

        if (bookTitle.includes(keyword)) {
            bookItem.removeAttribute('hidden');
        } else {
            bookItem.setAttribute('hidden', '');
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const submitAddForm = document.getElementById('bookForm');
    submitAddForm.addEventListener('submit', (event) => {
        event.preventDefault();
        addBook();
    });

    editBookForm.addEventListener('submit', (event) => {
        event.preventDefault();
        saveEditBook();
        document.dispatchEvent(new Event(RENDER_EVENT));
        save();
    })

    document.getElementById('cancelEditBook').addEventListener('click', () => {
        editBookId = null;
        overlay.setAttribute('hidden', '');
        editBookDialog.style.display = 'none';
    })

    searchBookTitle.addEventListener('input', () => {
        const keyword = searchBookTitle.value.toLowerCase()
        searchBook(keyword);
    })

    if (checkStorage()) {
        load();
    }
})

document.addEventListener(SAVED_EVENT, () => {
    console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener(RENDER_EVENT, () => {
    const incompleteBookList = document.getElementById('incompleteBookList');
    incompleteBookList.innerHTML = '';

    const completeBookList = document.getElementById('completeBookList');
    completeBookList.innerHTML = '';

    for (let book of books) {
        const bookItem = makeBook(book);
        book.isComplete
        ? completeBookList.append(bookItem)
        : incompleteBookList.append(bookItem);
    }
})
