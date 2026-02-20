import React, { useState } from 'react';
import { TrackRequest } from '../../types/review.types';
import Input from '../common/Input';
import Button from '../common/Button';

interface ManualTrackAddProps {
  onAddTrack: (track: TrackRequest) => void;
  onCancel: () => void;
}

/**
 * 수동 트랙 추가 컴포넌트
 * - Spotify 검색 API 구현 전 임시 사용
 */
const ManualTrackAdd: React.FC<ManualTrackAddProps> = ({ onAddTrack, onCancel }) => {
  const [track, setTrack] = useState<TrackRequest>({
    spotifyId: '',
    title: '',
    artistName: '',
    albumImageUrl: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!track.spotifyId.trim() || !track.title.trim()) {
      alert('Spotify ID와 곡 제목은 필수입니다.');
      return;
    }

    onAddTrack(track);
    setTrack({
      spotifyId: '',
      title: '',
      artistName: '',
      albumImageUrl: '',
    });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">곡 수동 추가</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Spotify ID <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={track.spotifyId}
            onChange={(e) => setTrack({ ...track, spotifyId: e.target.value })}
            placeholder="예: 3n3Ppam7vgaVa1iaRUc9Lp"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            곡 제목 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={track.title}
            onChange={(e) => setTrack({ ...track, title: e.target.value })}
            placeholder="예: Tomboy"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white placeholder-gray-400"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            아티스트
          </label>
          <input
            type="text"
            value={track.artistName}
            onChange={(e) => setTrack({ ...track, artistName: e.target.value })}
            placeholder="예: hyukoh"
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            앨범 이미지 URL
          </label>
          <input
            type="url"
            value={track.albumImageUrl}
            onChange={(e) => setTrack({ ...track, albumImageUrl: e.target.value })}
            placeholder="https://i.scdn.co/image/..."
            className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-white placeholder-gray-400"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-white text-black rounded-full font-semibold hover:scale-105 transition-transform"
          >
            추가
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-700 text-white rounded-full font-semibold hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </form>

      {/* Spotify ID 안내 */}
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-xs text-blue-200 leading-relaxed">
          <strong className="block mb-1">💡 Spotify ID 찾는 방법:</strong>
          1. Spotify 웹사이트에서 곡 검색<br/>
          2. 곡 페이지 주소: spotify.com/track/<strong className="text-white">여기가_ID</strong><br/>
          3. 또는 공유하기 → 링크 복사 후 ID 부분만 사용
        </p>
      </div>
    </div>
  );
};

export default ManualTrackAdd;
