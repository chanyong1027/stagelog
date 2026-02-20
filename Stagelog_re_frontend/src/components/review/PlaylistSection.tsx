import React from 'react';
import { Track } from '../../types/review.types';

interface PlaylistSectionProps {
  tracks: Track[];
  onRemoveTrack?: (trackId: number) => void;
  editable?: boolean;
}

const PlaylistSection: React.FC<PlaylistSectionProps> = ({
  tracks,
  onRemoveTrack,
  editable = false,
}) => {
  if (tracks.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
        플레이리스트가 비어있습니다
      </div>
    );
  }

  return (
    <div className="playlist-section">
      <h3 className="text-xl font-semibold mb-4">셋리스트 (Playlist)</h3>
      <div className="space-y-3">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            {/* 앨범 이미지 */}
            <img
              src={track.albumImageUrl}
              alt={track.title}
              className="w-16 h-16 rounded object-cover"
            />

            {/* 트랙 정보 */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{track.title}</h4>
              <p className="text-sm text-gray-600">{track.artistName}</p>
            </div>

            {/* 삭제 버튼 (수정 모드일 때만) */}
            {editable && onRemoveTrack && (
              <button
                onClick={() => onRemoveTrack(track.id)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded"
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlaylistSection;
