
// Review/Rating Schema (Separate)
const reviewSchema = new mongoose.Schema({
    user: { // User who wrote the review (can be owner or workshop)
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      message: 'Reviewer is required'
    },
    workshop: { // Workshop being reviewed
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      message: 'Workshop being reviewed is required'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
      message: 'Rating must be between 1 and 5'
    },
    comment: {
      type: String
    },
    breakdown: { // Optional: Link review to a specific breakdown
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Breakdown',
      message: 'Review can optionally be linked to a breakdown'
    }
  }, { timestamps: true });
  
  const Review = mongoose.model('Review', reviewSchema);
  
  
  module.exports =  Review 