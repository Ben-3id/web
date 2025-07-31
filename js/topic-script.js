// Topic Page JavaScript Functionality
import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
  projectId: '00ycpx1i',
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: false,
});

class TopicPage {
    constructor() {
        this.currentTopic = null;
        this.currentSection = null;
        this.pdfDocument = null;
        this.currentPage = 1;
        this.totalPages = 1;
        this.zoomLevel = 1.0;
        this.init();
    }

    init() {
        this.loadTopicData();
        this.setupEventListeners();
        this.setupTabFunctionality();
        this.setupPdfViewer();
    }

    async loadTopicData() {
        try {
            // Get URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const sectionId = urlParams.get('sectionId');
            const topicId = urlParams.get('topicId');

            if (!sectionId || !topicId) {
                this.showError('معرف القسم أو الموضوع غير موجود');
                return;
            }

            // For now, show a message that this feature is under development
            // since the current Sanity schema doesn't include sections/topics structure
            this.showError('هذه الميزة قيد التطوير. يرجى استخدام صفحات الأقسام والمقالات بدلاً من ذلك.');
            return;

            // TODO: Implement proper Sanity queries when the schema is updated
            // const query = `*[_type == "section" && _id == $sectionId][0]{
            //     _id,
            //     title,
            //     description,
            //     "topics": *[_type == "topic" && references(^._id) && _id == $topicId][0]{
            //         _id,
            //         title,
            //         description,
            //         content,
            //         blogs,
            //         pdfs,
            //         chapters
            //     }
            // }`;
            // 
            // const section = await client.fetch(query, { sectionId, topicId });

        } catch (error) {
            console.error('Error loading topic data:', error);
            this.showError('حدث خطأ أثناء تحميل البيانات');
        }
    }

    renderTopicPage() {
        // Update page title
        document.title = `${this.currentTopic.title} - موقع إسلامي`;
        
        // Update breadcrumb
        document.getElementById('sectionLink').textContent = this.currentSection.title;
        document.getElementById('sectionLink').href = `section.html?sectionId=${this.currentSection.id}`;
        document.getElementById('topicTitle').textContent = this.currentTopic.title;
        
        // Update topic header
        document.getElementById('topicTitleHeader').textContent = this.currentTopic.title;
        document.getElementById('topicSection').textContent = this.currentSection.title;
        document.getElementById('topicDate').textContent = this.getCurrentDate();
        document.getElementById('topicDescription').textContent = this.currentTopic.description;
    }

    getCurrentDate() {
        const now = new Date();
        return now.toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    setupEventListeners() {
        // Back button functionality
        const backButton = document.querySelector('.back-button');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back();
            });
        }
    }

    setupTabFunctionality() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
            });
        });
    }

    setupPdfViewer() {
        // PDF Modal controls
        const pdfModal = document.getElementById('pdfModal');
        const closeBtn = document.getElementById('closePdfModal');
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const zoomInBtn = document.getElementById('zoomIn');
        const zoomOutBtn = document.getElementById('zoomOut');
        const downloadBtn = document.getElementById('downloadPdf');

        // Close modal
        closeBtn.addEventListener('click', () => {
            this.closePdfModal();
        });

        // Close modal when clicking outside
        pdfModal.addEventListener('click', (e) => {
            if (e.target === pdfModal) {
                this.closePdfModal();
            }
        });

        // PDF navigation
        prevBtn.addEventListener('click', () => {
            this.previousPage();
        });

        nextBtn.addEventListener('click', () => {
            this.nextPage();
        });

        // Zoom controls
        zoomInBtn.addEventListener('click', () => {
            this.zoomIn();
        });

        zoomOutBtn.addEventListener('click', () => {
            this.zoomOut();
        });

        // Download functionality
        downloadBtn.addEventListener('click', () => {
            this.downloadPdf();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (pdfModal.classList.contains('active')) {
                switch(e.key) {
                    case 'Escape':
                        this.closePdfModal();
                        break;
                    case 'ArrowLeft':
                        this.previousPage();
                        break;
                    case 'ArrowRight':
                        this.nextPage();
                        break;
                }
            }
        });
    }

    loadBlogPosts() {
        const blogGrid = document.getElementById('blogGrid');
        
        // Sample blog posts data
        const blogPosts = [
            {
                id: 1,
                title: 'أساسيات التوحيد في الإسلام',
                excerpt: 'التوحيد هو أساس العقيدة الإسلامية وأول أركان الإيمان. في هذا المقال نتعرف على معنى التوحيد وأقسامه...',
                author: 'الشيخ أحمد محمد',
                date: '2024-01-15',
                tags: ['التوحيد', 'العقيدة', 'أساسيات'],
                readTime: '5 دقائق'
            },
            {
                id: 2,
                title: 'أركان الإيمان الستة',
                excerpt: 'الإيمان بالله وملائكته وكتبه ورسله واليوم الآخر والقدر خيره وشره. تعرف على تفاصيل كل ركن...',
                author: 'الشيخ محمد علي',
                date: '2024-01-10',
                tags: ['الإيمان', 'الأركان', 'عقيدة'],
                readTime: '8 دقائق'
            },
            {
                id: 3,
                title: 'الشرك وأنواعه',
                excerpt: 'الشرك هو أعظم الذنوب وأخطرها على العقيدة. نتعرف في هذا المقال على أنواع الشرك وكيفية الوقاية منه...',
                author: 'الشيخ عبدالله أحمد',
                date: '2024-01-05',
                tags: ['الشرك', 'الذنوب', 'الوقاية'],
                readTime: '6 دقائق'
            }
        ];

        blogGrid.innerHTML = blogPosts.map(post => `
            <div class="blog-card" onclick="window.topicPage.openBlogPost(${post.id})">
                <div class="blog-card-header">
                    <h3 class="blog-card-title">${post.title}</h3>
                    <div class="blog-card-meta">
                        <span>${post.author}</span>
                        <span>${post.date}</span>
                        <span>${post.readTime}</span>
                    </div>
                </div>
                <p class="blog-card-excerpt">${post.excerpt}</p>
                <div class="blog-card-footer">
                    <div class="blog-tags">
                        ${post.tags.map(tag => `<span class="blog-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more-btn">اقرأ المزيد</button>
                </div>
            </div>
        `).join('');
    }

    loadPdfDocuments() {
        const pdfGrid = document.getElementById('pdfGrid');
        
        // Sample PDF documents
        const pdfDocuments = [
            {
                id: 1,
                title: 'كتاب التوحيد',
                author: 'الشيخ محمد بن عبدالوهاب',
                pages: 150,
                size: '2.5 MB',
                url: 'https://example.com/book1.pdf',
                description: 'كتاب في التوحيد وأقسامه وأحكامه'
            },
            {
                id: 2,
                title: 'أصول الإيمان',
                author: 'الشيخ عبدالرحمن السعدي',
                pages: 200,
                size: '3.1 MB',
                url: 'https://example.com/book2.pdf',
                description: 'شرح لأصول الإيمان وأركانه'
            },
            {
                id: 3,
                title: 'عقيدة أهل السنة',
                author: 'الشيخ محمد بن صالح العثيمين',
                pages: 180,
                size: '2.8 MB',
                url: 'https://example.com/book3.pdf',
                description: 'عقيدة أهل السنة والجماعة'
            }
        ];

        pdfGrid.innerHTML = pdfDocuments.map(doc => `
            <div class="pdf-card">
                <div class="pdf-icon">📄</div>
                <h3 class="pdf-card-title">${doc.title}</h3>
                <p class="pdf-card-info">
                    <strong>المؤلف:</strong> ${doc.author}<br>
                    <strong>الصفحات:</strong> ${doc.pages}<br>
                    <strong>الحجم:</strong> ${doc.size}
                </p>
                <p class="pdf-card-info">${doc.description}</p>
                <div class="pdf-card-actions">
                    <button class="pdf-action-btn" onclick="window.topicPage.openPdf('${doc.url}', '${doc.title}')">
                        عرض
                    </button>
                    <button class="pdf-action-btn download" onclick="window.topicPage.downloadPdfFile('${doc.url}', '${doc.title}')">
                        تحميل
                    </button>
                </div>
            </div>
        `).join('');
    }

    loadChapters() {
        const chaptersList = document.getElementById('chaptersList');
        
        if (this.currentTopic.chapters && this.currentTopic.chapters.length > 0) {
            chaptersList.innerHTML = this.currentTopic.chapters.map((chapter, index) => `
                <div class="chapter-item" onclick="window.topicPage.openChapter(${index + 1})">
                    <div class="chapter-number">الفصل ${index + 1}</div>
                    <div class="chapter-title">${chapter}</div>
                    <div class="chapter-description">
                        شرح مفصل للفصل ${index + 1} من موضوع ${this.currentTopic.title}
                    </div>
                </div>
            `).join('');
        } else {
            chaptersList.innerHTML = '<p>لا توجد فصول متاحة لهذا الموضوع</p>';
        }
    }

    openBlogPost(postId) {
        // In a real application, this would navigate to a blog post page
        alert(`فتح المقال رقم ${postId}`);
    }

    openChapter(chapterNumber) {
        // In a real application, this would navigate to a chapter page
        alert(`فتح الفصل ${chapterNumber}`);
    }

    async openPdf(pdfUrl, title) {
        try {
            const pdfModal = document.getElementById('pdfModal');
            const modalTitle = document.getElementById('pdfModalTitle');
            
            modalTitle.textContent = title;
            pdfModal.classList.add('active');
            
            // Load PDF using PDF.js
            const loadingTask = pdfjsLib.getDocument(pdfUrl);
            this.pdfDocument = await loadingTask.promise;
            
            this.totalPages = this.pdfDocument.numPages;
            this.currentPage = 1;
            this.zoomLevel = 1.0;
            
            this.updatePageInfo();
            this.renderPage();
            
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('حدث خطأ أثناء تحميل الملف');
        }
    }

    async renderPage() {
        try {
            const page = await this.pdfDocument.getPage(this.currentPage);
            const canvas = document.getElementById('pdfCanvas');
            const context = canvas.getContext('2d');
            
            const viewport = page.getViewport({ scale: this.zoomLevel });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
        } catch (error) {
            console.error('Error rendering PDF page:', error);
        }
    }

    updatePageInfo() {
        document.getElementById('currentPage').textContent = this.currentPage;
        document.getElementById('totalPages').textContent = this.totalPages;
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.updatePageInfo();
            this.renderPage();
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.updatePageInfo();
            this.renderPage();
        }
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel * 1.2, 3.0);
        this.renderPage();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel / 1.2, 0.5);
        this.renderPage();
    }

    closePdfModal() {
        const pdfModal = document.getElementById('pdfModal');
        pdfModal.classList.remove('active');
        this.pdfDocument = null;
    }

    downloadPdf() {
        if (this.pdfDocument) {
            // In a real application, this would trigger a download
            alert('جاري تحميل الملف...');
        }
    }

    downloadPdfFile(url, title) {
        // In a real application, this would trigger a download
        alert(`جاري تحميل ${title}...`);
    }

    showError(message) {
        const topicContent = document.querySelector('.topic-content');
        topicContent.innerHTML = `
            <div class="error-topic">
                <h2>خطأ</h2>
                <p>${message}</p>
                <button class="back-button" onclick="window.history.back()">العودة</button>
            </div>
        `;
    }
}

// Initialize topic page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.topicPage = new TopicPage();
        console.log('Topic page initialized successfully');
    } catch (error) {
        console.error('Failed to initialize topic page:', error);
    }
});

// Export for external use
window.TopicPageUtils = {
    // Function to get current topic
    getCurrentTopic: () => {
        return window.topicPage ? window.topicPage.currentTopic : null;
    },

    // Function to get current section
    getCurrentSection: () => {
        return window.topicPage ? window.topicPage.currentSection : null;
    },

    // Function to open PDF
    openPdf: (url, title) => {
        if (window.topicPage) {
            window.topicPage.openPdf(url, title);
        }
    },

    // Function to open blog post
    openBlogPost: (postId) => {
        if (window.topicPage) {
            window.topicPage.openBlogPost(postId);
        }
    }
}; 