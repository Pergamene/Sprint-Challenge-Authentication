const request = require('supertest');

const server = require('./server');
const db = require('../database/dbConfig');

describe('server', () => {
  describe('POST /api/auth/register', () => {
    beforeEach(async () => {
      await db('users').truncate();
    });

    it('return 201 on success', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'username', password: 'password' });
      expect(res.status).toBe(201);
    });

    it('return user with correct id', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'username', password: 'password' });
      expect(res.body.id).toBe(1);
    });

    it('return user with correct username', async () => {
      const res = await request(server).post('/api/auth/register').send({ username: 'testName', password: 'password' });
      expect(res.body.username).toBe('testName');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await db('users').truncate();
      await request(server).post('/api/auth/register').send({ username: 'username', password: 'password' });
    });

    it('return 401 with incorrect password', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'pasword' });
      expect(res.status).toBe(401);
    });

    it('return message "Incorrect credientials." with incorrect password', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'pasword' });
      expect(res.body.message).toBe('Incorrect credientials.');
    });

    it('return 200 with correct credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'password' });
      expect(res.status).toBe(200);
    });

    it('return message "Logged in." with correct credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'password' });
      expect(res.body.message).toBe('Logged in.');
    });

    it('return token with correct credentials', async () => {
      const res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'password' });
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('GET /api/jokes', () => {
    beforeEach(async () => {
      await db('users').truncate();
      await request(server).post('/api/auth/register').send({ username: 'username', password: 'password' });
    });

    it('return 400 without credentials', async () => {
      const res = await request(server).get('/api/jokes');
      expect(res.status).toBe(400);
    });

    it('return 20 jokes with proper credentials', async () => {
      let res = await request(server).post('/api/auth/login').send({ username: 'username', password: 'password' });
      const { token } = res.body;

      res = await request(server).get('/api/jokes').set({ 'Authorization': token });
      expect(res.body).toHaveLength(20);
    });
  });
});
