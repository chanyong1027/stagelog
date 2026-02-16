package com.stagelog.Stagelog.performance.client;

import com.stagelog.Stagelog.performance.dto.KopisPerformanceListItem;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceDetailResponse;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceListResponse;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceDetailItem;
import java.util.Collections;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

@Slf4j
@Component
public class KopisApiClient implements KopisPerformanceDataProvider {

    private static final int ROWS_PER_PAGE = 100;
    private static final String BASE_URL = "http://www.kopis.or.kr";

    @Value("${external.kopis}")
    private String apiKey;
    private final RestClient restClient;

    public KopisApiClient(RestClient.Builder builder) {
        this.restClient = builder.baseUrl(BASE_URL).build();
    }

    @Override
    public List<KopisPerformanceListItem> fetchPerformances(String startDate, String endDate, int page, String category) {
        try {
            String uri = UriComponentsBuilder
                    .fromPath("/openApi/restful/pblprfr")
                    .queryParam("service", apiKey)
                    .queryParam("stdate", startDate)
                    .queryParam("eddate", endDate)
                    .queryParam("cpage", page)
                    .queryParam("rows", ROWS_PER_PAGE)
                    .queryParam("shcate", category)
                    .build(true).toString();
            KopisPerformanceListResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(KopisPerformanceListResponse.class);
            if (response == null || response.getPerformances() == null) {
                return Collections.emptyList();
            }
            return response.getPerformances();
        } catch (RestClientException e) {
            log.error("Kopis API 호출 오류: page={}", page, e);
            return Collections.emptyList();
        }
    }

    @Override
    public KopisPerformanceDetailItem fetchPerformanceDetail(String kopisId) {
        try {
            String uri = UriComponentsBuilder
                    .fromPath("/openApi/restful/pblprfr/{mt20id}")
                    .queryParam("service", apiKey)
                    .buildAndExpand(kopisId).toString();
            KopisPerformanceDetailResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(KopisPerformanceDetailResponse.class);

            if (response == null || response.getDetails() == null || response.getDetails().isEmpty()) {
                log.warn("KOPIS API 응답 없음: kopisId={}", kopisId);
                return null;
            }
            return response.getFirstDetail();
        } catch (RestClientException e) {
            log.error("KOPIS 상세 API 오류: kopisId={}", kopisId, e);
            return null;
        }
    }
}
