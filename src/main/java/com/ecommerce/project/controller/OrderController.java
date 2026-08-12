package com.ecommerce.project.controller;

import com.ecommerce.project.model.Order;
import com.ecommerce.project.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private com.ecommerce.project.service.NotificationService notificationService;

    @PostMapping("/create")
    public ResponseEntity<Order> createOrder(
            @RequestBody(required = false) java.util.Map<String, Object> body,
            Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        Long addressId = null;
        if (body != null && body.get("addressId") != null) {
            addressId = Long.valueOf(body.get("addressId").toString());
        }
        Order order = orderService.createOrder(username, addressId);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/verify")
    public ResponseEntity<Order> verifyPayment(@RequestBody VerifyPaymentRequest request,
            Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        Order order = orderService.verifyPayment(username, request.getRazorpayOrderId(), request.getRazorpayPaymentId(),
                request.getRazorpaySignature());

        if ("FAILED".equals(order.getStatus())) {
            return ResponseEntity.badRequest().body(order);
        }

        try {
            notificationService.sendOrderConfirmationToUser(order.getUser(), order);
            notificationService.sendOrderAlertToAdmin(order);
        } catch (Exception e) {
            System.err.println("Notification dispatch failed: " + e.getMessage());
        }

        return ResponseEntity.ok(order);
    }

    /**
     * GET /api/orders/my-orders
     * Retrieves the history of orders for the logged-in customer.
     */
    @GetMapping("/my-orders")
    public ResponseEntity<java.util.List<Order>> getMyOrders(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        String username = authentication.getName();
        java.util.List<Order> orders = orderService.getMyOrders(username);
        if (orders == null) {
            orders = java.util.Collections.emptyList();
        }
        return ResponseEntity.ok(orders);
    }

    /**
     * POST /api/orders/{orderId}/simulate-payment
     * Development-only endpoint: completes an order without Razorpay modal.
     * Deducts stock, clears cart, marks order as PAID.
     */
    @PostMapping("/{orderId}/simulate-payment")
    public ResponseEntity<Order> simulatePayment(@PathVariable Long orderId, Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        Order order = orderService.simulatePayment(orderId, username);

        try {
            notificationService.sendOrderConfirmationToUser(order.getUser(), order);
            notificationService.sendOrderAlertToAdmin(order);
        } catch (Exception e) {
            System.err.println("Notification dispatch failed: " + e.getMessage());
        }

        return ResponseEntity.ok(order);
    }

    @PostMapping("/place")
    public ResponseEntity<Order> placeOrder(
            @RequestBody(required = false) java.util.Map<String, Object> body,
            Authentication authentication) {
        checkNotAdmin(authentication);
        String username = authentication.getName();
        Long addressId = null;
        String paymentStatus = null;
        java.math.BigDecimal deliveryFee = java.math.BigDecimal.ZERO;
        if (body != null) {
            if (body.get("addressId") != null) {
                addressId = Long.valueOf(body.get("addressId").toString());
            }
            if (body.get("paymentStatus") != null) {
                paymentStatus = body.get("paymentStatus").toString();
            }
            if (body.get("deliveryFee") != null) {
                deliveryFee = new java.math.BigDecimal(body.get("deliveryFee").toString());
            }
        }
    Order order = orderService.placeOrder(username, addressId, paymentStatus, deliveryFee);

        try {
            notificationService.sendOrderConfirmationToUser(order.getUser(), order);
            notificationService.sendOrderAlertToAdmin(order);
        } catch (Exception e) {
            System.err.println("Notification dispatch failed: " + e.getMessage());
        }

        return ResponseEntity.ok(order);
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
