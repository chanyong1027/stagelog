import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ReviewListItem } from '../../types/review.types';
import { formatDateTime } from '../../utils/dateFormatter';
import { ROUTES } from '../../utils/constants';
import Card from '../common/Card';

interface ReviewCardProps {
  review: ReviewListItem;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(ROUTES.REVIEW_DETAIL(review.id));
  };

  return (
    <Card onClick={handleClick} hoverable className="cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* 제목 */}
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {review.title}
          </h3>

          {/* 작성일 */}
          <p className="text-sm text-gray-500">
            📝 {formatDateTime(review.createdAt)}
          </p>
        </div>

        {/* 화살표 아이콘 */}
        <svg
          className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </Card>
  );
};

export default ReviewCard;
