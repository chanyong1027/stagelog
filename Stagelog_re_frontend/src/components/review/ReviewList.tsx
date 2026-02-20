import React from 'react';
import { ReviewListItem } from '../../types/review.types';
import ReviewCard from './ReviewCard';

interface ReviewListProps {
  reviews: ReviewListItem[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg mb-4">작성한 리뷰가 없습니다.</p>
        <p className="text-gray-400 text-sm">첫 공연 후기를 작성해보세요!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};

export default ReviewList;
