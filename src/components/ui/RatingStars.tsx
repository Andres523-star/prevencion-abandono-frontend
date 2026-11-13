import React from 'react';
import '../../styles/ratingStars.css';

export interface RatingStarsProps {
  value: number;
  max?: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  value,
  max = 5,
  onChange,
  readonly = true
}) => {
  return (
    <div className="ui-rating-stars" role="radiogroup" aria-label="Calificación">
      {Array.from({ length: max }).map((_, idx) => {
        const starNum = idx + 1;
        const active = starNum <= value;
        return (
          <button
            key={idx}
            type="button"
            className={`ui-star-btn ${active ? 'filled' : ''} ${readonly ? 'readonly' : ''}`}
            onClick={() => !readonly && onChange && onChange(starNum)}
            disabled={readonly}
            aria-label={`${starNum} estrellas`}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
};
