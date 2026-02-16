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
    //private final KopisToRefineService kopisToRefineService;

    // 매일 새벽 2시 0분 0초에 실행
    @Scheduled(cron = "0 24 11 * * *")
    public void runDailyFetch() {
        log.info("=== 테스트용 정기 배치가 10:20에 시작되었습니다 ===");

        String startDate = LocalDate.now().minusDays(7).format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        // 1. 목록 가져오기 및 신규 저장/업데이트
        batchService.runJob("performanceFetchJob", startDate);

        // 2. 상세 정보가 없는 항목들 상세 정보 채우기
        // (performanceFetchJob이 끝나고 실행되도록 순차 실행 추천)
        batchService.runJob("performanceDetailJob", null);

        log.info("=== 테스트용 정기 배치 완료 ===");

        //kopisToRefineService.refineKopisData();
    }
}
