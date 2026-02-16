package com.stagelog.Stagelog.performance.batch.processor;

import com.stagelog.Stagelog.global.exception.BatchProcessException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.performance.client.KopisPerformanceDataProvider;
import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceDetailItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PerformanceDetailItemProcessor implements ItemProcessor<KopisPerformance, KopisPerformance> {

    private final KopisPerformanceDataProvider kopisPerformanceDataProvider;
    private static final long RATE_LIMIT_DELAY_MS = 200;

    @Override
    public KopisPerformance process(KopisPerformance item) throws Exception {
        try {
            Thread.sleep(RATE_LIMIT_DELAY_MS);

            KopisPerformanceDetailItem detailResponseDto = kopisPerformanceDataProvider.fetchPerformanceDetail(
                    item.getKopisId());

            if (detailResponseDto == null) {
                log.warn("상세정보를 찾을 수 없음: {}", item.getKopisId());
                item.handleNoDetail();
                return item;
            }

            item.updateDetailInfo(detailResponseDto);
            return item;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BatchProcessException(ErrorCode.BATCH_INTERRUPTED, e);
        }
    }
}
