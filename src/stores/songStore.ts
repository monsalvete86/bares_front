import { create } from 'zustand';
import { customerSongService } from '../services/customerApi';
import { socketService } from '../services/socket.service';

export interface SongRequest {
  id: string;
  title: string;
  artist?: string;
  youtubeUrl?: string;
  isKaraoke: boolean;
  status: 'pending' | 'playing' | 'completed';
  requestedBy: {
    id: string;
    name: string;
    tableId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSongRequest {
  title: string;
  artist?: string;
  youtubeUrl?: string;
  isKaraoke: boolean;
  requestedBy: {
    id: string;
    name: string;
    tableId: string;
  };
}

interface SongState {
  songRequests: SongRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchSongRequests: () => Promise<void>;
  fetchSongRequestsByTable: (tableId: string) => Promise<void>;
  addSongRequest: (songRequest: CreateSongRequest) => Promise<void>;
  updateSongRequestStatus: (id: string, status: SongRequest['status']) => Promise<void>;
}

export const useSongStore = create<SongState>()((set, get) => ({
  songRequests: [],
  isLoading: false,
  error: null,
  
  fetchSongRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await customerSongService.getSongsByTable('all');
      set({ 
        songRequests: response.data.map((song: any) => ({
          ...song,
          createdAt: new Date(song.createdAt),
          updatedAt: new Date(song.updatedAt)
        })),
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Error al cargar las solicitudes de canciones', isLoading: false });
      console.error('Error fetching song requests:', error);
    }
  },
  
  fetchSongRequestsByTable: async (tableId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customerSongService.getSongsByTable(tableId);
      // Parse dates
      const songs = response.data.map((song: any) => ({
        ...song,
        createdAt: new Date(song.createdAt),
        updatedAt: new Date(song.updatedAt)
      }));
      
      set({ songRequests: songs, isLoading: false });
    } catch (error) {
      set({ error: `Error al cargar las canciones de la mesa ${tableId}`, isLoading: false });
      console.error('Error fetching table songs:', error);
    }
  },
  
  addSongRequest: async (songRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await customerSongService.createSongRequest(songRequest);
      const newSong = {
        ...response.data,
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt)
      };
      
      set(state => ({
        songRequests: [...state.songRequests, newSong],
        isLoading: false
      }));
    } catch (error) {
      set({ error: 'Error al crear la solicitud de canción', isLoading: false });
      console.error('Error creating song request:', error);
    }
  },
  
  updateSongRequestStatus: async (id, status) => {
    // Esta función no se necesita en la vista de cliente, pero mantenemos
    // la firma del método para compatibilidad
    console.log('updateSongRequestStatus no implementado en vista de cliente');
    return Promise.resolve();
  }
}));