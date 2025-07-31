import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
    projectId: '00ycpx1i',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: false, // Changed to false for consistency
});

class ArticlePage {
    constructor() {
        this.articleContent = document.querySelector('#articleContent');
        this.init();
    }

    showLoading() {
        if (this.articleContent) {
            this.articleContent.innerHTML = `
                <div class="loading-section">
                    <div class="loading-spinner"></div>
                    <h2>جاري تحميل المقال...</h2>
                    <p>يرجى الانتظار</p>
                </div>
            `;
        }
    }

    async init() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const articleId = urlParams.get('id');
            const slug = urlParams.get('slug');

            console.log('URL Parameters:', Object.fromEntries(urlParams.entries()));
            console.log('Article ID:', articleId, 'Slug:', slug);

            if (!articleId && !slug) {
                this.showError('معرف المقال أو الرابط مطلوب', 'لم يتم تحديد المقال المطلوب في الرابط');
                return;
            }

            // Show loading state
            this.showLoading();

            // Use slug if available, otherwise use id
            const identifier = slug || articleId;
            const isSlug = !!slug;
            
            await this.loadArticle(identifier, isSlug);
        } catch (error) {
            console.error('Error in init:', error);
            this.showError('حدث خطأ في تحميل الصفحة', error.message);
        }
    }

    async loadArticle(identifier, isSlug = false) {
        try {
            console.log(`Loading article with ${isSlug ? 'slug' : 'id'}:`, identifier);
            
            // Update query to use 'post' type and handle both slug and id
            const query = isSlug 
                ? `*[_type == "post" && slug.current == $identifier][0]{
                    _id,
                    title,
                    description,
                    content,
                    mainImage{
                        asset->{
                            url
                        }
                    },
                    publishedAt,
                    "author": author->name,
                    "category": category->{
                        title,
                        _id
                    }
                }`
                : `*[_type == "post" && _id == $identifier][0]{
                    _id,
                    title,
                    description,
                    content,
                    mainImage{
                        asset->{
                            url
                        }
                    },
                    publishedAt,
                    "author": author->name,
                    "category": category->{
                        title,
                        _id
                    }
                }`;

            console.log('Executing query:', query);
            const article = await client.fetch(query, { identifier });
            console.log('Fetched article:', article);

            if (!article) {
                this.showError('المقال غير موجود', 'لم يتم العثور على المقال المطلوب في قاعدة البيانات');
                return;
            }

            this.displayArticle(article);
        } catch (error) {
            console.error('Error loading article:', error);
            this.showError('حدث خطأ في تحميل المقال', `خطأ تقني: ${error.message}`);
        }
    }

    displayArticle(article) {
        const breadcrumb = `
            <div class="breadcrumb">
                <a href="../home.html">الرئيسية</a> › 
                ${article.category ? 
                    `<a href="section.html?categoryId=${article.category._id}">${article.category.title}</a> › ` : 
                    ''
                }
                <span>${article.title}</span>
            </div>
        `;

        const mainImage = article.mainImage?.asset?.url ? `
            <div class="article-image">
                <img src="${article.mainImage.asset.url}" 
                     alt="${article.title}" 
                     loading="lazy"
                     onerror="this.parentElement.style.display='none';" />
            </div>
        ` : '';

        const publishedDate = article.publishedAt ? 
            new Date(article.publishedAt).toLocaleDateString('ar-SA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '';

        const content = `
            ${breadcrumb}
            <article class="article-content">
                <header class="article-header">
                    <h1 class="article-title">${article.title}</h1>
                    <div class="article-meta">
                        ${article.author ? `<span class="article-author">الكاتب: ${article.author}</span>` : ''}
                        ${publishedDate ? `<span class="article-date">تاريخ النشر: ${publishedDate}</span>` : ''}
                    </div>
                    ${article.description ? `<p class="article-description">${article.description}</p>` : ''}
                </header>
                
                ${mainImage}
                
                <div class="article-body">
                    ${this.renderContent(article.content)}
                </div>
                
                <div class="article-footer">
                    <div class="navigation-links">
                        ${article.category ? 
                            `<a href="section.html?categoryId=${article.category._id}" class="back-button">العودة إلى ${article.category.title}</a>` : 
                            ''
                        }
                        <a href="../home.html" class="back-button secondary">العودة إلى الصفحة الرئيسية</a>
                    </div>
                </div>
            </article>
        `;

        this.articleContent.innerHTML = content;
        document.title = `${article.title} - موقع إسلامي`;
    }

    renderContent(content) {
        if (!content) return '<p>المحتوى غير متاح</p>';
        
        // Handle different content types
        if (typeof content === 'string') {
            return `<div class="article-text">${content}</div>`;
        }
        
        // Handle Portable Text content from Sanity
        if (Array.isArray(content)) {
            return content.map(block => {
                if (block._type === 'block') {
                    const text = block.children?.map(child => child.text).join('') || '';
                    const style = block.style || 'normal';
                    
                    switch (style) {
                        case 'h1':
                            return `<h2 class="content-heading">${text}</h2>`;
                        case 'h2':
                            return `<h3 class="content-subheading">${text}</h3>`;
                        case 'h3':
                            return `<h4 class="content-subheading">${text}</h4>`;
                        case 'blockquote':
                            return `<blockquote class="content-quote">${text}</blockquote>`;
                        default:
                            return `<p class="content-paragraph">${text}</p>`;
                    }
                }
                // Handle other block types like images, lists, etc.
                return '';
            }).join('');
        }
        
        return '<p>المحتوى غير متاح</p>';
    }

    showError(message, details = '') {
        if (this.articleContent) {
            this.articleContent.innerHTML = `
                <div class="error-section">
                    <div class="error-icon">⚠️</div>
                    <h2>خطأ</h2>
                    <p class="error-main">${message}</p>
                    ${details ? `<p class="error-details">${details}</p>` : ''}
                    <div class="error-actions">
                        <a href="../home.html" class="back-button primary">العودة إلى الصفحة الرئيسية</a>
                        <button onclick="window.history.back()" class="back-button secondary">العودة للصفحة السابقة</button>
                        <button onclick="window.location.reload()" class="back-button secondary">إعادة المحاولة</button>
                    </div>
                    <p class="auto-redirect">سيتم توجيهك تلقائياً إلى الصفحة الرئيسية خلال <span id="countdown">10</span> ثانية</p>
                </div>
            `;
            
            // Auto-redirect to home page after 10 seconds
            this.startAutoRedirect();
        }
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

// Initialize the article page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new ArticlePage();
    } catch (error) {
        console.error('Failed to initialize article page:', error);
        const content = document.getElementById('articleContent');
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
