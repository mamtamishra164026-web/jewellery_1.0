package com.ecommerce.project.repository;

import com.ecommerce.project.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStockQuantityLessThan(Integer threshold);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :productName, '%')) OR (p.category IS NOT NULL AND LOWER(p.category) LIKE LOWER(CONCAT('%', :categoryName, '%')))")
    List<Product> findByProductNameContainingIgnoreCaseOrCategoryCategoryNameContainingIgnoreCase(
            @org.springframework.data.repository.query.Param("productName") String productName, 
            @org.springframework.data.repository.query.Param("categoryName") String categoryName);
}
