// api/upload.js - 分片上传API
// 使用内存存储分片（生产环境应使用云存储如Vercel Blob、AWS S3等）

import fs from 'fs';
import path from 'path';
import os from 'os';

// 临时存储分片
const chunksStore = new Map();
const filesStore = new Map();

// 获取临时目录
const TEMP_DIR = path.join(os.tmpdir(), 'uploads');

// 确保临时目录存在
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// CORS 设置
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    return res.end();
  }

  const url = req.url;
  const pathname = url.split('?')[0];

  // 视频分片上传
  if (pathname === '/api/upload-video-chunk' && req.method === 'POST') {
    const formData = await parseFormData(req);
    const { chunk, chunkIndex, totalChunks, uploadId, fileName, courseId } = formData;
    
    // 存储分片
    if (!chunksStore.has(uploadId)) {
      chunksStore.set(uploadId, { chunks: [], totalChunks: parseInt(totalChunks), fileName, courseId });
    }
    const upload = chunksStore.get(uploadId);
    upload.chunks[parseInt(chunkIndex)] = chunk;
    
    res.writeHead(200, headers);
    return res.end(JSON.stringify({ success: true, chunkIndex }));
  }

  // 视频合并
  if (pathname === '/api/merge-video' && req.method === 'POST') {
    const body = JSON.parse(req.body);
    const { uploadId, fileName, courseId } = body;
    const upload = chunksStore.get(uploadId);
    
    if (!upload) {
      res.writeHead(404, headers);
      return res.end(JSON.stringify({ error: 'Upload not found' }));
    }
    
    // 合并分片
    const filePath = path.join(TEMP_DIR, `${uploadId}_${fileName}`);
    const writeStream = fs.createWriteStream(filePath);
    
    for (let i = 0; i < upload.chunks.length; i++) {
      const chunk = upload.chunks[i];
      if (chunk) {
        writeStream.write(Buffer.from(chunk, 'base64'));
      }
    }
    
    writeStream.end();
    
    writeStream.on('finish', () => {
      // 生成可访问的URL（实际生产环境应该上传到CDN）
      const videoUrl = `/uploads/${uploadId}_${fileName}`;
      
      // 更新课程的视频URL
      // 这里应该调用数据API更新课程
      filesStore.set(videoUrl, { path: filePath, fileName, size: fs.statSync(filePath).size });
      
      // 清理临时分片
      chunksStore.delete(uploadId);
      
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true, url: videoUrl }));
    });
  }

  // 文件分片上传
  if (pathname === '/api/upload-file-chunk' && req.method === 'POST') {
    const formData = await parseFormData(req);
    const { chunk, chunkIndex, totalChunks, uploadId, fileName } = formData;
    
    if (!chunksStore.has(uploadId)) {
      chunksStore.set(uploadId, { chunks: [], totalChunks: parseInt(totalChunks), fileName, type: 'file' });
    }
    const upload = chunksStore.get(uploadId);
    upload.chunks[parseInt(chunkIndex)] = chunk;
    
    res.writeHead(200, headers);
    return res.end(JSON.stringify({ success: true }));
  }

  // 文件合并
  if (pathname === '/api/merge-file' && req.method === 'POST') {
    const body = JSON.parse(req.body);
    const { uploadId, fileName } = body;
    const upload = chunksStore.get(uploadId);
    
    if (!upload) {
      res.writeHead(404, headers);
      return res.end(JSON.stringify({ error: 'Upload not found' }));
    }
    
    const filePath = path.join(TEMP_DIR, `${uploadId}_${fileName}`);
    const writeStream = fs.createWriteStream(filePath);
    
    for (let i = 0; i < upload.chunks.length; i++) {
      const chunk = upload.chunks[i];
      if (chunk) {
        writeStream.write(Buffer.from(chunk, 'base64'));
      }
    }
    
    writeStream.end();
    
    writeStream.on('finish', () => {
      const fileUrl = `/uploads/${uploadId}_${fileName}`;
      filesStore.set(fileUrl, { path: filePath, fileName, size: fs.statSync(filePath).size });
      chunksStore.delete(uploadId);
      
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true, url: fileUrl }));
    });
  }

  // 获取文件列表
  if (pathname === '/api/files' && req.method === 'GET') {
    const fileList = Array.from(filesStore.entries()).map(([url, info]) => ({
      url,
      name: info.fileName,
      size: info.size
    }));
    res.writeHead(200, headers);
    return res.end(JSON.stringify(fileList));
  }

  // 404
  res.writeHead(404, headers);
  return res.end(JSON.stringify({ error: 'Not found' }));
}

// 解析 multipart/form-data
async function parseFormData(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      const boundary = req.headers['content-type'].split('boundary=')[1];
      if (!boundary) {
        reject(new Error('No boundary found'));
        return;
      }
      
      const parts = buffer.toString().split(`--${boundary}`);
      const result = {};
      
      for (const part of parts) {
        if (part.includes('Content-Disposition')) {
          const nameMatch = part.match(/name="([^"]+)"/);
          const filenameMatch = part.match(/filename="([^"]+)"/);
          
          if (nameMatch) {
            const name = nameMatch[1];
            const contentStart = part.indexOf('\r\n\r\n') + 4;
            let content = part.substring(contentStart, part.lastIndexOf('\r\n--'));
            
            if (filenameMatch) {
              // 文件内容 - 转为base64存储
              result[name] = content;
            } else {
              result[name] = content.trim();
            }
          }
        }
      }
      
      resolve(result);
    });
    req.on('error', reject);
  });
}