import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  // Tempat kita menyimpan data barang sementara di Front-end
  const [barang, setBarang] = useState([]);

// --- STATE BARU UNTUK FORMULIR ---
  const [formData, setFormData] = useState({
    nama_barang: '',
    kategori: '',
    jumlah: '',
    harga: ''
  });

  // Fungsi untuk menangani saat pengguna mengetik di formulir
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fungsi untuk mengirim data baru ke Back-end
    const prosesSimpan = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        // MODE EDIT: Kirim data lewat Axios (PUT) ke Back-end
        await axios.put(`https://aplikasi-inventaris.onrender.com/api/barang/${editId}`, formData);
        setEditId(null); // Kembalikan ke mode tambah setelah selesai
      } else {
        // MODE TAMBAH BARU: Kirim data lewat Axios (POST) ke Back-end
        await axios.post('https://aplikasi-inventaris.onrender.com/api/barang', formData);
      }
      
      ambilDataBarang(); 
      setFormData({ nama_barang: '', kategori: '', jumlah: '', harga: '' }); 
    } catch (error) {
      console.error("Gagal memproses data:", error);
    }
  };


  const [editId, setEditId] = useState(null); 
  // Jika null = mode tambah barang baru. Jika ada isinya = mode edit barang lama.
  const siapkanEdit = (item) => {
    setFormData({
      nama_barang: item.nama_barang,
      kategori: item.kategori,
      jumlah: item.jumlah,
      harga: item.harga
    });
    setEditId(item.id); // Menyimpan ID barang yang mau diedit
  };



  // Fungsi untuk mengirim perintah hapus ke Back-end
  const hapusBarang = async (id) => {
    // Memberikan pertanyaan konfirmasi keamanan sebelum menghapus
    const konfirmasi = window.confirm("Apakah Anda yakin ingin menghapus barang ini?");
    
    if (konfirmasi) {
      try {
        await axios.delete(`https://aplikasi-inventaris.onrender.com/api/barang/${id}`);
        ambilDataBarang(); // Memanggil ulang data agar barang yang dihapus hilang dari layar
      } catch (error) {
        console.error("Gagal menghapus barang:", error);
      }
    }
  };


  // Fungsi Axios untuk mengambil data dari Back-end
  const ambilDataBarang = async () => {
    try {
      const respons = await axios.get('https://aplikasi-inventaris.onrender.com/api/barang');
      setBarang(respons.data); // Menyimpan data yang didapat ke dalam state 'barang'
    } catch (error) {
      console.error("Gagal mengambil data:", error);
    }
  };

  // useEffect menyuruh React menjalankan ambilDataBarang() saat halaman pertama kali dibuka
  useEffect(() => {
    ambilDataBarang();
  }, []);

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">📦 Aplikasi Inventaris Barang</h1>
      
      {/* Formulir Tambah Barang */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <form onSubmit={prosesSimpan} className="row g-3">
            <div className="col-md-3">
              <input type="text" className="form-control" name="nama_barang" placeholder="Nama Barang" value={formData.nama_barang} onChange={handleInputChange} required />
            </div>
            <div className="col-md-3">
              <input type="text" className="form-control" name="kategori" placeholder="Kategori" value={formData.kategori} onChange={handleInputChange} />
            </div>
            <div className="col-md-3">
              <input type="number" className="form-control" name="jumlah" placeholder="Jumlah" value={formData.jumlah} onChange={handleInputChange} required />
            </div>
            <div className="col-md-2">
              <input type="number" className="form-control" name="harga" placeholder="Harga" value={formData.harga} onChange={handleInputChange} required />
            </div>
            <div className="col-md-1">
            <button type="submit" className={editId ? "btn btn-success w-100" : "btn btn-primary w-100"}>
             {editId ? "Perbarui" : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <table className="table table-striped table-hover">
            <thead className="table-dark">
              <tr>
                <th>No</th>
                <th>Nama Barang</th>
                <th>Kategori</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Di sinilah kita menampilkan data dari database */}
              {barang.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>{item.nama_barang}</td>
                  <td>{item.kategori}</td>
                  <td>{item.jumlah}</td>
                  <td>Rp {item.harga}</td>
                  <td>
                   <button onClick={() => siapkanEdit(item)} className="btn btn-warning btn-sm me-2">Edit</button>
                    <button onClick={() => hapusBarang(item.id)} className="btn btn-danger btn-sm">Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;