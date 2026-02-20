package com.stagelog.Stagelog.performance.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlElementWrapper;
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class KopisPerformanceDetailItem {

    private static final DateTimeFormatter KOPIS_DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy.MM.dd");

    private String mt20id; // 뮤지컬 고유 id
    private String prfnm; // 공연 이름
    private String fcltynm; // 공연장명
    private String prfstate; // 공연 상태
    private String poster; // 포스터
    private String prfpdfrom; // 공연 시작일
    private String prfpdto; // 공연 종료일
    private String prfcast; // 출연진
    private String pcseguidance; //티켓 가격
    private String dtguidance; // 공연 시간
    private String prfruntime; // 공연 런타임
    private String genrenm;
    private String area;
    private String visit;
    private String festival;

    @JacksonXmlElementWrapper(localName = "relates")
    @JacksonXmlProperty(localName = "relate")
    private List<RelateDto> relates;

    // ------비즈니스 로직------

    public LocalDate getStartDate() {
        return parseKopisDate(prfpdfrom);
    }

    public LocalDate getEndDate() {
        return parseKopisDate(prfpdto);
    }

    public boolean isVisitPerformance() {
        return "Y".equalsIgnoreCase(visit);
    }

    public boolean isFestival() {
        return "Y".equalsIgnoreCase(festival);
    }

    public boolean hasTicketLinks() {
        return relates != null && !relates.isEmpty();
    }

    public List<RelateDto> getTicketLinks() {
        return relates != null ? relates : new ArrayList<>();
    }

    private LocalDate parseKopisDate(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return null;
        }

        try {
            return LocalDate.parse(dateStr.trim(), KOPIS_DATE_FORMATTER);
        } catch (Exception e) {
            // 파싱 실패 시 null 반환 (로깅은 상위 레이어에서 처리) why?
            return null;
        }
    }


    @Getter
    @Setter
    @NoArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RelateDto {
        private String relatenm;  // 예매처 이름 (예: 멜론티켓)
        private String relateurl; // 예매처 URL

        public boolean hasValidUrl() {
            return relateurl != null && !relateurl.trim().isEmpty();
        }
    }

}
