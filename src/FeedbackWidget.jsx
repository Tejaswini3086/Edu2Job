import React, { useState } from 'react';

const FeedbackWidget = ({ userEmail, suggestedJob }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0); // Existing Feature: Star hover effect
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async () => {
        // Validation logic preserved
        if (rating === 0) {
            alert("Please select a star rating!");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/education/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userEmail: userEmail, // Prop used correctly for Admin Dashboard
                    rating: rating,
                    comment: comment,
                    suggestedJob: suggestedJob
                })
            });

            if (response.ok) {
                setSubmitted(true);
                // Existing Feature: Auto-scroll to confirmation message
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
        } catch (error) {
            console.error("Feedback Error:", error);
            alert("Could not submit feedback. Please check your connection.");
        }
    };

    // Existing Feature: Success state UI
    if (submitted) return (
        <div style={{
            color: '#4ade80', 
            marginTop: '20px', 
            fontWeight: 'bold', 
            padding: '15px', 
            background: 'rgba(74, 222, 128, 0.1)', 
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #4ade80'
        }}>
            ✅ Thank you! Your feedback helps us improve our AI model.
        </div>
    );

    return (
        <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            background: 'rgba(46, 139, 87, 0.1)', 
            borderRadius: '15px', 
            border: '1px solid #2E8B57' 
        }}>
            <h4 style={{ color: '#2E8B57', marginTop: 0 }}>Rate this Career Suggestion</h4>
            <p style={{fontSize: '0.8rem', color: '#94a3b8'}}>How relevant is "{suggestedJob}" to your profile?</p>
            
            {/* Existing Feature: Interactive Star Rating with Hover */}
            <div style={{ fontSize: '24px', cursor: 'pointer', marginBottom: '15px' }}>
                {[1, 2, 3, 4, 5].map(star => (
                    <span 
                        key={star} 
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)} 
                        onMouseLeave={() => setHoverRating(0)} 
                        style={{ 
                            color: star <= (hoverRating || rating) ? '#FFD700' : '#475569', 
                            marginRight: '5px',
                            transition: 'color 0.2s' 
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>

            <textarea 
                placeholder="Any comments on the accuracy?" 
                value={comment}
                maxLength="200" // Existing Feature: 200 character limit
                onChange={(e) => setComment(e.target.value)}
                style={{ 
                    width: '100%', 
                    padding: '10px', 
                    borderRadius: '8px', 
                    background: '#0f172a', 
                    color: 'white', 
                    border: '1px solid #334155',
                    marginBottom: '5px',
                    fontFamily: 'inherit',
                    resize: 'none'
                }}
                rows="3"
            />
            
            {/* Existing Feature: Real-time character count display */}
            <div style={{ textAlign: 'right', fontSize: '0.7rem', color: '#64748b', marginBottom: '10px' }}>
                {comment.length}/200 characters
            </div>

            <button 
                onClick={handleSubmit} 
                style={{ 
                    background: '#2E8B57', 
                    color: 'white', 
                    border: 'none', 
                    padding: '12px 20px', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    width: '100%',
                    transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.opacity = '0.9'}
                onMouseOut={(e) => e.target.style.opacity = '1'}
            >
                Submit Feedback
            </button>
        </div>
    );
};

export default FeedbackWidget;