'use strict';

const http = require('http');
const fs = require('fs');
// const url = require('url');
const path = require('path');
const { parse } = require('querystring');

function createServer() {
  const server = new http.Server();
  const dbPath = path.join(__dirname, 'db', 'expense.json');
  const formPath = path.join(__dirname, 'index.html');

  server.on('request', (req, res) => {
    if (req.method === 'GET') {
      fs.readFile(formPath, 'utf-8', (err, data) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error loading index.html');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(data);
        }
      });
    } else if (req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const data = parse(body);

        let expenses = [];

        if (fs.existsSync(dbPath)) {
          const fileData = fs.readFileSync(dbPath);

          expenses = JSON.parse(fileData);
        }

        expenses.push(data);

        fs.mkdirSync(path.dirname(dbPath), { recursive: true });
        fs.writeFileSync(dbPath, JSON.stringify(expenses, null, 2));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(expenses, null, 2));
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'text/plain' });
      res.end('Method Not Work');
    }
  });

  server.on('error', () => {
    // console.log('Server has been crashed');
  });

  return server;
}

module.exports = {
  createServer,
};
