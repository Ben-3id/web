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

        if (!articleId) {
            this.showError('معرف المقال مطلوب');
            return;
        }

        await this.loadArticle(articleId);
    }

    async loadArticle(articleId) {
        try {
            const query = `*[_type == "article" && _id == $articleId][0]{
                title,
                introduction,
                content,
                mainImage{
                    asset->{
                        url
                    }
                },
                publishedAt,
                keyFeatures,
                references,
                tags,
                "category": category->{
                    title,
                    _id
                }
            }`;

            const article = await client.fetch(query, { articleId });

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

        const keyFeatures = article.keyFeatures?.length ? `
            <div class="key-features">
                <h2>النقاط الرئيسية</h2>
                <ul>
                    ${article.keyFeatures.map(feature => `<li>${feature}</li>`).join('')}
                </ul>
            </div>
        ` : '';

        const references = article.references?.length ? `
            <div class="references">
                <h2>المراجع</h2>
                <ul>
                    ${article.references.map(ref => `
                        <li>
                            <strong>${ref.title}</strong>
                            ${ref.source ? ` - ${ref.source}` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        ` : '';

        const tags = article.tags?.length ? `
            <div class="article-tags">
                ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        ` : '';

        const content = `
            ${breadcrumb}
            <article class="article">
                <header class="article-header">
                    <h1 class="article-title">${article.title}</h1>
                    ${article.publishedAt ? 
                        `<time class="article-date">${new Date(article.publishedAt).toLocaleDateString('ar-SA')}</time>` 
                        : ''}
                </header>
                
                ${mainImage}
                
                <div class="article-introduction">
                    ${article.introduction || ''}
                </div>

                <div class="article-content">
                    ${this.renderContent(article.content)}
                </div>

                ${keyFeatures}
                ${references}
                ${tags}
            </article>
        `;

        if (this.articleContent) {
            this.articleContent.innerHTML = content;
            document.title = `${article.title} - موقع إسلامي`;
        }
    }

    renderContent(content) {
        // This is a simple rendering - you might want to use a more sophisticated
        // renderer for Portable Text from Sanity
        return content ? content.map(block => {
            if (block._type === 'block') {
                return `<p>${block.children.map(child => child.text).join('')}</p>`;
            }
            return '';
        }).join('') : '';
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
