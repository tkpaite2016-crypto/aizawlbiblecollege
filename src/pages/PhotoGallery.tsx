import { useEffect, useState } from 'react';
import { Image, Upload, X, ChevronLeft, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { supabase, Photo } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type UploadForm = { title: string; description: string; album: string; files: File[] };

export default function PhotoGallery() {
  const { profile } = useAuth();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<string[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState('All');
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState<UploadForm>({ title: '', description: '', album: 'General', files: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadError, setUploadError] = useState('');

  const canUpload = profile?.role === 'admin' || profile?.role === 'faculty';

  useEffect(() => {
    supabase
      .from('photos')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const p = data ?? [];
        setPhotos(p);
        const unique = ['All', ...Array.from(new Set(p.map((ph) => ph.album ?? 'General')))];
        setAlbums(unique);
        setLoading(false);
      });
  }, []);

  const filtered = selectedAlbum === 'All' ? photos : photos.filter((p) => (p.album ?? 'General') === selectedAlbum);

  function lightboxNav(dir: 1 | -1) {
    if (lightbox === null) return;
    const next = lightbox + dir;
    if (next >= 0 && next < filtered.length) setLightbox(next);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (uploadForm.files.length === 0) return;
    setUploadError('');
    setUploading(true);
    setUploadProgress({ current: 0, total: uploadForm.files.length });

    const uploadedPhotos: Photo[] = [];

    for (let i = 0; i < uploadForm.files.length; i++) {
      const file = uploadForm.files[i];
      setUploadProgress({ current: i + 1, total: uploadForm.files.length });

      const ext = file.name.split('.').pop();
      const fileName = `gallery/${Date.now()}_${i}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('photos').upload(fileName, file);

      if (uploadErr) {
        setUploadError(`Failed to upload ${file.name}: ${uploadErr.message}`);
        continue;
      }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
      const { error: dbErr } = await supabase.from('photos').insert({
        title: uploadForm.title || null,
        description: uploadForm.description || null,
        album: uploadForm.album,
        image_url: urlData.publicUrl,
        uploaded_by: profile?.id,
      });

      if (!dbErr) {
        uploadedPhotos.push({
          id: crypto.randomUUID(),
          title: uploadForm.title || null,
          description: uploadForm.description || null,
          album: uploadForm.album,
          image_url: urlData.publicUrl,
          uploaded_by: profile?.id ?? null,
          is_published: true,
          created_at: new Date().toISOString(),
        });
      }
    }

    if (uploadedPhotos.length > 0) {
      setPhotos((prev) => {
        const updated = [...uploadedPhotos.reverse(), ...prev];
        const unique = ['All', ...Array.from(new Set(updated.map((ph) => ph.album ?? 'General')))];
        setAlbums(unique);
        return updated;
      });
      setShowUpload(false);
      setUploadForm({ title: '', description: '', album: 'General', files: [] });
    }

    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
  }

  function removeFile(index: number) {
    setUploadForm((f) => ({ ...f, files: f.files.filter((_, i) => i !== index) }));
  }

  return (
    <div className="page-enter">
      {/* Hero */}
      <section className="bg-navy-950 py-8 md:py-14">
        <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <Image className="w-8 h-8 md:w-9 md:h-9 text-gold-400 mx-auto sm:mx-0 mb-2 md:mb-3" />
            <h1 className="text-xl md:text-3xl font-serif font-bold text-white mb-1">Photo Gallery</h1>
            <p className="text-slate-400 text-xs md:text-sm">Memories and moments from campus life.</p>
          </div>
          {canUpload && (
            <button onClick={() => setShowUpload(true)} className="btn-gold flex-shrink-0 text-xs md:text-sm">
              <Upload className="w-3.5 h-3.5 md:w-4 md:h-4" /> Upload Photos
            </button>
          )}
        </div>
      </section>

      {/* Album filter */}
      {albums.length > 1 && (
        <section className="bg-white border-b border-slate-200 sticky top-[68px] z-30">
          <div className="page-container">
            <div className="flex items-center gap-2 py-3 overflow-x-auto">
              {albums.map((album) => (
                <button
                  key={album}
                  onClick={() => setSelectedAlbum(album)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    selectedAlbum === album ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {album}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="py-8 md:py-12 bg-slate-50">
        <div className="page-container">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-navy-200 border-t-navy-800 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Image className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No photos in this album yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 md:gap-3">
              {filtered.map((photo, idx) => (
                <button
                  key={photo.id}
                  onClick={() => setLightbox(idx)}
                  className="aspect-square overflow-hidden rounded-lg md:rounded-xl shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] group"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.title ?? ''}
                    className="w-full h-full object-cover group-hover:brightness-90 transition-all"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && filtered[lightbox] && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null); }} className="absolute top-4 right-4 text-white hover:text-slate-300 z-10">
            <X className="w-7 h-7" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); lightboxNav(-1); }}
            className={`absolute left-3 md:left-8 text-white hover:text-gold-400 transition-colors ${lightbox === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={lightbox === 0}
          >
            <ChevronLeft className="w-9 h-9" />
          </button>
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={filtered[lightbox].image_url}
              alt={filtered[lightbox].title ?? ''}
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {(filtered[lightbox].title || filtered[lightbox].description) && (
              <div className="mt-3 text-center">
                {filtered[lightbox].title && <p className="text-white font-medium">{filtered[lightbox].title}</p>}
                {filtered[lightbox].description && <p className="text-slate-400 text-sm mt-1">{filtered[lightbox].description}</p>}
              </div>
            )}
            <p className="text-slate-500 text-xs text-center mt-2">{lightbox + 1} / {filtered.length}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); lightboxNav(1); }}
            className={`absolute right-3 md:right-8 text-white hover:text-gold-400 transition-colors ${lightbox === filtered.length - 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
            disabled={lightbox === filtered.length - 1}
          >
            <ChevronRight className="w-9 h-9" />
          </button>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setShowUpload(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-bold text-navy-900">Upload Photos</h2>
              <button onClick={() => setShowUpload(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {uploadError && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{uploadError}
              </div>
            )}
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="label">Select Photos *</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  required
                  onChange={(e) => setUploadForm((f) => ({ ...f, files: Array.from(e.target.files ?? []) }))}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-navy-800 file:text-white hover:file:bg-navy-700 cursor-pointer"
                />
                {uploadForm.files.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-slate-500">{uploadForm.files.length} file(s) selected:</p>
                    <div className="flex flex-wrap gap-2">
                      {uploadForm.files.map((file, idx) => (
                        <div key={idx} className="relative group">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="label">Title (applies to all)</label>
                <input value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} className="input-field" placeholder="Optional title for all photos" />
              </div>
              <div>
                <label className="label">Album</label>
                <input value={uploadForm.album} onChange={(e) => setUploadForm((f) => ({ ...f, album: e.target.value }))} className="input-field" placeholder="e.g., Graduation 2024" />
              </div>
              <button type="submit" disabled={uploading || uploadForm.files.length === 0} className="btn-primary w-full justify-center">
                {uploading ? (
                  <><Loader className="w-4 h-4 animate-spin" /> Uploading {uploadProgress.current}/{uploadProgress.total}...</>
                ) : (
                  `Upload ${uploadForm.files.length || ''} Photo${uploadForm.files.length !== 1 ? 's' : ''}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
