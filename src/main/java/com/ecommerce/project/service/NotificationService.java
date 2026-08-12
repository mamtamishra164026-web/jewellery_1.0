package com.ecommerce.project.service;

import com.ecommerce.project.model.Order;
import com.ecommerce.project.model.OrderItem;
import com.ecommerce.project.model.User;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.logging.Logger;

@Service
public class NotificationService {

    private static final Logger LOGGER = Logger.getLogger(NotificationService.class.getName());

    // Hardcoded admin alert destination
    private static final String ADMIN_ALERT_EMAIL = "shivamishra9535@gmail.com";

    @Autowired(required = false)
    private JavaMailSender mailSender;

    // ─────────────────────────────────────────────────────────────────────────
    // sendOrderConfirmationToUser
    // Compiles a premium HTML invoice and dispatches it to the customer.
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendOrderConfirmationToUser(User user, Order order) {
        try {
            String toEmail = user.getEmail();
            String subject = "CreationHub — Order Confirmation Details [#" + order.getId() + "]";

            StringBuilder html = new StringBuilder();
            html.append("<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background-color:#FAF6F0;'>");
            html.append("<h2 style='color:#0f172a;font-family:serif;border-bottom:2px solid #e2e8f0;padding-bottom:10px;'>Thank you for shopping with CreationHub!</h2>");
            html.append("<p style='font-size:14px;color:#475569;'>Your order is successfully confirmed.</p>");
            html.append("<p style='font-size:14px;color:#475569;'>Hi <strong>@").append(user.getUsername()).append("</strong>, here is your premium structured checkout invoice:</p>");

            html.append("<div style='background-color:#ffffff;padding:15px;border-radius:12px;margin:20px 0;'>");
            html.append("<p style='font-size:12px;margin:2px 0;'><strong>Order Reference:</strong> #").append(order.getId()).append("</p>");
            html.append("<p style='font-size:12px;margin:2px 0;'><strong>Placement Date:</strong> ").append(order.getOrderDate()).append("</p>");
            html.append("<p style='font-size:12px;margin:2px 0;'><strong>Fulfillment Stage:</strong> ").append(order.getOrderStatus()).append("</p>");
            html.append("<p style='font-size:12px;margin:2px 0;'><strong>Payment Status:</strong> ").append(order.getPaymentStatus()).append("</p>");

            if (order.getShippingFullName() != null) {
                html.append("<p style='font-size:12px;margin:10px 0 2px 0;'><strong>Recipient:</strong> ").append(order.getShippingFullName()).append("</p>");
            }
            String addressStr = order.getShippingAddress() != null ? order.getShippingAddress().toString() : "Address Not Provided";
            html.append("<p style='font-size:12px;margin:2px 0;'><strong>Shipping To:</strong> ").append(addressStr).append("</p>");
            if (order.getShippingPhone() != null) {
                html.append("<p style='font-size:12px;margin:2px 0;'><strong>Phone:</strong> ").append(order.getShippingPhone()).append("</p>");
            }
            html.append("</div>");

            html.append("<h4 style='font-size:12px;color:#0f172a;margin-top:15px;'>ITEM BRIEF SUMMARY:</h4>");
            html.append("<table style='width:100%;border-collapse:collapse;font-size:12px;'>");
            html.append("<tr style='border-bottom:1px solid #e2e8f0;text-align:left;color:#64748b;'>");
            html.append("<th style='padding:6px 0;'>Item Name</th><th style='padding:6px 0;'>Qty</th><th style='padding:6px 0;text-align:right;'>Total Price</th>");
            html.append("</tr>");

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    html.append("<tr style='border-bottom:1px solid #f1f5f9;'>");
                    html.append("<td style='padding:6px 0;'>").append(item.getProduct() != null ? item.getProduct().getName() : "Unknown Product").append("</td>");
                    html.append("<td style='padding:6px 0;'>").append(item.getQuantity()).append("</td>");
                    html.append("<td style='padding:6px 0;text-align:right;'>₹").append(item.getPrice().multiply(new BigDecimal(item.getQuantity()))).append("</td>");
                    html.append("</tr>");
                }
            }
            html.append("</table>");
            html.append("<p style='font-size:14px;margin-top:10px;color:#4f46e5;'><strong>Amount Charged:</strong> ₹").append(order.getTotalAmount()).append("</p>");
            html.append("<p style='font-size:11px;color:#64748b;'>We are currently preparing your premium lifestyle gear. Dispatch notifications and tracking logs will follow shortly.</p>");
            html.append("<p style='font-size:11px;color:#64748b;margin-top:20px;'>Aesthetic curation via <em>CreationHub Inc.</em></p>");
            html.append("</div>");

            dispatchEmail(toEmail, subject, html.toString());
        } catch (Exception e) {
            LOGGER.severe("[Notification ERROR] sendOrderConfirmationToUser failed for user=" + user.getUsername() + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // sendOrderAlertToAdmin
    // Dispatches an immediate high-priority alert to the admin inbox.
    // Admin email is hardcoded to: shivamishra9535@gmail.com
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void sendOrderAlertToAdmin(Order order) {
        try {
            String subject = "🚨 Alert: New Order Placed Successfully!";

            StringBuilder html = new StringBuilder();
            html.append("<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #fee2e2;border-radius:16px;background-color:#FAF6F0;'>");
            html.append("<h2 style='color:#ef4444;font-family:serif;border-bottom:2px solid #fee2e2;padding-bottom:10px;'>🚨 NEW ORDER FULFILLMENT NOTICE</h2>");

            String customerName = (order.getUser() != null) ? order.getUser().getUsername() : "Guest";
            html.append("<p style='font-size:13px;color:#475569;'>Customer: <strong>").append(customerName).append("</strong></p>");

            html.append("<div style='background-color:#ffffff;padding:15px;border-radius:12px;margin:15px 0;'>");
            html.append("<h4 style='margin:0 0 5px 0;font-size:12px;color:#0f172a;'>SHIPPING DESTINATION:</h4>");
            if (order.getShippingFullName() != null) {
                html.append("<p style='font-size:11px;margin:2px 0;'>Recipient: ").append(order.getShippingFullName()).append("</p>");
            }
            String addressStr = order.getShippingAddress() != null ? order.getShippingAddress().toString() : "Address Not Provided";
            html.append("<p style='font-size:11px;margin:2px 0;'>Address: ").append(addressStr).append("</p>");
            if (order.getShippingPhone() != null) {
                html.append("<p style='font-size:11px;margin:2px 0;'>Phone: ").append(order.getShippingPhone()).append("</p>");
            }
            html.append("</div>");

            html.append("<h4 style='font-size:12px;color:#0f172a;margin-top:15px;'>ITEM BRIEF SUMMARY:</h4>");
            html.append("<table style='width:100%;border-collapse:collapse;font-size:12px;'>");
            html.append("<tr style='border-bottom:1px solid #e2e8f0;text-align:left;color:#64748b;'>");
            html.append("<th style='padding:6px 0;'>Item Name</th><th style='padding:6px 0;'>Qty</th><th style='padding:6px 0;text-align:right;'>Total Price</th>");
            html.append("</tr>");

            if (order.getItems() != null) {
                for (OrderItem item : order.getItems()) {
                    html.append("<tr style='border-bottom:1px solid #f1f5f9;'>");
                    html.append("<td style='padding:6px 0;'>").append(item.getProduct() != null ? item.getProduct().getName() : "Unknown Product").append("</td>");
                    html.append("<td style='padding:6px 0;'>").append(item.getQuantity()).append("</td>");
                    html.append("<td style='padding:6px 0;text-align:right;'>₹").append(item.getPrice().multiply(new BigDecimal(item.getQuantity()))).append("</td>");
                    html.append("</tr>");
                }
            }
            html.append("</table>");
            html.append("<p style='font-size:14px;margin-top:15px;color:#4f46e5;'><strong>Total Paid:</strong> ₹").append(order.getTotalAmount()).append("</p>");
            html.append("</div>");

            dispatchEmail(ADMIN_ALERT_EMAIL, subject, html.toString());
        } catch (Exception e) {
            LOGGER.severe("[Notification ERROR] sendOrderAlertToAdmin failed for order#" + order.getId() + ": " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // broadcastPromotionalCampaign
    // Bulletproof per-user async broadcast.
    // If one email fails (Gmail refusal, bad address, timeout), the error is
    // logged and the loop continues — no global 500 is ever thrown back.
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void broadcastPromotionalCampaign(String targetEmail, String announcementTitle, String announcementText) {
        try {
            StringBuilder html = new StringBuilder();
            html.append("<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background-color:#FAF6F0;'>");
            html.append("<h2 style='color:#0f172a;font-family:serif;border-bottom:2px solid #e2e8f0;padding-bottom:10px;'>").append(announcementTitle).append("</h2>");
            html.append("<p style='font-size:14px;color:#475569;line-height:1.6;'>").append(announcementText).append("</p>");
            html.append("<p style='font-size:10px;color:#64748b;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:10px;'>This is a CreationHub corporate broadcast. &mdash; CreationHub Inc.</p>");
            html.append("</div>");

            dispatchEmail(targetEmail, "CREATIONHUB EXCLUSIVE: " + announcementTitle, html.toString());
            LOGGER.info("[Broadcast SUCCESS] Campaign dispatched to: " + targetEmail);
        } catch (Exception e) {
            // Per-user failure: log and continue — NEVER propagate up
            LOGGER.warning("[Broadcast SKIP] Failed to dispatch to " + targetEmail + " | Reason: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // broadcastToList — convenience overload accepting a full user list
    // Iterates per-user, wrapping every send in its own try-catch.
    // ─────────────────────────────────────────────────────────────────────────
    @Async
    public void broadcastToList(List<User> recipients, String title, String message) {
        int success = 0;
        int skipped = 0;
        for (User recipient : recipients) {
            if (recipient.getEmail() == null || recipient.getEmail().trim().isEmpty()) {
                skipped++;
                continue;
            }
            try {
                StringBuilder html = new StringBuilder();
                html.append("<div style='font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #e2e8f0;border-radius:16px;background-color:#FAF6F0;'>");
                html.append("<h2 style='color:#0f172a;font-family:serif;border-bottom:2px solid #e2e8f0;padding-bottom:10px;'>").append(title).append("</h2>");
                html.append("<p style='font-size:14px;color:#475569;line-height:1.6;'>").append(message).append("</p>");
                html.append("<p style='font-size:10px;color:#64748b;margin-top:20px;border-top:1px solid #e2e8f0;padding-top:10px;'>This is a CreationHub corporate broadcast. &mdash; CreationHub Inc.</p>");
                html.append("</div>");
                dispatchEmail(recipient.getEmail(), "CREATIONHUB EXCLUSIVE: " + title, html.toString());
                success++;
            } catch (Exception e) {
                // Per-user failure: log and continue — the loop must NOT stop
                LOGGER.warning("[Broadcast SKIP] Failed for " + recipient.getEmail() + " | Reason: " + e.getMessage());
                skipped++;
            }
        }
        LOGGER.info("[Broadcast COMPLETE] Sent=" + success + " | Skipped=" + skipped);
    }

    // ── Helper Email Dispatcher ───────────────────────────────────────────────
    private void dispatchEmail(String to, String subject, String body) {
        if (mailSender == null) {
            // Mock log when no SMTP server is configured (local dev without mail)
            LOGGER.warning("[Notification Mock] No SMTP configured. Simulated dispatch:");
            LOGGER.warning("[Notification Mock]  To: " + to);
            LOGGER.warning("[Notification Mock]  Subject: " + subject);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            LOGGER.info("[Notification SUCCESS] Email dispatched to " + to);
        } catch (Exception e) {
            LOGGER.severe("[Notification EXCEPTION] Failed to dispatch to " + to + ": " + e.getMessage());
            // Re-throw so the calling @Async method's own try-catch can log it properly
            throw new RuntimeException("Email dispatch failed for " + to, e);
        }
    }
}
