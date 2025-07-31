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
    this.data = { sections: [] };
    this.init();
  }

  init() {
    // Only load sections if sectionsGrid exists (for other pages that might use this)
    if (this.sectionsGrid) {
      this.loadSections();
    }
  }

  async loadSections() {
    if (!this.sectionsGrid) {
      console.warn('sectionsGrid element not found');
      return;
    }

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

  renderSections() {
    if (!this.sectionsGrid) return;
    
    this.sectionsGrid.innerHTML = this.data.sections.map(section => `
      <div class="section-card">
        <h3>${section.icon || '📖'} ${section.title}</h3>
        <p>${section.description || 'بدون وصف'}</p>
        <p><strong>${(section.topics || []).length}</strong> موضوع</p>
      </div>
    `).join('');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new IslamicWebsite();
});
