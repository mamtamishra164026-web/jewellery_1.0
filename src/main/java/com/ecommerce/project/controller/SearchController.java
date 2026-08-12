package com.ecommerce.project.controller;

import com.ecommerce.project.model.Product;
import com.ecommerce.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/products")
public class SearchController {

    @Autowired
    private ProductRepository productRepository;

    @GetMapping("/search/suggestions")
    public ResponseEntity<List<ProductSuggestionDTO>> getSearchSuggestions(@RequestParam("query") String query) {
        if (query == null || query.trim().length() <= 2) {
            return ResponseEntity.ok(List.of());
        }

        String trimmedQuery = query.trim();
        List<Product> matches = productRepository.findByProductNameContainingIgnoreCaseOrCategoryCategoryNameContainingIgnoreCase(trimmedQuery, trimmedQuery);

        // Fetch top 5 matching product rows
        List<ProductSuggestionDTO> suggestions = matches.stream()
                .limit(5)
                .map(product -> new ProductSuggestionDTO(
                        product.getId(),
                        product.getName(),
                        product.getPrice(),
                        product.getImageUrl()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(suggestions);
    }
}
