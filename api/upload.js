// api/upload.js - 增强版（含详细错误日志）
import fs from 'fs';
import path from 'path';
import os from 'os';
import { supabase } from './supabase.js';

const chunksStore = new Map();
const filesStore = new Map();
const TEMP_DIR = path.join(os.tmpdir(), 'uploads');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(200, headers);
    return res.end();
  }

  const url = req.url;
  const pathname = url.split('?')[0];

  // 视频分片上传
  if (pathname === '/api/upload-video-chunk' && req.method === 'POST') {
    try {
      const formData = await parseFormData(req);
      const { chunk, chunkIndex, totalChunks, uploadId, fileName, courseId } = formData;
      if (!chunksStore.has(uploadId)) {
        chunksStore.set(uploadId, { chunks: [], totalChunks: parseInt(totalChunks), fileName, courseId });
      }
      const upload = chunksStore.get(uploadId);
      upload.chunks[parseInt(chunkIndex)] = chunk;
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true, chunkIndex }));
    } catch (err) {
      console.error('Chunk upload error:', err);
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: 'Chunk upload failed: ' + err.message }));
    }
  }

  // 视频合并
  if (pathname === '/api/merge-video' && req.method === 'POST') {
    try {
      const body = JSON.parse(req.body);
      const { uploadId, fileName, courseId } = body;
      console.log('Merge request received:', { uploadId, fileName, courseId });
      
      const upload = chunksStore.get(uploadId);
      if (!upload) {
        console.error('Upload not found in store');
        res.writeHead(404, headers);
        return res.end(JSON.stringify({ error: 'Upload session not found' }));
      }

      console.log(`Merging ${upload.chunks.length} chunks for ${fileName}`);
      const filePath = path.join(TEMP_DIR, `${uploadId}_${fileName}`);
      const writeStream = fs.createWriteStream(filePath);
      
      for (let i = 0; i < upload.chunks.length; i++) {
        const chunk = upload.chunks[i];
        if (chunk) {
          writeStream.write(Buffer.from(chunk, 'base64'));
        }
      }
      writeStream.end();

      writeStream.on('finish', async () => {
        const videoUrl = `/uploads/${uploadId}_${fileName}`;
        filesStore.set(videoUrl, { path: filePath, fileName, size: fs.statSync(filePath).size });
        
        console.log('File saved, updating database for course:', courseId);
        const { error } = await supabase
          .from('courses')
          .update({ video_url: videoUrl })
          .eq('id', parseInt(courseId));
        
        if (error) {
          console.error('Supabase update error:', error);
          res.writeHead(500, headers);
          return res.end(JSON.stringify({ error: 'Database update failed: ' + error.message }));
        }
        
        chunksStore.delete(uploadId);
        console.log('Merge successful');
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true, url: videoUrl }));
      });

      writeStream.on('error', (err) => {
        console.error('File write error:', err);
        res.writeHead(500, headers);
        return res.end(JSON.stringify({ error: 'File write failed: ' + err.message }));
      });
    } catch (err) {
      console.error('Merge error:', err);
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: 'Merge failed: ' + err.message }));
    }
    return;
  }

  // 文件分片上传（与视频逻辑类似，但不更新数据库）
  if (pathname === '/api/upload-file-chunk' && req.method === 'POST') {
    try {
      const formData = await parseFormData(req);
      const { chunk, chunkIndex, totalChunks, uploadId, fileName } = formData;
      if (!chunksStore.has(uploadId)) {
        chunksStore.set(uploadId, { chunks: [], totalChunks: parseInt(totalChunks), fileName, type: 'file' });
      }
      const upload = chunksStore.get(uploadId);
      upload.chunks[parseInt(chunkIndex)] = chunk;
      res.writeHead(200, headers);
      return res.end(JSON.stringify({ success: true }));
    } catch (err) {
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: err.message }));
    }
  }

  if (pathname === '/api/merge-file' && req.method === 'POST') {
    try {
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
        if (chunk) writeStream.write(Buffer.from(chunk, 'base64'));
      }
      writeStream.end();
      writeStream.on('finish', () => {
        const fileUrl = `/uploads/${uploadId}_${fileName}`;
        filesStore.set(fileUrl, { path: filePath, fileName, size: fs.statSync(filePath).size });
        chunksStore.delete(uploadId);
        res.writeHead(200, headers);
        return res.end(JSON.stringify({ success: true, url: fileUrl }));
      });
    } catch (err) {
      res.writeHead(500, headers);
      return res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  if (pathname === '/api/files' && req.method === 'GET') {
    const fileList = Array.from(filesStore.entries()).map(([url, info]) => ({
      url,
      name: info.fileName,
      size: info.size
    }));
    res.writeHead(200, headers);
    return res.end(JSON.stringify(fileList));
  }

  res.writeHead(404, headers);
  return res.end(JSON.stringify({ error: 'Not found' }));
}

// 解析 multipart/form-data（保持原样）
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
export default handler;