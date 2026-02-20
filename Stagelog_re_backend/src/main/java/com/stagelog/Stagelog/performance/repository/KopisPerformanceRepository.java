package com.stagelog.Stagelog.performance.repository;

import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KopisPerformanceRepository extends JpaRepository<KopisPerformance, Long> {
    Optional<KopisPerformance> findByKopisId(String mt20id);

    Page<KopisPerformance> findByHasDetailFalse(Pageable pageable);
}
