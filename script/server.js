// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

// Config
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Example route: get parceiros
app.get('/api/parceiros', async (req, res) => {
  try {
    const response = await axios.get(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/parceiros`, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    });
    res.json(response.data.records);
  } catch (error) {
    console.error('Erro ao buscar parceiros:', error.message);
    res.status(500).json({ error: 'Erro ao buscar parceiros' });
  }
});

// [Outras rotas aqui conforme necessidade do projeto]
// Exemplo: /api/consultas, /api/promocoes, etc

// Catch-all para frontend
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
