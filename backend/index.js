// 1. Memanggil library
require('dotenv').config(); // Ini untuk membaca file .env
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Memanggil library PostgreSQL

// 2. Menginisialisasi aplikasi Express
const app = express();
app.use(cors()); 
app.use(express.json());

// 3. Konfigurasi Jembatan ke Database PostgreSQL
/*
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});
*/

// 3.1 Konfigurasi Jembatan ke Database PostgreSQL di SUPA BASE
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});



// 4. Mengetes Koneksi ke Database
pool.connect((err) => {
    if (err) {
        console.error('Yah, Gagal terhubung ke database:', err.message);
    } else {
        console.log('Mantap! Server berhasil terhubung ke PostgreSQL!');
    }
});

// 5. Menentukan Port dan Rute Dasar
const PORT = 5000;

app.get('/', (req, res) => {
    res.send('Halo, Server dan Database sudah saling terhubung!');
});


// --- FITUR CREATE (Menambah Barang Baru) ---
app.post('/api/barang', async (req, res) => {
    try {
        // 1. Menangkap data yang dikirim dari Front-end
        const { nama_barang, kategori, jumlah, harga } = req.body;

        // 2. Menjalankan perintah SQL untuk memasukkan data
        const querySQL = `
            INSERT INTO tabel_barang (nama_barang, kategori, jumlah, harga)
            VALUES ($1, $2, $3, $4) RETURNING *;
        `;
        const nilaiData = [nama_barang, kategori, jumlah, harga];
        
        const hasil = await pool.query(querySQL, nilaiData);

        // 3. Memberikan jawaban ke Front-end bahwa sukses
        res.json({ pesan: "Barang berhasil ditambahkan!", data: hasil.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menambahkan barang" });
    }
});

// --- FITUR READ (Menampilkan Semua Barang) ---
app.get('/api/barang', async (req, res) => {
    try {
        // Menjalankan perintah SQL untuk mengambil semua data
        const hasil = await pool.query("SELECT * FROM tabel_barang");
        
        // Mengirimkan data dalam format JSON
        res.json(hasil.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal mengambil data" });
    }
});

// --- FITUR UPDATE (Mengedit Data Barang) ---
// Perhatikan ada :id di URL, ini adalah parameter penanda barang mana yang diedit
app.put('/api/barang/:id', async (req, res) => {
    try {
        const { id } = req.params; // Mengambil ID dari URL
        const { nama_barang, kategori, jumlah, harga } = req.body; // Mengambil data baru

        const querySQL = `
            UPDATE tabel_barang 
            SET nama_barang = $1, kategori = $2, jumlah = $3, harga = $4
            WHERE id = $5 
            RETURNING *;
        `;
        const nilaiData = [nama_barang, kategori, jumlah, harga, id];
        
        const hasil = await pool.query(querySQL, nilaiData);

        if (hasil.rows.length === 0) {
            return res.status(404).json({ error: "Barang tidak ditemukan!" });
        }

        res.json({ pesan: "Barang berhasil diperbarui!", data: hasil.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal memperbarui barang" });
    }
});

// --- FITUR DELETE (Menghapus Data Barang) ---
app.delete('/api/barang/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const querySQL = "DELETE FROM tabel_barang WHERE id = $1 RETURNING *;";
        const hasil = await pool.query(querySQL, [id]);

        if (hasil.rows.length === 0) {
            return res.status(404).json({ error: "Barang tidak ditemukan!" });
        }

        res.json({ pesan: "Barang berhasil dihapus!", data: hasil.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Gagal menghapus barang" });
    }
});

// 6. Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});