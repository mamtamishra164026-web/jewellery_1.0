package com.ecommerce.project.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * BroadcastCampaign — persists every marketing broadcast dispatch event.
 * Tracks campaign title, body content, recipient list, count, and dispatch time.
 */
@Entity
@Table(name = "broadcast_campaigns")
public class BroadcastCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private LocalDateTime sentAt;

    @Column(nullable = false)
    private int recipientCount;

    /**
     * Comma-separated list of all target email addresses in this batch.
     * Stored as TEXT for simplicity (no separate join table needed).
     */
    @Column(columnDefinition = "TEXT")
    private String recipients;

    public BroadcastCampaign() {
        this.sentAt = LocalDateTime.now();
    }

    public BroadcastCampaign(String title, String content, int recipientCount, String recipients) {
        this.title = title;
        this.content = content;
        this.sentAt = LocalDateTime.now();
        this.recipientCount = recipientCount;
        this.recipients = recipients;
    }

    // ── Getters & Setters ─────────────────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }

    public int getRecipientCount() { return recipientCount; }
    public void setRecipientCount(int recipientCount) { this.recipientCount = recipientCount; }

    public String getRecipients() { return recipients; }
    public void setRecipients(String recipients) { this.recipients = recipients; }
}
