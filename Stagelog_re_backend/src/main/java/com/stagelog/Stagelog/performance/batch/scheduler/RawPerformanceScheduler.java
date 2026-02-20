package com.stagelog.Stagelog.performance.batch.scheduler;

import com.stagelog.Stagelog.performance.service.BatchService;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RawPerformanceScheduler {

    private final BatchService batchService;

    // 매일 새벽 2시에 실행
    @Scheduled(cron = "0 0 2 * * *")
    public void runDailyFetch() {
        log.info("=== 정기 배치 시작 (새벽 2시) ===");

        String startDate = LocalDate.now().minusDays(7).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        // 1. 목록 가져오기 및 신규 저장/업데이트
        batchService.runJob("performanceFetchJob", startDate);

        // 2. 상세 정보가 없는 항목들 상세 정보 채우기
        batchService.runJob("performanceDetailJob", null);

        log.info("=== 정기 배치 완료 ===");
    }
}
