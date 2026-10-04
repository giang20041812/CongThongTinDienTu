import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080/api';

export const fetchPosts = async () => {
  try {
    const res = await fetch(`${API_BASE}/posts`);
    if (!res.ok) throw new Error('Failed to fetch posts');
    return await res.json();
  } catch (err) {
    console.error('Error fetching posts:', err);
    return [];
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

export const fetchAnnouncements = async () => {
  try {
    const res = await fetch(`${API_BASE}/announcements`);
    if (!res.ok) throw new Error('Failed to fetch announcements');
    return await res.json();
  } catch (err) {
    console.error('Error fetching announcements:', err);
    return [];
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

export const fetchCategories = async () => {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return await res.json();
  } catch (err) {
    console.error('Error fetching categories:', err);
    return [];
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

export const usePosts = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchPosts();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    refetch();
  }, []);
  
  return { data, loading, refetch };
};

export const useAnnouncements = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const refetch = async () => {
    setLoading(true);
    const res = await fetchAnnouncements();
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
