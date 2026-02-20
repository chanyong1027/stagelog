import client from './client';

/**
 * Spotify 트랙 DTO
 */
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  external_urls: { [key: string]: string };
  preview_url: string | null;
}

/**
 * Spotify 트랙 검색 응답
 */
export interface SpotifyTrackSearchResponse {
  tracks: {
    items: SpotifyTrack[];
  };
}

/**
 * Spotify API
 */
export const spotifyAPI = {
  /**
   * Spotify 트랙 검색
   * @param keyword - 검색어 (곡 제목, 아티스트 등)
   * @param limit - 결과 개수 (기본 10)
   */
  searchTracks: (keyword: string, limit: number = 10) =>
    client.get<SpotifyTrackSearchResponse>('/api/spotify/search/tracks', {
      params: { keyword, limit },
    }),
};
