const authorId = 'b7f8c14e-9b2f-4c12-a1b7-e2c8a14b3d7c';
const nhatruongImg = 'http://res.cloudinary.com/kttdfqzj/image/upload/v1791082503/lxz2u4vyrhpny8zaqcmv.jpg';
const dothatlacImg = 'http://res.cloudinary.com/kttdfqzj/image/upload/v1791082468/wvcltvda5anr4fw7c1ur.jpg';

const categoriesToCreate = [
  { code: 'NEWS', name: 'Tin nhà trường' },
  { code: 'YOUTH', name: 'Hoạt động thanh niên' },
  { code: 'CLUB', name: 'Hoạt động câu lạc bộ' },
  { code: 'ADMISSION', name: 'Tuyển sinh' },
  { code: 'OLYMPIC', name: 'Các kỳ thi HSG - Olympic' },
  { code: 'STEM', name: 'Nghiên cứu khoa học - STEM' },
  { code: 'STUDY_ABROAD', name: 'Du học' }
];

async function seed() {
  console.log('Fetching existing categories...');
  const resCats = await fetch('http://127.0.0.1:8080/api/categories');
  const existingCats = await resCats.json();
  const catMap = {};
  
  for (const c of categoriesToCreate) {
    const existing = existingCats.find(e => e.code === c.code);
    if (existing) {
      console.log('Updating', c.name);
      await fetch('http://127.0.0.1:8080/api/categories/' + existing.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      catMap[c.code] = existing.id;
    } else {
      console.log('Creating', c.name);
      const res = await fetch('http://127.0.0.1:8080/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(c)
      });
      const data = await res.json();
      catMap[c.code] = data.id;
    }
  }

  // Create Posts
  console.log('Creating posts...');
  for (const [code, catId] of Object.entries(catMap)) {
    for (let i = 1; i <= 3; i++) {
      const post = {
        title: 'Tin tức ' + code + ' số ' + i,
        slug: code.toLowerCase() + '-' + i,
        category: { id: catId },
        imgUrl: nhatruongImg,
        bannerUrl: nhatruongImg,
        blocks: [
          { type: 'TEXT', content: 'Đây là nội dung mẫu cho bài viết số ' + i + ' thuộc chuyên mục ' + code + '. Bài viết cung cấp các thông tin hữu ích và cập nhật mới nhất cho học sinh, phụ huynh và giáo viên.', orderIndex: 0 },
          { type: 'IMAGE', imageUrl: nhatruongImg, content: 'Ảnh minh họa bài viết', orderIndex: 1 }
        ]
      };
      await fetch('http://127.0.0.1:8080/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
    }
  }

  // Create Announcements
  console.log('Creating announcements...');
  for (let i = 1; i <= 4; i++) {
    await fetch('http://127.0.0.1:8080/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Thông báo quan trọng số ' + i,
        content: 'Đây là nội dung chi tiết của thông báo số ' + i + '. Yêu cầu toàn thể học sinh và giáo viên chú ý thực hiện.',
        author: { id: authorId },
        department: 'Ban Giám Hiệu',
        isImportant: i === 1,
        fileAttachmentUrl: 'https://example.com/TB-NghiLe-29.pdf',
        fileAttachmentName: 'TB-NghiLe-29.pdf',
        announcementNumber: '142/TB-CVA-2026',
        recipient: 'Toàn thể Cán bộ, Giáo viên, Nhân viên và Học sinh nhà trường',
        actionRequired: 'Yêu cầu các đơn vị có liên quan nghiên cứu kỹ các văn bản hướng dẫn nghiệp vụ đính kèm, chuẩn bị đầy đủ các điều kiện cơ sở vật chất, hồ sơ dự thi và thực hiện đúng thời hạn quy định. Trong quá trình triển khai, nếu có vướng mắc phát sinh, các tổ chuyên môn kịp thời báo cáo Ban Giám hiệu qua Văn phòng trường để được hướng dẫn giải quyết.',
        status: 'PUBLISHED',
        views: 0
      })
    });
  }

  // Create Lost & Found
  console.log('Creating lost & found...');
  for (let i = 1; i <= 4; i++) {
    await fetch('http://127.0.0.1:8080/api/lost-found-reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'Đồ vật thất lạc ' + i,
        description: 'Mô tả chi tiết đồ vật thất lạc số ' + i + '. Ai nhặt được vui lòng liên hệ phòng quản sinh.',
        location: 'Khu vực sân trường',
        contactInfo: 'Phòng Quản sinh',
        status: i % 2 === 0 ? 'RETURNED' : 'PENDING',
        imageUrl: dothatlacImg,
        views: 0
      })
    });
  }

  // Create Schedules
  console.log('Creating schedules...');
  for (let i = 1; i <= 4; i++) {
    await fetch('http://127.0.0.1:8080/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Lịch trình sự kiện ' + i,
        description: 'Mô tả sự kiện ' + i,
        startTime: '2026-10-10T08:00:00Z',
        endTime: '2026-10-10T11:00:00Z',
        location: 'Hội trường lớn',
        type: 'WORK',
        relatedUser: { id: authorId }
      })
    });
  }

  console.log('DONE!');
}

seed().catch(console.error);
