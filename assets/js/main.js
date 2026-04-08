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

  // Detect columns from computed style instead of hardcoding 3
  const gridStyle = window.getComputedStyle(grid);
  const columns = gridStyle.gridTemplateColumns.split(' ').length;

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
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mainCategory button').forEach(button => {
    button.addEventListener('click', () => {
      const article = button.closest('.mainCategory');
      if (article.classList.contains('greyed-out')) return;
      toggleCategory(article.id);
    });
  });

  document.querySelectorAll('#specialsLinks a').forEach(a => {
    a.addEventListener('click', () => {
      loadSpecial(a.dataset.special);
    });
  });

  enableDragScroll(document.getElementById('specialsCarousel'));
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
    const walk = (x - startX) * 1.5;
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

function createTag(type) {
  const tag = document.createElement('div');
  tag.classList.add('tag', type);

  const icon = document.createElement('div');
  icon.classList.add('tag-icon');
  tag.appendChild(icon);

  return tag;
}

function buildCard(item) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.dataset.id = item.id;

  const tags = document.createElement('div');
  tags.classList.add('tags');

  if (isVal(item.tags) && item.tags === 'spicy') tags.appendChild(createTag('spicy'));
  if (isVal(item.tags) && item.tags === 'vegan') tags.appendChild(createTag('vegan'));
  if (item.isOnSale) tags.appendChild(createTag('sale'));
  if (item.isChefsChoice) tags.appendChild(createTag('chefsChoice'));
  if (tags.children.length > 0) card.appendChild(tags);

  const img = document.createElement('img');
  img.src = `./assets/images/items/${item.id}.jpeg`;
  img.alt = item.name ?? '';
  img.onerror = () => {
    img.style.display = 'none';
    const placeholder = document.createElement('div');
    placeholder.classList.add('img-placeholder');
    placeholder.innerHTML = `<img src="/assets/images/placeholder.svg" alt="">`;
    card.insertBefore(placeholder, img);
  };
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
    const toggle = document.createElement('button');
    toggle.classList.add('card-toggle');
    toggle.innerHTML = '<i class="bi bi-chevron-compact-down"></i>';

    const ingredients = document.createElement('p');
    ingredients.classList.add('ingredients-text');
    ingredients.textContent = item.ingredients;

    toggle.addEventListener('click', () => {
      const isExpanded = card.classList.toggle('is-expanded');
      toggle.querySelector('i').classList.toggle('bi-chevron-compact-down', !isExpanded);
      toggle.querySelector('i').classList.toggle('bi-chevron-compact-up', isExpanded);
    });

    content.appendChild(ingredients);
    content.appendChild(toggle);
  }

  card.appendChild(content);
  return card;
}

// ── Specials carousel ─────────────────────────────────────────────────────────

const specialsData = {};

function loadSpecial(key, isInitial = false) {
  const carousel = document.getElementById('specialsCarousel');
  const weekly = document.getElementById('weeklySpecials');

  if (key === 'weeklySpecial') {
    carousel.classList.remove('visible');
    weekly.classList.add('visible');
  } else {
    carousel.classList.add('visible');
    weekly.classList.remove('visible');
  }

  carousel.innerHTML = '';

  const applyActive = () => {
    document.querySelectorAll('#specialsLinks a').forEach(a => {
      a.classList.remove('active');
      if (a.dataset.special === key) a.classList.add('active');
    });
  };

  if (isInitial) {
    setTimeout(applyActive, 100);
  } else {
    applyActive();
  }

  const items = specialsData[key];
  if (!items) return;

  items.forEach(item => {
    const card = buildCard(item);
    if (card) carousel.appendChild(card);
  });
}

// ── Filters ───────────────────────────────────────────────────────────────────

function applyFilters() {
  const activeFilters = Array.from(
    document.querySelectorAll('#filterArea li.active')
  ).map(el => el.id);

  // Apply to all cards everywhere in the menu panels
  document.querySelectorAll('.expandedPanel .card, #specialsCarousel .card').forEach(card => {
    if (activeFilters.length === 0) {
      card.style.display = '';
      return;
    }

    const hasMatch = activeFilters.some(filter => {
      return card.querySelector(`.tag.${filter}`) !== null;
    });

    card.style.display = hasMatch ? '' : 'none';
  });

  // Grey out categories that have no visible cards after filtering
  document.querySelectorAll('.mainCategory').forEach(article => {
    if (activeFilters.length === 0) {
      article.classList.remove('greyed-out');
      return;
    }

    const panelId = categoryPanels[article.id];
    if (!panelId) return;

    const panel = document.getElementById(panelId);
    const hasMatch = activeFilters.some(filter => {
      return panel.querySelector(`.tag.${filter}`) !== null;
    });

    if (hasMatch) {
      article.classList.remove('greyed-out');
    } else {
      if (activeCategory === article.id) closeActive();
      article.classList.add('greyed-out');
    }
  });
}

function setupFilterListeners() {
  document.querySelectorAll('#filterArea li').forEach(circle => {
    circle.addEventListener('click', () => {
      circle.classList.toggle('active');
      applyFilters();
    });
  });
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
      document.getElementById('specialsCarousel').classList.add('visible');
      continue;
    }

    for (const [subcategoryName, items] of Object.entries(subcategories)) {
      const subcategoryKey = toKey(subcategoryName);

      const container = document.querySelector(
        `.subCategory[data-subcategory="${subcategoryKey}"]`
      );

      items.forEach(item => {
        if (item.isOnSale) saleItems.push(item);
      });

      if (!container) continue;

      const title = document.createElement('h2');
      title.classList.add('subcategory-title');
      title.textContent = subcategoryName.toUpperCase();
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

  specialsData['saleSpecial'] = saleItems;
}

fetch('./assets/data/Dynamite_Sushi_Menu.json')
  .then(res => res.json())
  .then(data => {
    renderMenuFromJSON(data);
    setupFilterListeners();
  })
  .catch(err => console.error('Failed to load menu JSON:', err));