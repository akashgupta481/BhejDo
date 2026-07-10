import { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import api from '../lib/api';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  parcelId: string;
  travelerName?: string;
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  parcelId,
  travelerName = 'the traveler',
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.post('/reviews', {
        parcel_id: parcelId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const displayRating = hoveredRating || rating;

  const getRatingLabel = (r: number): string => {
    switch (r) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          /* Success State */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
              <Star className="w-8 h-8 text-emerald-600 fill-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 mb-6">
              Your review has been submitted successfully. It helps build trust in our community.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        ) : (
          /* Review Form */
          <>
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 bg-indigo-100 rounded-full flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Rate Your Experience</h3>
              <p className="text-sm text-gray-500 mt-1">
                How was your delivery experience with {travelerName}?
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Star Rating */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= displayRating
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-gray-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {displayRating > 0 && (
                <span className="text-sm font-medium text-amber-600">
                  {getRatingLabel(displayRating)}
                </span>
              )}
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comment (optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience... Was the delivery on time? Was the parcel in good condition?"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                maxLength={500}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{comment.length}/500</p>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200/50"
            >
              {submitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Review
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
