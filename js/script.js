import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
  projectId: '00ycpx1i',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false, // الأفضل تخليه false أثناء التطوير لتفادي الكاش
});

class IslamicWebsite {
  constructor() {
    this.sectionsGrid = document.getElementById('sectionsGrid');
    this.categoriesGrid = document.getElementById('categoriesGrid');
    this.data = { sections: [], categories: [] };
    this.init();
  }

  init() {
    this.loadSections();
    this.loadCategories();
  }

  async loadSections() {
    this.sectionsGrid.innerHTML = '<div class="loading">جاري تحميل الأقسام...</div>';
    const query = '*[_type == "section"]';
    try {
      const sections = await client.fetch(query);
      if (sections.length > 0) {
        this.data.sections = sections;
        this.renderSections();
      } else {
        this.sectionsGrid.innerHTML = '<p>لا توجد أقسام متاحة.</p>';
      }
    } catch (err) {
      console.error('خطأ في تحميل الأقسام:', err.message);
      this.sectionsGrid.innerHTML = '<p>فشل في جلب الأقسام.</p>';
    }
  }

  async loadCategories() {
    this.categoriesGrid.innerHTML = '<div class="loading">جاري تحميل التصنيفات...</div>';
    const query = '*[_type == "category"]{_id, title, description}';
    try {
      const categories = await client.fetch(query);
      if (categories.length > 0) {
        this.data.categories = categories;
        this.renderCategories();
      } else {
        this.categoriesGrid.innerHTML = '<p>لا توجد تصنيفات.</p>';
      }
    } catch (err) {
      console.error('خطأ في تحميل التصنيفات:', err.message);
      this.categoriesGrid.innerHTML = '<p>فشل في جلب التصنيفات.</p>';
    }
  }

  renderSections() {
    this.sectionsGrid.innerHTML = this.data.sections.map(section => `
      <div class="section-card">
        <h3>${section.icon || '📖'} ${section.title}</h3>
        <p>${section.description || 'بدون وصف'}</p>
        <p><strong>${(section.topics || []).length}</strong> موضوع</p>
      </div>
    `).join('');
  }

  renderCategories() {
    this.categoriesGrid.innerHTML = this.data.categories.map(cat => `
      <div class="category-card">
        <h3>${cat.title}</h3>
        <p>${cat.description || ''}</p>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new IslamicWebsite();
});
