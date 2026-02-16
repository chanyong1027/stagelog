package com.stagelog.Stagelog.performance.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class KopisPerformanceListItem {
    private Long mcode; // 디비에서 구분용 고유 id
    private String mt20id; // 뮤지컬 고유 id
    private String prfnm; // 공연 이름
    private String fcltynm; // 공연장명
    private String prfstate; // 공연 상태
    private String poster; // 포스터
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy.MM.dd")
    private LocalDate prfpdfrom; // 공연 시작일
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy.MM.dd")
    private LocalDate prfpdto;

    public KopisPerformance toEntity() {
        return KopisPerformance.builder()
                .kopisId(this.mt20id)
                .title(this.prfnm)
                .venue(this.fcltynm)
                .status(this.prfstate)
                .posterUrl(this.poster)
                .startDate(this.prfpdfrom)
                .endDate(this.prfpdto)
                .build();
    }
}
