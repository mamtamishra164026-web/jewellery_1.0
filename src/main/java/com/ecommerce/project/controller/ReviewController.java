package com.ecommerce.project.controller;

import com.ecommerce.project.model.Review;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.ReviewRepository;
import com.ecommerce.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ReviewController {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * POST /api/reviews/submit
     * Authenticated customer submits a review with rating, text, and optional photo.
     */
    @PostMapping("/reviews/submit")
    public ResponseEntity<?> submitReview(@RequestBody Map<String, Object> payload, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(Map.of("message", "Authentication required"));
        }

        try {
            String username = authentication.getName();
            Optional<User> userOpt = userRepository.findByUsername(username);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "User not found"));
            }

            User user = userOpt.get();
            Long productId = Long.valueOf(payload.get("productId").toString());
            Integer rating = Integer.valueOf(payload.get("rating").toString());
            String comment = payload.get("comment") != null ? payload.get("comment").toString() : "";
            String imageUrl = payload.get("imageUrl") != null ? payload.get("imageUrl").toString() : null;

            Review review = new Review();
            review.setProductId(productId);
            review.setUserId(user.getId());
            review.setUsername(user.getUsername());
            review.setRating(rating);
            review.setComment(comment);
            review.setImageUrl(imageUrl);
            review.setStatus("PENDING"); // Requires admin approval by default
            review.setIsVerifiedPurchase(true);

            Review saved = reviewRepository.save(review);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Failed to submit review: " + e.getMessage()));
        }
    }

    /**
     * GET /api/public/reviews/product/{productId}
     * Returns approved reviews for a given product along with computed average rating.
     */
    @GetMapping("/public/reviews/product/{productId}")
    public ResponseEntity<Map<String, Object>> getProductReviews(@PathVariable Long productId) {
        List<Review> approved = reviewRepository.findByProductIdAndStatus(productId, "APPROVED");

        double avgRating = 0.0;
        if (!approved.isEmpty()) {
            avgRating = approved.stream().mapToInt(Review::getRating).average().orElse(0.0);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("reviews", approved);
        response.put("totalReviews", approved.size());
        response.put("averageRating", Math.round(avgRating * 10.0) / 10.0);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/admin/reviews
     * Admin fetches all reviews (pending, approved, rejected).
     */
    @GetMapping("/admin/reviews")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Review>> getAllReviewsForAdmin() {
        return ResponseEntity.ok(reviewRepository.findAll());
    }

    /**
     * PUT /api/admin/reviews/{id}/status
     * Admin updates status of a review (APPROVED, REJECTED, PENDING).
     */
    @PutMapping("/admin/reviews/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateReviewStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<Review> opt = reviewRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();

        Review review = opt.get();
        if (body.get("status") != null) {
            review.setStatus(body.get("status").toUpperCase());
        }
        Review updated = reviewRepository.save(review);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/admin/reviews/{id}
     * Admin deletes a review.
     */
    @DeleteMapping("/admin/reviews/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable Long id) {
        if (!reviewRepository.existsById(id)) return ResponseEntity.notFound().build();
        reviewRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Review deleted successfully"));
    }
}
