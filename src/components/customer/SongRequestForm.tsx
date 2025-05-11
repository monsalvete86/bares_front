import React from 'react';
import { useSongStore } from '../../stores/songStore';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Music, Mic, Youtube } from 'lucide-react';

const SongRequestForm: React.FC = () => {
  const { addSongRequest } = useSongStore();
  const { user } = useAuthStore();
  
  const [title, setTitle] = React.useState('');
  const [artist, setArtist] = React.useState('');
  const [youtubeUrl, setYoutubeUrl] = React.useState('');
  const [isKaraoke, setIsKaraoke] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      addSongRequest({
        title: title.trim(),
        artist: artist.trim() || undefined,
        youtubeUrl: youtubeUrl.trim() || undefined,
        isKaraoke,
        requestedBy: {
          id: user.id,
          name: user.name,
          tableId: user.tableId || '',
        }
      });
      
      // Reset form
      setTitle('');
      setArtist('');
      setYoutubeUrl('');
      setIsKaraoke(false);
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 bg-primary text-white flex items-center">
        <Music size={20} className="mr-2" />
        <h2 className="text-lg font-medium">Solicitar Canción</h2>
      </div>
      
      {showSuccess && (
        <div className="p-3 bg-green-50 text-green-800 flex items-center animate-fade-in">
          <div className="mr-2 h-4 w-4 rounded-full bg-green-500" />
          <span>¡Canción solicitada con éxito!</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Nombre de la canción"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej. La Bamba"
          required
          fullWidth
        />
        
        <Input
          label="Artista (opcional)"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          placeholder="Ej. Ritchie Valens"
          fullWidth
        />

        <Input
          label="URL de YouTube (opcional)"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://youtube.com/watch?v=..."
          leftIcon={<Youtube size={16} />}
          fullWidth
        />
        
        <div className="flex items-center">
          <input
            id="karaoke"
            type="checkbox"
            checked={isKaraoke}
            onChange={(e) => setIsKaraoke(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="karaoke" className="ml-2 flex items-center text-sm text-gray-700">
            <Mic size={16} className="mr-1" />
            Quiero cantar (Karaoke)
          </label>
        </div>
        
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          leftIcon={<Music size={16} />}
        >
          Solicitar Canción
        </Button>
      </form>
    </div>
  );
};

export default SongRequestForm;