'use strict';
const input=document.querySelector('#search');
if(input){const entries=[...document.querySelectorAll('[data-search]')];input.addEventListener('input',()=>{const q=input.value.trim().toLocaleLowerCase();let count=0;entries.forEach(e=>{e.hidden=!e.dataset.search.includes(q);if(!e.hidden)count++;});document.querySelector('#search-status').textContent=q?`找到 ${count} 篇文章` : '';});}
