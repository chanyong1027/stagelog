package com.stagelog.Stagelog.performance.batch.config;

import com.stagelog.Stagelog.performance.batch.processor.PerformanceDetailItemProcessor;
import com.stagelog.Stagelog.performance.batch.processor.PerformanceItemProcessor;
import com.stagelog.Stagelog.performance.batch.reader.PerformanceItemReader;
import com.stagelog.Stagelog.performance.batch.writer.PerformanceItemWriter;
import com.stagelog.Stagelog.performance.domain.KopisPerformance;
import com.stagelog.Stagelog.performance.dto.KopisPerformanceListItem;
import com.stagelog.Stagelog.performance.repository.KopisPerformanceRepository;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class PerformanceStepConfig {

    private final JobRepository jobRepository;
    private final PlatformTransactionManager transactionManager;
    private final PerformanceItemReader performanceItemReader;
    private final PerformanceItemProcessor performanceItemProcessor;
    private final PerformanceItemWriter performanceItemWriter;

    private final KopisPerformanceRepository kopisPerformanceRepository;

    private static final int CHUNK_SIZE = 100;
    private static final int DETAIL_CHUNK_SIZE = 30;

    @Bean
    public Step performanceFetchStep() {
        return new StepBuilder("performanceFetchStep", jobRepository)
                .<KopisPerformanceListItem, KopisPerformance>chunk(CHUNK_SIZE, transactionManager)
                .reader(performanceItemReader)
                .processor(performanceItemProcessor)
                .writer(performanceItemWriter)
                .build();
    }

    @Bean
    @StepScope
    public RepositoryItemReader<KopisPerformance> performanceDetailReader() {
        return new RepositoryItemReaderBuilder<KopisPerformance>()
                .name("performanceDetailReader")
                .repository(kopisPerformanceRepository)
                .methodName("findByHasDetailFalse") // Repository에 추가한 메소드명
                .pageSize(DETAIL_CHUNK_SIZE)
                .sorts(Map.of("id", Sort.Direction.ASC))
                .build();
    }

    @Bean
    public Step performanceDetailStep(
            RepositoryItemReader<KopisPerformance> performanceDetailReader,
            PerformanceDetailItemProcessor performanceDetailProcessor, // 위에서 만든 Processor 주입
            PerformanceItemWriter performanceItemWriter // 기존 Writer 재사용 (saveAll은 update도 됨)
    ) {
        return new StepBuilder("performanceDetailStep", jobRepository)
                .<KopisPerformance, KopisPerformance>chunk(DETAIL_CHUNK_SIZE, transactionManager)
                .reader(performanceDetailReader)
                .processor(performanceDetailProcessor)
                .writer(performanceItemWriter)
                .build();
    }
}
