package com.ecommerce.project.controller;

import com.ecommerce.project.model.BroadcastCampaign;
import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.BroadcastCampaignRepository;
import com.ecommerce.project.repository.ProductRepository;
import com.ecommerce.project.repository.UserRepository;
import com.ecommerce.project.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.ecommerce.project.service.NotificationService notificationService;

    @Autowired
    private BroadcastCampaignRepository broadcastCampaignRepository;

    /**
     * GET /api/admin/analytics
     * Restricted to ROLE_ADMIN only.
     * Compiles sales and stock status dashboard.
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        Map<String, Object> analytics = orderService.getAnalytics();
        return ResponseEntity.ok(analytics);
    }

    /**
     * GET /api/admin/users
     * Fetches all registered users from the Database and returns them as a List.
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    /**
     * PUT /api/admin/users/{id}/role
     * Accepts a path variable for the User ID and updates that specific user's role in the database.
     */
    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestParam(required = false) String role,
            @RequestBody(required = false) Map<String, String> body) {

        String newRole = role;
        if (newRole == null && body != null) {
            newRole = body.get("role");
        }

        if (newRole == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Role parameter or body field is required"));
        }

        // Standardize to ROLE_ format
        if (!newRole.startsWith("ROLE_")) {
            newRole = "ROLE_" + newRole.toUpperCase();
        } else {
            newRole = "ROLE_" + newRole.substring(5).toUpperCase();
        }

        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        user.setRole(newRole);
        userRepository.save(user);

        return ResponseEntity.ok(user);
    }

    /**
     * GET /api/admin/orders
     * Restricted to ROLE_ADMIN only.
     * Performs optimized relational fetch of all customer orders.
     */
    @GetMapping("/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.ecommerce.project.model.Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * PUT /api/admin/orders/{orderId}/status
     * Restricted to ROLE_ADMIN only.
     * Safely updates the order's fulfillment lifecycle state.
     */
    @PutMapping("/orders/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.ecommerce.project.model.Order> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("status field is required");
        }
        com.ecommerce.project.model.Order updated = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/admin/users/{userId}/history
     * Restricted to ROLE_ADMIN only.
     * Relational JPQL query to retrieve a specific customer's purchase history.
     */
    @GetMapping("/users/{userId}/history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getUserOrderHistory(@PathVariable Long userId) {
        List<Order> orders = userRepository.findOrdersByUserId(userId);
        List<Map<String, Object>> history = new ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("orderId", o.getId());
            
            List<String> productNames = new ArrayList<>();
            if (o.getItems() != null) {
                for (com.ecommerce.project.model.OrderItem item : o.getItems()) {
                    if (item.getProduct() != null) {
                        productNames.add(item.getProduct().getName());
                    }
                }
            }
            map.put("productNames", productNames);
            map.put("totalOrderCost", o.getTotalAmount());
            map.put("executionTimestamp", o.getOrderDate());
            map.put("paymentStatus", o.getPaymentStatus());
            map.put("orderStatus", o.getOrderStatus());
            history.add(map);
        }
        return ResponseEntity.ok(history);
    }

    /**
     * GET /api/admin/products/low-stock
     * Restricted to ROLE_ADMIN only.
     * Dynamically fetches products with stock quantity below threshold of 5.
     */
    @GetMapping("/products/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<com.ecommerce.project.model.Product>> getLowStockProducts() {
        List<com.ecommerce.project.model.Product> lowStock = productRepository.findByStockQuantityLessThan(5);
        return ResponseEntity.ok(lowStock);
    }

    /**
     * POST /api/admin/notifications/broadcast
     * Restricted to ROLE_ADMIN only.
     * Triggers async broadcast and persists a BroadcastCampaign audit record.
     */
    @PostMapping("/notifications/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> broadcastMarketingCampaign(
            @RequestBody Map<String, String> payload) {
        String title = payload.get("title");
        String message = payload.get("message");

        if (title == null || title.trim().isEmpty() || message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "title and message are required fields"));
        }

        List<User> recipients = userRepository.findAll();
        List<String> targetEmails = new ArrayList<>();

        for (User recipient : recipients) {
            if (recipient.getEmail() != null && !recipient.getEmail().trim().isEmpty()) {
                notificationService.broadcastPromotionalCampaign(recipient.getEmail(), title, message);
                targetEmails.add(recipient.getEmail());
            }
        }

        // Persist broadcast campaign audit record
        String recipientsCsv = String.join(",", targetEmails);
        BroadcastCampaign campaign = new BroadcastCampaign(title, message, targetEmails.size(), recipientsCsv);
        broadcastCampaignRepository.save(campaign);

        return ResponseEntity.ok(Map.of(
                "status", "DISPATCHED",
                "message", "Broadcast triggered asynchronously for " + targetEmails.size() + " active user mailboxes.",
                "campaignId", campaign.getId().toString()
        ));
    }

    /**
     * GET /api/admin/broadcasts
     * Restricted to ROLE_ADMIN only.
     * Returns full broadcast campaign history sorted newest-first.
     */
    @GetMapping("/broadcasts")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BroadcastCampaign>> getBroadcastHistory() {
        return ResponseEntity.ok(broadcastCampaignRepository.findAllByOrderBySentAtDesc());
    }
}
