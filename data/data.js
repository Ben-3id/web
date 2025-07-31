import { createClient } from 'https://cdn.skypack.dev/@sanity/client';

const client = createClient({
  projectId: '00ycpx1i', // غيّره حسب مشروعك
  dataset: 'production',
  apiVersion: '2023-01-01',
  useCdn: true,
});

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', async () => {
  // الاستعلام لجلب التصنيفات مع البوستات المرتبطة بكل تصنيف
  const query = `
    *[_type == "category"]{
      _id,
      title,
      description,
      "posts": *[_type == "post" && references(^._id)]{
        _id,
        title,
        publishedAt,
        "author": author->name
      }
    }
  `;

  try {
    const categories = await client.fetch(query);
    const container = document.getElementById("sectionsGrid");
    
    if (!container) {
      console.warn("عنصر sectionsGrid غير موجود في الصفحة.");
      return;
    }
    
    if (!categories.length) {
      container.innerHTML = "<p>لا توجد تصنيفات حتى الآن.</p>";
      return;
    }

    container.innerHTML = categories.map(cat => `
      <div class="category-card" onclick="window.location.href='pages/section.html?categoryId=${cat._id}'">
        <div class="category-content">
          <h2 class="category-title">${cat.title}</h2>
          <p class="category-description">${cat.description || "لا يوجد وصف"}</p>
          <div class="category-meta">
            <span class="post-count">${cat.posts?.length || 0} مقال</span>
            <span class="category-arrow">→</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error("خطأ في جلب التصنيفات:", err.message);
    const container = document.getElementById("sectionsGrid");
    if (container) {
      container.innerHTML = "<p>حدث خطأ في تحميل الأقسام. يرجى المحاولة مرة أخرى.</p>";
    }
  }
});
