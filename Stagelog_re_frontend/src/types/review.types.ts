// 리뷰 목록 아이템
export interface ReviewListItem {
  id: number;
  title: string;
  createdAt: string;
}

// 리뷰 상세
export interface ReviewDetail {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  playlistTitle?: string;  // 플레이리스트 제목
  tracks: Track[];
}

// 트랙 (셋리스트)
export interface Track {
  id: number;
  title: string;
  artistName: string;
  albumImageUrl: string;
  spotifyId: string;
}

// 리뷰 생성 요청
export interface ReviewCreateRequest {
  title: string;
  content: string;
  playlistTitle?: string;  // 플레이리스트 제목
  tracks?: TrackRequest[];
}

// 리뷰 수정 요청
export interface ReviewUpdateRequest {
  title: string;
  content: string;
  playlistTitle?: string;  // 플레이리스트 제목
  tracks?: TrackRequest[];
}

// 트랙 요청
export interface TrackRequest {
  spotifyId: string;
  title: string;
  artistName: string;
  albumImageUrl: string;
}
