package com.ecommerce.project.service;

import com.ecommerce.project.exception.ProductNotFoundException;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    /**
     * Retrieve a paginated, sorted list of all products.
     */
    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    /**
     * Retrieve a single product by its ID.
     * 
     * @throws ProductNotFoundException if the product does not exist.
     */
    @Transactional(readOnly = true)
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ProductNotFoundException(id));
    }

    /**
     * Save a new product to the database.
     */
    @Transactional
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    /**
     * Delete a product permanently by its ID.
     */
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
    }

    /**
     * Update an existing product's fields.
     */
    @Transactional
    public Product updateProduct(Long id, Product updatedProduct) {
        Product existing = getProductById(id);
        existing.setName(updatedProduct.getName());
        existing.setDescription(updatedProduct.getDescription());
        existing.setPrice(updatedProduct.getPrice());
        existing.setStockQuantity(updatedProduct.getStockQuantity());
        // Explicitly overwrite the image URL parameter directly to prevent any local caching/stale reads
        existing.setImageUrl(updatedProduct.getImageUrl());
        
        // Ensure immediate flush to physical database to bypass JPA transactional write-behind caching
        return productRepository.saveAndFlush(existing);
    }

    /**
     * Directly adjust the stock quantity of a product.
     */
    @Transactional
    public Product patchStock(Long id, Integer quantityChange) {
        Product existing = getProductById(id);
        int newStock = existing.getStockQuantity() + quantityChange;
        if (newStock < 0) {
            throw new IllegalArgumentException("Stock quantity cannot be negative.");
        }
        existing.setStockQuantity(newStock);
        return productRepository.save(existing);
    }
}
