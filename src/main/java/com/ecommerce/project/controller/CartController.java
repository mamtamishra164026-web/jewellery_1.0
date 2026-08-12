package com.ecommerce.project.controller;

import com.ecommerce.project.model.CartItem;
import com.ecommerce.project.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<List<CartItem>> getCartItems(Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        List<CartItem> cartItems = cartService.getCartItems(username);
        return ResponseEntity.ok(cartItems);
    }

    @PostMapping("/add")
    public ResponseEntity<CartItem> addToCart(@Valid @RequestBody CartRequest request, Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        CartItem cartItem = cartService.addToCart(username, request.getProductId(), request.getQuantity());
        return ResponseEntity.ok(cartItem);
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CartItem> updateQuantity(@PathVariable Long itemId, @Valid @RequestBody UpdateCartRequest request, Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        CartItem cartItem = cartService.updateQuantity(username, itemId, request.getQuantity());
        return ResponseEntity.ok(cartItem);
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> removeCartItem(@PathVariable Long itemId, Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        cartService.removeCartItem(username, itemId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/merge")
    public ResponseEntity<List<CartItem>> mergeCart(@RequestBody List<CartRequest> requests, Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        List<CartItem> cartItems = cartService.mergeCart(username, requests);
        return ResponseEntity.ok(cartItems);
    }

    private void checkNotAdmin(Authentication authentication) {
        if (authentication != null) {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (isAdmin) {
                throw new com.ecommerce.project.exception.ApiException("Admin cannot place orders");
            }
        }
    }
}
