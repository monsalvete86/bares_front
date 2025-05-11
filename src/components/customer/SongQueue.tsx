import React, { useEffect } from 'react';
import { useSongStore, SongRequest } from '../../stores/songStore';
import { useAuthStore } from '../../stores/authStore';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Music, Mic } from 'lucide-react';

const SongQueue: React.FC = () => {
  const { songRequests, fetchSongRequestsByTable } = useSongStore();
  const { user } = useAuthStore();
  
  const [filter, setFilter] = React.useState<'all' | 'table' | 'mine'>('all');
  
  // Cargar canciones al montar el componente
  useEffect(() => {
    if (user?.tableId) {
      fetchSongRequestsByTable(filter === 'all' ? 'all' : user.tableId);
    }
  }, [user, filter, fetchSongRequestsByTable]);
  
  const pendingSongs = songRequests.filter(song => song.status === 'pending');
  
  const filteredSongs = React.useMemo(() => {
    if (filter === 'all') return pendingSongs;
    
    if (filter === 'table' && user?.tableId) {
      return pendingSongs.filter(song => song.requestedBy.tableId === user.tableId);
    }
    
    if (filter === 'mine' && user?.id) {
      return pendingSongs.filter(song => song.requestedBy.id === user.id);
    }
    
    return pendingSongs;
  }, [pendingSongs, filter, user]);
  
  return (
    <div>
      <div className="mb-4 flex overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setFilter('all')}
        >
          Todas
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium mr-2 ${
            filter === 'table' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setFilter('table')}
        >
          Mi Mesa
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === 'mine' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-800'
          }`}
          onClick={() => setFilter('mine')}
        >
          Mis Canciones
        </button>
      </div>
      
      {filteredSongs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Music size={48} className="mx-auto mb-2 opacity-30" />
          <p>No hay canciones pendientes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSongs.map((song, index) => (
            <SongCard 
              key={song.id} 
              song={song} 
              position={index + 1}
              isUserSong={song.requestedBy.id === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface SongCardProps {
  song: SongRequest;
  position: number;
  isUserSong: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ song, position, isUserSong }) => {
  return (
    <div className={`p-3 rounded-lg border ${
      isUserSong ? 'border-primary-light bg-primary bg-opacity-5' : 'border-gray-200 bg-white'
    } animate-slide-in`}>
      <div className="flex items-start">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-800 font-medium mr-3">
          {position}
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium">{song.title}</h3>
          {song.artist && (
            <p className="text-sm text-gray-600">{song.artist}</p>
          )}
          
          <div className="mt-1 flex items-center text-xs text-gray-500">
            <span className="mr-2">Mesa {song.requestedBy.tableId}</span>
            <span>•</span>
            <span className="mx-2">{song.requestedBy.name}</span>
            <span>•</span>
            <span className="ml-2">
              {formatDistanceToNow(song.createdAt, { 
                addSuffix: true,
                locale: es
              })}
            </span>
          </div>
        </div>
        
        {song.isKaraoke && (
          <div className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs flex items-center">
            <Mic size={12} className="mr-1" />
            Karaoke
          </div>
        )}
      </div>
    </div>
  );
};

export default SongQueue;