package com.ecommerce.project.controller;

import com.ecommerce.project.model.Address;
import com.ecommerce.project.model.User;
import com.ecommerce.project.repository.AddressRepository;
import com.ecommerce.project.repository.UserRepository;
import com.ecommerce.project.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/addresses")
public class AddressController {

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * GET /api/addresses
     * Returns all saved delivery addresses for the currently authenticated user.
     */
    @GetMapping
    public ResponseEntity<List<Address>> getMyAddresses(Authentication authentication) {
        User user = resolveUser(authentication);
        return ResponseEntity.ok(addressRepository.findByUser(user));
    }

    /**
     * POST /api/addresses
     * Persists a brand new delivery address linked to the current user.
     */
    @PostMapping
    public ResponseEntity<Address> createAddress(@RequestBody Map<String, String> body,
                                                  Authentication authentication) {
        User user = resolveUser(authentication);
        Address address = new Address(
                user,
                body.get("fullName"),
                body.get("addressLine"),
                body.get("city"),
                body.get("state"),
                body.get("pincode"),
                body.get("phoneNumber")
        );
        return ResponseEntity.ok(addressRepository.save(address));
    }

    /**
     * PUT /api/addresses/{id}
     * Safely updates an existing address record owned by the current user.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Address> updateAddress(@PathVariable Long id,
                                                  @RequestBody Map<String, String> body,
                                                  Authentication authentication) {
        User user = resolveUser(authentication);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        // Ownership guard
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        if (body.containsKey("fullName"))    address.setFullName(body.get("fullName"));
        if (body.containsKey("addressLine")) address.setAddressLine(body.get("addressLine"));
        if (body.containsKey("city"))        address.setCity(body.get("city"));
        if (body.containsKey("state"))       address.setState(body.get("state"));
        if (body.containsKey("pincode"))     address.setPincode(body.get("pincode"));
        if (body.containsKey("phoneNumber")) address.setPhoneNumber(body.get("phoneNumber"));

        return ResponseEntity.ok(addressRepository.save(address));
    }

    /**
     * DELETE /api/addresses/{id}
     * Safely deletes a saved address owned by the current authenticated user.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, Authentication authentication) {
        User user = resolveUser(authentication);
        Address address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address", "id", id));

        // Ownership guard
        if (!address.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        addressRepository.delete(address);
        return ResponseEntity.noContent().build();
    }

    // ── Helper ──────────────────────────────────────────────────────────────
    private User resolveUser(Authentication authentication) {
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
    }
}
