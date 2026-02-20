package com.stagelog.Stagelog.performance.batch.writer;

import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import com.stagelog.Stagelog.performance.repository.KopisPerformanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.batch.item.Chunk;
import org.springframework.batch.item.ItemWriter;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PerformanceItemWriter implements ItemWriter<KopisPerformance> {

    private final KopisPerformanceRepository kopisPerformanceRepository;

    @Override
    public void write(Chunk<? extends KopisPerformance> chunk) {
        if (chunk.isEmpty()) {
            log.debug("이 청크에 쓸 아이템이 없습니다.");
            return;
        }

        int itemCount = chunk.size();
        log.info(">>>>> DB에 {}개의 새로운 아이템을 작성중입니다.", itemCount);

        try {
            kopisPerformanceRepository.saveAll(chunk.getItems());
            log.info("성공적으로 {}개의 아이템들이 저장되었습니다.", itemCount);

        } catch (Exception e) {
            log.error("저장 중 {}개의 아이템들이 에러가 났습니다.: {}", itemCount, e.getMessage(), e);
            throw e;
        }
    }
}
