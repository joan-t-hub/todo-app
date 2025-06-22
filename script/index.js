// Récupérer la première balise ul contenant les to-dos
const ul = document.getElementById('checkboxList');
const todoElements = ul.querySelectorAll('li');

// Construire le tableau d'objets to-dos
const todos = Array.from(todoElements).map((li, index) => {
    const label = li.querySelector('label');
    const checkbox = li.querySelector('input[type="checkbox"]');
    // Récupérer le texte du to-do (en supprimant les éléments enfants inutiles)
    let text = '';
    if (label) {
        // On récupère le texte du label sans les enfants (checkbox, span)
        text = Array.from(label.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .join(' ');
    }
    return {
        id: index + 1,
        text: text,
        completed: checkbox ? checkbox.checked : false
    };
});

// Afficher le tableau au format JSON dans la console
console.log(JSON.stringify(todos, null, 2));

document.getElementById('clickMe').addEventListener('click', function() {
        alert('Button clicked!');
});

// Gestion de l'ajout d'un to-do via la modale
const addTodoForm = document.getElementById('addTodoForm');
if (addTodoForm) {
    addTodoForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const todoTextInput = document.getElementById('todoText');
        const todoText = todoTextInput.value.trim();
        if (todoText) {
            // Créer le nouvel élément li
            const ul = document.getElementById('checkboxList');
            const li = document.createElement('li');
            li.innerHTML = `<label class="custom-checkbox"><input type="checkbox" /><span class="checkmark"></span> ${todoText}</label>`;
            ul.appendChild(li);
            // Réinitialiser le champ
            todoTextInput.value = '';
            // Fermer la modale (Bootstrap)
            const modal = bootstrap.Modal.getInstance(document.getElementById('notificationModal'));
            if (modal) modal.hide();
            // Mettre à jour le JSON affiché
            updateTodosJSON();
        }
    });
}

// Fonction pour mettre à jour le JSON affiché en console
function updateTodosJSON() {
    const ul = document.getElementById('checkboxList');
    const completedUl = document.getElementById('completedList');
    const todoElements = ul.querySelectorAll('li');
    const completedElements = completedUl.querySelectorAll('li');
    const todos = Array.from(todoElements).map((li, index) => {
        const label = li.querySelector('label');
        const checkbox = li.querySelector('input[type="checkbox"]');
        let text = '';
        if (label) {
            text = Array.from(label.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ');
        }
        return {
            id: index + 1,
            text: text,
            completed: false
        };
    });
    const completed = Array.from(completedElements).map((li, index) => {
        const label = li.querySelector('label');
        const checkbox = li.querySelector('input[type="checkbox"]');
        let text = '';
        if (label) {
            text = Array.from(label.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ');
        }
    return {
            id: index + 1,
            text: text,
            completed: true
        };
    });
    console.log(JSON.stringify({todos, completed}, null, 2));
}
// Appel initial pour afficher le JSON au chargement
updateTodosJSON();

// Fonction pour basculer la classe strike sur le texte du to-do
function toggleStrikeOnTodo(event) {
    const li = event.target.closest('li');
    if (!li) return;
    // On ne fait rien si on clique sur la checkbox
    if (event.target.tagName.toLowerCase() === 'input') return;
    const label = li.querySelector('label');
    if (!label) return;

    const ulParent = li.parentElement;
    const checkboxList = document.getElementById('checkboxList');
    const completedList = document.getElementById('completedList');

    if (ulParent.id === 'checkboxList') {
        // On barre le texte et on déplace dans la liste complétée
        label.classList.add('strike');
        completedList.appendChild(li);
    } else if (ulParent.id === 'completedList') {
        // On retire la barre et on remet dans la liste principale
        label.classList.remove('strike');
        checkboxList.appendChild(li);
    }
    updateTodosJSON();
}

// Ajout de l'écouteur sur les deux ul
const ulCheckboxList = document.getElementById('checkboxList');

// Sélectionne un to-do au clic sur n'importe quelle zone de l'élément sauf la checkbox
ulCheckboxList.addEventListener('click', function(event) {
    const li = event.target.closest('li');
    if (!li || li.parentElement.id !== 'checkboxList') return;
    // Si clic sur la checkbox, ne pas sélectionner ici (la gestion de barre/déplacement est ailleurs)
    if (event.target.tagName.toLowerCase() === 'input' && event.target.type === 'checkbox') return;
    // Si clic sur le label mais pas sur la checkbox, empêcher le comportement natif qui coche la checkbox
    if (event.target.tagName.toLowerCase() === 'label') {
        event.preventDefault();
    }
    // Sélectionne ce to-do
    const todoElements = Array.from(ulCheckboxList.querySelectorAll('li'));
    const index = todoElements.indexOf(li);
    if (index !== -1) {
        selectTodoByIndex(index);
    }
});

// On ne barre/déplace que si on clique sur la checkbox
ulCheckboxList.addEventListener('change', function(event) {
    if (event.target.tagName.toLowerCase() === 'input' && event.target.type === 'checkbox') {
        const li = event.target.closest('li');
        if (!li || li.parentElement.id !== 'checkboxList') return;
        const label = li.querySelector('label');
        if (label) label.classList.add('strike');
        // Déplacer dans la liste complétée
        document.getElementById('completedList').appendChild(li);
        updateTodosJSON();
    }
});

// Pour la liste complétée, décocher ramène dans la liste principale
const ulCompletedList = document.getElementById('completedList');
ulCompletedList.addEventListener('change', function(event) {
    if (event.target.tagName.toLowerCase() === 'input' && event.target.type === 'checkbox') {
        const li = event.target.closest('li');
        if (!li || li.parentElement.id !== 'completedList') return;
        const label = li.querySelector('label');
        if (label) label.classList.remove('strike');
        // Déplacer dans la liste principale
        document.getElementById('checkboxList').appendChild(li);
        updateTodosJSON();
    }
});

// Gestion de la sélection dynamique d'un to-do
let selectedTodoIndex = 0;

function updateSelectedTodoDisplay() {
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    if (todoElements.length === 0) {
        document.getElementById('selectedTodoDisplay').textContent = '';
        return;
    }
    // Met à jour l'affichage dans la deuxième colonne
    const label = todoElements[selectedTodoIndex].querySelector('label');
    document.getElementById('selectedTodoDisplay').textContent = label ? label.textContent.trim() : '';
}

function selectTodoByIndex(index) {
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    todoElements.forEach((li, i) => {
        const label = li.querySelector('label');
        if (label) {
            if (i === index) {
                label.classList.add('selected-todo');
            } else {
                label.classList.remove('selected-todo');
            }
        }
    });
    selectedTodoIndex = index;
    updateSelectedTodoDisplay();
}

// Par défaut, sélectionne le premier élément
selectTodoByIndex(0);

// Gestion de la modale de rappel
const addReminderAction = document.getElementById('addReminderAction');
const reminderModal = document.getElementById('reminderModal');
const reminderTodoName = document.getElementById('reminderTodoName');
const reminderForm = document.getElementById('reminderForm');
const reminderDatetime = document.getElementById('reminderDatetime');

// Stockage des rappels (clé: texte du to-do, valeur: timestamp)
let reminders = {};

addReminderAction.addEventListener('click', function() {
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    if (todoElements.length === 0) return;
    const label = todoElements[selectedTodoIndex].querySelector('label');
    const todoText = label ? label.textContent.trim() : '';
    reminderTodoName.textContent = todoText;
    reminderDatetime.value = '';
    // Ouvre la modale Bootstrap
    const modal = new bootstrap.Modal(reminderModal);
    modal.show();
});

reminderForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    if (todoElements.length === 0) return;
    const label = todoElements[selectedTodoIndex].querySelector('label');
    const todoText = label ? label.textContent.trim() : '';
    const datetimeValue = reminderDatetime.value;
    if (!datetimeValue) return;
    const timestamp = new Date(datetimeValue).getTime();
    // Enregistre le rappel
    reminders[todoText] = timestamp;
    // Ferme la modale
    const modal = bootstrap.Modal.getInstance(reminderModal);
    if (modal) modal.hide();
    updateTodosJSON();
    scheduleReminder(todoText, timestamp);
});

// Planification des rappels
function scheduleReminder(todoText, timestamp) {
    const now = Date.now();
    const delay = timestamp - now;
    if (delay <= 0) return;
    setTimeout(function() {
        showReminderNotification(todoText);
        // Supprime le rappel après notification
        delete reminders[todoText];
        updateTodosJSON();
    }, delay);
}

// Gestion du marquage important
const markImportantAction = document.querySelector('#actionsList li:nth-child(3) label');
let importantTodos = {};

markImportantAction.addEventListener('click', function() {
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    if (todoElements.length === 0) return;
    const label = todoElements[selectedTodoIndex].querySelector('label');
    const todoText = label ? label.textContent.trim() : '';
    // Toggle important
    if (importantTodos[todoText]) {
        delete importantTodos[todoText];
        markImportantAction.classList.remove('important-action');
    } else {
        importantTodos[todoText] = true;
        markImportantAction.classList.add('important-action');
    }
    updateTodosJSON();
});

// Met à jour l'état du bouton important selon le to-do sélectionné
function updateImportantActionDisplay() {
    const ul = document.getElementById('checkboxList');
    const todoElements = ul.querySelectorAll('li');
    if (todoElements.length === 0) {
        markImportantAction.classList.remove('important-action');
        return;
    }
    const label = todoElements[selectedTodoIndex].querySelector('label');
    const todoText = label ? label.textContent.trim() : '';
    if (importantTodos[todoText]) {
        markImportantAction.classList.add('important-action');
    } else {
        markImportantAction.classList.remove('important-action');
    }
}

// Ajoute l'appel à updateImportantActionDisplay dans la sélection
const oldSelectTodoByIndex = selectTodoByIndex;
selectTodoByIndex = function(index) {
    oldSelectTodoByIndex(index);
    updateImportantActionDisplay();
};

// Modifie la notification pour l'important
function showReminderNotification(todoText) {
    const isImportant = !!importantTodos[todoText];
    // Notification visuelle
    if (window.Notification && Notification.permission !== 'denied') {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                const notif = new Notification("Don't forget the " + todoText, {
                    body: 'Ceci est votre rappel.',
                    icon: '/images/notification_8137272.png',
                    // Pas de couleur native, on gère le son et la couleur via CSS si possible
                });
                // Bip sonore
                let audio;
                if (isImportant) {
                    audio = new Audio('images/01.Number One - Bankai.mp3');
                } else {
                    audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
                }
                audio.loop = true;
                audio.play();
                notif.onclick = function() { window.focus(); };
                notif.onclose = function() { audio.pause(); };
                setTimeout(() => { notif.close(); audio.pause(); }, 10000); // auto-fermeture après 10s
            }
        });
    } else {
        alert("Don't forget the " + todoText);
    }
}

// Gestion des remarques
const remarksAction = document.querySelector('#actionsList li:nth-child(4) label');
let todoRemarks = {};

remarksAction.addEventListener('click', function() {
    // Supprime tout champ de remarque déjà ouvert
    const existingForm = document.getElementById('remarksForm');
    if (existingForm) existingForm.remove();

    // Crée le formulaire dans l'élément
    const form = document.createElement('form');
    form.id = 'remarksForm';
    form.className = 'd-flex flex-column gap-2 mt-2';
    form.innerHTML = `
        <textarea class="form-control" id="remarkText" rows="2" placeholder="Ajouter une remarque..."></textarea>
        <button type="submit" class="btn btn-primary btn-sm align-self-end">Enregistrer</button>
    `;
    remarksAction.parentElement.appendChild(form);

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const text = form.querySelector('#remarkText').value.trim();
        if (!text) return;
        // Ajoute la remarque au to-do sélectionné
        const ul = document.getElementById('checkboxList');
        const todoElements = ul.querySelectorAll('li');
        if (todoElements.length === 0) return;
        const label = todoElements[selectedTodoIndex].querySelector('label');
        const todoText = label ? label.textContent.trim() : '';
        if (!todoRemarks[todoText]) todoRemarks[todoText] = [];
        todoRemarks[todoText].push(text);
        updateTodosJSON();
        form.remove();
    });
});

// Ajoute la clé remarks dans le JSON
const oldUpdateTodosJSON4 = updateTodosJSON;
updateTodosJSON = function() {
    const ul = document.getElementById('checkboxList');
    const completedUl = document.getElementById('completedList');
    const todoElements = ul.querySelectorAll('li');
    const completedElements = completedUl.querySelectorAll('li');
    const todos = Array.from(todoElements).map((li, index) => {
        const label = li.querySelector('label');
        const checkbox = li.querySelector('input[type="checkbox"]');
        let text = '';
        if (label) {
            text = Array.from(label.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ');
        }
        // Ajoute le rappel si présent
        let reminder = null;
        if (reminders[text]) {
            reminder = reminders[text];
        }
        // Ajoute important si présent
        let important = !!importantTodos[text];
        // Ajoute les remarques si présentes
        let remarks = todoRemarks[text] ? [...todoRemarks[text]] : [];
        return {
            id: index + 1,
            text: text,
            completed: false,
            reminder: reminder,
            important: important,
            remarks: remarks
        };
    });
    const completed = Array.from(completedElements).map((li, index) => {
        const label = li.querySelector('label');
        const checkbox = li.querySelector('input[type="checkbox"]');
        let text = '';
        if (label) {
            text = Array.from(label.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent.trim())
                .join(' ');
        }
        return {
            id: index + 1,
            text: text,
            completed: true,
            reminder: null,
            important: false,
            remarks: []
        };
    });
    console.log(JSON.stringify({todos, completed}, null, 2));
};

// Recharge les rappels au chargement
rescheduleAllReminders();

// Suppression du to-do sélectionné via le bouton delete (deuxième colonne)
const deleteButton = Array.from(document.querySelectorAll('.col-md-7 .clear-bg')).find(btn => btn.innerHTML.includes('delete.png') && btn.innerHTML.includes('Delete'));
if (deleteButton) {
    deleteButton.addEventListener('click', function() {
        console.log('Bouton Delete cliqué');
        const ul = document.getElementById('checkboxList');
        const todoElements = ul.querySelectorAll('li');
        if (todoElements.length === 0) return;
        const liToDelete = todoElements[selectedTodoIndex];
        if (!liToDelete) return;
        // Récupère le texte du to-do pour supprimer aussi les rappels, remarques, important
        const label = liToDelete.querySelector('label');
        const todoText = label ? label.textContent.trim() : '';
        // Suppression dans les structures annexes
        delete reminders[todoText];
        delete importantTodos[todoText];
        delete todoRemarks[todoText];
        // Supprime l'élément du DOM
        liToDelete.remove();
        updateTodosJSON();
    });
} else {
    console.log('Bouton Delete non trouvé');
}

