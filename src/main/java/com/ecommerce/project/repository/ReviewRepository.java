package com.ecommerce.project.repository;

import com.ecommerce.project.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductIdAndStatus(Long productId, String status);
    List<Review> findByStatus(String status);
    List<Review> findByUserIdAndProductId(Long userId, Long productId);
}
