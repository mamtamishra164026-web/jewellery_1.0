package com.ecommerce.project.service;

import com.ecommerce.project.exception.InsufficientStockException;
import com.ecommerce.project.exception.ProductNotFoundException;
import com.ecommerce.project.exception.ResourceNotFoundException;
import com.ecommerce.project.model.CartItem;
import com.ecommerce.project.model.Product;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.CartItemRepository;
import com.ecommerce.project.repository.ProductRepository;
import com.ecommerce.project.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CartItem> getCartItems(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        return cartItemRepository.findByUser(user);
    }

    @Transactional
    public CartItem addToCart(String username, Long productId, Integer quantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        // Check if item is already in cart
        Optional<CartItem> existingItemOptional = cartItemRepository.findByUserAndProduct(user, product);
        
        int requestedTotalQuantity = quantity;
        CartItem cartItem;

        if (existingItemOptional.isPresent()) {
            cartItem = existingItemOptional.get();
            requestedTotalQuantity += cartItem.getQuantity();
        } else {
            cartItem = new CartItem(user, product, 0);
        }

        // Business Logic Guard: Check stock quantity
        if (requestedTotalQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException(productId, 
                "Requested quantity (" + requestedTotalQuantity + ") exceeds physical warehouse stock (" + product.getStockQuantity() + ")");
        }

        cartItem.setQuantity(requestedTotalQuantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateQuantity(String username, Long itemId, Integer quantity) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        CartItem cartItem = cartItemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));

        Product product = cartItem.getProduct();

        // Business Logic Guard: Check stock quantity
        if (quantity > product.getStockQuantity()) {
            throw new InsufficientStockException(product.getId(),
                    "Requested quantity (" + quantity + ") exceeds physical warehouse stock (" + product.getStockQuantity() + ")");
        }

        cartItem.setQuantity(quantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeCartItem(String username, Long itemId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        CartItem cartItem = cartItemRepository.findByIdAndUser(itemId, user)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));
                
        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public List<CartItem> mergeCart(String username, List<com.ecommerce.project.controller.CartRequest> requests) {
        for (com.ecommerce.project.controller.CartRequest request : requests) {
            addToCart(username, request.getProductId(), request.getQuantity());
        }
        return getCartItems(username);
    }
}
