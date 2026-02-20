package com.stagelog.Stagelog.performance.batch.reader;

import com.stagelog.Stagelog.global.exception.BatchProcessException;
import com.stagelog.Stagelog.global.exception.ErrorCode;
import com.stagelog.Stagelog.performance.client.KopisPerformanceDataProvider;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceListItem;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.item.ItemReader;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@StepScope
@Slf4j  
public class PerformanceItemReader implements ItemReader<KopisPerformanceListItem> {
    private final KopisPerformanceDataProvider kopisPerformanceDataProvider;

    private final List<KopisPerformanceListItem> performanceBuffer = new ArrayList<>();
    private final SearchPeriodCursor periodCursor;

    private int currentPage = 1;
    private int nextIndex = 0;

    private static final String CATEGORY_PERFORMANCE = "CCCD";

    public PerformanceItemReader(
            KopisPerformanceDataProvider kopisPerformanceDataProvider,
            @Value("#{jobParameters['startDate']}") String startDate
    ) {
        this.kopisPerformanceDataProvider = kopisPerformanceDataProvider;

        // startDate가 파라미터로 안 들어왔을 때를 대비한 방어 로직 (선택 사항)
        LocalDate start;
        if (startDate == null || startDate.isEmpty()) {
            start = LocalDate.of(2024, 1, 1); // 기본값
        } else {
            start = LocalDate.parse(startDate, DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        }

        // 커서 초기화
        this.periodCursor = new SearchPeriodCursor(start);
    }

    @Override
    public KopisPerformanceListItem read() {
        if (hasBufferedItems()) {
            return popFromBuffer();
        }

        if (tryFillBuffer()) {
            return popFromBuffer();
        }

        return null; // 데이터 없음 (종료)
    }

    private boolean hasBufferedItems() {
        return nextIndex < performanceBuffer.size();
    }

    private KopisPerformanceListItem popFromBuffer() {
        return performanceBuffer.get(nextIndex++);
    }

    private boolean tryFillBuffer() {
        clearBuffer();

        while (performanceBuffer.isEmpty() && !periodCursor.isFinished()) {
            fetchDataWithRateLimit();
        }

        return !performanceBuffer.isEmpty();
    }

    private void clearBuffer() {
        performanceBuffer.clear();
        nextIndex = 0;
    }

    private void fetchDataWithRateLimit() {
        try {
            sleepForRateLimit();
            fetchDataForCurrentPeriod();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BatchProcessException(ErrorCode.BATCH_INTERRUPTED, e);
        } catch (Exception e) {
            log.error("API 호출 중 에러 발생", e);
            periodCursor.moveToNextMonth();
            resetPage();
        }
    }

    private void sleepForRateLimit() throws InterruptedException {
        Thread.sleep(250); // 초당 5회 제한 (안전하게 0.25초)
    }

    private void fetchDataForCurrentPeriod() {
        periodCursor.initCurrentPeriodIfNull();

        String start = periodCursor.getFormattedStart();
        String end = periodCursor.getFormattedEnd();

        log.info("Fetching KOPIS: {} ~ {}, page={}", start, end, currentPage);

        List<KopisPerformanceListItem> fetched = kopisPerformanceDataProvider.fetchPerformances(
                start, end, currentPage, CATEGORY_PERFORMANCE
        );

        // 데이터가 있으면 버퍼에 담고 페이지 증가 후 리턴 (else 제거)
        if (hasData(fetched)) {
            performanceBuffer.addAll(fetched);
            currentPage++;
            return;
        }

        // 데이터가 없으면 다음 달로 이동
        periodCursor.moveToNextMonth();
        resetPage();
    }

    private boolean hasData(List<KopisPerformanceListItem> fetched) {
        return fetched != null && !fetched.isEmpty();
    }

    private void resetPage() {
        this.currentPage = 1;
    }

    private static class SearchPeriodCursor {
        private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");

        private final LocalDate searchEndDate;

        private LocalDate currentStartDate;
        private LocalDate currentEndDate;

        public SearchPeriodCursor(LocalDate startDate) {
            this.currentStartDate = startDate;
            this.searchEndDate = LocalDate.now().plusMonths(12);
        }

        public boolean isFinished() {
            return currentStartDate.isAfter(searchEndDate);
        }

        public void initCurrentPeriodIfNull() {
            if (currentEndDate == null) {
                updateCurrentEndDate();
            }
        }

        public void moveToNextMonth() {
            currentStartDate = currentStartDate.plusMonths(1);
            updateCurrentEndDate();
        }

        private void updateCurrentEndDate() {
            // 현재 시작일 기준 1달 뒤 하루 전 (예: 1/1 ~ 1/31)
            LocalDate calculatedEnd = currentStartDate.plusMonths(1).minusDays(1);

            if (calculatedEnd.isAfter(searchEndDate)) {
                this.currentEndDate = searchEndDate;
                return;
            }
            this.currentEndDate = calculatedEnd;
        }

        public String getFormattedStart() {
            return currentStartDate.format(formatter);
        }

        public String getFormattedEnd() {
            initCurrentPeriodIfNull();
            return currentEndDate.format(formatter);
        }
    }
}
