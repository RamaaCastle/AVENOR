// admin.js
import { app, db, storage, auth } from "./firebase.js";
import {
  signInWithEmailAndPassword, onAuthStateChanged, createUserWithEmailAndPassword, signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  collection, addDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const authState = document.getElementById('authState');
const loginView = document.getElementById('loginView');
const panelView = document.getElementById('panelView');

const email = document.getElementById('email');
const password = document.getElementById('password');
const loginBtn = document.getElementById('loginBtn');
const createBtn = document.getElementById('createBtn');
const logoutBtn = document.getElementById('logoutBtn');

const fileInput = document.getElementById('fileInput');
const titleInput = document.getElementById('titleInput');
const categorySelect = document.getElementById('categorySelect');
const priorityInput = document.getElementById('priorityInput');
const uploadBtn = document.getElementById('uploadBtn');

const previewWrap = document.getElementById('previewWrap');
const tbody = document.getElementById('tbody');

onAuthStateChanged(auth, (user)=>{
  if (user){
    authState.textContent = `Sesión: ${user.email}`;
    loginView.hidden = true;
    panelView.hidden = false;
    bindTable();
  } else {
    authState.textContent = "No autenticado";
    loginView.hidden = false;
    panelView.hidden = true;
  }
});

loginBtn?.addEventListener('click', async()=>{
  try{
    await signInWithEmailAndPassword(auth, email.value, password.value);
  }catch(e){ alert(e.message); }
});

createBtn?.addEventListener('click', async()=>{
  try{
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    alert("Usuario creado.");
  }catch(e){ alert(e.message); }
});

logoutBtn?.addEventListener('click', ()=> signOut(auth));

fileInput?.addEventListener('change', ()=>{
  previewWrap.innerHTML = '';
  const f = fileInput.files?.[0];
  if (!f) return;
  const img = document.createElement('img');
  img.src = URL.createObjectURL(f);
  img.style.maxWidth = '360px';
  img.style.border = '1px solid var(--border)';
  img.style.borderRadius = '12px';
  img.style.display = 'block';
  previewWrap.appendChild(img);
});

uploadBtn?.addEventListener('click', async()=>{
  const f = fileInput.files?.[0];
  if (!f){ return alert("Seleccioná una imagen"); }

  uploadBtn.disabled = true; uploadBtn.textContent = "Subiendo…";

  try{
    const filename = `${Date.now()}_${f.name.replace(/\s+/g,'_')}`;
    const r = ref(storage, `galeria/${filename}`);
    const task = uploadBytesResumable(r, f, { cacheControl: 'public,max-age=31536000,immutable' });

    task.on('state_changed', null, (err)=> alert(err.message), async ()=>{
      const url = await getDownloadURL(r);
      await addDoc(collection(db, 'galeria'), {
        url,
        path: r.fullPath,
        title: titleInput.value || null,
        category: categorySelect.value,
        priority: Number(priorityInput.value ?? 50),
        createdAt: serverTimestamp()
      });
      fileInput.value = '';
      previewWrap.innerHTML = '';
      titleInput.value = '';
      uploadBtn.textContent = "Subir";
      uploadBtn.disabled = false;
      alert("Imagen publicada ✅");
    });
  }catch(e){
    alert(e.message);
    uploadBtn.textContent = "Subir";
    uploadBtn.disabled = false;
  }
});

function bindTable(){
  const q = query(collection(db,'galeria'), orderBy('createdAt','desc'));
  onSnapshot(q, (snap)=>{
    tbody.innerHTML = '';
    snap.forEach(docSnap=>{
      const d = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><img class="thumb" src="${d.url}" alt=""></td>
        <td>${d.title ?? '—'}</td>
        <td>${d.category ?? '—'}</td>
        <td>${d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : '—'}</td>
        <td>
          <button data-id="${docSnap.id}" data-path="${d.path}" class="btn btn--ghost danger">Eliminar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // bind delete
    tbody.querySelectorAll('button[data-id]').forEach(btn=>{
      btn.addEventListener('click', async()=>{
        if (!confirm('¿Eliminar esta imagen?')) return;
        const id = btn.dataset.id;
        const path = btn.dataset.path;
        try{
          await deleteDoc(doc(db,'galeria', id));
          if (path){
            await deleteObject(ref(storage, path));
          }
        }catch(e){ alert(e.message); }
      });
    });
  });
}
