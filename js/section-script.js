import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
  projectId: '00ycpx1i',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false, // الأفضل تخليه false أثناء التطوير لتفادي الكاش
});

// Section Page JavaScript Functionality
class SectionPage {
    constructor() {
        this.sectionContent = document.querySelector('#sectionContent');
        this.init();
    }

    showLoading() {
        this.sectionContent.innerHTML = `
            <div class="loading-section">
                <div class="loading-spinner"></div>
                <h2>جاري التحميل...</h2>
                <p>يرجى الانتظار</p>
            </div>
        `;
    }

    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const categoryId = urlParams.get('categoryId');
            
            console.log('URL Parameters:', Object.fromEntries(urlParams.entries()));
            console.log('Category ID from URL:', categoryId);

            if (!categoryId) {
                this.showError('معرف القسم مطلوب', 'لم يتم تحديد القسم المطلوب في الرابط');
                return;
            }

            // Show loading state
            this.showLoading();
            await this.loadSectionContent(categoryId);
        } catch (error) {
            console.error('Error in init:', error);
            this.showError('حدث خطأ في تحميل الصفحة', error.message);
        }
    }

    async loadSectionContent(categoryId) {
        try {
            console.log('Loading section content for categoryId:', categoryId);
            
            // Updated query to better handle the relationship between categories and posts
            const query = `*[_type == "category" && _id == $categoryId][0]{
                _id,
                title,
                description,
                "posts": *[_type == "post" && references(^._id)] {
                    _id,
                    title,
                    slug,
                    description,
                    mainImage {
                        asset-> {
                            _id,
                            url
                        }
                    },
                    publishedAt,
                    "author": author->name,
                    "category": category->{_id, title}
                } | order(publishedAt desc)
            }`;

            const params = { categoryId };
            console.log('Query params:', params);
            console.log('Executing query:', query);
            
            const category = await client.fetch(query, params);
            console.log('Fetched category:', category);
            
            if (!category) {
                console.error('Category not found for ID:', categoryId);
                this.showError('القسم غير موجود', 'لم يتم العثور على القسم المطلوب في قاعدة البيانات');
                return;
            }

            // Ensure posts array exists
            if (!category.posts) {
                console.log('No posts found in category, trying alternative query');
                // Try alternative query to find posts
                const alternativeQuery = `*[_type == "post" && category._ref == $categoryId] {
                    _id,
                    title,
                    slug,
                    description,
                    mainImage {
                        asset-> {
                            _id,
                            url
                        }
                    },
                    publishedAt,
                    "author": author->name,
                    "category": category->{_id, title}
                } | order(publishedAt desc)`;
                
                const posts = await client.fetch(alternativeQuery, params);
                console.log('Alternative posts query result:', posts);
                category.posts = posts || [];
            }

            this.displaySection(category);
        } catch (error) {
            console.error('Error loading section:', error);
            this.showError('حدث خطأ في تحميل البيانات', `خطأ تقني: ${error.message}`);
        }
    }

    displaySection(category) {
        const breadcrumb = `
            <div class="breadcrumb">
                <a href="../home.html">الرئيسية</a> › 
                <span>${category.title}</span>
            </div>
        `;

        const postsList = category.posts && category.posts.length > 0 
            ? this.renderPostsGrid(category.posts)
            : `<div class="no-posts-message">
                <h3>لا توجد مقالات متاحة</h3>
                <p>لم يتم نشر أي مقالات في هذا القسم حتى الآن. يرجى المحاولة لاحقاً أو تصفح أقسام أخرى.</p>
                <a href="../home.html" class="back-button">العودة إلى الصفحة الرئيسية</a>
               </div>`;

        const content = `
            ${breadcrumb}
            <div class="section-content">
                <div class="section-header">
                    <h1 class="section-title">${category.title}</h1>
                    <p class="section-description">${category.description || ''}</p>
                </div>
                
                <div class="posts-section">
                    <h2 class="posts-title">المقالات المتاحة (${category.posts?.length || 0})</h2>
                    ${postsList}
                </div>
            </div>
        `;

        this.sectionContent.innerHTML = content;

        // Update page title
        document.title = `${category.title} - موقع إسلامي`;
    }

    renderPostsGrid(posts) {
        console.log('Rendering posts:', posts);
        if (!posts || posts.length === 0) {
            return '<p style="text-align: center; color: #666; padding: 2rem;">لا توجد مقالات متاحة في هذا القسم</p>';
        }

        return `
            <div class="posts-grid">
                ${posts.map(post => {
                    const postUrl = post.slug?.current ? 
                        `article.html?slug=${encodeURIComponent(post.slug.current)}` : 
                        `article.html?id=${encodeURIComponent(post._id)}`;
                    
                    return `
                        <a href="${postUrl}" class="post-card" data-post-id="${post._id}">
                            ${post.mainImage?.asset?.url ? 
                                `<div class="post-image-container">
                                    <img src="${post.mainImage.asset.url}" 
                                         alt="${post.title}" 
                                         class="post-image"
                                         loading="lazy"
                                         onerror="this.parentElement.style.display='none';">
                                </div>` 
                                : '<div class="post-image-placeholder"><span>📖</span></div>'
                            }
                            <div class="post-content">
                                <h3 class="post-title">${post.title}</h3>
                                <p class="post-description">${post.description || 'اقرأ المزيد...'}</p>
                                <div class="post-meta">
                                    ${post.author ? `<span class="post-author">الكاتب: ${post.author}</span>` : ''}
                                    ${post.publishedAt ? 
                                        `<span class="post-date">${new Date(post.publishedAt).toLocaleDateString('ar-SA')}</span>` 
                                        : ''
                                    }
                                </div>
                            </div>
                        </a>
                    `;
                }).join('')}
            </div>
        `;
    }

    showError(message, details = '') {
        this.sectionContent.innerHTML = `
            <div class="error-section">
                <div class="error-icon">⚠️</div>
                <h2>خطأ</h2>
                <p class="error-main">${message}</p>
                ${details ? `<p class="error-details">${details}</p>` : ''}
                <div class="error-actions">
                    <a href="../home.html" class="back-button primary">العودة إلى الصفحة الرئيسية</a>
                    <button onclick="window.location.reload()" class="back-button secondary">إعادة المحاولة</button>
                </div>
                <p class="auto-redirect">سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال <span id="countdown">10</span> ثانية</p>
            </div>
        `;
        
        // Auto-redirect to home page after 10 seconds
        this.startAutoRedirect();
    }

    startAutoRedirect() {
        let countdown = 10;
        const countdownElement = document.getElementById('countdown');
        
        const timer = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(timer);
                window.location.href = '../home.html';
            }
        }, 1000);
    }
}

// Initialize the section page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SectionPage();
    } catch (error) {
        console.error('Failed to initialize section page:', error);
        const content = document.getElementById('sectionContent');
        if (content) {
            content.innerHTML = `
                <div class="error-section">
                    <div class="error-icon">❌</div>
                    <h2>خطأ في التحميل</h2>
                    <p class="error-main">حدث خطأ أثناء تحميل الصفحة</p>
                    <p class="error-details">${error.message}</p>
                    <div class="error-actions">
                        <a href="../home.html" class="back-button primary">العودة إلى الصفحة الرئيسية</a>
                    </div>
                </div>
            `;
        }
    }
}); 