import React, { useState } from 'react';
import { useSongStore, SongRequest } from '../../stores/songStore';
import { useTableStore } from '../../stores/tableStore';
import { Music, Check, Trash2, Plus, X, Youtube } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from '../ui/Card';

interface SongRequestListProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SongRequestList: React.FC<SongRequestListProps> = ({ 
  isCollapsed, 
  onToggleCollapse 
}) => {
  const { songRequests, updateSongStatus, addSongRequest } = useSongStore();
  const { tables } = useTableStore();
  const [isAddingSong, setIsAddingSong] = useState(false);
  const pendingSongs = songRequests.filter(song => song.status === 'pending');
  
  const handlePlayedClick = (id: string) => {
    updateSongStatus(id, 'played');
  };
  
  const handleCancelClick = (id: string) => {
    updateSongStatus(id, 'cancelled');
  };

  const handleAddSong = (formData: {
    title: string;
    artist?: string;
    youtubeUrl?: string;
    tableId: string;
    isKaraoke: boolean;
  }) => {
    const table = tables.find(t => t.id === formData.tableId);
    if (!table || !table.customers.length) return;

    // Use the first customer of the selected table
    const customer = table.customers[0];

    addSongRequest({
      title: formData.title,
      artist: formData.artist,
      youtubeUrl: formData.youtubeUrl,
      isKaraoke: formData.isKaraoke,
      requestedBy: {
        id: customer?.id ?? '',
        name: customer.name,
        tableId: formData.tableId,
      }
    });

    setIsAddingSong(false);
  };
  
  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Button
          variant="outline"
          onClick={onToggleCollapse}
          className="p-2 h-auto w-12"
        >
          <Music size={24} />
        </Button>
        
        {pendingSongs.length > 0 && (
          <div className="mt-2 bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold">
            {pendingSongs.length}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Solicitudes de Música</h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onToggleCollapse}
            className="p-2 h-auto"
          >
            <Music size={16} />
          </Button>
          <Button
            onClick={() => setIsAddingSong(true)}
            leftIcon={<Plus size={16} />}
          >
            Agregar
          </Button>
        </div>
      </div>
      
      {pendingSongs.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
          <Music size={48} className="mb-2 opacity-30" />
          <p>No hay canciones pendientes</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto flex-1">
          {pendingSongs.map((song) => (
            <SongRequestCard
              key={song.id}
              song={song}
              onMarkAsPlayed={() => handlePlayedClick(song.id)}
              onCancel={() => handleCancelClick(song.id)}
            />
          ))}
        </div>
      )}

      {/* Modal para agregar canción */}
      {isAddingSong && (
        <AddSongModal
          onClose={() => setIsAddingSong(false)}
          onSubmit={handleAddSong}
          tables={tables}
        />
      )}
    </div>
  );
};

interface SongRequestCardProps {
  song: SongRequest;
  onMarkAsPlayed: () => void;
  onCancel: () => void;
}

const SongRequestCard: React.FC<SongRequestCardProps> = ({
  song,
  onMarkAsPlayed,
  onCancel,
}) => {
  return (
    <Card variant="outlined" className="overflow-hidden animate-slide-in">
      <CardHeader className="p-3 pb-1">
        <CardTitle className="text-base truncate">{song.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-3 pt-0">
        <div className="text-sm text-gray-500">
          {song.artist && <p className="truncate">{song.artist}</p>}
          {song.youtubeUrl && (
            <a 
              href={song.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline flex items-center gap-1"
            >
              <Youtube size={14} />
              Ver video
            </a>
          )}
          <p>
            Mesa: {song.requestedBy.tableId} • {song.requestedBy.name}
          </p>
          {song.isKaraoke && (
            <span className="inline-block px-2 py-0.5 mt-1 bg-purple-100 text-purple-800 rounded text-xs">
              Karaoke
            </span>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-3 pt-0 justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Trash2 size={14} />}
          onClick={onCancel}
        >
          Cancelar
        </Button>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Check size={14} />}
          onClick={onMarkAsPlayed}
        >
          Atendida
        </Button>
      </CardFooter>
    </Card>
  );
};

interface AddSongModalProps {
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    artist?: string;
    youtubeUrl?: string;
    tableId: string;
    isKaraoke: boolean;
  }) => void;
  tables: Array<{ id: string; name: string; }>;
}

const AddSongModal: React.FC<AddSongModalProps> = ({
  onClose,
  onSubmit,
  tables,
}) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [tableId, setTableId] = useState('');
  const [isKaraoke, setIsKaraoke] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !tableId) return;

    onSubmit({
      title,
      artist: artist || undefined,
      youtubeUrl: youtubeUrl || undefined,
      tableId,
      isKaraoke,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md animate-slide-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Agregar Canción</span>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nombre de la canción"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              fullWidth
            />

            <Input
              label="Artista (opcional)"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              fullWidth
            />

            <Input
              label="URL de YouTube (opcional)"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              fullWidth
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mesa
              </label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm"
                required
              >
                <option value="">Seleccionar mesa</option>
                {tables.map(table => (
                  <option key={table.id} value={table.id}>
                    Mesa {table.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="karaoke"
                checked={isKaraoke}
                onChange={(e) => setIsKaraoke(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="karaoke" className="ml-2 text-sm text-gray-700">
                Karaoke
              </label>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                Agregar Canción
              </Button>
            </div>
          </form>
        </CardContent>
      </div>
    </div>
  );
};

export default SongRequestList;