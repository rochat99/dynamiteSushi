const categoryPanels = {
  starters: 'startersPanel',
  kitchenEntrees: 'kitchenEntreesPanel',
  sushiFusion: 'sushiFusionPanel',
  riceBowls: 'riceBowlsPanel',
  makiRolls: 'makiRollsPanel',
  signatureDragons: 'signatureDragonsPanel',
  aLaCarte: 'aLaCartePanel',
  combosAndTrays: 'combosAndTraysPanel',
  beverages: 'beveragesPanel',
};

let activeCategory = null;

function placePanel(panel, article) {
  const grid = document.getElementById('menuSection');
  const allArticles = Array.from(grid.querySelectorAll('.mainCategory'));
  const columns = 3;

  const articleIndex = allArticles.indexOf(article);
  const buttonRow = Math.floor(articleIndex / columns);
  const columnPosition = articleIndex % columns;

  const targetRow = buttonRow + 3;
  panel.style.gridRow = targetRow;
  panel.style.gridColumn = '1 / -1';

  panel.classList.remove('left', 'middle', 'right');

  if (columnPosition === 0) panel.classList.add('left');
  else if (columnPosition === 1) panel.classList.add('middle');
  else panel.classList.add('right');
}

function closeActive() {
  if (!activeCategory) return;
  const prevPanel = document.getElementById(categoryPanels[activeCategory]);
  const prevArticle = document.getElementById(activeCategory);
  prevPanel.classList.remove('visible');
  prevPanel.style.gridRow = '';
  prevPanel.style.gridColumn = '';
  prevArticle.classList.remove('is-expanded');
  activeCategory = null;
}

function toggleCategory(id) {
  const panelId = categoryPanels[id];
  const panel = document.getElementById(panelId);
  const article = document.getElementById(id);

  if (activeCategory === id) {
    closeActive();
    return;
  }

  closeActive();

  placePanel(panel, article);
  panel.classList.add('visible');
  article.classList.add('is-expanded');
  activeCategory = id;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      panel.querySelectorAll('.card').forEach(card => checkChevronVisibility(card));
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mainCategory button').forEach(button => {
    button.addEventListener('click', () => {
      const article = button.closest('.mainCategory');
      toggleCategory(article.id);
    });
  });

  document.querySelectorAll('#specialsLinks a').forEach(a => {
    a.addEventListener('click', () => {
      loadSpecial(a.dataset.special);
    });
  });

  enableDragScroll(document.getElementById('specialsCarousel'));
  // removed the bentoLink active line from here
});

function enableDragScroll(element) {
  let isDown = false;
  let startX;
  let scrollLeft;

  element.addEventListener('mousedown', (e) => {
    isDown = true;
    element.classList.add('dragging');
    startX = e.pageX - element.offsetLeft;
    scrollLeft = element.scrollLeft;
  });

  element.addEventListener('mouseleave', () => {
    isDown = false;
    element.classList.remove('dragging');
  });

  element.addEventListener('mouseup', () => {
    isDown = false;
    element.classList.remove('dragging');
  });

  element.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - element.offsetLeft;
    const walk = (x - startX) * 1.5; // 1.5 = drag speed multiplier
    element.scrollLeft = scrollLeft - walk;
  });
}

// ── Menu card building ────────────────────────────────────────────────────────

function isVal(v) {
  return v !== null && v !== undefined && v !== 'null';
}

function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

function buildCard(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.id = item.id;

  // TAGS
  const tags = document.createElement('div');
  tags.classList.add('tags');

  if (isVal(item.tags) && item.tags === 'spicy') {
    const tag = document.createElement('div');
    tag.classList.add('tag', 'spicy');
    tags.appendChild(tag);
  }

  if (isVal(item.tags) && item.tags === 'vegan') {
    const tag = document.createElement('div');
    tag.classList.add('tag', 'vegan');
    tags.appendChild(tag);
  }

  if (item.isOnSale) {
    const tag = document.createElement('div');
    tag.classList.add('tag', 'sale');
    tags.appendChild(tag);
  }

  if (item.isChefsChoice) {
    const tag = document.createElement('div');
    tag.classList.add('tag', 'chefsChoice');
    tags.appendChild(tag);
  }

  if (tags.children.length > 0) card.appendChild(tags);

  const img = document.createElement('img');
  img.src = `./assets/images/items/${item.id}.jpg`;
  img.alt = item.name ?? '';
  card.appendChild(img);

  const content = document.createElement('div');
  content.classList.add('card-content');

  if (!isVal(item.name)) return null;
  const name = document.createElement('h2');
  name.textContent = item.name;
  content.appendChild(name);

  const hasBothOptions = isVal(item.option1) && isVal(item.option2);
  const hasOption1Only = isVal(item.option1) && !isVal(item.option2);

  if (hasBothOptions) {
    const options = document.createElement('h3');
    options.classList.add('card-options');
    options.textContent = `${item.option1} | ${item.option2}`;
    content.appendChild(options);
  } else if (hasOption1Only) {
    const options = document.createElement('h3');
    options.classList.add('card-options');
    options.textContent = item.option1;
    content.appendChild(options);
  }

  const price = document.createElement('h3');
  price.classList.add('card-price');

  if (item.isOnSale && isVal(item.salePrice)) {
    const original = document.createElement('span');
    original.classList.add('price-original');
    original.textContent = formatPrice(item.price1);
    const sale = document.createElement('span');
    sale.classList.add('price-sale');
    sale.textContent = formatPrice(item.salePrice);
    price.appendChild(original);
    price.appendChild(document.createTextNode(' '));
    price.appendChild(sale);
  } else if (hasBothOptions && isVal(item.price2)) {
    price.textContent = `${formatPrice(item.price1)} | ${formatPrice(item.price2)}`;
  } else {
    price.textContent = formatPrice(item.price1);
  }

  content.appendChild(price);

  if (isVal(item.ingredients)) {
    const wrapper = document.createElement('div');
    wrapper.classList.add('ingredients-wrapper');

    const p = document.createElement('p');
    p.classList.add('ingredients-text');
    p.textContent = item.ingredients;
    wrapper.appendChild(p);
    content.appendChild(wrapper);

    const toggle = document.createElement('button');
    toggle.classList.add('card-toggle');
    toggle.style.display = 'none';
    toggle.innerHTML = '<i class="bi bi-chevron-compact-down"></i>';

    toggle.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('is-expanded');
      const icon = toggle.querySelector('i');
      icon.classList.toggle('bi-chevron-compact-down', !isExpanded);
      icon.classList.toggle('bi-chevron-compact-up', isExpanded);

      if (isExpanded) {
        p.style.display = 'block';
        p.style.webkitLineClamp = 'unset';
        p.style.overflow = 'visible';
        wrapper.style.overflow = 'visible';
        wrapper.classList.add('no-fade');
      } else {
        p.style.display = '-webkit-box';
        p.style.webkitBoxOrient = 'vertical';
        p.style.webkitLineClamp = '3';
        p.style.overflow = 'hidden';
        wrapper.style.overflow = 'hidden';
        wrapper.classList.remove('no-fade');
      }
    });

    content.appendChild(toggle);
  }

  card.appendChild(content);
  return card;
}

function checkChevronVisibility(card) {
  const p = card.querySelector('.ingredients-text');
  const toggle = card.querySelector('.card-toggle');
  const wrapper = card.querySelector('.ingredients-wrapper');
  if (!p || !toggle || !wrapper) return;

  p.style.display = 'block';
  p.style.webkitLineClamp = 'unset';
  p.style.overflow = 'visible';
  wrapper.style.overflow = 'visible';

  const lineHeight = parseFloat(getComputedStyle(p).lineHeight);
  const naturalHeight = p.scrollHeight;
  const threeLineHeight = lineHeight * 3;

  if (naturalHeight > Math.ceil(threeLineHeight)) {
    p.style.display = '-webkit-box';
    p.style.webkitBoxOrient = 'vertical';
    p.style.webkitLineClamp = '3';
    p.style.overflow = 'hidden';
    wrapper.style.overflow = 'hidden';
    toggle.style.display = 'block';
  } else {
    p.style.display = 'block';
    toggle.style.display = 'none';
    wrapper.classList.add('no-fade');
  }
}

// ── Specials carousel ─────────────────────────────────────────────────────────

const specialsData = {};

function loadSpecial(key, isInitial = false) {
  const carousel = document.getElementById('specialsCarousel');
  carousel.innerHTML = '';

  const items = specialsData[key];
  if (!items) return;

  items.forEach(item => {
    const card = buildCard(item);
    if (card) carousel.appendChild(card);
  });

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      carousel.querySelectorAll('.card').forEach(card => checkChevronVisibility(card));
    });
  });

  const applyActive = () => {
    document.querySelectorAll('#specialsLinks a').forEach(a => {
      a.classList.remove('active');
      if (a.dataset.special === key) a.classList.add('active');
    });
  };

  // On initial load, defer slightly to ensure DOM is fully ready
  if (isInitial) {
    setTimeout(applyActive, 0);
  } else {
    applyActive();
  }
}

// ── Render from JSON ──────────────────────────────────────────────────────────

function toKey(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/ (.)/g, (_, c) => c.toUpperCase());
}

function renderMenuFromJSON(data) {
  const categories = data.categories;
  const saleItems = [];

  for (const [categoryName, subcategories] of Object.entries(categories)) {

    if (categoryName === 'Sales & Specials') {
      for (const [subcategoryName, items] of Object.entries(subcategories)) {
        specialsData[toKey(subcategoryName)] = items;
      }
      loadSpecial('bentoBoxes', true);
      continue;
    }

    for (const [subcategoryName, items] of Object.entries(subcategories)) {
      const subcategoryKey = toKey(subcategoryName);

      const container = document.querySelector(
        `.subCategory[data-subcategory="${subcategoryKey}"]`
      );

      // Collect sale items from every category
      items.forEach(item => {
        if (item.isOnSale) saleItems.push(item);
      });

      if (!container) continue;

      const title = document.createElement('h3');
      title.classList.add('subcategory-title');
      title.textContent = subcategoryName;
      container.appendChild(title);

      const row = document.createElement('div');
      row.classList.add('cardsRow');

      items.forEach(item => {
        const card = buildCard(item);
        if (!card) return;
        row.appendChild(card);
      });

      container.appendChild(row);
    }
  }

  // Store sale items so the SALES link in specials can load them
  specialsData['saleSpecial'] = saleItems;
}

fetch('./assets/data/Dynamite_Sushi_Menu.json')
  .then(res => res.json())
  .then(data => renderMenuFromJSON(data))
  .catch(err => console.error('Failed to load menu JSON:', err));