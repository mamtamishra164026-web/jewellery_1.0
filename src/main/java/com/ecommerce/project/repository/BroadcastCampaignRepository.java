package com.ecommerce.project.repository;

import com.ecommerce.project.model.BroadcastCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BroadcastCampaignRepository extends JpaRepository<BroadcastCampaign, Long> {
    /** Returns all campaigns sorted newest-first. */
    List<BroadcastCampaign> findAllByOrderBySentAtDesc();
}
