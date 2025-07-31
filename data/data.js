import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
  projectId: '00ycpx1i', // غيّره حسب مشروعك
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false, // Changed to false for consistency with section-script.js
});

// Function to show loading state
function showLoading() {
    const container = document.getElementById("sectionsGrid");
    if (container) {
        container.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <h3>جاري تحميل الأقسام...</h3>
                <p>يرجى الانتظار</p>
            </div>
        `;
    }
}

// Function to show error with auto-redirect
function showError(message, details = '') {
    const container = document.getElementById("sectionsGrid");
    if (container) {
        container.innerHTML = `
            <div class="error-section">
                <div class="error-icon">⚠️</div>
                <h3>خطأ في تحميل البيانات</h3>
                <p class="error-main">${message}</p>
                ${details ? `<p class="error-details">${details}</p>` : ''}
                <div class="error-actions">
                    <button onclick="window.location.reload()" class="back-button primary">إعادة المحاولة</button>
                    <button onclick="loadCategoriesWithFallback()" class="back-button secondary">استخدام البيانات المحلية</button>
                </div>
                <p class="auto-redirect">سيتم إعادة المحاولة تلقائياً خلال <span id="countdown">15</span> ثانية</p>
            </div>
        `;
        
        // Auto-retry after 15 seconds
        let countdown = 15;
        const countdownElement = document.getElementById('countdown');
        const timer = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.reload();
            }
        }, 1000);
    }
}

// Improved query for categories with better error handling
const query = `
  *[_type == "category"] | order(_createdAt desc) {
    _id,
    title,
    description,
    "posts": *[_type == "post" && references(^._id)] {
      _id,
      title,
      slug,
      description,
      publishedAt,
      "author": author->name
    } | order(publishedAt desc)
  }
`;

// Function to load categories with fallback data
function loadCategoriesWithFallback() {
    const fallbackCategories = [
        {
            _id: 'fallback-1',
            title: 'القرآن الكريم',
            description: 'تفسير وعلوم القرآن الكريم',
            posts: []
        },
        {
            _id: 'fallback-2',
            title: 'الحديث الشريف',
            description: 'شروح وعلوم الحديث النبوي',
            posts: []
        },
        {
            _id: 'fallback-3',
            title: 'الفقه الإسلامي',
            description: 'أحكام وفتاوى فقهية',
            posts: []
        }
    ];
    
    displayCategories(fallbackCategories);
}

// Function to display categories
function displayCategories(categories) {
    const container = document.getElementById("sectionsGrid");
    if (!container) {
        console.warn("عنصر sectionsGrid غير موجود في الصفحة.");
        return;
    }
    
    if (!categories || categories.length === 0) {
        container.innerHTML = `
            <div class="no-categories-message">
                <h3>لا توجد أقسام متاحة</h3>
                <p>لم يتم إنشاء أي أقسام حتى الآن. يرجى المحاولة لاحقاً.</p>
                <button onclick="window.location.reload()" class="back-button">إعادة المحاولة</button>
            </div>
        `;
        return;
    }

    container.innerHTML = categories.map(cat => `
        <div class="category-card" onclick="navigateToSection('${cat._id}', '${cat.title}')" 
             onkeypress="if(event.key==='Enter') navigateToSection('${cat._id}', '${cat.title}')" 
             tabindex="0" role="button" aria-label="انتقل إلى قسم ${cat.title}">
            <div class="category-content">
                <h2 class="category-title">${cat.title}</h2>
                <p class="category-description">${cat.description || "لا يوجد وصف"}</p>
                <div class="category-meta">
                    <span class="post-count">${cat.posts?.length || 0} مقال</span>
                    <span class="category-arrow">←</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Function to handle navigation with error checking
function navigateToSection(categoryId, categoryTitle) {
    try {
        const url = `pages/section.html?categoryId=${encodeURIComponent(categoryId)}`;
        console.log(`Navigating to section: ${categoryTitle} (${categoryId})`);
        window.location.href = url;
    } catch (error) {
        console.error('Navigation error:', error);
        alert('حدث خطأ أثناء الانتقال إلى القسم. يرجى المحاولة مرة أخرى.');
    }
}

// Make navigateToSection available globally
window.navigateToSection = navigateToSection;
window.loadCategoriesWithFallback = loadCategoriesWithFallback;

// Main execution with improved error handling
async function loadCategories() {
    try {
        showLoading();
        
        console.log('Loading categories...');
        const categories = await client.fetch(query);
        console.log('Fetched categories:', categories);
        
        displayCategories(categories);
        
    } catch (err) {
        console.error("خطأ في جلب التصنيفات:", err);
        showError('فشل في تحميل الأقسام من الخادم', err.message);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
});

// Retry mechanism for network issues
window.addEventListener('online', () => {
    console.log('Connection restored, reloading categories...');
    loadCategories();
});

window.addEventListener('offline', () => {
    console.log('Connection lost, showing offline message...');
    showError('انقطع الاتصال بالإنترنت', 'يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
});
