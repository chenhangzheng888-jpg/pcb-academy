// api/data.js - Supabase 数据库版本（持久化存储）
import { supabase } from './supabase.js';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    return res.end();
  }

  const url = req.url;
  const path = url.split('?')[0];

  try {
    // ---------- 首页内容 ----------
    if (path === '/api/home-content') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('home_content').select('*').single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(req.body);
        const { error } = await supabase.from('home_content').update(body).eq('id', 1);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // ---------- 课程管理 ----------
    if (path === '/api/courses') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('courses').select('*').order('order', { ascending: true });
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('courses').insert(body).select().single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    // 单个课程（包含浏览量自增）
    if (path.match(/^\/api\/courses\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'GET') {
        // 增加浏览量（使用 RPC 函数）
        await supabase.rpc('increment_course_views', { course_id: id });
        const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(req.body);
        const { error } = await supabase.from('courses').update(body).eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // 课程章节管理
    if (path.match(/^\/api\/courses\/\d+\/chapters$/)) {
      const id = parseInt(path.split('/')[3]);
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data: course } = await supabase.from('courses').select('chapters').eq('id', id).single();
        const newChapters = [...(course.chapters || []), body.chapter];
        const { error } = await supabase.from('courses').update({ chapters: newChapters }).eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    if (path.match(/^\/api\/courses\/\d+\/chapters\/\d+$/)) {
      const parts = path.split('/');
      const courseId = parseInt(parts[3]);
      const chapterIndex = parseInt(parts[5]);
      const { data: course } = await supabase.from('courses').select('chapters').eq('id', courseId).single();
      const newChapters = course.chapters.filter((_, idx) => idx !== chapterIndex);
      const { error } = await supabase.from('courses').update({ chapters: newChapters }).eq('id', courseId);
      if (error) throw error;
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true }));
    }

    // ---------- 文章管理 ----------
    if (path === '/api/articles') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('articles').insert(body).select().single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    if (path.match(/^\/api\/articles\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'GET') {
        await supabase.rpc('increment_article_views', { article_id: id });
        const { data, error } = await supabase.from('articles').select('*').eq('id', id).single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('articles').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // ---------- 题库管理 ----------
    if (path === '/api/questions') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('questions').select('*');
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('questions').insert(body).select().single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    if (path.match(/^\/api\/questions\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('questions').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // ---------- 用户管理 ----------
    if (path === '/api/users') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('users').select('id, username, email, role, membership, created_at');
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('users').insert(body).select().single();
        if (error) throw error;
        const { password, ...safeUser } = data;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(safeUser));
      }
    }

    if (path.match(/^\/api\/users\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    if (path.match(/^\/api\/users\/\d+\/membership$/)) {
      const id = parseInt(path.split('/')[3]);
      const body = JSON.parse(req.body);
      const { error } = await supabase.from('users').update({ membership: body.membership }).eq('id', id);
      if (error) throw error;
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true }));
    }

    // ---------- 订单管理 ----------
    if (path === '/api/orders') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('orders').insert(body).select().single();
        if (error) throw error;
        // 更新用户会员
        await supabase.from('users').update({ membership: body.package === 'month' ? 'month' : 'year' }).eq('email', body.user_email);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    // ---------- 套餐管理 ----------
    if (path === '/api/packages') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('packages').select('*');
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('packages').insert(body).select().single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    if (path.match(/^\/api\/packages\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('packages').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // ---------- 优惠券管理 ----------
    if (path === '/api/coupons') {
      if (req.method === 'GET') {
        const { data, error } = await supabase.from('coupons').select('*');
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const { data, error } = await supabase.from('coupons').insert(body).select().single();
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(data));
      }
    }

    if (path.match(/^\/api\/coupons\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }

    // ---------- 统计数据 ----------
    if (path === '/api/stats') {
      const [usersCount, coursesCount, articlesCount, orders, videosCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('courses').select('*', { count: 'exact', head: true }),
        supabase.from('articles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('amount'),
        supabase.from('courses').select('video_url').not('video_url', 'is', null)
      ]);
      const totalRevenue = orders.data?.reduce((sum, o) => sum + o.amount, 0) || 0;
      const { data: courseViewsData } = await supabase.from('courses').select('name, views');
      res.writeHead(200, headers);
      return res.end(JSON.stringify({
        totalUsers: usersCount.count || 0,
        totalCourses: coursesCount.count || 0,
        totalArticles: articlesCount.count || 0,
        totalOrders: orders.count || 0,
        totalRevenue,
        totalVideos: videosCount.count || 0,
        monthLabels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        monthRevenue: [1250, 1890, 2340, 2980, 3450, 4320],
        courseNames: courseViewsData?.map(c => c.name.substring(0, 10)) || [],
        courseViews: courseViewsData?.map(c => c.views || 0) || []
      }));
    }

    // ---------- 登录 ----------
    if (path === '/api/login') {
      const body = JSON.parse(req.body);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', body.email)
        .eq('password', body.password)
        .single();
      if (data) {
        const { password, ...safeUser } = data;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(safeUser));
      }
      res.writeHead(401, headers);
      return res.end(JSON.stringify({ error: 'Invalid credentials' }));
    }

    // ---------- 注册 ----------
    if (path === '/api/register') {
      const body = JSON.parse(req.body);
      const { data: existing } = await supabase.from('users').select('id').eq('email', body.email).single();
      if (existing) {
        res.writeHead(400, headers);
        return res.end(JSON.stringify({ error: '邮箱已存在' }));
      }
      const { data, error } = await supabase.from('users').insert({
        username: body.username,
        email: body.email,
        password: body.password,
        role: 'user',
        membership: 'none'
      }).select().single();
      if (error) throw error;
      const { password, ...safeUser } = data;
      res.writeHead(200, headers);
      return res.end(JSON.stringify(safeUser));
    }

    // ---------- 检查认证 ----------
    if (path === '/api/check-auth') {
      // 简化处理，实际可解析 token
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ isAdmin: false }));
    }

    // 404
    res.writeHead(404, headers);
    return res.end(JSON.stringify({ error: 'API not found' }));
  } catch (error) {
    console.error('API Error:', error);
    res.writeHead(500, headers);
    return res.end(JSON.stringify({ error: error.message }));
  }
}