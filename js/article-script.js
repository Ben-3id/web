import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
    projectId: '00ycpx1i',
    dataset: 'production',
    apiVersion: '2023-01-01',
    useCdn: true,
});

class ArticlePage {
    constructor() {
        this.articleContent = document.querySelector('#articleContent');
        this.init();
    }

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const articleId = urlParams.get('id');
        const slug = urlParams.get('slug');

        if (!articleId && !slug) {
            this.showError('معرف المقال أو الرابط مطلوب');
            return;
        }

        // Use slug if available, otherwise use id
        const identifier = slug || articleId;
        const isSlug = !!slug;
        
        await this.loadArticle(identifier, isSlug);
    }

    async loadArticle(identifier, isSlug = false) {
        try {
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

            const article = await client.fetch(query, { identifier });

            if (!article) {
                this.showError('المقال غير موجود');
                return;
            }

            this.displayArticle(article);
        } catch (error) {
            console.error('Error loading article:', error);
            this.showError('حدث خطأ في تحميل المقال');
        }
    }

    displayArticle(article) {
        const breadcrumb = `
            <div class="breadcrumb">
                <a href="../home.html">الرئيسية</a> › 
                <a href="section.html?categoryId=${article.category._id}">${article.category.title}</a> › 
                <span>${article.title}</span>
            </div>
        `;

        const mainImage = article.mainImage?.asset?.url ? `
            <div class="article-image">
                <img src="${article.mainImage.asset.url}" alt="${article.title}" />
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
            </article>
        `;

        this.articleContent.innerHTML = content;
        document.title = `${article.title} - موقع إسلامي`;
    }

    renderContent(content) {
        if (!content) return '';
        
        // Handle different content types
        if (typeof content === 'string') {
            return `<p>${content}</p>`;
        }
        
        // Handle Portable Text content from Sanity
        if (Array.isArray(content)) {
            return content.map(block => {
                if (block._type === 'block') {
                    return `<p>${block.children?.map(child => child.text).join('') || ''}</p>`;
                }
                return '';
            }).join('');
        }
        
        return '<p>المحتوى غير متاح</p>';
    }

    showError(message) {
        if (this.articleContent) {
            this.articleContent.innerHTML = `
                <div class="error-section">
                    <h2>خطأ</h2>
                    <p>${message}</p>
                    <a href="../home.html" class="back-button">العودة إلى الصفحة الرئيسية</a>
                </div>
            `;
        }
    }
}

// Initialize the article page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ArticlePage();
});
