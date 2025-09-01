// app.js
import { app, db } from "./firebase.js";
import {
  collection, query, orderBy, limit, startAfter, getDocs, where
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const grid = document.getElementById('galleryGrid');
const loader = document.getElementById('loader');
const loadMoreBtn = document.getElementById('loadMoreBtn');
const chips = document.querySelectorAll('.chip');

let lastDoc = null;
let activeFilter = 'all';
let loading = false;

chips.forEach(chip=>{
  chip.addEventListener('click', ()=>{
    chips.forEach(c=>c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeFilter = chip.dataset.filter;
    // reset
    lastDoc = null;
    grid.innerHTML = '';
    fetchPage();
  });
});

async function fetchPage(){
  if (loading) return;
  loading = true;
  loader.hidden = false;
  loadMoreBtn.hidden = true;

  try {
    const baseRef = collection(db, "galeria");
    let q = null;

    if (activeFilter === 'all') {
      q = query(baseRef, orderBy('createdAt', 'desc'), limit(12), ...(lastDoc?[startAfter(lastDoc)]:[]));
    } else {
      q = query(baseRef, where('category','==', activeFilter), orderBy('createdAt','desc'), limit(12), ...(lastDoc?[startAfter(lastDoc)]:[]));
    }

    const snap = await getDocs(q);
    const docs = snap.docs;

    docs.forEach(d=>{
      const item = d.data();
      const el = document.createElement('a');
      el.className = 'item';
      el.href = item.url;
      el.target = '_blank';
      el.rel = 'noopener';
      el.innerHTML = `
        <img loading="lazy" src="${item.url}" alt="${item.title??'Avenor'}">
        ${item.title ? `<div class="item__cap">${item.title}</div>` : '' }
      `;
      grid.appendChild(el);
    });

    lastDoc = docs.length ? docs[docs.length-1] : lastDoc;
    loadMoreBtn.hidden = docs.length < 12;
  } catch (err){
    console.error(err);
  } finally {
    loader.hidden = true;
    loading = false;
  }
}

if (grid) {
  fetchPage();
  if (loadMoreBtn) loadMoreBtn.addEventListener('click', fetchPage);
}
