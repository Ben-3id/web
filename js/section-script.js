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
                this.showError('معرف القسم مطلوب');
                return;
            }

            // Show loading state
            this.showLoading();
            await this.loadSectionContent(categoryId);
        } catch (error) {
            console.error('Error in init:', error);
            this.showError('حدث خطأ في تحميل الصفحة');
        }
    }

    async loadSectionContent(categoryId) {
        try {
            console.log('Loading section content for categoryId:', categoryId);
            // Remove quotes from _id comparison since categoryId is a parameter
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
                    "author": author->name
                } | order(publishedAt desc)
            }`;

            const params = { categoryId };
            console.log('Query params:', params);
            const category = await client.fetch(query, params);
            console.log('Fetched category:', category);
            
            if (!category) {
                console.error('Category not found for ID:', categoryId);
                this.showError('القسم غير موجود');
                return;
            }

            if (!category.posts) {
                console.log('No posts found in category');
                category.posts = [];
            }

            this.displaySection(category);
        } catch (error) {
            console.error('Error loading section:', error);
            this.showError('حدث خطأ في تحميل البيانات');
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
            : '<p style="text-align: center; color: #666; padding: 2rem;">لا توجد مقالات متاحة في هذا القسم</p>';

        const content = `
            ${breadcrumb}
            <div class="section-content">
                <div class="section-header">
                    <h1 class="section-title">${category.title}</h1>
                    <p class="section-description">${category.description || ''}</p>
                </div>
                
                <div class="posts-section">
                    <h2 class="posts-title">المقالات المتاحة</h2>
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
        return `
            <div class="posts-grid">
                ${posts.map(post => {
                    const postUrl = post.slug ? 
                        `article.html?slug=${encodeURIComponent(post.slug.current)}` : 
                        `article.html?id=${encodeURIComponent(post._id)}`;
                    
                    return `
                        <a href="${postUrl}" class="post-card" data-post-id="${post._id}">
                            ${post.mainImage?.asset?.url ? 
                                `<div class="post-image-container">
                                    <img src="${post.mainImage.asset.url}" 
                                         alt="${post.title}" 
                                         class="post-image"
                                         loading="lazy">
                                </div>` 
                                : ''
                            }
                            <div class="post-content">
                                <h3 class="post-title">${post.title}</h3>
                                <p class="post-description">${post.description || ''}</p>
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

    showError(message) {
        this.sectionContent.innerHTML = `
            <div class="error-section">
                <h2>خطأ</h2>
                <p>${message}</p>
                <a href="../home.html" class="back-button">العودة إلى الصفحة الرئيسية</a>
            </div>
        `;
    }
}

// Initialize the section page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new SectionPage();
    } catch (error) {
        console.error('Failed to initialize section page:', error);
        document.getElementById('sectionContent').innerHTML = `
            <div class="error-section">
                <h2>خطأ في التحميل</h2>
                <p>حدث خطأ أثناء تحميل الصفحة</p>
                <a href="../home.html" class="back-button">العودة إلى الصفحة الرئيسية</a>
            </div>
        `;
    }
}); 