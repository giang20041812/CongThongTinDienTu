import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

export const fetchPosts = async (page = 0, size = 10, categoryId?: string, status?: string, keyword?: string) => {
  try {
    let url = `${API_BASE}/posts?page=${page}&size=${size}`;
    if (categoryId) url += `&categoryId=${categoryId}`;
    if (status) url += `&status=${status}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  } catch (err) {
    console.error('Error fetching posts:', err);
    return { content: [], totalPages: 0 };
  }
};

export const uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    return data.url;
  } catch (err) {
    console.error('Error uploading image:', err);
    throw err;
  }
};

export const createPost = async (post: any) => {
  try {
    const res = await fetch(`${API_BASE}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Failed to create post');
    return await res.json();
  } catch (err) {
    console.error('Error creating post:', err);
    throw err;
  }
};

export const updatePost = async (id: string, post: any) => {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Failed to update post');
    return await res.json();
  } catch (err) {
    console.error('Error updating post:', err);
    throw err;
  }
};

export const deletePost = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return true;
  } catch (err) {
    console.error('Error deleting post:', err);
    throw err;
  }
};

export const fetchAnnouncements = async (page = 0, size = 10, status?: string, keyword?: string) => {
  try {
    let url = `${API_BASE}/announcements?page=${page}&size=${size}`;
    if (status) url += `&status=${status}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return await res.json();
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return { content: [], totalPages: 0 };
  }
};

export const createAnnouncement = async (data: any) => {
  try {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create announcement');
    return await res.json();
  } catch (err) {
    console.error('Error creating announcement:', err);
    throw err;
  }
};

export const updateAnnouncement = async (id: string, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update announcement');
    return await res.json();
  } catch (err) {
    console.error('Error updating announcement:', err);
    throw err;
  }
};

export const deleteAnnouncement = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete announcement');
    return true;
  } catch (err) {
    console.error('Error deleting announcement:', err);
    throw err;
  }
};

export const fetchCategories = async (page = 0, size = 100, keyword?: string) => {
  if (!keyword && page === 0 && cache['categories'] && Date.now() - cache['categories'].timestamp < CACHE_DURATION) {
    return cache['categories'].data;
  }
  try {
    let url = `${API_BASE}/categories?page=${page}&size=${size}`;
    if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch categories');
    const data = await res.json();
    if (!keyword && page === 0) cache['categories'] = { data, timestamp: Date.now() };
    return data;
  } catch (err) {
    console.error('Error fetching categories:', err);
    return { content: [], totalPages: 0 };
  }
};

export const fetchCategoryByPosition = async (displayOrder: number) => {
  try {
    const res = await fetch(`${API_BASE}/categories/position/${displayOrder}`);
    if (!res.ok) throw new Error('Failed to fetch category by position');
    return await res.json();
  } catch (err) {
    console.error('Error fetching category by position:', err);
    return null;
  }
};

export const createCategory = async (data: any) => {
  try {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create category');
    return await res.json();
  } catch (err) {
    console.error('Error creating category:', err);
    throw err;
  }
};

export const updateCategory = async (id: string, data: any) => {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update category');
    return await res.json();
  } catch (err) {
    console.error('Error updating category:', err);
    throw err;
  }
};

export const deleteCategory = async (id: string) => {
  try {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete category');
    return true;
  } catch (err) {
    console.error('Error deleting category:', err);
    throw err;
  }
};


export const fetchLostItems = async () => {
  try {
    const res = await fetch(`${API_BASE}/lost-found-reports`);
    if (!res.ok) throw new Error('Failed to fetch lost items');
    return await res.json();
  } catch (err) {
    console.error('Error fetching lost items:', err);
    return [];
  }
};

export const fetchSchedules = async () => {
  try {
    const res = await fetch(`${API_BASE}/schedules`);
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return await res.json();
  } catch (err) {
    console.error('Error fetching schedules:', err);
    return [];
  }
};

// --- React Hooks ---

export const usePosts = (page = 0, size = 100, categoryId?: string, status?: string, keyword?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchPosts(page, size, categoryId, status, keyword);
    setData(res.content || []);
    setTotalPages(res.totalPages || 0);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [page, size, categoryId, status, keyword]);
  
  return { data, totalPages, loading, refetch };
};

export const useCategories = (page = 0, size = 100, keyword?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchCategories(page, size, keyword);
    setData(res.content || []);
    setTotalPages(res.totalPages || 0);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [page, size, keyword]);
  
  return { data, totalPages, loading, refetch };
};


export const useAnnouncements = (page = 0, size = 100, status?: string, keyword?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchAnnouncements(page, size, status, keyword);
    setData(res.content || []);
    setTotalPages(res.totalPages || 0);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, [page, size, status, keyword]);
  
  return { data, totalPages, loading, refetch };
};

export const fetchHomepageAnnouncements = async () => {
  if (cache['homepage_announcements'] && Date.now() - cache['homepage_announcements'].timestamp < CACHE_DURATION) {
    return cache['homepage_announcements'].data;
  }
  try {
    const res = await fetch(`${API_BASE}/announcements/homepage`);
    if (!res.ok) throw new Error('Failed to fetch homepage announcements');
    const data = await res.json();
    const content = data.content || data;
    cache['homepage_announcements'] = { data: content, timestamp: Date.now() };
    return content;
  } catch (err) {
    console.error('Error fetching homepage announcements:', err);
    return [];
  }
};

export const useHomepageAnnouncements = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchHomepageAnnouncements();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);
  
  return { data, loading, refetch };
};

export const useLostItems = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLostItems().then(res => { setData(res); setLoading(false); });
  }, []);
  return { data, loading };
};


export const useSchedules = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchSchedules().then(res => { setData(res); setLoading(false); });
  }, []);
  return { data, loading };
};

export const fetchHomepageData = async () => {
  try {
    const catsRes = await fetchCategories(0, 100);
    const categories = catsRes.content || [];
    let homepageCategories = categories
      .filter((c: any) => c.displayOrder != null && c.displayOrder > 0 && c.displayOrder <= 9)
      .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

    if (homepageCategories.length === 0) {
      homepageCategories = categories.slice(0, 4);
    }

    const sections = await Promise.all(
      homepageCategories.map(async (cat: any) => {
        const postsRes = await fetchPosts(0, 5, cat.id, 'PUBLISHED');
        return {
          category: cat,
          posts: postsRes.content || []
        };
      })
    );

    const topSections = sections.length > 0 ? sections.slice(0, 1) : [];
    const bottomSections = sections.length > 1 ? sections.slice(1) : [];

    return { topSections, bottomSections };
  } catch (err) {
    console.error('[fetchHomepageData] Caught error:', err);
    return { topSections: [], bottomSections: [] };
  }
};

export const useHomepageData = () => {
  const [data, setData] = useState<any>({ topSections: [], bottomSections: [] });
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchHomepageData().then(res => { setData(res); setLoading(false); });
  }, []);
  return { data, loading };
};
