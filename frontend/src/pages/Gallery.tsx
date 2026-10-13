// @ts-nocheck
import React, { useEffect, useState } from 'react';

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gallery')
      .then(res => res.json())
      .then(data => {
        setPhotos(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat galeri:", err);
        setLoading(false);
      });
  }, []);

  const groupedPhotos = photos.reduce((acc, photo) => {
    const category = photo.category || "Lainnya";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(photo);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold text-center mb-10">Galeri Kegiatan GKI Kediri</h1>
      
      {loading ? (
        <p className="text-center text-gray-500">Memuat foto...</p>
      ) : photos.length === 0 ? (
        <p className="text-center text-gray-500">Belum ada foto yang diunggah.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedPhotos).map(([category, items]) => (
            <div key={category} className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-2xl font-bold text-[#2B1E16]">{category}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((photo) => (
                  <a 
                    href={photo.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    key={photo.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-shadow duration-200 block cursor-pointer group"
                  >
                    <div className="relative w-full h-56 bg-gray-100 overflow-hidden">
                      {/* Merender Cover Thumbnail lokal */}
                      <img 
                        src={photo.thumbnail_path ? `/api/files/${photo.thumbnail_path}` : 'https://placehold.co/600x400/e2e8f0/64748b?text=Tanpa+Cover'} 
                        alt={photo.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Gambar+Rusak';
                        }}
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-xl font-bold mt-1 text-[#2B1E16]">{photo.title}</h3>
                      {photo.description ? (
                        <p className="text-gray-600 mt-1 text-sm">{photo.description}</p>
                      ) : (
                        <p className="text-gray-400 italic mt-1 text-xs">Klik untuk melihat dokumentasi di Google Drive</p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
