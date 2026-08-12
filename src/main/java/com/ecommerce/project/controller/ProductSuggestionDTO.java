package com.ecommerce.project.controller;

import java.math.BigDecimal;

public class ProductSuggestionDTO {
    private Long id;
    private String productName;
    private BigDecimal price;
    private String image;

    public ProductSuggestionDTO() {}

    public ProductSuggestionDTO(Long id, String productName, BigDecimal price, String image) {
        this.id = id;
        this.productName = productName;
        this.price = price;
        this.image = image;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
