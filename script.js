// DOM elements
const themeToggle = document.getElementById('themeToggle');
const htmlEl = document.documentElement;
const yearSpan = document.getElementById('year');


// Year in footer
yearSpan.textContent = new Date().getFullYear();
// ===== Theme (Light / Dark) =====
const savedTheme = localStorage.getItem('hlp_theme');
if (savedTheme) htmlEl.setAttribute('data-theme', savedTheme);
updateThemeButton();


themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    if (current === 'dark') htmlEl.setAttribute('data-theme', 'dark');
    else htmlEl.removeAttribute('data-theme');
    localStorage.setItem('hlp_theme', current === 'dark' ? 'dark' : 'light');
    updateThemeButton();
});


function updateThemeButton(){
    const isDark = htmlEl.getAttribute('data-theme') === 'dark';
    themeToggle.textContent = isDark ? '☀️' : '🌙';
}


// ===== Water Tracker =====
const cupsContainer = document.getElementById('cupsContainer');
const dailyInput = document.getElementById('dailyCups');
const setCupsBtn = document.getElementById('setCups');
const resetCupsBtn = document.getElementById('resetCups');


let dailyCups = parseInt(localStorage.getItem('hlp_dailyCups')) || parseInt(dailyInput.value);
let filledCupsSet = new Set(JSON.parse(localStorage.getItem('hlp_filledCups') || '[]'));


dailyInput.value = dailyCups;


function renderCups(){
    cupsContainer.innerHTML = '';
    for(let i = 1; i <= dailyCups; i++){
        const cup = document.createElement('div');
        cup.className = 'cup';
        cup.setAttribute('role','button');
        cup.setAttribute('aria-pressed', filledCupsSet.has(i));
        cup.title = `${i} / ${dailyCups}`;
        cup.textContent = i;
        if(filledCupsSet.has(i)) cup.classList.add('filled');
        cup.addEventListener('click', () => toggleCup(i));
        cupsContainer.appendChild(cup);
    }
}
function toggleCup(i){
    if(filledCupsSet.has(i)) filledCupsSet.delete(i);
    else filledCupsSet.add(i);
    localStorage.setItem('hlp_filledCups', JSON.stringify(Array.from(filledCupsSet)));
    renderCups();
}
setCupsBtn.addEventListener('click', () => {
    const v = parseInt(dailyInput.value) || 1;
    dailyCups = Math.min(Math.max(v,1),20);
    localStorage.setItem('hlp_dailyCups', dailyCups);
    // reset filled set to keep only valid indexes
    filledCupsSet = new Set(Array.from(filledCupsSet).filter(x => x <= dailyCups));
    localStorage.setItem('hlp_filledCups', JSON.stringify(Array.from(filledCupsSet)));
    renderCups();
});
resetCupsBtn.addEventListener('click', () => {
    filledCupsSet.clear();
    localStorage.setItem('hlp_filledCups', JSON.stringify([]));
    renderCups();
});
renderCups();


// ===== Habits =====
const habitsContainer = document.getElementById('habitsContainer');
const addHabitForm = document.getElementById('addHabitForm');
const habitNameInput = document.getElementById('habitName');


let habits = JSON.parse(localStorage.getItem('hlp_habits') || '[]');
// habits = [{id: 'h1', name:'نوم 8 ساعات', done:false}, ...]


function saveHabits(){ localStorage.setItem('hlp_habits', JSON.stringify(habits)); }
function renderHabits(){
    habitsContainer.innerHTML = '';
    if(habits.length === 0){
        habitsContainer.innerHTML = '<p style="color:var(--muted)">لم تضف عادات بعد — أضف عادة جديدة أدناه.</p>';
        return;
    }
    habits.forEach(h => {
        const card = document.createElement('div');
        card.className = 'habit-card' + (h.done ? ' done' : '');
        card.innerHTML = `<div>${h.name}</div><div>${h.done ? '✓' : ''}</div>`;
        card.addEventListener('click', () => {
         h.done = !h.done;
         saveHabits();
         renderHabits();
          });
        // small delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'حذف';
        delBtn.style.marginInlineStart = '8px';
        delBtn.className = 'btn ghost';
        delBtn.addEventListener('click', (ev) => {
           ev.stopPropagation();
           habits = habits.filter(x => x.id !== h.id);
           saveHabits();
           renderHabits();
      });
      card.appendChild(delBtn);
      habitsContainer.appendChild(card);
     });
}
addHabitForm.addEventListener('submit', (e) => {
     e.preventDefault();
     const name = habitNameInput.value.trim();
     if(name.length < 2) return;
     const id = 'h' + Date.now();
     habits.push({id, name, done:false});
     habitNameInput.value = '';
     saveHabits();
     renderHabits();
});
renderHabits();


// ===== Meal of the Day =====
const mealTitle = document.getElementById('mealTitle');
const mealDesc = document.getElementById('mealDesc');
const mealImg = document.getElementById('mealImg');
const newMealBtn = document.getElementById('newMeal');
const favMealBtn = document.getElementById('favoriteMeal');


const meals = [
     {title:'سلطة الكينوا والأفوكادو', desc:'كينوا، أفوكادو، طماطم، عصير ليمون، زيت زيتون، ملح وفلفل', img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1b2c6bd2f4e3e7f1f6a9b0e7d7fc1a2d'},
     {title:'سمك مشوي مع خضار', desc:'فيليه سمك مشوي مع تبلة خفيفة وخضار مشوية جانبية', img:'https://images.unsplash.com/photo-1514512364185-2b6a3c3b96d8?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3b5f3f1b5e2d9f0d3b1a2c4e5f6a7b8c'},
     {title:'عصير أخضر منعش', desc:'سبانخ، تفاح أخضر، خيار، ليمون، زنجبيل — مشروب طاقة طبيعي', img:'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1b2c6bd2f4e3e7f1f6a9b0e7d7fc1a2d'},
     {title:'شوربة خضار مغذية', desc:'شوربة خضار متنوعة مطبوخة بمرق خفيف وتوابل بسيطة', img:'https://images.unsplash.com/photo-1476718406336-bb5a9690ee2a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=5c2c3b4d5e6f7a8b9c0d1e2f3a4b5c6d'},
     {title:'وجبة الإفطار المتوازن', desc:'بيض مسلوق، شريحة توست من الحبوب الكاملة، فاكهة موسمية', img:'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=7f6c5d4b3a2a1b0c9d8e7f6a5b4c3d2e'}
];


let currentMealIndex = parseInt(localStorage.getItem('hlp_currentMeal')) || 0;
let favorites = JSON.parse(localStorage.getItem('hlp_favorites') || '[]');


function renderMeal(index){
     const m = meals[index % meals.length];
     mealTitle.textContent = m.title;
     mealDesc.textContent = m.desc;
    mealImg.src = m.img;
    currentMealIndex = index % meals.length;
    localStorage.setItem('hlp_currentMeal', currentMealIndex);
    updateFavoriteButton();
}
function randomMeal(){
    const idx = Math.floor(Math.random() * meals.length);
    renderMeal(idx);
}
newMealBtn.addEventListener('click', randomMeal);
function updateFavoriteButton(){
    const isFav = favorites.includes(currentMealIndex);
    favMealBtn.textContent = isFav ? '♥ محفوظة' : '♡ حفظ كمفضلة';
}
favMealBtn.addEventListener('click', () => {
    if(favorites.includes(currentMealIndex)){
        favorites = favorites.filter(x => x !== currentMealIndex);
    } else {
        favorites.push(currentMealIndex);
    }
    localStorage.setItem('hlp_favorites', JSON.stringify(favorites));
    updateFavoriteButton();
});
renderMeal(currentMealIndex);


// ===== Contact form (basic validation + save locally) =====
const contactForm = document.getElementById('contactForm');
const formFeedback = document.getElementById('formFeedback');


contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();


    if(name.length < 2 || !email.includes('@') || message.length < 10){
        formFeedback.textContent = 'تحقق من الحقول: الاسم (2+)، إيميل صالح، والرسالة (10+ أحرف).';
        formFeedback.style.color = 'crimson';
        return;
    }


    const messages = JSON.parse(localStorage.getItem('hlp_messages') || '[]');
    messages.push({name,email,message,date:new Date().toISOString()});
    localStorage.setItem('hlp_messages', JSON.stringify(messages));


    formFeedback.textContent = 'تم الإرسال! شكراً لتواصلك.';
    formFeedback.style.color = 'green';
    contactForm.reset();
});
