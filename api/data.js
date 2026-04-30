// api/data.js - 数据管理API
// 使用内存存储（实际生产环境应使用数据库如Supabase、MongoDB等）

let dataStore = {
  courses: [],
  articles: [],
  questions: [],
  users: [],
  orders: [],
  packages: [],
  coupons: [],
  homeContent: {
    heroTitle: 'PCB&硬件进阶学院',
    heroSubtitle: '从入门到专家，一站式学习平台',
    features: ['实战项目驱动', '专家在线指导', '终身学习权益']
  },
  stats: {
    totalViews: 0,
    monthlyRevenue: [0, 0, 0, 0, 0, 0],
    courseViews: {}
  }
};

// 初始化默认数据
function initData() {
  if (dataStore.courses.length === 0) {
    dataStore.courses = [
      { id: 1, category: 'pcb', name: 'Altium Designer实战教程', desc: '从零开始学习Altium Designer', chapters: ['第1章 软件安装与界面', '第2章 原理图设计', '第3章 PCB布局', '第4章 布线技巧'], access: 'free', order: 1, video_url: null, views: 0 },
      { id: 2, category: 'pcb', name: '高速PCB设计进阶', desc: '掌握高速信号设计要点', chapters: ['第1章 信号完整性', '第2章 电源完整性', '第3章 EMI/EMC设计'], access: 'member', order: 2, video_url: null, views: 0 },
      { id: 3, category: 'hardware', name: '嵌入式硬件设计', desc: '嵌入式系统硬件开发', chapters: ['第1章 处理器选型', '第2章 外围电路设计', '第3章 电源管理', '第4章 接口设计'], access: 'free', order: 1, video_url: null, views: 0 }
    ];
  }
  
  if (dataStore.articles.length === 0) {
    dataStore.articles = [
      { id: 1, title: 'PCB设计入门指南', content: '<p>PCB设计是电子产品开发的核心环节...</p><h3>设计流程</h3><ol><li>原理图设计</li><li>PCB布局</li><li>布线</li><li>DRC检查</li><li>输出Gerber</li></ol>', access: 'free', views: 0 },
      { id: 2, title: '阻抗匹配详解', content: '<p>在高速PCB设计中，阻抗匹配至关重要...</p><h3>什么是阻抗匹配？</h3><p>阻抗匹配是指信号源、传输线和负载之间的阻抗相等...</p>', access: 'member', views: 0 }
    ];
  }
  
  if (dataStore.questions.length === 0) {
    dataStore.questions = [
      { id: 1, category: 'pcb', type: 'choice', question: 'PCB设计中，3W原则主要用于减少什么？', answer: '串扰', options: ['电磁干扰', '串扰', '电源噪声', '信号衰减'] },
      { id: 2, category: 'pcb', type: 'qa', question: '请简述PCB设计的基本流程。', answer: '原理图设计 → PCB布局 → 布线 → 设计规则检查 → 输出Gerber文件' },
      { id: 3, category: 'hardware', type: 'choice', question: '以下哪个是常用的嵌入式处理器架构？', answer: 'ARM', options: ['x86', 'ARM', 'MIPS', 'RISC-V'] },
      { id: 4, category: 'hardware', type: 'qa', question: '什么是上拉电阻？有什么作用？', answer: '上拉电阻是将信号线连接到高电平的电阻，用于确定默认电平、提高驱动能力' }
    ];
  }
  
  if (dataStore.users.length === 0) {
    dataStore.users = [
      { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin', membership: 'admin', createdAt: new Date().toISOString() },
      { id: 2, username: '张三', email: 'test@test.com', password: '123456', role: 'user', membership: 'none', createdAt: new Date().toISOString() },
      { id: 3, username: '李四', email: 'member@test.com', password: '123456', role: 'user', membership: 'month', createdAt: new Date().toISOString() }
    ];
  }
  
  if (dataStore.packages.length === 0) {
    dataStore.packages = [
      { id: 1, name: '月会员', price: 99, duration: 30, desc: '享受30天会员权益' },
      { id: 2, name: '年会员', price: 599, duration: 365, desc: '享受365天会员权益，赠送学习资料包' },
      { id: 3, name: '终身会员', price: 1999, duration: 9999, desc: '终身学习权益，优先答疑' }
    ];
  }
  
  if (dataStore.coupons.length === 0) {
    dataStore.coupons = [
      { id: 1, code: 'NEW2024', discount: 20, days: 30, minAmount: 99, valid: true, createdAt: new Date().toISOString() },
      { id: 2, code: 'PCBVIP', discount: 50, days: 365, minAmount: 199, valid: true, createdAt: new Date().toISOString() }
    ];
  }
  
  if (dataStore.orders.length === 0) {
    dataStore.orders = [
      { id: 1, user_email: 'member@test.com', package_id: 1, amount: 99, status: 'paid', createdAt: new Date().toISOString() }
    ];
  }
}

initData();

// 辅助函数
function generateId() {
  return Date.now();
}

function saveToStorage() {
  // 生产环境这里应该写入数据库
  // 目前使用内存存储，Vercel部署后每次请求是独立的
}

// CORS 设置
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

// 主处理函数
export default async function handler(req, res) {
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    return res.end();
  }
  
  const url = req.url;
  const path = url.split('?')[0];
  
  try {
    // 首页内容
    if (path === '/api/home-content') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.homeContent));
      }
      if (req.method === 'PUT') {
        const body = JSON.parse(req.body);
        dataStore.homeContent = { ...dataStore.homeContent, ...body };
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 课程管理
    if (path === '/api/courses') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.courses));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const newCourse = {
          id: generateId(),
          ...body,
          chapters: [],
          video_url: null,
          views: 0,
          createdAt: new Date().toISOString()
        };
        dataStore.courses.push(newCourse);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newCourse));
      }
    }
    
    // 单个课程
    if (path.match(/^\/api\/courses\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      const course = dataStore.courses.find(c => c.id === id);
      
      if (req.method === 'GET') {
        if (course) {
          // 增加浏览量
          course.views = (course.views || 0) + 1;
          res.writeHead(200, headers);
          return res.end(JSON.stringify(course));
        }
        res.writeHead(404, headers);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      
      if (req.method === 'DELETE') {
        dataStore.courses = dataStore.courses.filter(c => c.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 课程章节管理
    if (path.match(/^\/api\/courses\/\d+\/chapters$/)) {
      const id = parseInt(path.split('/')[3]);
      const course = dataStore.courses.find(c => c.id === id);
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        course.chapters.push(body.chapter);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    if (path.match(/^\/api\/courses\/\d+\/chapters\/\d+$/)) {
      const parts = path.split('/');
      const courseId = parseInt(parts[3]);
      const chapterIndex = parseInt(parts[5]);
      const course = dataStore.courses.find(c => c.id === courseId);
      if (req.method === 'DELETE') {
        course.chapters.splice(chapterIndex, 1);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 文章管理
    if (path === '/api/articles') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.articles));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const newArticle = {
          id: generateId(),
          ...body,
          views: 0,
          createdAt: new Date().toISOString()
        };
        dataStore.articles.push(newArticle);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newArticle));
      }
    }
    
    if (path.match(/^\/api\/articles\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      const article = dataStore.articles.find(a => a.id === id);
      if (req.method === 'GET') {
        if (article) {
          article.views = (article.views || 0) + 1;
          res.writeHead(200, headers);
          return res.end(JSON.stringify(article));
        }
        res.writeHead(404, headers);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      if (req.method === 'DELETE') {
        dataStore.articles = dataStore.articles.filter(a => a.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 题库管理
    if (path === '/api/questions') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.questions));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const newQuestion = {
          id: generateId(),
          ...body,
          createdAt: new Date().toISOString()
        };
        dataStore.questions.push(newQuestion);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newQuestion));
      }
    }
    
    if (path.match(/^\/api\/questions\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        dataStore.questions = dataStore.questions.filter(q => q.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 用户管理
    if (path === '/api/users') {
      if (req.method === 'GET') {
        // 返回用户列表（不包含密码）
        const safeUsers = dataStore.users.map(u => ({ ...u, password: undefined }));
        res.writeHead(200, headers);
        return res.end(JSON.stringify(safeUsers));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const existingUser = dataStore.users.find(u => u.email === body.email);
        if (existingUser) {
          res.writeHead(400, headers);
          return res.end(JSON.stringify({ error: '邮箱已存在' }));
        }
        const newUser = {
          id: generateId(),
          ...body,
          role: 'user',
          createdAt: new Date().toISOString()
        };
        dataStore.users.push(newUser);
        const { password, ...safeUser } = newUser;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(safeUser));
      }
    }
    
    if (path.match(/^\/api\/users\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        dataStore.users = dataStore.users.filter(u => u.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    if (path.match(/^\/api\/users\/\d+\/membership$/)) {
      const id = parseInt(path.split('/')[3]);
      const body = JSON.parse(req.body);
      const user = dataStore.users.find(u => u.id === id);
      if (user) {
        user.membership = body.membership;
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 订单管理
    if (path === '/api/orders') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.orders));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const pkg = dataStore.packages.find(p => p.name === (body.package === 'month' ? '月会员' : '年会员'));
        const newOrder = {
          id: generateId(),
          user_email: body.email,
          package_id: pkg?.id,
          amount: body.package === 'month' ? 99 : 599,
          status: 'paid',
          createdAt: new Date().toISOString()
        };
        dataStore.orders.push(newOrder);
        // 更新用户会员
        const user = dataStore.users.find(u => u.email === body.email);
        if (user) {
          user.membership = body.package;
        }
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newOrder));
      }
    }
    
    // 套餐管理
    if (path === '/api/packages') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.packages));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const newPackage = {
          id: generateId(),
          ...body
        };
        dataStore.packages.push(newPackage);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newPackage));
      }
    }
    
    if (path.match(/^\/api\/packages\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        dataStore.packages = dataStore.packages.filter(p => p.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 优惠券管理
    if (path === '/api/coupons') {
      if (req.method === 'GET') {
        res.writeHead(200, headers);
        return res.end(JSON.stringify(dataStore.coupons));
      }
      if (req.method === 'POST') {
        const body = JSON.parse(req.body);
        const newCoupon = {
          id: generateId(),
          ...body,
          valid: true,
          createdAt: new Date().toISOString()
        };
        dataStore.coupons.push(newCoupon);
        res.writeHead(200, headers);
        return res.end(JSON.stringify(newCoupon));
      }
    }
    
    if (path.match(/^\/api\/coupons\/\d+$/)) {
      const id = parseInt(path.split('/').pop());
      if (req.method === 'DELETE') {
        dataStore.coupons = dataStore.coupons.filter(c => c.id !== id);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true }));
      }
    }
    
    // 统计数据
    if (path === '/api/stats') {
      const totalUsers = dataStore.users.length;
      const totalCourses = dataStore.courses.length;
      const totalArticles = dataStore.articles.length;
      const totalOrders = dataStore.orders.length;
      const totalRevenue = dataStore.orders.reduce((sum, o) => sum + o.amount, 0);
      const totalVideos = dataStore.courses.filter(c => c.video_url).length;
      
      // 模拟月度数据
      const monthLabels = ['1月', '2月', '3月', '4月', '5月', '6月'];
      const courseNames = dataStore.courses.map(c => c.name.substring(0, 10));
      const courseViews = dataStore.courses.map(c => c.views || 0);
      
      res.writeHead(200, headers);
      return res.end(JSON.stringify({
        totalUsers,
        totalCourses,
        totalArticles,
        totalOrders,
        totalRevenue,
        totalVideos,
        monthLabels,
        monthRevenue: [1250, 1890, 2340, 2980, 3450, 4320],
        courseNames,
        courseViews
      }));
    }
    
    // 登录
    if (path === '/api/login') {
      const body = JSON.parse(req.body);
      const user = dataStore.users.find(u => u.email === body.email && u.password === body.password);
      if (user) {
        const { password, ...safeUser } = user;
        res.writeHead(200, headers);
        return res.end(JSON.stringify(safeUser));
      }
      res.writeHead(401, headers);
      return res.end(JSON.stringify({ error: 'Invalid credentials' }));
    }
    
    // 注册
    if (path === '/api/register') {
      const body = JSON.parse(req.body);
      const existingUser = dataStore.users.find(u => u.email === body.email);
      if (existingUser) {
        res.writeHead(400, headers);
        return res.end(JSON.stringify({ error: '邮箱已存在' }));
      }
      const newUser = {
        id: generateId(),
        username: body.username,
        email: body.email,
        password: body.password,
        role: 'user',
        membership: 'none',
        createdAt: new Date().toISOString()
      };
      dataStore.users.push(newUser);
      const { password, ...safeUser } = newUser;
      res.writeHead(200, headers);
      return res.end(JSON.stringify(safeUser));
    }
    
    // 检查认证状态
    if (path === '/api/check-auth') {
      // 实际生产环境应该验证token
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