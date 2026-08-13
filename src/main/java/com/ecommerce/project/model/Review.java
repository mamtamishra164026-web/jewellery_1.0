package com.ecommerce.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Long userId;

    private String username;

    private Integer rating;

    @Column(length = 2000)
    private String comment;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl;

    // Status: PENDING, APPROVED, REJECTED
    @Column(nullable = false)
    private String status = "PENDING";

    private Boolean isVerifiedPurchase = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Review(Long productId, Long userId, String username, Integer rating, String comment, String imageUrl, String status, Boolean isVerifiedPurchase) {
        this.productId = productId;
        this.userId = userId;
        this.username = username;
        this.rating = rating;
        this.comment = comment;
        this.imageUrl = imageUrl;
        this.status = status;
        this.isVerifiedPurchase = isVerifiedPurchase;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getIsVerifiedPurchase() { return isVerifiedPurchase; }
    public void setIsVerifiedPurchase(Boolean isVerifiedPurchase) { this.isVerifiedPurchase = isVerifiedPurchase; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
