package com.stagelog.Stagelog.performance.domain;

import com.stagelog.Stagelog.global.entity.BaseEntity;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.global.exception.InvalidInputException;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceDetailItem;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.stream.Collectors;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "kopis_performance")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class KopisPerformance extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "mt20id", unique = true, nullable = false)
    private String kopisId;

    @Column(name = "prfnm")
    private String title;

    @Column(name = "poster", length = 1000)
    private String posterUrl;

    @Column(name = "fcltynm")
    private String venue;

    @Column(name = "prfstate")
    private String status;

    @Column(name = "prfpdfrom")
    private LocalDate startDate;

    @Column(name = "prfpdto")
    private LocalDate endDate;

    @Column(name = "genrenm")
    private String genre;

    @Column(name = "has_detail")
    private Boolean hasDetail = false; // 상세 정보 수집 여부

    // --------상세 정보로 받아 올 필드들--------

    @Column(name = "prfcast", columnDefinition = "TEXT")
    private String cast;

    @Column(name = "prfruntime")
    private String runtime;

    @Column(name = "pcseguidance", length = 1000)
    private String ticketPrice;

    @Column(name = "area")
    private String area;

    @Column(name = "dtguidance")
    private String performanceStartTime;

    @Column(name = "visit")
    private boolean isVisit;

    @Column(name = "festival")
    private boolean isFestival;

    @Column(name = "relatenm")
    private String ticketVendor;

    @Column(name = "relateurl", columnDefinition = "TEXT")
    private String ticketUrl;

    public void updateStatus(String status) {
        this.status = status;
    }

    public void updateDetailInfo(KopisPerformanceDetailItem detail) {
        if (detail == null) {
            throw new InvalidInputException(ErrorCode.PERFORMANCE_DETAIL_NULL);
        }

        this.title = detail.getPrfnm();
        this.cast = detail.getPrfcast();
        this.runtime = detail.getPrfruntime();
        this.genre = detail.getGenrenm();
        this.ticketPrice = detail.getPcseguidance();
        this.performanceStartTime = detail.getDtguidance();
        this.area = detail.getArea();
        this.startDate = detail.getStartDate();
        this.endDate = detail.getEndDate();
        this.hasDetail = true;
        this.isFestival = detail.isFestival();
        this.isVisit = detail.isVisitPerformance();
        this.ticketVendor = detail.getRelates().stream()
                .map(KopisPerformanceDetailItem.RelateDto::getRelatenm)
                .collect(Collectors.joining(", "));
        this.ticketUrl = detail.getTicketLinks().stream()
                .map(KopisPerformanceDetailItem.RelateDto::getRelateurl)
                .filter(url -> url != null && !url.isEmpty())
                .collect(Collectors.joining(", "));
    }


    public void handleNoDetail() {
        this.hasDetail = true;
    }
}
